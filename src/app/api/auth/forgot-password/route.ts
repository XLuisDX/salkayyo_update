import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/firebase/admin'
import { sendPasswordResetEmail } from '@/services/email.service'

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
      const resetLink = await getAdminAuth().generatePasswordResetLink(email)

      await sendPasswordResetEmail(email, userRecord.displayName || 'there', resetLink)
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code
      // Don't reveal whether the account exists — only re-throw unexpected failures.
      if (code !== 'auth/user-not-found') {
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send reset email'
    return NextResponse.json({ error: { message } }, { status: 500 })
  }
}
