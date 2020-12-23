import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const persistedState = createPersistedState({
  paths: ["user"],
});

export default new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser(state, { user }) {
      state.user = user;
    },
  },
  actions: {},
  modules: {},
  plugins: [persistedState],
});
