<template>
  <div class="chat container">
    <div class="w-100">
      <section>
        <b-navbar shadow :mobile-burger="false" centered>
          <template slot="brand">
            <span v-if="chat" class="ml-4 is-size-3">
              {{ chat.name }}
            </span>
          </template>
        </b-navbar>
      </section>
      <section>
        <div class="msgs mt-6" ref="messages">
          <div v-if="chat">
            <div
              :class="['msg', 'my-4', { received: msg.author.id !== user.id }]"
              v-for="msg in chat.messages"
              :key="msg.id"
            >
              <p class="pb-1">
                <account-icon
                  v-if="msg.author.id !== user.id"
                  :size="16"
                  class="mr-1"
                ></account-icon>
                <strong class="mr-2">{{ msg.author.username }}</strong>
                <span class="is-size-7 has-text-weight-light">
                  {{ new Date(msg.sentAt) | datetime }}
                </span>
                <account-icon v-if="msg.author.id === user.id"></account-icon>
              </p>
              <div class="box">
                {{ msg.body }}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <form @submit.prevent="sendMsg" class="mt-6 pb-4" v-if="chat">
          <b-field label="Message" label-position="on-border">
            <b-input
              v-model="msgInput"
              class="w-100"
              :placeholder="'Message ' + chat.name"
            ></b-input>
            <p class="control">
              <b-button class="button is-primary" native-type="submit">
                Send
              </b-button>
            </p>
          </b-field>
        </form>
        <p>Dan6erbond is typing...</p>
      </section>
    </div>
  </div>
</template>

<script>
import AccountIcon from "vue-material-design-icons/Account.vue";
import { mapState } from "vuex";
import GET_CHAT from "@/graphql/GetChat.gql";
import SEND_MESSAGE from "@/graphql/SendMessage.gql";
import SUBSCRIBE_TO_CHAT from "@/graphql/SubscribeToChat.gql";
import SUBSCRIBE_TO_TYPING from "@/graphql/SubscribeToTyping.gql";

export default {
  name: "Chat",
  components: {
    AccountIcon,
  },
  data() {
    return {
      msgInput: "",
      chat: null,
      usersTyping: [],
    };
  },
  computed: {
    ...mapState(["user"]),
  },
  apollo: {
    chat: {
      query: GET_CHAT,
      variables() {
        return {
          chatId: this.$route.params.id,
        };
      },
      result() {
        if (this.$refs.messages) {
          setTimeout(
            () =>
              (this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight),
            50,
          );
        }
      },
      subscribeToMore: {
        document: SUBSCRIBE_TO_CHAT,
        variables() {
          return {
            chatId: this.$route.params.id,
          };
        },
        updateQuery(previousResult, { subscriptionData }) {
          previousResult.chat.messages.push(subscriptionData.data.onMessage);
          return previousResult;
        },
      },
    },
  },
  methods: {
    async sendMsg() {
      if (!this.msgInput) return;

      /* const { data } = */ await this.$apollo.mutate({
        mutation: SEND_MESSAGE,
        variables: {
          input: {
            chatId: this.$route.params.id,
            body: this.msgInput,
          },
        },
        update: (store, { data: { message } }) => {
          const data = store.readQuery({
            query: GET_CHAT,
            variables: {
              chatId: this.$route.params.id,
            },
          });
          data.chat.messages.push(message.message);
          store.writeQuery({ query: GET_CHAT, data });

          this.msgInput = "";
          this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
        },
        optimisticResponse: {
          message: {
            __typename: "MessagePayload",
            message: {
              __typename: "Message",
              id: -1,
              body: this.msgInput,
              sentAt: new Date().getTime(),
              author: {
                __typename: "User",
                ...this.user,
              },
            },
          },
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/scss/_variables.scss";

.chat {
  height: calc(100vh - 80px);
  padding-top: 20px;
  margin-bottom: -30px;
  display: flex;
}

.msgs {
  overflow-y: scroll;
  height: calc(100vh - 350px);

  /* width */
  &::-webkit-scrollbar {
    width: 10px;
  }

  /* Track */
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  &::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  .msg {
    width: 50%;
    min-width: 350px;
    margin-left: auto;
    padding-right: 1rem;

    p {
      text-align: right;
      padding-right: 0.25rem;
    }

    &.received {
      margin-left: 0;

      p {
        text-align: left;
        padding-left: 0;
      }

      .box {
        background-color: $grey-lighter;
      }
    }
  }
}
</style>
