import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const parentProfiles = pgTable('parent_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  phone: text('phone').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const otpCodes = pgTable('otp_codes', {
  id: text('id').primaryKey(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  attempts: integer('attempts').notNull().default(0),
  consumed: boolean('consumed').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const parentSessions = pgTable('parent_sessions', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').notNull(),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
})

export const children = pgTable('children', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').notNull(),
  name: text('name').notNull(),
  birthYear: integer('birth_year'),
  groupName: text('group_name'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const certificates = pgTable('medical_certificates', {
  id: text('id').primaryKey(),
  parentId: text('parent_id').notNull(),
  childId: text('child_id').notNull(),
  fileUrl: text('file_url').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type ParentProfile = typeof parentProfiles.$inferSelect
