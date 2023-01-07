import type { paths, components } from "../apiProxy"
import { Fetcher } from "openapi-typescript-fetch"

const BASEURL = "http://localhost:5085"

interface API {
  getMyDatabase(): Promise<
    paths["/api/MyDatabase"]["get"]["responses"]["200"]["content"]["application/json"]
  >
  updateMyDatabase(
    item: components["schemas"]["MyTable"]
  ): Promise<components["schemas"]["MyTable"]>
}

class Api implements API {
  private readonly fetchOptions = {
    method: "GET",
    mode: "cors" as RequestMode,
    credentials: "include" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
    },
  }
  constructor(private readonly baseUrl: string) {}

  async getMyDatabase() {
    type ET = paths["/api/MyDatabase"]["get"]
    const endpoint: keyof paths = "/api/MyDatabase"

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...this.fetchOptions,
    })

    if (response.status == 200) {
      const data: ET["responses"]["200"]["content"]["application/json"] =
        await response.json()
      return data
    } else {
      throw new Error(response.statusText)
    }
  }

  async updateMyDatabase(item: components["schemas"]["MyTable"]) {
    type ET = paths["/api/MyDatabase"]["post"]
    const endpoint: keyof paths = "/api/MyDatabase"

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...this.fetchOptions,
      method: "POST",
      body: JSON.stringify(item),
    })

    if (response.status != 200) {
      throw new Error(response.statusText)
    }

    return (await response.json()) as components["schemas"]["MyTable"]
  }
}

const fetcher = Fetcher.for<paths>()
fetcher.configure({
  baseUrl: BASEURL,
  use: [
    /* middleware */
  ],
  init: {
    credentials: "include",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
  },
})

const fetcherApi = {
  getMyDatabase: fetcher.path("/api/MyDatabase").method("get").create(),
  getMyDatabaseById: fetcher
    .path("/api/MyDatabase/{id}")
    .method("get")
    .create(),
  updateMyDatabase: fetcher.path("/api/MyDatabase").method("post").create(),
}

const fetcherApiWrapper: API = {
  getMyDatabase: async () => {
    const res = await fetcherApi.getMyDatabase({})
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },
  updateMyDatabase: async (item) => {
    const res = await fetcherApi.updateMyDatabase(item)
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },
}
const api = new Api(BASEURL)

export { api as api1, fetcherApiWrapper as api2 }
