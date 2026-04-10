import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordChangedEmail } from '@/services/email.service'
import { getErrorMessage } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, ipAddress } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Missing email' },
        { status: 400 }
      )
    }

    const changedAt = new Date().toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    })

    const { data, error } = await sendPasswordChangedEmail(
      email,
      name || 'there',
      changedAt,
      ipAddress
    )

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send password changed email' },
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
