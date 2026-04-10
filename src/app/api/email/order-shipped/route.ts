import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/firebase/admin'
import { sendOrderShippedEmail } from '@/services/email.service'
import { getErrorMessage } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, email, trackingNumber, carrier, estimatedDelivery } = body

    if (!orderId || !email) {
      return NextResponse.json(
        { error: 'Missing orderId or email' },
        { status: 400 }
      )
    }

    const db = getAdminDb()
    const orderDoc = await db.collection('orders').doc(orderId).get()

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const orderData = orderDoc.data()!

    const { data, error } = await sendOrderShippedEmail(
      email,
      orderId,
      orderData.recipientData.fullName,
      orderData.recipientData,
      trackingNumber,
      carrier,
      estimatedDelivery
    )

    if (error) {
      console.error('Email error:', error)
      return NextResponse.json(
        { error: 'Failed to send shipping notification' },
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
