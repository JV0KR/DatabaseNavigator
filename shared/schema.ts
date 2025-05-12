import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Store database connections
export const connections = pgTable("connections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  server: text("server").notNull(),
  authentication: text("authentication").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  database: text("database").notNull(),
  saveCredentials: boolean("save_credentials").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Store query history
export const queries = pgTable("queries", {
  id: serial("id").primaryKey(),
  connectionId: integer("connection_id").references(() => connections.id),
  query: text("query").notNull(),
  executionTime: integer("execution_time"), // in milliseconds
  status: text("status").notNull(), // success, error
  error: text("error"),
  results: json("results"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema for inserting a new connection
export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting a new query
export const insertQuerySchema = createInsertSchema(queries).omit({
  id: true,
  createdAt: true,
});

// Types
export type Connection = typeof connections.$inferSelect;
export type InsertConnection = z.infer<typeof insertConnectionSchema>;

export type Query = typeof queries.$inferSelect;
export type InsertQuery = z.infer<typeof insertQuerySchema>;

// Additional schema for database connections with validated fields
export const connectionFormSchema = z.object({
  name: z.string().min(1, "Connection name is required"),
  server: z.string().min(1, "Server address is required"),
  authentication: z.enum(["SQL Server Authentication", "Windows Authentication"]),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  database: z.string().min(1, "Database name is required"),
  saveCredentials: z.boolean().default(false),
});

// Schema for query execution
export const executeQuerySchema = z.object({
  connectionId: z.number(),
  query: z.string().min(1, "SQL query is required"),
});

// Type for database table info
export type TableInfo = {
  name: string;
  schema: string;
  type: string;
};

// Type for query result column
export type ResultColumn = {
  name: string;
  type: string;
};

// Type for query result set
export type QueryResult = {
  columns: ResultColumn[];
  rows: Record<string, any>[];
  rowCount: number;
  executionTime: number;
};
