// // import { integer, pgTable, json, text, varchar } from "drizzle-orm/pg-core";

// // export const usersTable = pgTable("users", {
// //   id: integer().primaryKey().generatedAlwaysAsIdentity(),
// //   name: varchar({ length: 255 }).notNull(),
// //   email: varchar({ length: 255 }).notNull().unique(),
// //   credits: integer(),
// // });

// // export const SessionChatTable = pgTable("sessionChatTable", {
// //   id: integer().primaryKey().generatedAlwaysAsIdentity(),
// //   sessionId: varchar().notNull(),
// //   notes: text(),
// //   selectedDoctor: json(),
// //   conversation: json(),
// //   report: json(),
// //   createdBy: varchar().references(() => usersTable.email),
// //   createdOn: varchar(),
// // });
// // Updated schema with proper types and constraints
// import {
//   pgTable,
//   uuid,
//   text,
//   json,
//   timestamp,
//   varchar,
//   integer,
// } from "drizzle-orm/pg-core";
// import { sql } from "drizzle-orm";

// export const usersTable = pgTable("users", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   name: varchar("name", { length: 255 }).notNull(),
//   email: varchar("email", { length: 255 }).notNull().unique(),
//   credits: integer("credits").default(0),
// });

// export const SessionChatTable = pgTable("session_chat", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   sessionId: varchar("session_id", { length: 36 }).notNull(),
//   notes: text("notes"),
//   selectedDoctor: json("selected_doctor"),
//   conversation: json("conversation").default([]),
//   report: json("report").default({}),
//   createdBy: varchar("created_by", { length: 255 }).references(
//     () => usersTable.email
//   ),
//   createdAt: timestamp("created_at").defaultNow(),
// });
import { integer, pgTable, json, text, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer(),
});

export const SessionChatTable = pgTable("sessionChatTable", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  sessionId: varchar().notNull(),
  notes: text(),
  selectedDoctor: json(),
  conversation: json(),
  report: json(),
  createdBy: varchar().references(() => usersTable.email),
  createdOn: varchar(),
});
