exports.up = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.increments("id").primary();
      table.string("username", 255).unique().notNullable();
    })
    .alterTable("chats", (table) => {
      table.increments("id").primary();
    })
    .alterTable("messages", (table) => {
      table.increments("id").primary();
    })
    .alterTable("chats_users", (table) => {
      table.increments("id").primary();
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.increments("id");
      table.string("username", 255).notNullable();
    })
    .alterTable("chats", (table) => {
      table.increments("id");
    })
    .alterTable("messages", (table) => {
      table.increments("id");
    })
    .alterTable("chats_users", (table) => {
      table.increments("id");
    });
};
