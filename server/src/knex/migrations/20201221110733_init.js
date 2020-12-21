/* eslint-disable func-names */
exports.up = function (knex) {
  return knex.schema
    .createTable("users", (table) => {
      table.increments("id");
      table.string("username", 255).notNullable();
      table.string("password", 255).notNullable();
    })
    .createTable("chats", (table) => {
      table.increments("id");
      table.string("name", 255);
    })
    .createTable("messages", (table) => {
      table.increments("id");
      table.text("body");
      table.datetime("sent_at");
      table.integer("chat_id").unsigned().notNullable();
      table.integer("author_id").unsigned().notNullable();

      table.foreign("chat_id").references("id").inTable("chats");
      table.foreign("author_id").references("id").inTable("users");
    })
    .createTable("chats_users", (table) => {
      table.increments("id");
      table.integer("chat_id").unsigned().notNullable();
      table.integer("user_id").unsigned().notNullable();

      table.foreign("chat_id").references("id").inTable("chats");
      table.foreign("user_id").references("id").inTable("users");
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable("users")
    .dropTable("chats")
    .dropTable("messages")
    .dropTable("chats_users");
};
