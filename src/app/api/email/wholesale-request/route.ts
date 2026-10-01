import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/firebase/admin'
import {
  sendWholesaleRequestAdminEmail,
  sendWholesaleRequestConfirmationEmail,
} from '@/services/email.service'
import { getErrorMessage } from '@/lib/utils'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, contactName, email, phone, message } = body

    if (!companyName || !contactName || !email || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const db = getAdminDb()
    const docRef = await db.collection('wholesale-requests').add({
      companyName,
      contactName,
      email,
      phone,
      message,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    })

    // The lead is already persisted above — don't let email delivery issues
    // (e.g. an unverified sending domain) block the user-facing confirmation
    // or lose the lead. Log failures for follow-up instead of failing the request.
    try {
      const { error } = await sendWholesaleRequestAdminEmail(
        companyName,
        contactName,
        email,
        phone,
        message
      )
      if (error) {
        console.error('Wholesale admin email error:', error)
      }
    } catch (adminEmailError) {
      console.error('Wholesale admin email error:', adminEmailError)
    }

    try {
      await sendWholesaleRequestConfirmationEmail(email, contactName)
    } catch (confirmationError) {
      console.error('Wholesale confirmation email error:', confirmationError)
    }

    return NextResponse.json({ success: true, id: docRef.id })
  } catch (error: unknown) {
    console.error('Wholesale request error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
