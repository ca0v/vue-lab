import type { paths, components } from "../apiProxy"
import { Fetcher } from "openapi-typescript-fetch"

const BASEURL = "http://localhost:5085"

interface API {
  getPersonMovies(id: string): Promise<Array<components["schemas"]["Title"]>>
  getCrew(titleId: string): Promise<Array<components["schemas"]["Crew"]>>
  getMovie(titleId: string): Promise<components["schemas"]["Title"]>
  getPerson(id: string): Promise<components["schemas"]["Person"]>

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
  getPersonMovies: fetcher
    .path("/api/Person/{id}/movies")
    .method("get")
    .create(),
  getPerson: fetcher.path("/api/Person/{id}").method("get").create(),
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
  getPersonMovies: async (id) => {
    const res = await fetcherApi.getPersonMovies({ id })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },
  getPerson: async (id) => {
    const res = await fetcherApi.getPerson({ id })
    if (!res.ok) {
      throw new Error(res.statusText)
    }
    return res.data
  },

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
export { fetcherApiWrapper as api1, fetcherApiWrapper as api2 }
