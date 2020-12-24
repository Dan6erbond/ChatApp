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
    <section class="sidebar-layout">
      <b-sidebar position="fixed" open type="is-light" fullheight scroll="clip">
        <div class="p-1">
          <b-menu>
            <b-menu-list label="Users">
              <b-menu-item
                icon="account"
                v-for="user in usersToDisplay"
                :key="user.id"
                :label="user.username + ' - ' + user.status"
              >
              </b-menu-item>
            </b-menu-list>
          </b-menu>
        </div>
      </b-sidebar>
    </section>
    <main role="main">
      <router-view />
    </main>
  </div>
</template>

<script>
import MessageIcon from "vue-material-design-icons/Message.vue";
import { mapState } from "vuex";
import GET_USERS from "@/graphql/GetUsers.gql";
import SUBSCRIBE_TO_USERS from "@/graphql/SubscribeToUsers.gql";

export default {
  components: {
    MessageIcon,
  },
  data() {
    return {
      users: [],
    };
  },
  computed: {
    ...mapState(["user"]),
    usersToDisplay() {
      return this.users.filter((u) => {
        if (this.user) {
          return u.id !== this.user.id;
        }
        return true;
      });
    },
  },
  apollo: {
    users: {
      query: GET_USERS,
      subscribeToMore: {
        document: SUBSCRIBE_TO_USERS,
        updateQuery(previousResult, { subscriptionData }) {
          previousResult.users = previousResult.users.map((u) => {
            if (u.id === subscriptionData.data.onUserOnlineStatus.user.id) {
              return {
                ...u,
                status: subscriptionData.data.onUserOnlineStatus.status,
              };
            }
            return u;
          });
          return previousResult;
        },
      },
    },
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
  padding-left: 250px;
}

.b-sidebar {
  .sidebar-content {
    padding-top: 80px;
    padding-left: 10px;
  }
}
</style>
