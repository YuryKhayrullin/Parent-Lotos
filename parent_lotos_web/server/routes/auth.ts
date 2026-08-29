import { createHash, randomInt, randomUUID } from 'node:crypto'
import type { Request, Response } from 'express'
import { and, desc, eq, gt } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/index.js'
import { otpCodes, parentProfiles } from '../db/schema.js'
import { createParentSession, getParentSession, revokeParentSession } from '../parent-auth.js'

const bodySchema = z.object({ phone: z.string().trim().min(10).max(20) })

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits.startsWith('8') ? `7${digits.slice(1)}` : digits
}

export async function requestOtp(req: Request, res: Response) {
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Некорректный номер телефона' })

  const phone = normalizePhone(parsed.data.phone)
  if (phone.length < 11) return res.status(400).json({ error: 'Некорректный номер телефона' })

  const code = String(randomInt(100000, 1000000))
  const codeHash = createHash('sha256').update(code).digest('hex')
  await db.insert(otpCodes).values({
    id: randomUUID(),
    phone,
    codeHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  })

  const response: { ok: true; expiresIn: number; devCode?: string } = { ok: true, expiresIn: 300 }
  if (process.env.NODE_ENV !== 'production') response.devCode = code
  return res.json(response)
}

const verifySchema = z.object({
  phone: z.string().min(10).max(20),
  code: z.string().regex(/^\d{6}$/),
})

export async function verifyOtp(req: Request, res: Response) {
  const parsed = verifySchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Введите корректный код' })

  const phone = normalizePhone(parsed.data.phone)
  const rows = await db
    .select()
    .from(otpCodes)
    .where(and(eq(otpCodes.phone, phone), eq(otpCodes.consumed, false), gt(otpCodes.expiresAt, new Date())))
    .orderBy(desc(otpCodes.createdAt))
    .limit(1)

  const otp = rows[0]
  if (!otp || otp.attempts >= 5 || createHash('sha256').update(parsed.data.code).digest('hex') !== otp.codeHash) {
    if (otp) await db.update(otpCodes).set({ attempts: otp.attempts + 1 }).where(eq(otpCodes.id, otp.id))
    return res.status(401).json({ error: 'Неверный или просроченный код' })
  }

  await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, otp.id))
  const existing = await db.select().from(parentProfiles).where(eq(parentProfiles.phone, phone)).limit(1)
  const parent =
    existing[0] ??
    (await db.insert(parentProfiles).values({ id: randomUUID(), userId: randomUUID(), phone }).returning())[0]

  await createParentSession(parent.id, res)
  return res.json({ ok: true, parentId: parent.id })
}

export async function logout(req: Request, res: Response) {
  await revokeParentSession(req, res)
  return res.json({ ok: true })
}

export async function me(req: Request, res: Response) {
  const current = await getParentSession(req)
  if (!current) return res.status(401).json({ error: 'Не авторизован' })
  return res.json({ parent: current.parent })
}
