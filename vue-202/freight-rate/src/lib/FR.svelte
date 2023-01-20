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

  const samplePorts = ["LB", "NY"]

  const sampleRateHistoryData: Array<FreightRate> = []

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
    for (let i = 1; i < 12; i++) {
      let start_date = asZulu(2021, 1 - i, 1)
      let end_date = asZulu(2021, 1 - i, 31)
      sampleRateHistoryData.push({
        start_date,
        end_date,
        port_rates: samplePorts.map(createSamplePortRate),
      })
    }
  }
  injectSampleRates()

  function asZulu(year: number, month: number, day: number): number {
    // return a date as a zulu time
    return Date.UTC(year, month - 1, day)
  }

  function asDate(zulu: number): string {
    // return a date as a string
    return new Date(zulu).toLocaleDateString()
  }

  function asDecimal(value: number): string {
    // return a number as a string with 2 decimal places
    return value.toFixed(2)
  }

  let showForm: boolean = false

  function toggleForm() {
    showForm = !showForm
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
          <th>Start Date</th>
          <th>End Date</th>
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
            <td>{asDate(rate.start_date)}</td>
            <td>{asDate(rate.end_date)}</td>
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
    <form class:visible={showForm}>
      <label for="start_date">Start Date</label>
      <input
        type="date"
        name="start_date"
        min={today()}
        value={firstDayOfNextMonth()}
      />
      <label for="end_date">End Date</label>
      <input type="date" name="end_date" readonly value="2100-01-01" />
      <!-- write a row for each port -->
      {#each samplePorts as port}
        <label for={port}>{port}</label>
        <input type="number" name={port} />
      {/each}
      <button>Save</button>
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
