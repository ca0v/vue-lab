import type { paths, components } from "../apiProxy"
import { Fetcher } from "openapi-typescript-fetch"

const BASEURL = "http://localhost:5085"

interface API {
  getCrew(titleId: string): Promise<Array<components["schemas"]["Crew"]>>
  getMovie(titleId: string): Promise<components["schemas"]["Title"]>

  searchForMovie(
    query: string
  ): Promise<
    paths["/api/Title"]["get"]["responses"]["200"]["content"]["application/json"]
  >

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

  async getCrew(titleId: string) {
    type ET = paths["/api/Crew/{id}"]["get"]
    const endpoint: keyof paths = "/api/Crew/{id}"

    const response = await fetch(
      `${this.baseUrl}${endpoint}`.replace("{id}", titleId),
      {
        ...this.fetchOptions,
      }
    )

    if (response.status == 200) {
      const data: ET["responses"]["200"]["content"]["application/json"] =
        await response.json()
      return data
    } else {
      throw response.statusText
    }
  }

  async getMovie(titleId: string) {
    type ET = paths["/api/Title/{id}"]["get"]
    const endpoint: keyof paths = "/api/Title"

    const response = await fetch(`${this.baseUrl}${endpoint}/${titleId}`, {
      ...this.fetchOptions,
    })

    if (response.status == 200) {
      const data: components["schemas"]["Title"] = await response.json()
      return data
    } else {
      throw response.statusText
    }
  }

  async searchForMovie(query: string) {
    type ET = paths["/api/Title/search/{searchString}"]["get"]
    const endpoint: keyof paths = "/api/Title"

    const response = await fetch(`${this.baseUrl}${endpoint}/search/${query}`, {
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
  getCrew: fetcher.path("/api/Crew/{id}").method("get").create(),
  getMovie: fetcher.path("/api/Title/{id}").method("get").create(),
  searchForMovie: fetcher
    .path("/api/Title/search/{searchString}")
    .method("get")
    .create(),
  getMyDatabase: fetcher.path("/api/MyDatabase").method("get").create(),
  getMyDatabaseById: fetcher
    .path("/api/MyDatabase/{id}")
    .method("get")
    .create(),
  updateMyDatabase: fetcher.path("/api/MyDatabase").method("post").create(),
}

const fetcherApiWrapper: API = {
  getCrew: async (titleId) => {
    const res = await fetcherApi.getCrew({ id: titleId })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },

  getMovie: async (titleId) => {
    const res = await fetcherApi.getMovie({ id: titleId })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },

  searchForMovie: async (query) => {
    const res = await fetcherApi.searchForMovie({ searchString: query })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },
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
