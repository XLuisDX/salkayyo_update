import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/firebase/admin'
import { CartItem, RecipientData } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, recipientData, userId } = body as {
      items: CartItem[]
      recipientData: RecipientData
      userId: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      )
    }

    if (!recipientData || !userId) {
      return NextResponse.json(
        { error: 'Missing recipient data or user ID' },
        { status: 400 }
      )
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    )
    const tax = subtotal * 0.09
    const total = subtotal + tax

    // Create order in Firestore first
    const db = getAdminDb()
    const orderRef = await db.collection('orders').add({
      userId,
      items: items.map((item) => ({
        productId: item.product.id,
        title: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.images?.[0] || '',
      })),
      subtotal,
      tax,
      total,
      status: 'pending',
      paymentMethod: 'stripe',
      recipientData,
      createdAt: new Date(),
    })

    // Create Stripe line items
    const lineItems = items.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.product.title,
            description: item.product.description,
            images: item.product.images?.slice(0, 1) || [],
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })
    )

    // Add tax as a line item
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Tax (9%)',
          description: 'Sales tax',
          images: [],
        },
        unit_amount: Math.round(tax * 100),
      },
      quantity: 1,
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/orders/${orderRef.id}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/en/cart?canceled=true`,
      metadata: {
        orderId: orderRef.id,
        userId,
      },
      customer_email: undefined,
      shipping_address_collection: undefined,
    })

    // Update order with Stripe session ID
    await orderRef.update({
      stripeSessionId: session.id,
    })

    return NextResponse.json({ checkoutUrl: session.url, orderId: orderRef.id })
  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
