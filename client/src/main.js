// import Buefy from "buefy";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/scss/app.scss";
import router from "./router";
import store from "./store";

createApp(App)
  .use(store)
  .use(router)
  // .use(Buefy)
  .mount("#app");
