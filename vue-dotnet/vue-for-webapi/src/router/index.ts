import { createRouter, createWebHistory } from "vue-router"
import EditView from "../views/EditView.vue"
import PersonView from "../views/PersonView.vue"
import MovieView from "../views/MovieView.vue"
import MovieSearchView from "../views/MovieSearchView.vue"
import Main from "../components/Main.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Main",
      component: Main,
    },
    {
      path: "/edit/:id",
      name: "Edit",
      component: EditView,
    },
    {
      path: "/person/:id",
      name: "PersonView",
      component: PersonView,
    },
    {
      path: "/movies/:id",
      name: "MovieView",
      component: MovieView,
    },
    {
      path: "/movies",
      name: "MovieSearch",
      component: MovieSearchView,
    },
  ],
})

export default router
