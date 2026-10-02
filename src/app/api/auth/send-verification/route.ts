import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/firebase/admin'
import { sendVerificationEmail } from '@/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: { code: 'auth/invalid-email', message: 'Email is required' } },
        { status: 400 }
      )
    }

    try {
      const userRecord = await getAdminAuth().getUserByEmail(email)

      if (!userRecord.emailVerified) {
        const verificationLink = await getAdminAuth().generateEmailVerificationLink(email)

        await sendVerificationEmail(email, userRecord.displayName || 'there', verificationLink)
      }
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code
      // Don't reveal whether the account exists — only re-throw unexpected failures.
      if (code !== 'auth/user-not-found') {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const code = (error as { code?: string; message?: string })?.code
    const rawMessage = error instanceof Error ? error.message : ''

    const message = code === 'auth/too-many-requests' || rawMessage.includes('TOO_MANY_ATTEMPTS_TRY_LATER')
      ? 'Too many requests. Please wait a moment before trying again.'
      : 'Failed to send verification email'

    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
