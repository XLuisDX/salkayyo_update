import { getAdminAuth } from '@/firebase/admin'
import { sendVerificationEmail } from '@/services/email.service'

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) return Response.json({ error: { message: 'Sign in to continue' } }, { status: 401 })

  const auth = getAdminAuth()
  const user = await auth.verifyIdToken(token, true).catch(() => null)
  if (!user) return Response.json({ error: { message: 'Sign in to continue' } }, { status: 401 })

  try {
    const account = await auth.getUser(user.uid)
    if (account.email && !account.emailVerified) {
      const link = await auth.generateEmailVerificationLink(account.email)
      await sendVerificationEmail(account.email, account.displayName || 'there', link)
    }
    return Response.json({ success: true })
  } catch (error) {
    const message = error instanceof Error && error.message.includes('TOO_MANY_ATTEMPTS_TRY_LATER')
      ? 'Too many requests. Please wait a moment before trying again.'
      : 'Failed to send verification email'
    return Response.json({ error: { message } }, { status: 500 })
  }
}
