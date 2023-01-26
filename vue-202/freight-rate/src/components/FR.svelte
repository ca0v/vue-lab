<script lang="ts">
  import TrashIcon from "../assets/trash_icon.svelte"
  import PencilIcon from "../assets/pencil_icon.svelte"
  import AddIcon from "../assets/add_icon.svelte"
  import { onMount } from "svelte"
  import type { DiffGram, FreightRate } from "../@types/FreightRate"
  import {
    addDay,
    asDate,
    asDecimal,
    INFINITY_DATE,
    inputToZulu,
    ONE_DAY,
    today,
  } from "../lib/fun"
  import { Api } from "../data/freight-store"
  import { proposeToast } from "../store/messaging"
  import { object_without_properties } from "svelte/internal"

  let showForm: boolean = false
  let inputForm: HTMLFormElement

  const API_URL = localStorage?.getItem("API_URL") || "/aiq/api/"
  localStorage?.setItem("API_URL", API_URL)

  const api = new Api(API_URL)

  const MESSAGE_TEMPLATES = {
    prior: (
      priorStartDate: string,
      priorEndDate: string,
      newPriorEndDate: string
    ) =>
      `The time frame ${priorStartDate} to ${priorEndDate}\nwill become\n${priorStartDate} to ${newPriorEndDate}.\n\nContinue?`,
    delete_prev: (priorStartDate: string, priorEndDate: string) =>
      `The previous time frame ${priorStartDate} to ${priorEndDate}\nwill become ${priorStartDate} to all future dates.\n\nContinue?`,
    delete_next: (
      nextStartDate: string,
      nextEndDate: string,
      newNextStartDate: string
    ) => {
      if (!newNextStartDate) {
        return `The time frame ${nextStartDate} to ${nextEndDate}\nwill become ${nextStartDate} to all future dates.\n\nContinue?`
      }
      return `The time frame ${nextStartDate} to ${nextEndDate}\nwill become ${newNextStartDate} to ${nextEndDate}.\n\nContinue?`
    },
  }

  let freightRateData: Array<FreightRate> = []

  // when the component mounts...
  onMount(async () => {
    getMoreData()
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  })

  function handleKeyDown(event: KeyboardEvent) {
    const key = event.key
    const isAlt = event.altKey || event.metaKey

    if (isAlt) {
      switch (key) {
        case "a":
          addNewFreight()
          break
        case "m":
          getMoreData().then(() => {
            // scroll to the bottom
            window.scrollTo(0, document.body.scrollHeight)
          })
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
    openDialog()
  }

  function openDialog() {
    showForm = true
    setTimeout(() => inputForm["start_date"]?.focus(), 100)
  }

  function resetForm() {
    if (!inputForm) return
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

  function toss(message: string) {
    proposeToast(message, { error: true })
    return message
  }

  async function save() {
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
      offload_rate: string
      port1_rate: string
      port2_rate: string
    }

    const startDate = inputToZulu(data.start_date)
    const newData: FreightRate = {
      pk: 0,
      start_date: startDate,
      end_date: 0, // don't care
      port1_rate: parseFloat(data.port1_rate),
      port2_rate: parseFloat(data.port2_rate),
      offload_rate: parseFloat(data.offload_rate),
    }

    // find the mock data
    if (data.primary_key) {
      // this is an update, find the proper rate
      const id = parseInt(data.primary_key)
      const rate = freightRateData.find((rate) => rate.start_date === id)
      if (!rate) throw toss("rate not found")
      if (!(await updateFreightRate(rate, newData))) {
        return false
      }
    } else {
      if (!(await insertFreightRate(newData))) {
        return false
      }
    }

    // trigger redraw
    freightRateData = freightRateData

    // clear the form data
    resetForm()
    showForm = false
  }

  async function updateFreightRate(rate: FreightRate, data: FreightRate) {
    try {
      return await unsafeUpdateFreightRate(rate, data)
    } catch (error: any) {
      toss(error?.message || error)
      return false
    }
  }

  async function unsafeUpdateFreightRate(rate: FreightRate, data: FreightRate) {
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")

    const primaryKey = rate.start_date
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
        const message = MESSAGE_TEMPLATES.prior(
          priorStartDate,
          priorEndDate,
          newPriorEndDate
        )
        if (!confirm(message)) return false
      }
    }

    // update rate
    const response = await api.updateRate(primaryKey, data)
    await mergeDiffgram(response)
    return true
  }

  function keyOf<T>(obj: T) {
    return Object.keys(<any>obj) as (keyof T)[]
  }

  function mergeFreightItems(response: FreightRate[]) {
    response.forEach((response_rate) => {
      const index = freightRateData.findIndex(
        (rate) => rate.start_date === response_rate.start_date
      )
      if (index >= 0) {
        const target = freightRateData[index]!
        keyOf(response_rate).forEach((key) => {
          const newValue = <any>response_rate[key]
          if (target[key] != newValue) {
            target[key] = newValue
            hiliteRate(response_rate, key)
          }
        })
        freightRateData[index] = response_rate
      } else {
        hiliteRate(response_rate, "start_date")
        freightRateData.push(response_rate)
      }
    })
    sortFreightRates()
  }

  async function insertFreightRate(data: FreightRate) {
    try {
      return await unsafeInsertFreightRate(data)
    } catch (error: any) {
      toss(error?.message || error)
      return false
    }
  }

  async function unsafeInsertFreightRate(data: FreightRate) {
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
        proposeToast("This would create a duplicate start date.")
        return
      }
    }

    const response = await api.insertRate(data)
    // merge the results into freightRateData
    await mergeDiffgram(response)

    return true
  }

  function blankIfInfinity(date: string) {
    return date === INFINITY_DATE ? "" : date
  }

  function computeAverage(rate: FreightRate): number {
    if (!rate) return 0
    const portTotal = rate.port1_rate + rate.port2_rate
    return portTotal / 2 + rate.offload_rate
  }

  function editFreightRate(rate: FreightRate) {
    // since we are using sample data, we will just remove the rate from the sample data
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")
    // clear the inputForm and set the values
    if (!inputForm) throw toss("form is not defined")
    resetForm()
    inputForm["primary_key"].value = rate.start_date
    inputForm["start_date"].value = asDate(rate.start_date)
    inputForm["offload_rate"].value = asDecimal(rate.offload_rate)
    inputForm["port1_rate"].value = asDecimal(rate.port1_rate)
    inputForm["port2_rate"].value = asDecimal(rate.port2_rate)

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
    openDialog()
  }

  async function deleteFreightRate(rate: FreightRate) {
    try {
      return await unsafeDeleteFreightRate(rate)
    } catch (error: any) {
      toss(error?.message || error)
      return false
    }
  }

  async function unsafeDeleteFreightRate(rate: FreightRate) {
    // since we are using sample data, we will just remove the rate from the sample data
    const index = freightRateData.indexOf(rate)
    if (index < 0) throw toss("rate not found")

    if (index === 0) {
      if (freightRateData.length > 1) {
        // if this is the first rate, we need to update the end date of the next rate
        const priorRate = freightRateData[1]
        const priorStartDate = asDate(priorRate.start_date)
        const priorEndDate = asDate(priorRate.end_date)
        const message = MESSAGE_TEMPLATES.delete_prev(
          priorStartDate,
          priorEndDate
        )
        if (!confirm(message)) return false
      }
    } else {
      // if this is not the first rate, we need to update the end date of the next rate
      const nextRate = freightRateData[index - 1]
      const nextStartDate = asDate(nextRate.start_date)
      const nextEndDate = blankIfInfinity(asDate(nextRate.end_date))
      const newNextStartDate = asDate(rate.start_date)
      const message = MESSAGE_TEMPLATES.delete_next(
        nextStartDate,
        nextEndDate,
        newNextStartDate
      )
      if (!confirm(message)) return false
    }
    const response = await api.deleteRate(rate.start_date)
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw toss("Rate not found")
        default:
          const data = await response.json()
          throw toss(data?.message || "Error deleting rate")
      }
    }

    // merge the results into freightRateData
    await mergeDiffgram(response)

    return true
  }

  type HiliteFields = keyof FreightRate

  async function mergeDiffgram(response: Response) {
    const data = (await response.json()) as DiffGram
    if (data.deletes) {
      freightRateData = freightRateData.filter(
        (r) => !data.deletes.includes(r.start_date)
      )
    }
    if (data.updates) {
      // fetch the rates that were updated
      const updatedRates = await Promise.all(
        data.updates.map((key) => api.getRates(key, 1))
      )
      mergeFreightItems(updatedRates.flat())
    }
    if (data.inserts) {
      // fetch the rates that were inserted
      const updatedRates = await Promise.all(
        data.inserts.map((key) => api.getRates(key, 1))
      )
      mergeFreightItems(updatedRates.flat())
    }
  }

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
    try {
      console.log("getMoreData")
      return await unsafeGetMoreData()
    } catch (err: any) {
      toss(err?.message || err)
    }
  }

  async function unsafeGetMoreData() {
    let startDate = 0
    if (freightRateData && freightRateData.length) {
      startDate = freightRateData[freightRateData.length - 1].start_date
      startDate = startDate - ONE_DAY
    }
    const moreData = await api.more(startDate, 12)
    if (!moreData.length) {
      proposeToast("No results found")
      return
    }

    freightRateData.push(...moreData)
    sortFreightRates()
  }

  function sortFreightRates() {
    freightRateData = freightRateData.sort(
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
      <div class={`th align-right port`}>LB</div>
      <div class={`th align-right port`}>NY</div>
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
          {blankIfInfinity(asDate(rate.end_date)) || "..."}
        </div>
        <!-- write a cell for each port rate -->
        <div class={`align-right port1 title`}>LB</div>
        <div
          class={`align-right port_rate1 value`}
          class:hilite={isHiliteHack(rate, `port1_rate`)}
        >
          {asDecimal(rate.port1_rate)}
        </div>
        <div class={`align-right port2 title`}>LB</div>
        <div
          class={`align-right port_rate2 value`}
          class:hilite={isHiliteHack(rate, `port2_rate`)}
        >
          {asDecimal(rate.port2_rate)}
        </div>
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
          <button class="delete" on:click={() => deleteFreightRate(rate)}>
            <TrashIcon />
          </button>
          <button class="edit" on:click={() => editFreightRate(rate)}>
            <PencilIcon />
          </button>
        </div>
      {/each}
      <nav>
        <button
          title="Alt+M"
          on:click={async () => {
            await getMoreData()
            // scroll to the bottom of the page
            window.scrollTo(0, document.body.scrollHeight)
          }}>More Rows</button
        >
      </nav>
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
        <!-- write a row for each port -->
        <label for={"port1_rate"}>LB</label>
        <input
          type="number"
          name={"port1_rate"}
          min="0.01"
          step="0.01"
          required
        />
        <label for={"port2_rate"}>NY</label>
        <input
          type="number"
          name={"port2_rate"}
          min="0.01"
          step="0.01"
          required
        />
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
    grid-column-start: 1;
    grid-column-end: -1;
    display: flex;
    flex-direction: row;
    justify-content: center;
    /* align buttons to the right */
    justify-content: flex-end;
    gap: 1em;
    padding: 1em;
    padding-bottom: 0;
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
