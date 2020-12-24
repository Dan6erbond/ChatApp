<template>
  <div id="app">
    <b-navbar shadow fixed-top class="main-nav" type="is-primary" centered>
      <template slot="brand">
        <router-link
          :to="user ? '/chats' : '/'"
          class="mt-2 mx-2 has-text-white"
        >
          <message-icon :size="48"></message-icon>
        </router-link>
      </template>
    </b-navbar>
    <main role="main">
      <router-view />
    </main>
  </div>
</template>

<script>
import MessageIcon from "vue-material-design-icons/Message.vue";
import { mapState } from "vuex";

export default {
  components: {
    MessageIcon,
  },
  computed: {
    ...mapState(["user"]),
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 30px;
}

.main-nav {
  z-index: 100 !important;
}

main {
  padding-top: 50px;
}
</style>
