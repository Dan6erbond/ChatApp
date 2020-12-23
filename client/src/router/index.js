import Vue from "vue";
import VueRouter from "vue-router";
import Chat from "../views/Chat.vue";
import Chats from "../views/Chats.vue";
import Home from "../views/Home.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/chats",
    name: "Chats",
    component: Chats,
  },

  {
    path: "/chats/:id",
    name: "Chat",
    component: Chat,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
