<template>
  <div class="home container">
    <section>
      <h2>Log In</h2>
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
        <b-button class="button is-primary" native-type="submit"
          >Log In</b-button
        >
      </form>
    </section>
  </div>
</template>

<script>
// @ is an alias to /src
import gql from "graphql-tag";

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
    login() {
      console.log(this.username, this.password);
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
