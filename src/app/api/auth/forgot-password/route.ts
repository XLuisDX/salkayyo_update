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

    const userRecord = await getAdminAuth().getUserByEmail(email)
    const resetLink = await getAdminAuth().generatePasswordResetLink(email)

    await sendPasswordResetEmail(email, userRecord.displayName || 'there', resetLink)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const code = (error as { code?: string })?.code
    const message = error instanceof Error ? error.message : 'Failed to send reset email'
    const status = code === 'auth/user-not-found' ? 404 : 500

    return NextResponse.json({ error: { code, message } }, { status })
  }
}
