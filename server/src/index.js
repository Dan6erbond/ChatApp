import { ApolloServer, gql, PubSub, withFilter } from "apollo-server-express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { GraphQLScalarType, Kind } from "graphql";
import http from "http";
import knex from "knex";
import JwtManager from "./jwtManager";
import dbConfig from "./knex/knexfile";
import PasswordManager from "./passwordManager";
import UserManager from "./userManager";

dotenv.config();

const db = knex(dbConfig[process.env.NODE_ENV]);

const PORT = process.env.PORT | 4000;

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    username: String!
    chats: [Chat!]!
    status: OnlineStatus!
  }

  type Chat {
    id: ID!
    name: String
    users: [User!]!
    messages: [Message!]!
  }

  type Message {
    id: ID!
    body: String!
    sentAt: Date!
    chat: Chat!
    author: User!
  }

  enum OnlineStatus {
    ONLINE
    OFFLINE
  }

  type Query {
    users: [User!]!
    me: User
    chats: [Chat!]!
    chat(id: ID!): Chat
    messages(chatId: ID!): [Message!]
  }

  input RegisterInput {
    username: String!
    password: String!
  }

  type RegisterPayload {
    user: User!
    token: String!
  }

  input LoginInput {
    username: String!
    password: String!
  }

  type LoginPayload {
    user: User!
    token: String!
  }

  input MessageInput {
    chatId: ID!
    body: String!
  }

  type MessagePayload {
    message: Message!
  }

  input CreateChatInput {
    userId: ID!
    name: String
  }

  type CreateChatPayload {
    chat: Chat!
  }

  input AddUserInput {
    chatId: ID!
    userId: ID!
  }

  type AddUserPayload {
    chat: Chat!
    newUser: User!
  }

  type UserOnlineStatusEvent {
    user: User!
    status: OnlineStatus!
  }

  input TypingInput {
    chatId: ID!
  }

  type UserTypingEvent {
    user: User!
    time: Date!
  }

  type Mutation {
    register(input: RegisterInput!): RegisterPayload!
    login(input: LoginInput!): LoginPayload!
    message(input: MessageInput!): MessagePayload!
    createChat(input: CreateChatInput!): CreateChatPayload!
    addUser(input: AddUserInput!): AddUserPayload!
    typing(input: TypingInput!): Boolean
  }

  type Subscription {
    onMessage(chatId: ID!): Message!
    onUserOnlineStatus(userId: ID): UserOnlineStatusEvent!
    onUserTyping(chatId: ID!): UserTypingEvent!
  }
`;

const ON_MESSAGE = "ON_MESSAGE";
const ON_USER_ONLINE_STATUS = "ON_USER_ONLINE_STATUS";
const ON_USER_TYPING = "ON_USER_TYPING";

const pubsub = new PubSub();

const resolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
  User: {
    chats: async (user) => {
      return await db
        .select()
        .from("chats")
        .whereExists(function () {
          this.select()
            .from("chats_users")
            .whereRaw("chats_users.chat_id = chats.id")
            .where("user_id", user.id);
        });
    },
    status: (user, _, { userManager }) => {
      if (userManager.onlineUsers.find((u) => u.id === user.id)) {
        return "ONLINE";
      }
      return "OFFLINE";
    },
  },
  Chat: {
    users: async (chat) => {
      return await db
        .select()
        .from("chats_users")
        .where("chat_id", chat.id)
        .join("users", "users.id", "chats_users.user_id");
    },
    messages: async (chat) => {
      const messages = await db
        .select()
        .from("messages")
        .where("chat_id", chat.id)
        .orderBy("sent_at");
      return messages.map((o) => ({ ...o, sentAt: new Date(o.sent_at) }));
    },
    name: async (chat, _, { user }) => {
      if (chat.name) {
        return chat.name;
      }
      const users = await db
        .select()
        .from("chats_users")
        .where("chat_id", chat.id)
        .where("user_id", "!=", user.id)
        .leftJoin("users", "chats_users.user_id", "users.id");
      if (users.length === 1) {
        return users[0].username;
      } else if (!users.length) {
        return "";
      }
      return `${users[0].username} and ${users.length - 1} more`;
    },
  },
  Message: {
    author: async (message) => {
      const author = await db
        .select()
        .from("users")
        .where("id", message.author_id)
        .first();
      return author;
    },
  },
  Query: {
    me: async (_, __, { user }) => {
      return await db
        .select()
        .from("users")
        .whereRaw("LOWER(username) = ?", user.username.toLowerCase())
        .first();
    },
    messages: async (_, { chatId }) => {
      const messages = await db
        .select({
          id: "id",
          body: "body",
          sentAt: "sent_at",
        })
        .from("messages")
        .where("chat_id", chatId)
        .orderBy("sent_at");
      return messages.map((o) => ({ ...o, sentAt: new Date(o.sent_at) }));
    },
    chats: async (_, __, { user }) => {
      return await db
        .select()
        .from("chats")
        .whereExists(function () {
          this.select()
            .from("chats_users")
            .whereRaw("chats_users.chat_id = chats.id")
            .where("user_id", user.id);
        });
    },
    chat: async (_, { id }) => {
      return await db.select().from("chats").where("id", id).first();
    },
    users: async () => {
      return await db.select().from("users");
    },
  },
  Mutation: {
    register: async (_, { input }, { passwordManager, jwtManager }) => {
      const exists = await db
        .select()
        .from("users")
        .where("username", input.username)
        .first();

      if (!exists) {
        const password = await passwordManager.hashPassword(input.password);
        const user = { ...input, password };
        const [id] = await db.insert(user, ["id"]).into("users");

        const token = jwtManager.signUser(user);

        return {
          token,
          user: {
            id,
            username: user.username,
          },
        };
      }
    },
    login: async (_, { input }, { passwordManager, jwtManager }) => {
      const dbUser = await db
        .select()
        .from("users")
        .whereRaw("LOWER(username) = ?", input.username.toLowerCase())
        .first();
      const match = await passwordManager.comparePassword(
        input.password,
        dbUser.password
      );

      if (match) {
        const token = jwtManager.signUser(dbUser);

        return {
          token,
          user: {
            id: dbUser.id,
            username: dbUser.username,
          },
        };
      }
    },
    message: async (_, { input }, { user }) => {
      if (!input.body) return;

      const chatExists = await db
        .select()
        .from("chats")
        .where("id", input.chatId)
        .first();

      if (chatExists) {
        const sentAt = new Date();

        let message = {
          ...input,
          sentAt,
          author_id: user.id,
        };

        const [id] = await db
          .insert(
            {
              body: input.body,
              chat_id: input.chatId,
              author_id: user.id,
              sent_at: sentAt,
            },
            ["id"]
          )
          .into("messages");

        message = { ...message, id };

        pubsub.publish(ON_MESSAGE, {
          onMessage: message,
          chatId: input.chatId,
          userId: user.id,
        });

        return { message };
      }
    },
    createChat: async (_, { input }, { user }) => {
      const chatExists = await db
        .select()
        .from("chats_users")
        .where("user_id", user.id)
        .whereExists(function () {
          this.select()
            .from({ cu: "chats_users" })
            .whereRaw("cu.chat_id = chats_users.chat_id")
            .where("user_id", input.userId);
        })
        .whereNotExists(function () {
          this.select()
            .from({ cu: "chats_users" })
            .whereRaw("cu.chat_id = chats_users.chat_id")
            .where("user_id", "!=", input.userId)
            .where("user_id", "!=", user.id);
        })
        .first();

      if (user && !chatExists) {
        const [id, name] = await db
          .insert({ name: input.name }, ["id", "name"])
          .into("chats");
        await db.insert({ chat_id: id, user_id: user.id }).into("chats_users");
        await db
          .insert({ chat_id: id, user_id: input.userId })
          .into("chats_users");

        return { chat: { id, name } };
      }
    },
    typing: async (_, { input }, { user }) => {
      pubsub.publish(ON_USER_TYPING, {
        onUserTyping: {
          user,
          time: new Date(),
        },
        chatId: input.chatId,
        userId: user.id,
      });

      return true;
    },
  },
  Subscription: {
    onMessage: {
      subscribe: withFilter(
        (_, { chatId }, { user }) => {
          const exists = db
            .select()
            .from("chats_users")
            .where("chat_id", chatId)
            .where("user_id", user.id)
            .first();

          if (exists) {
            return pubsub.asyncIterator(ON_MESSAGE);
          }
        },
        (payload, { chatId }, { user }) =>
          payload.chatId === chatId && payload.userId !== user.id
      ),
    },
    onUserOnlineStatus: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(ON_USER_ONLINE_STATUS),
        (payload, { userId }, { user }) => {
          if (userId) {
            return payload.userId === userId && payload.userId !== user.id;
          }
          return payload.userId !== user.id;
        }
      ),
    },
    onUserTyping: {
      subscribe: withFilter(
        (_, { chatId }, { user }) => {
          const exists = db
            .select()
            .from("chats_users")
            .where("chat_id", chatId)
            .where("user_id", user.id)
            .first();

          if (exists) {
            return pubsub.asyncIterator(ON_USER_TYPING);
          }
        },
        (payload, { chatId }, { user }) =>
          payload.chatId === chatId && payload.userId !== user.id
      ),
    },
  },
};

const app = express();
app.set("jwtManager", new JwtManager(process.env.JWT_KEY));
app.set("passwordManager", new PasswordManager());
app.set("userManager", new UserManager());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      // check connection for metadata
      return connection.context;
    }
    const jwtManager = app.get("jwtManager");
    const passwordManager = app.get("passwordManager");
    const userManager = app.get("userManager");

    let user;
    // check from req
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1] || "";
      user = jwtManager.verifyUser(token);
    }

    return { user, jwtManager, passwordManager, userManager };
  },
  subscriptions: {
    onConnect: (connectionParams) => {
      let user;
      if (connectionParams.authorization) {
        const jwtManager = app.get("jwtManager");
        const token = connectionParams.authorization.split(" ")[1] || "";
        user = jwtManager.verifyUser(token);

        const userManager = app.get("userManager");
        userManager.userOnline(user);

        pubsub.publish(ON_USER_ONLINE_STATUS, {
          userId: user.id,
          onUserOnlineStatus: {
            user,
            status: "ONLINE",
          },
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`Websocket connection by ${user.username}.`);
        }
      }
      return { user };
    },
    onDisconnect: async (_, context) => {
      const { user } = await context.initPromise;

      if (user) {
        const userManager = app.get("userManager");
        userManager.userOffline(user);

        pubsub.publish(ON_USER_ONLINE_STATUS, {
          userId: user.id,
          onUserOnlineStatus: {
            user,
            status: "OFFLINE",
          },
        });

        if (process.env.NODE_ENV === "development") {
          console.log(`Websocket disconnect by ${user.username}.`);
        }
      }
    },
  },
});
server.applyMiddleware({ app, path: "/graphql" });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.use(cors());
app.use(bodyParser.json());

httpServer.listen({ port: PORT }, () => {
  console.log(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
