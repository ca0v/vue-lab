<script lang="ts">
  type PortRate = {
    port: string
    rate: number
  }

  type FreightRate = {
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

  function createSamplePortRate(port: string) {
    return { port, rate: 1000 + Math.random() * 100 }
  }

  // inject sample data for the last 12 months
  function injectSampleRates() {
    // generate for today and go backward 12 months
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = 1
    const offload_rate = 1000 + Math.random() * 100
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
      // update the rate
      rate.start_date = startDate
      rate.offload_rate = parseFloat(data.offload_rate)
      rate.port_rates = portRates

      // update the end date of the previous rate
      const index = sampleRateHistoryData.indexOf(rate) + 1
      if (index < sampleRateHistoryData.length) {
        sampleRateHistoryData[index].end_date = addDay(startDate, -1)
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
        newData.end_date = addDay(priorRate.start_date, -1)
        // if priorRate start date is the same then we have a problem, throw
        if (priorRate.start_date === startDate) {
          alert("duplicate start date")
          return
        }
        // this is the last rate
        priorRate.end_date = addDay(startDate, -1)
        const priorRateIndex = sampleRateHistoryData.indexOf(priorRate)
        // insert the new rate before the prior rate
        sampleRateHistoryData.splice(priorRateIndex, 0, newData)
      } else {
        // add the new rate to the end of the list
        sampleRateHistoryData.push(newData)
      }
      // hilite the new rate
      hiliteRate(newData)
    }

    // trigger redraw
    sampleRateHistoryData = sampleRateHistoryData

    // clear the form data
    resetForm()
    showForm = false
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
        asDate(previousRate.start_date + ONE_DAY)
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
      // if this is the first rate, we need to update the end date of the next rate
      sampleRateHistoryData[1].end_date = inputToZulu(INFINITY_DATE)
    } else {
      // if this is not the first rate, we need to update the end date of the next rate
      sampleRateHistoryData[index + 1].end_date = rate.end_date
    }
    // remove the rate from the sample data
    sampleRateHistoryData = sampleRateHistoryData.filter((r) => r !== rate)
  }

  let hiliteHack = 0

  function hiliteRate(newData: FreightRate) {
    // find the row that was just added
    hiliteHack = newData.start_date
    setTimeout(() => (hiliteHack = 0), 500)
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
      <!-- write a row for each freight rate -->
      {#each sampleRateHistoryData as rate}
        <td class="align-right date1 title">Start Date</td>
        <td
          class="align-right date1 value"
          class:hilite={rate.start_date == hiliteHack}
          >{asDate(rate.start_date)}</td
        >
        <td class="align-right date2 title">End Date</td>
        <td class="align-right date2 value"
          >{blankIfInfinity(asDate(rate.end_date))}</td
        >
        <!-- write a cell for each port rate -->
        {#each rate.port_rates as port, i}
          <td class={`align-right port${i + 1} title`}>{port.port}</td>
          <td class={`align-right port_rate${i + 1} value`}
            >{asDecimal(port.rate)}</td
          >
        {/each}
        <td class="align-right offload title">Offload</td>
        <td class="align-right offload_rate value"
          >{asDecimal(rate.offload_rate)}</td
        >
        <td class="align-right average title">Average</td>
        <td class="align-right average_rate value"
          >{asDecimal(computeAverage(rate))}</td
        >
        <td class="toolbar">
          {#if true}
            <button class="delete" on:click={() => deleteFreightRate(rate)} />
          {/if}
          <button class="edit" on:click={() => editFreightRate(rate)} />
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
        <input type="date" name="end_date" readonly value={INFINITY_DATE} />
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
    <nav>
      <button on:click={() => addNewFreight()}>Add New Rate</button>
    </nav>
  </div>
</div>

<style>
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
    justify-content: flex-end;
    gap: 0.5em;
  }

  .toolbar > button {
    background-color: transparent;
    width: 3em;
    height: 3em;
    margin: 0;
    padding: 0.1em 0.2em;
    color: var(--text-color);
  }

  button.delete {
    color: var(--delete-color);
  }

  button.delete::before {
    content: "🗑";
  }

  button.edit::before {
    content: "✎";
  }

  button.edit {
    color: var(--border-color-lite);
  }

  button.edit:hover {
    border-color: var(--border-color-intense);
  }

  button.delete:hover {
    border-color: var(--delete-color-intense);
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
    grid-auto-rows: 3em;
    font-size: larger;
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

  .table .hilite {
    background-color: blue;
    border: 1px solid red;
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
