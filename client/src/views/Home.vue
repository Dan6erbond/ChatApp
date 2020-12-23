<template>
  <div class="home container">
    <h2 class="has-text-centered is-size-1">Log In</h2>
    <section>
      <br />
      <form @submit.prevent="login" class="login-form">
        <b-field label="Username">
          <b-input placeholder="Username" v-model="username"></b-input>
        </b-field>
        <b-field label="Password">
          <b-input
            type="password"
            password-reveal
            placeholder="Password"
            v-model="password"
          ></b-input>
        </b-field>
        <b-button class="button is-primary" native-type="submit">
          Log In
        </b-button>
      </form>
    </section>
  </div>
</template>

<script>
import gql from "graphql-tag";
import { mapMutations } from "vuex";

export default {
  name: "Home",
  data() {
    return {
      username: "",
      password: "",
      messages: [],
      onlineUsers: [],
    };
  },
  apollo: {
    messages: gql`
      query GetMessages {
        messages(chatId: 10) {
          id
          body
          sentAt
        }
      }
    `,
    onlineUsers: gql`
      query GetOnlineUsers {
        onlineUsers {
          id
          username
        }
      }
    `,
    $subscribe: {
      onUserOnlineStatus: {
        query: gql`
          subscription OnUserOnlineStatus {
            onUserOnlineStatus {
              user {
                id
                username
              }
              status
            }
          }
        `,
        result({ data }) {
          console.log(data.onUserOnlineStatus);
        },
      },
    },
  },
  methods: {
    ...mapMutations(["setUser"]),
    async login() {
      const { data } = await this.$apollo.mutate({
        mutation: gql`
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              user {
                id
                username
              }
              token
            }
          }
        `,
        variables: {
          input: {
            username: this.username,
            password: this.password,
          },
        },
      });
      localStorage.setItem("token", data.login.token);
      this.setUser({ user: data.login.user });
      this.$router.push("/chats");
    },
  },
};
</script>

<style lang="scss" scoped>
.login-form {
  margin: 0 auto;
  max-width: 350px;
}
</style>
