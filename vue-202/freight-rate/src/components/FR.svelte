<script lang="ts">
  import TrashIcon from "../assets/trash_icon.svelte"
  import PencilIcon from "../assets/pencil_icon.svelte"
  import AddIcon from "../assets/add_icon.svelte"
  import { onMount } from "svelte"
  import type { FreightRate } from "../@types/FreightRate"
  import {
    addDay,
    asDate,
    asDecimal,
    INFINITY_DATE,
    inputToZulu,
    ONE_DAY,
    today,
  } from "../lib/fun"
  import { samplePorts } from "../mock/freight-data"
  import { more } from "../data/freight-store"

  let showForm: boolean = false
  let inputForm: HTMLFormElement

  let freightRateData: Array<FreightRate> = []

  // when the component mounts...
  onMount(async () => {
    freightRateData = await more()
    freightRateData[0].end_date = inputToZulu(INFINITY_DATE)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key
    const isAlt = event.altKey

    if (isAlt) {
      switch (key) {
        case "a":
          addNewFreight()
          break
        case "s":
          save()
          break
        default:
          return
      }
    }

    if (!isAlt) {
      switch (key) {
        case "Escape":
          cancelSave()
          break
        default:
          return
      }
    }

    event.preventDefault()
  }

  function addNewFreight() {
    // clear the form data
    resetForm()
    inputForm["start_date"].value = today()
    showForm = true
    setTimeout(() => inputForm["start_date"].focus(), 100)
  }

  function resetForm() {
    // clear the form data
    inputForm.reset()
    inputForm["start_date"].min = ""
    inputForm["start_date"].max = ""
    inputForm["primary_key"].value = ""
  }

  function cancelSave() {
    // clear the form data
    resetForm()
    // hide the form
    showForm = false
  }

  // I am fully aware this should be done with a store, just poc-ing (and regretting it)
  function setEndDate(rate: FreightRate, value: number) {
    if (rate.end_date !== value) {
      rate.end_date = value
      hiliteRate(rate, "end_date")
    }
  }

  function setStartDate(rate: FreightRate, value: number) {
    if (rate.start_date !== value) {
      rate.start_date = value
      hiliteRate(rate, "start_date")
    }
  }

  function setOffloadRate(rate: FreightRate, value: number) {
    if (rate.offload_rate !== value) {
      rate.offload_rate = value
      hiliteRate(rate, "offload_rate")
    }
  }

  function toss(message: string) {
    alert(message)
    throw new Error(message)
  }

  function save(): boolean | undefined {
    if (!inputForm) throw toss("form is not defined")
    // validate the form inputs
    if (!inputForm.checkValidity()) {
      inputForm.reportValidity()
      return false
    }

    // fake a save by adding a new rate to the sample data
    // get the form data
    const rawData = new FormData(inputForm).entries()
    // convert the data to json
    const data = Object.fromEntries(rawData) as {
      primary_key: string
      start_date: string
      end_date: string
      offload_rate: string
    }

    // for each port, get the rate
    const portRates = samplePorts.map((port) => {
      return { port, rate: parseFloat((<any>data)[port]) }
    })

    const startDate = inputToZulu(data.start_date)
    const newData: FreightRate = {
      start_date: startDate,
      end_date: inputToZulu(data.end_date),
      port_rates: portRates,
      offload_rate: parseFloat(data.offload_rate),
    }

    // find the mock data
    if (data.primary_key) {
      // this is an update, find the proper rate
      const id = inputToZulu(data.primary_key)
      const rate = freightRateData.find((rate) => rate.start_date === id)
      if (!rate) throw toss("rate not found")
      if (!updateFreightRate(rate, newData)) return false
    } else {
      newData.end_date = inputToZulu(INFINITY_DATE)
      insertFreightRate(newData)
    }

    // trigger redraw
    freightRateData = freightRateData

    // clear the form data
    resetForm()
    showForm = false
  }

  function updateFreightRate(rate: FreightRate, data: FreightRate): boolean {
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")

    const startDate = data.start_date

    // confirm the change with user
    if (index < freightRateData.length - 1) {
      // get the date range of the prior rate
      const priorRate = freightRateData[index + 1]
      const priorStartDate = asDate(priorRate.start_date)
      const priorEndDate = asDate(priorRate.end_date)
      // the new end date will change...
      const newPriorEndDate = asDate(addDay(startDate, -1))
      // if the new end date is not the same as the prior end date, confirm the change
      if (priorEndDate !== newPriorEndDate) {
        const message = `The previous time block will change from\n${priorStartDate} through ${priorEndDate} to\n${priorStartDate} through ${newPriorEndDate}.\n\nContinue?`
        if (!confirm(message)) return false
      }
    }

    // update rate
    setStartDate(rate, data.start_date)
    setOffloadRate(rate, data.offload_rate)

    if (!rate.port_rates) rate.port_rates = data.port_rates
    data.port_rates.forEach((portRate, i) => {
      if (rate.port_rates[i].rate !== portRate.rate) {
        rate.port_rates[i].rate = portRate.rate
        hiliteRate(rate, <"port1_rate">`port${i + 1}_rate`)
      }
    })

    // update the end date of the previous rate
    if (index < freightRateData.length - 1) {
      setEndDate(freightRateData[index + 1], addDay(startDate, -1))
    }

    return true
  }

  function insertFreightRate(data: FreightRate) {
    // this is an insert
    // find the rate that will be in effect after this one expires and use the start date to update the new end date
    // find the rate that was in effect before the new rate and update the end date
    const startDate = data.start_date
    const priorRate = freightRateData.find(
      (rate) => rate.start_date <= startDate
    )
    if (priorRate) {
      // if priorRate start date is the same then we have a problem, throw
      if (priorRate.start_date === startDate) {
        alert("duplicate start date")
        return
      }
      setEndDate(data, priorRate.end_date)
      // this is the last rate
      setEndDate(priorRate, addDay(startDate, -1))
      const priorRateIndex = freightRateData.indexOf(priorRate)
      // insert the new rate before the prior rate
      freightRateData.splice(priorRateIndex, 0, data)
    } else {
      // add the new rate to the end of the list
      // set the "end_date" to one day before the next start date
      if (freightRateData.length) {
        const nextRate = freightRateData[freightRateData.length - 1]
        setEndDate(data, addDay(nextRate.start_date, -1))
      }
      freightRateData.push(data)
    }
    // hilite the entire row
    hiliteRate(data, "start_date")
    hiliteRate(data, "end_date")
    hiliteRate(data, "offload_rate")
    hiliteRate(data, "port1_rate")
    hiliteRate(data, "port2_rate")
  }

  function blankIfInfinity(date: string) {
    return date === INFINITY_DATE ? "" : date
  }

  function computeAverage(rate: FreightRate): number {
    if (!rate.port_rates.length) return rate.offload_rate
    // compute the average rate
    const sum = rate.port_rates.reduce((sum, portRate) => {
      return sum + portRate.rate
    }, 0)
    return sum / rate.port_rates.length + rate.offload_rate
  }

  function editFreightRate(rate: FreightRate) {
    // since we are using sample data, we will just remove the rate from the sample data
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")
    // clear the inputForm and set the values
    if (!inputForm) throw toss("form is not defined")
    resetForm()
    inputForm["primary_key"].value = asDate(rate.start_date)
    inputForm["start_date"].value = asDate(rate.start_date)
    inputForm["end_date"].value = asDate(rate.end_date)
    inputForm["offload_rate"].value = asDecimal(rate.offload_rate)
    rate.port_rates.forEach((portRate) => {
      inputForm[portRate.port].value = asDecimal(portRate.rate)
    })
    // the start_date range is between the previous rate and the next rate
    if (index < freightRateData.length - 1) {
      const previousRate = freightRateData[index + 1]
      inputForm["start_date"].min = asDate(previousRate.start_date + ONE_DAY)
    }
    if (index > 0) {
      const nextRate = freightRateData[index - 1]
      inputForm["start_date"].max = asDate(nextRate.start_date - ONE_DAY)
    }
    // show the form
    showForm = true
    setTimeout(() => inputForm["start_date"].focus(), 100)
  }

  function deleteFreightRate(rate: FreightRate): boolean {
    // since we are using sample data, we will just remove the rate from the sample data
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")

    if (index === 0) {
      if (freightRateData.length > 1) {
        // if this is the first rate, we need to update the end date of the next rate
        const priorRate = freightRateData[1]
        const priorStartDate = asDate(priorRate.start_date)
        const priorEndDate = asDate(priorRate.end_date)
        const newPriorEndDate = inputToZulu(INFINITY_DATE)
        const message = `The previous time block ${priorStartDate} through ${priorEndDate}\nwill become unbounded.\n\nContinue?`
        if (!confirm(message)) return false
        setEndDate(priorRate, newPriorEndDate)
      }
    } else {
      // if this is not the first rate, we need to update the end date of the next rate
      const nextRate = freightRateData[index - 1]
      const nextStartDate = asDate(nextRate.start_date)
      const nextEndDate =
        blankIfInfinity(asDate(nextRate.end_date)) || "unbounded"
      const newNextStartDate = asDate(rate.start_date)
      const message = `The next time block ${nextStartDate} through ${nextEndDate}\nwill become ${newNextStartDate} through ${nextEndDate}.\n\nContinue?`
      if (!confirm(message)) return false
      setStartDate(nextRate, rate.start_date)
    }
    // remove the rate from the sample data
    freightRateData = freightRateData.filter((r) => r !== rate)
    return true
  }

  type HiliteFields =
    | "start_date"
    | "end_date"
    | "offload_rate"
    | "port1_rate"
    | "port2_rate"

  function isHiliteHack(newData: FreightRate, field: string) {
    return newData._hiliteHack?.has(field as HiliteFields)
  }

  function hiliteRate(newData: FreightRate, field: HiliteFields) {
    // find the row that was just added
    newData._hiliteHack = newData._hiliteHack || new Set()
    newData._hiliteHack.add(field)
    console.log("hilite", asDate(newData.start_date), field)
    setTimeout(() => {
      newData._hiliteHack?.delete(field)
      freightRateData = freightRateData
    }, 5000)
  }

  async function getMoreData() {
    const moreData = await more(
      freightRateData[freightRateData.length - 1].start_date
    )
    if (!moreData.length) {
      alert("No results found")
      return
    }
    freightRateData = [...freightRateData, ...moreData].sort(
      (a, b) => b.start_date - a.start_date
    )
  }
</script>

<h2>Freight Rates Maintenance</h2>

<!-- 
    here we have a grid that lists the freight rates for the past 12 months
    the grid is pre-sorted by the last 12 months
    There is an add button that allows the user to add a new freight date and rates
-->

<div>
  <div class="rates">
    <div class="table">
      <div class="th align-right date1">Start Date</div>
      <div class="th align-right date2">End Date</div>
      <!-- write heading for each port type -->
      {#each samplePorts as port, i}
        <div class={`th align-right port${i + 1}`}>{port}</div>
      {/each}
      <div class="th align-right offload">Offload</div>
      <div class="th align-right average">Average</div>
      <div class="th toolbar">
        <button title="Alt+A" class="quick-add-row" on:click={addNewFreight}
          ><AddIcon /></button
        >
      </div>
      <!-- write a row for each freight rate -->
      {#each freightRateData as rate}
        <div class="align-right date1 title">Start Date</div>
        <div
          class="align-right date1 value"
          class:hilite={rate._hiliteHack?.has("start_date")}
        >
          {asDate(rate.start_date)}
        </div>
        <div class="align-right date2 title">End Date</div>
        <div
          class="align-right date2 value"
          class:hilite={rate._hiliteHack?.has("end_date")}
        >
          {blankIfInfinity(asDate(rate.end_date)) || "<null>"}
        </div>
        <!-- write a cell for each port rate -->
        {#each rate.port_rates as port, i}
          <div class={`align-right port${i + 1} title`}>{port.port}</div>
          <div
            class={`align-right port_rate${i + 1} value`}
            class:hilite={isHiliteHack(rate, `port${i + 1}_rate`)}
          >
            {asDecimal(port.rate)}
          </div>
        {/each}
        <div class="align-right offload title">Offload</div>
        <div
          class="align-right offload_rate value"
          class:hilite={isHiliteHack(rate, "offload_rate")}
        >
          {asDecimal(rate.offload_rate)}
        </div>
        <div class="align-right average title">Average</div>
        <div class="align-right average_rate value">
          {asDecimal(computeAverage(rate))}
        </div>
        <div class="toolbar">
          {#if true}
            <button class="delete" on:click={() => deleteFreightRate(rate)}>
              <TrashIcon />
            </button>
          {/if}
          <button class="edit" on:click={() => editFreightRate(rate)}>
            <PencilIcon />
          </button>
        </div>
      {/each}
      <button on:click={() => getMoreData()}>More Rows</button>
    </div>
    <!-- button to add a new rate, date must not be earlier than latest start date -->
    <dialog open={showForm}>
      <form
        class:visible={true}
        bind:this={inputForm}
        on:submit|preventDefault={save}
      >
        <input type="hidden" name="primary_key" />
        <label for="start_date">Start Date</label>
        <input type="date" required name="start_date" value={today()} />
        <label for="end_date">End Date</label>
        <input type="text" name="end_date" readonly value={INFINITY_DATE} />
        <!-- write a row for each port -->
        {#each samplePorts as port}
          <label for={port}>{port}</label>
          <input type="number" name={port} min="0.01" step="0.01" required />
        {/each}
        <label for="offload_rate">Offload</label>
        <input
          type="number"
          name="offload_rate"
          min="0.01"
          step="0.01"
          required
        />
        <nav>
          <button type="submit">Save</button>
          <button type="button" on:click={() => cancelSave()}>Cancel</button>
        </nav>
      </form>
    </dialog>
  </div>
</div>

<style>
  * {
    transition-duration: 200ms;
  }
  h2 {
    text-align: center;
  }

  .align-right {
    text-align: right;
  }

  form {
    display: none;
    padding: 1em;
  }

  form.visible {
    display: block;
  }

  .toolbar {
    display: flex;
    flex-direction: row;
    margin: 0;
    padding: 0;
    /* align buttons to the right */
    justify-content: flex-end;
  }

  .toolbar > button {
    box-sizing: border-box;
    background-color: transparent;
    width: 3em;
    height: 2.5em;
    margin: 0;
    padding: 0;
    color: var(--text-color);
    border: 1px solid transparent;
  }

  button.edit:hover {
    border-color: var(--border-color-intense);
  }

  button.delete:hover {
    border-color: var(--border-color-intense);
  }

  nav {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 1em;
  }

  nav > button {
    width: auto;
  }

  .table {
    display: grid;
    grid-template-columns: repeat(6, 1fr) auto;
    font-size: larger;
    /* center text vertically */
    align-items: center;
    border-top: 1px solid var(--border-color-lite);
    border-bottom: 1px solid var(--border-color-lite);
  }

  .table > .th {
    border-bottom: 1px solid var(--border-color-lite);
    font-weight: bold;
    height: 2em;
    line-height: 2rem;
  }

  .table > .value {
    white-space: nowrap;
    border-bottom: 0.5px solid var(--border-color-lite-50);
  }

  .table > .date1.value {
    grid-column-start: 1;
  }

  .table > .title {
    display: none;
    /* no wrap */
    white-space: nowrap;
  }

  /* animation on border color */
  .table .hilite {
    border-bottom: 1px solid transparent;
    text-decoration-style: dashed;
    text-decoration-color: var(--color-delta);
    text-decoration-line: underline;
    text-decoration-thickness: 0.25rem;
  }

  .toolbar > button.quick-add-row {
    width: 2em;
    height: 2em;
    margin: 0;
    padding: 0;
  }

  dialog > form {
    background: var(--background-color);
  }

  @media (max-width: 991px) {
    .table {
      grid-template-columns: repeat(2, 1fr);
    }
    .table > .th {
      display: none;
    }

    .table > .th.toolbar {
      display: flex;
      grid-column-start: 1;
      grid-column-end: -1;
      /* align items to the right */
      justify-content: flex-end;
    }

    .table > .title {
      grid-column-start: 1;
    }
    .table > .date1.value,
    .table > .value {
      grid-column-start: 2;
    }

    .table > .th {
      display: none;
    }

    .table > .title {
      display: inline-block;
    }

    .table > .toolbar {
      grid-column-start: 1;
      grid-column-end: -1;
      margin-bottom: 1.5em;
    }
  }
</style>
