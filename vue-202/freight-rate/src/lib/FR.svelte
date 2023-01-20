<script lang="ts">
  type PortRate = {
    port: string
    rate: number
  }

  type FreightRate = {
    start_date: number
    end_date: number
    port_rates: Array<PortRate>
  }

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
    let start_date = asZulu(year, month, day)
    let end_date = asZulu(2100, 1, 1)
    for (let i = 1; i <= 12; i++) {
      const port_rates = samplePorts.map(createSamplePortRate)
      sampleRateHistoryData.push({ start_date, end_date, port_rates })
      end_date = start_date
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

  function toggleForm() {
    showForm = !showForm
  }

  function subtractOneDay(start_date: number): number {
    // return the day before the start_date
    return start_date - 24 * 60 * 60 * 1000
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
    const data = Object.fromEntries(rawData) as { start_date: string }
    // for each port, get the rate
    const portRates = samplePorts.map((port) => {
      return { port, rate: parseFloat(data[port]) }
    })

    // find the latest start date
    const latestStartDate = sampleRateHistoryData[0].start_date
    // if the new start date is earlier than the latest start date, throw an error
    if (inputToZulu(data.start_date) < latestStartDate) {
      alert("Start date must not be earlier than latest start date")
      return
    }

    // update the end date of the previous rate to the day before the new start date
    sampleRateHistoryData[0].end_date = subtractOneDay(
      inputToZulu(data.start_date)
    )

    // add the new rate to the sample data
    // convert the dates to zulu time
    sampleRateHistoryData.unshift({
      start_date: inputToZulu(data.start_date),
      end_date: asZulu(2100, 1, 1),
      port_rates: portRates,
    })

    // trigger redraw
    sampleRateHistoryData = sampleRateHistoryData

    // clear the form data
    inputForm.reset()
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
    <table>
      <thead>
        <tr>
          <th class="align-right">Start Date</th>
          <th class="align-right">End Date</th>
          <!-- write heading for each port type -->
          {#each samplePorts as port}
            <th class="align-right">{port}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        <!-- write a row for each freight rate -->
        {#each sampleRateHistoryData as rate}
          <tr>
            <td class="align-right">{asDate(rate.start_date)}</td>
            <td class="align-right">{asDate(rate.end_date)}</td>
            <!-- write a cell for each port rate -->
            {#each rate.port_rates as port}
              <td class="align-right">{asDecimal(port.rate)}</td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
    <!-- button to add a new rate, date must not be earlier than latest start date -->
    <button on:click={() => toggleForm()}>Add New Rate</button>
    <form class:visible={showForm} bind:this={inputForm}>
      <label for="start_date">Start Date</label>
      <input
        type="date"
        required
        name="start_date"
        min={today()}
        value={firstDayOfNextMonth()}
      />
      <label for="end_date">End Date</label>
      <input type="date" name="end_date" readonly value="2100-01-01" />
      <!-- write a row for each port -->
      {#each samplePorts as port}
        <label for={port}>{port}</label>
        <input type="number" name={port} min="0.01" step="0.01" required />
      {/each}
      <button type="button" on:click={() => save()}>Save</button>
    </form>
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
  }

  form.visible {
    display: block;
  }
</style>
