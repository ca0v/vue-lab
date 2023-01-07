import { createRouter, createWebHistory } from "vue-router"
import EditView from "../views/EditView.vue"
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
  ],
})

export default router
