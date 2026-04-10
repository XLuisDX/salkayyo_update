import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import Stripe from 'stripe'
import { Resend } from 'resend'
import {
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderCancelledTemplate,
} from './email-templates'

admin.initializeApp()

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

const db = admin.firestore()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})
const resend = new Resend(process.env.RESEND_API_KEY)

const APP_URL = process.env.APP_URL || 'https://saklayyo.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@saklayyo.com'

// Stripe Webhook Handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string

  if (!signature) {
    res.status(400).send('Missing stripe-signature header')
    return
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: unknown) {
    const message = getErrorMessage(err)
    console.error('Webhook signature verification failed:', message)
    res.status(400).send(`Webhook Error: ${message}`)
    return
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'paid',
            paymentId: session.payment_intent as string,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`Order ${orderId} marked as paid`)
        }
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.orderId

        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'cancelled',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })

          console.log(`Order ${orderId} cancelled (session expired)`)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.status(200).json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    res.status(500).json({ error: getErrorMessage(error) })
  }
})

// Send order confirmation email when order status changes to 'paid'
export const onOrderPaid = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    // Only proceed if status changed to 'paid'
    if (beforeData.status !== 'paid' && afterData.status === 'paid') {
      try {
        // Get user email
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          // Send confirmation email to customer
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Order Confirmed #${orderId.slice(0, 8).toUpperCase()} ✅`,
            html: orderConfirmationTemplate(
              orderId,
              afterData.recipientData.fullName,
              afterData.items,
              afterData.subtotal,
              afterData.tax,
              afterData.total,
              afterData.recipientData,
              afterData.paymentMethod || 'stripe',
              APP_URL
            ),
          })

          console.log(`Confirmation email sent for order ${orderId}`)

          // Notify admin about new order
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: ADMIN_EMAIL,
            subject: `🔔 New Order #${orderId.slice(0, 8).toUpperCase()} - $${afterData.total.toFixed(2)}`,
            html: `
              <h1>New Order Received!</h1>
              <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
              <p><strong>Customer:</strong> ${afterData.recipientData.fullName}</p>
              <p><strong>Email:</strong> ${userData.email}</p>
              <p><strong>Total:</strong> $${afterData.total.toFixed(2)}</p>
              <p><strong>Items:</strong> ${afterData.items.length}</p>
              <p><a href="${APP_URL}/admin/orders/${orderId}">View in Admin</a></p>
            `,
          })
        }

        // Update product stock
        for (const item of afterData.items) {
          const productRef = db.collection('products').doc(item.productId)
          await productRef.update({
            stock: admin.firestore.FieldValue.increment(-item.quantity),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          })
        }
      } catch (error) {
        console.error('Error processing paid order:', error)
      }
    }
  })

// Send shipping notification when order status changes to 'shipped'
export const onOrderShipped = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status !== 'shipped' && afterData.status === 'shipped') {
      try {
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Shipped! 📦`,
            html: orderShippedTemplate(
              orderId,
              afterData.recipientData.fullName,
              afterData.recipientData,
              afterData.trackingNumber,
              afterData.carrier,
              afterData.estimatedDelivery,
              APP_URL
            ),
          })

          console.log(`Shipping notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending shipping notification:', error)
      }
    }
  })

// Send delivery notification when order status changes to 'delivered'
export const onOrderDelivered = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status !== 'delivered' && afterData.status === 'delivered') {
      try {
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          const deliveredAt = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Been Delivered! 🎉`,
            html: orderDeliveredTemplate(
              orderId,
              afterData.recipientData.fullName,
              deliveredAt,
              APP_URL
            ),
          })

          console.log(`Delivery notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending delivery notification:', error)
      }
    }
  })

// Send cancellation notification when order status changes to 'cancelled'
export const onOrderCancelled = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
      try {
        const userDoc = await db.collection('users').doc(afterData.userId).get()
        const userData = userDoc.data()

        if (userData?.email) {
          await resend.emails.send({
            from: 'Saklayyo Store <orders@saklayyo.com>',
            to: userData.email,
            subject: `Order #${orderId.slice(0, 8).toUpperCase()} Has Been Cancelled`,
            html: orderCancelledTemplate(
              orderId,
              afterData.recipientData.fullName,
              afterData.total,
              afterData.cancellationReason,
              APP_URL
            ),
          })

          console.log(`Cancellation notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending cancellation notification:', error)
      }
    }
  })

// Clean up old pending orders (older than 24 hours)
export const cleanupPendingOrders = functions.pubsub
  .schedule('every 6 hours')
  .onRun(async () => {
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 24)

    const pendingOrders = await db
      .collection('orders')
      .where('status', '==', 'pending')
      .where('createdAt', '<', cutoffTime)
      .get()

    const batch = db.batch()

    pendingOrders.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'cancelled',
        cancellationReason: 'Payment timeout',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      })
    })

    await batch.commit()

    console.log(`Cleaned up ${pendingOrders.size} pending orders`)
  })

// Welcome email on new user creation
export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot) => {
    const userData = snapshot.data()

    if (userData?.email) {
      try {
        await resend.emails.send({
          from: 'Saklayyo Store <welcome@saklayyo.com>',
          to: userData.email,
          subject: 'Welcome to Saklayyo Store! 🎉',
          html: welcomeEmailTemplate(userData.name || 'there', APP_URL),
        })

        console.log(`Welcome email sent to ${userData.email}`)
      } catch (error) {
        console.error('Error sending welcome email:', error)
      }
    }
  })
