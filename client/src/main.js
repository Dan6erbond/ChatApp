import Buefy from "buefy";
import Vue from "vue";
import VueApollo from "vue-apollo";
import App from "./App.vue";
import "./assets/scss/app.scss";
import "./helpers/filters";
import router from "./router";
import store from "./store";
import { apolloProvider } from "./vue-apollo";

Vue.use(Buefy);
Vue.use(VueApollo);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  apolloProvider,
  render: h => h(App),
}).$mount("#app");
