import type { paths } from "../ApiProxy"
import { Fetcher } from "openapi-typescript-fetch"

const BASEURL = "http://localhost:5085"

interface API {
  getMyDatabase(): Promise<
    paths["/api/MyDatabase"]["get"]["responses"]["200"]["content"]["application/json"]
  >
  //getMyDatabaseById(id: number): paths["/api/MyDatabase/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
}

class Api implements API {
  constructor(private readonly baseUrl: string) {}

  async getMyDatabase() {
    type ET = paths["/api/MyDatabase"]["get"]
    const endpoint: keyof paths = "/api/MyDatabase"

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (response.status == 200) {
      const data: ET["responses"]["200"]["content"]["application/json"] =
        await response.json()
      return data
    } else {
      throw new Error(response.statusText)
    }
  }
}

const fetcher = Fetcher.for<paths>()
fetcher.configure({
  baseUrl: BASEURL,
})

const fetcherApi = {
  getMyDatabase: fetcher.path("/api/MyDatabase").method("get").create(),
  getMyDatabaseById: fetcher.path("/api/MyDatabase/{id}").method("get").create(),
}

const fetcherApiWrapper = {
  getMyDatabase: async () => {
    const res = await fetcherApi.getMyDatabase({})
    if (res.ok) {
      return res.data
    } else {
      throw new Error(res.statusText)
    }
  },
}
const api = new Api(BASEURL)

export { api as api1, fetcherApiWrapper as api2 }
