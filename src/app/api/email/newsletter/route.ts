import { createHash, randomBytes } from 'node:crypto'
import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'
import { getAdminDb } from '@/firebase/admin'
import { sendNewsletterWelcomeEmail } from '@/services/email.service'

const input = z.object({ email: z.string().trim().toLowerCase().max(254).email() })

export async function POST(request: Request) {
  const parsed = input.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'Invalid email address' }, { status: 400 })
  try {
    const { email } = parsed.data
    const db = getAdminDb()
    const ref = db.collection('newsletterSubscriptions').doc(createHash('sha256').update(email).digest('hex'))
    const newToken = randomBytes(32).toString('hex')
    const token = await db.runTransaction(async transaction => {
      const subscription = (await transaction.get(ref)).data()
      if (subscription) return subscription.welcomeSent ? null : subscription.token as string
      transaction.create(ref, { email, token: newToken, createdAt: FieldValue.serverTimestamp() })
      return newToken
    })
    if (token) {
      await sendNewsletterWelcomeEmail(email, token)
      await db.runTransaction(async transaction => {
        if ((await transaction.get(ref)).get('token') === token) transaction.update(ref, { welcomeSent: true })
      })
    }
    return Response.json({ success: true })
  } catch (error) {
    console.error('Newsletter subscription failed', error)
    return Response.json({ error: 'Newsletter unavailable' }, { status: 502 })
  }
}
