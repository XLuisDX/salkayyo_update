import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/services/email.service'
import { getErrorMessage } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, resetLink } = body

    if (!email || !resetLink) {
      return NextResponse.json(
        { error: 'Missing email or reset link' },
        { status: 400 }
      )
    }

    const { data, error } = await sendPasswordResetEmail(
      email,
      name || 'there',
      resetLink
    )

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, messageId: data?.id })
  } catch (error: unknown) {
    console.error('Email error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
