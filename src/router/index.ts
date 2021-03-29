import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Home from "../views/Home.vue";

import Main from "../components/MainMenu/Main.vue";
import Settings from "../components/MainMenu/Settings.vue";
import Info from "../components/MainMenu/Info.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home,

    children: [
      {
        path: "",
        component: Main,
      },
      {
        path: "/settings",
        component: Settings,
      },
      {
        path: "/info",
        component: Info,
      },
    ],
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
