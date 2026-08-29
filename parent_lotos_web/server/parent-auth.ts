import { createHash, randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import { and, eq, gt, isNull } from 'drizzle-orm'
import { db } from './db/index.js'
import { parentProfiles, parentSessions } from './db/schema.js'

export const COOKIE = 'lotos_parent_session'
const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export async function createParentSession(parentId: string, res: Response) {
  const token = `${randomUUID()}${randomUUID()}`
  await db.insert(parentSessions).values({
    id: randomUUID(),
    parentId,
    tokenHash: hash(token),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export async function getParentSession(req: Request) {
  const token = req.cookies?.[COOKIE]
  if (!token) return null
  const rows = await db
    .select({ session: parentSessions, parent: parentProfiles })
    .from(parentSessions)
    .innerJoin(parentProfiles, eq(parentProfiles.id, parentSessions.parentId))
    .where(
      and(
        eq(parentSessions.tokenHash, hash(token)),
        isNull(parentSessions.revokedAt),
        gt(parentSessions.expiresAt, new Date()),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

export async function revokeParentSession(req: Request, res: Response) {
  const token = req.cookies?.[COOKIE]
  if (token) {
    await db.update(parentSessions).set({ revokedAt: new Date() }).where(eq(parentSessions.tokenHash, hash(token)))
  }
  res.clearCookie(COOKIE, { path: '/' })
}
