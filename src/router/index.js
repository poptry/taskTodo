import Vue from "vue";
import VueRouter from "vue-router";
import Main from "@/views/Main.vue";
import Home from "@/views/Home.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Main,
    name: Main,
    redirect: "home",
    children: [
      {
        path: "home",
        component: Home,
      },
    ],
  },
];

const router = new VueRouter({
  routes,
});

export default router;
