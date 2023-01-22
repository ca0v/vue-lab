<script lang="ts">
  import TrashIcon from "../trash_icon.svelte"
  import PencilIcon from "../pencil_icon.svelte"
  import AddIcon from "../add_icon.svelte"
  import { onMount } from "svelte"

  // when the component mounts...
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key
    const isAlt = event.altKey

    if (!isAlt) return
    switch (key) {
      case "a":
        addNewFreight()
        break
      case "s":
        save()
        break
      case "Escape":
        cancelSave()
        break
      default:
        return
    }

    event.preventDefault()
  }

  type PortRate = {
    port: string
    rate: number
  }

  type FreightRate = {
    _hiliteHack?: Set<HiliteFields>
    start_date: number
    end_date: number
    offload_rate: number
    port_rates: Array<PortRate>
  }

  const ONE_DAY = 24 * 60 * 60 * 1000
  const INFINITY_DATE = "2100-01-01"

  let inputForm: HTMLFormElement

  const samplePorts = ["LB", "NY"]

  let sampleRateHistoryData: Array<FreightRate> = []

  function today() {
    // return today's date as a string in yyyy-mm-dd format
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    return `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`
  }

  function firstDayOfNextMonth() {
    // return the first day of the next month as a string in yyyy-mm-dd format
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 2
    return `${year}-${month.toString().padStart(2, "0")}-01`
  }

  function round2(value: number): number {
    // round a number to 2 decimal places
    return Math.round(value * 100) / 100
  }

  function createSamplePortRate(port: string) {
    return { port, rate: round2(1000 + Math.random() * 100) }
  }

  // inject sample data for the last 12 months
  function injectSampleRates() {
    // generate for today and go backward 12 months
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = 1
    const offload_rate = round2(1000 + Math.random() * 100)
    let start_date = asZulu(year, month, day)
    let end_date = inputToZulu(INFINITY_DATE)
    for (let i = 1; i <= 12; i++) {
      const port_rates = samplePorts.map(createSamplePortRate)
      sampleRateHistoryData.push({
        start_date,
        end_date,
        port_rates,
        offload_rate,
      })
      end_date = addDay(start_date, -1)
      start_date = asZulu(year, month - i, day)
    }
  }
  injectSampleRates()

  function inputToZulu(date: string): number {
    // convert a date string in yyyy-mm-dd format to zulu time
    const [year, month, day] = date.split("-").map((s) => parseInt(s))
    return asZulu(year, month, day)
  }

  function asZulu(year: number, month: number, day: number): number {
    // return a date as a zulu time
    return Date.UTC(year, month - 1, day)
  }

  function asDate(zulu: number): string {
    // convert a zulu time to a date string in yyyy-mm-dd format
    return new Date(zulu).toISOString().slice(0, 10)
  }

  function asDecimal(value: number): string {
    // return a number as a string with 2 decimal places
    return value.toFixed(2)
  }

  let showForm: boolean = false

  function addNewFreight() {
    // clear the form data
    resetForm()
    inputForm["start_date"].value = today()
    showForm = true
  }

  function addDay(start_date: number, days = 1): number {
    // return the day before the start_date
    return start_date + days * ONE_DAY
  }

  function resetForm() {
    // clear the form data
    inputForm.reset()
    inputForm["start_date"].min = ""
    inputForm["start_date"].max = ""
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

  function setValue<T>(rate: FreightRate, value: T, key: HiliteFields) {
    if (rate[key] !== value) {
      rate[key] = value
      hiliteRate(rate, key)
    }
  }

  function save() {
    if (!inputForm) throw new Error("form is not defined")
    // validate the form inputs
    if (!inputForm.checkValidity()) {
      inputForm.reportValidity()
      return
    }

    // fake a save by adding a new rate to the sample data
    // get the form data
    const rawData = new FormData(inputForm).entries()
    // convert the data to json
    const data = Object.fromEntries(rawData) as {
      primary_key: string
      start_date: string
      offload_rate: string
    }
    // for each port, get the rate
    const portRates = samplePorts.map((port) => {
      return { port, rate: parseFloat(data[port]) }
    })

    // find the mock data
    const startDate = inputToZulu(data.start_date)
    if (data.primary_key) {
      // this is an update, find the proper rate
      const id = inputToZulu(data.primary_key)
      const rate = sampleRateHistoryData.find((rate) => rate.start_date === id)
      if (!rate) throw new Error("rate not found")
      setStartDate(rate, startDate)
      const offload_rate = parseFloat(data.offload_rate)
      setValue(rate, offload_rate, "offload_rate")
      setValue(rate, offload_rate, "offload_rate")

      portRates.forEach((portRate, i) => {
        if (!rate.port_rates) rate.port_rates = portRates
        if (rate.port_rates[i].rate !== portRate.rate) {
          rate.port_rates[i].rate = portRate.rate
          hiliteRate(rate, <"port1_rate">`port${i + 1}_rate`)
        }
      })

      // update the end date of the previous rate
      const index = sampleRateHistoryData.indexOf(rate) + 1
      if (index < sampleRateHistoryData.length) {
        setEndDate(sampleRateHistoryData[index], addDay(startDate, -1))
      }
    } else {
      const newData = {
        start_date: startDate,
        end_date: inputToZulu(INFINITY_DATE),
        port_rates: portRates,
        offload_rate: parseFloat(data.offload_rate),
      }
      // this is an insert
      // find the rate that will be in effect after this one expires and use the start date to update the new end date
      // find the rate that was in effect before the new rate and update the end date
      const priorRate = sampleRateHistoryData.find(
        (rate) => rate.start_date <= startDate
      )
      if (priorRate) {
        // if priorRate start date is the same then we have a problem, throw
        if (priorRate.start_date === startDate) {
          alert("duplicate start date")
          return
        }
        setEndDate(newData, priorRate.end_date)
        // this is the last rate
        setEndDate(priorRate, addDay(startDate, -1))
        const priorRateIndex = sampleRateHistoryData.indexOf(priorRate)
        // insert the new rate before the prior rate
        sampleRateHistoryData.splice(priorRateIndex, 0, newData)
      } else {
        // add the new rate to the end of the list
        sampleRateHistoryData.push(newData)
      }
      // hilite the entire row
      hiliteRate(newData, "start_date")
      hiliteRate(newData, "end_date")
      hiliteRate(newData, "offload_rate")
      hiliteRate(newData, "port1_rate")
      hiliteRate(newData, "port2_rate")
    }

    // trigger redraw
    sampleRateHistoryData = sampleRateHistoryData

    // clear the form data
    resetForm()
    showForm = false
  }

  function blankIfInfinity(date: string) {
    return date === INFINITY_DATE ? "-" : date
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
    const index = sampleRateHistoryData.indexOf(rate)
    if (index < 0) throw new Error("rate not found")
    // clear the inputForm and set the values
    if (!inputForm) throw new Error("form is not defined")
    resetForm()
    inputForm["primary_key"].value = asDate(rate.start_date)
    inputForm["start_date"].value = asDate(rate.start_date)
    inputForm["end_date"].value = asDate(rate.end_date)
    inputForm["offload_rate"].value = asDecimal(rate.offload_rate)
    rate.port_rates.forEach((portRate) => {
      inputForm[portRate.port].value = asDecimal(portRate.rate)
    })
    // the start_date range is between the previous rate and the next rate
    if (index < sampleRateHistoryData.length - 1) {
      const previousRate = sampleRateHistoryData[index + 1]
      inputForm["start_date"].min = blankIfInfinity(
        asDate(previousRate.end_date + ONE_DAY)
      )
    }
    if (index > 0) {
      const nextRate = sampleRateHistoryData[index - 1]
      inputForm["start_date"].max = asDate(nextRate.start_date - ONE_DAY)
    }
    // show the form
    showForm = true
  }

  function deleteFreightRate(rate: FreightRate) {
    // since we are using sample data, we will just remove the rate from the sample data
    const index = sampleRateHistoryData.indexOf(rate)
    if (index < 0) throw new Error("rate not found")
    if (index === 0) {
      if (sampleRateHistoryData.length > 1) {
        // if this is the first rate, we need to update the end date of the next rate
        setEndDate(sampleRateHistoryData[1], inputToZulu(INFINITY_DATE))
      }
    } else {
      // if this is not the first rate, we need to update the end date of the next rate
      setStartDate(sampleRateHistoryData[index - 1], rate.start_date)
    }
    // remove the rate from the sample data
    sampleRateHistoryData = sampleRateHistoryData.filter((r) => r !== rate)
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
      newData._hiliteHack.delete(field)
      sampleRateHistoryData = sampleRateHistoryData
    }, 5000)
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
      <th class="align-right date1">Start Date</th>
      <th class="align-right date2">End Date</th>
      <!-- write heading for each port type -->
      {#each samplePorts as port, i}
        <th class={`align-right port${i + 1}`}>{port}</th>
      {/each}
      <th class="align-right offload">Offload</th>
      <th class="align-right average">Average</th>
      <div class="toolbar">
        <button title="Alt+A" class="quick-add-row" on:click={addNewFreight}
          ><AddIcon /></button
        >
      </div>
      <!-- write a row for each freight rate -->
      {#each sampleRateHistoryData as rate}
        <td class="align-right date1 title">Start Date</td>
        <td
          class="align-right date1 value"
          class:hilite={rate._hiliteHack?.has("start_date")}
          >{asDate(rate.start_date)}</td
        >
        <td class="align-right date2 title">End Date</td>
        <td
          class="align-right date2 value"
          class:hilite={rate._hiliteHack?.has("end_date")}
          >{blankIfInfinity(asDate(rate.end_date))}</td
        >
        <!-- write a cell for each port rate -->
        {#each rate.port_rates as port, i}
          <td class={`align-right port${i + 1} title`}>{port.port}</td>
          <td
            class={`align-right port_rate${i + 1} value`}
            class:hilite={isHiliteHack(rate, `port${i + 1}_rate`)}
            >{asDecimal(port.rate)}</td
          >
        {/each}
        <td class="align-right offload title">Offload</td>
        <td
          class="align-right offload_rate value"
          class:hilite={isHiliteHack(rate, "offload_rate")}
          >{asDecimal(rate.offload_rate)}</td
        >
        <td class="align-right average title">Average</td>
        <td class="align-right average_rate value"
          >{asDecimal(computeAverage(rate))}</td
        >
        <td class="toolbar">
          {#if true}
            <button class="delete" on:click={() => deleteFreightRate(rate)}>
              <TrashIcon />
            </button>
          {/if}
          <button class="edit" on:click={() => editFreightRate(rate)}>
            <PencilIcon />
          </button>
        </td>
      {/each}
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

  .table > th {
    border-bottom: 1px solid var(--border-color-lite);
    font-weight: bold;
  }

  .table > .value {
    white-space: nowrap;
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
    animation: hilite 5s;
    border-radius: var(--radius);
  }

  .toolbar > button.quick-add-row {
    width: 2em;
    height: 2em;
    margin: 0;
    padding: 0;
  }

  @keyframes hilite {
    start {
      background-color: transparent;
    }
    50% {
      background-color: var(--color-delta);
    }
    end {
      background-color: transparent;
    }
  }

  @media (max-width: 991px) {
    .table {
      grid-template-columns: repeat(2, 1fr);
    }
    .table > th {
      display: none;
    }

    .table > .title {
      grid-column-start: 1;
    }
    .table > .date1.value,
    .table > .value {
      grid-column-start: 2;
    }

    .table > th {
      display: none;
    }

    .table > .title {
      display: inline-block;
    }

    .table > .toolbar {
      grid-column-start: 1;
      grid-column-end: -1;
    }
  }
</style>
