import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const links = sqliteTable("airbnb", {
  link: text("link").notNull().primaryKey(),
  staysCount: integer("staysCount").notNull(),
});

export const stays = sqliteTable("stays", {
  name: text("name").notNull(),
  city: text("city").notNull(),
  parentLink: text("parentLink").references(() => links.link),
  link: text("link").notNull().primaryKey(),
  price: text("price").notNull(),
  date: text("date").notNull(),
});
