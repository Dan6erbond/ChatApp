<template>
  <div class="chats container">
    <h1 class="is-size-2">Chats</h1>
    {{ $route.params.id }}
    <section>
      <div class="is-flex is-flex-direction-column">
        <router-link
          :to="{ name: 'Chat', params: { id: chat.id } }"
          v-for="chat in chats"
          :key="chat.id"
        >
          <div class="box chat is-pointer">
            <article class="media">
              <div class="media-content">
                <div class="content">
                  <p>
                    <strong>{{ chat.name }}</strong>
                  </p>
                  <p v-for="user in chat.users" :key="user.id">
                    <account-icon></account-icon> {{ user.username }}
                  </p>
                </div>
              </div>
            </article>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script>
import gql from "graphql-tag";
import AccountIcon from "vue-material-design-icons/Account.vue";

export default {
  name: "Chats",
  components: {
    AccountIcon,
  },
  data() {
    return {
      chats: [],
    };
  },
  apollo: {
    chats: gql`
      query GetChats {
        chats {
          id
          name
          users {
            id
            username
          }
        }
      }
    `,
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.chat {
  &:hover {
    background-color: $grey-lighter;
  }
}
</style>
