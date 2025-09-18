import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Health from "../views/Health.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/health",
    name: "Health",
    component: Health,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
