import { char, integer, pgTable } from 'drizzle-orm/pg-core'

export const accounts = pgTable('accounts', {
  id: char('id', { length: 64 }).primaryKey(),
  balance: integer('balance').notNull(),
})