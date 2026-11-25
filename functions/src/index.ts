import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import type { CreateEmailOptions } from 'resend'
import {
  escapeHtml,
  welcomeEmailTemplate,
  orderConfirmationTemplate,
  orderShippedTemplate,
  orderDeliveredTemplate,
  orderCancelledTemplate,
} from './email-templates'

admin.initializeApp()

const db = admin.firestore()

async function sendEmail(key: string, email: CreateEmailOptions) {
  const sent = db.collection('emailDeliveries').doc(key)
  if ((await sent.get()).exists) return
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + process.env.RESEND_API_KEY,
      'Content-Type': 'application/json',
      'Idempotency-Key': key,
    },
    body: JSON.stringify(email),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error('Resend returned ' + response.status)
  await sent.set({ sentAt: admin.firestore.FieldValue.serverTimestamp() })
}

async function getUser(uid: string) {
  return admin.auth().getUser(uid).catch(error => {
    if (error.code === 'auth/user-not-found') return null
    throw error
  })
}

const APP_URL = process.env.APP_URL || "https://salkayyo.com";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@salkayyo.com";

async function notifyPaidOrder(orderId: string, afterData: admin.firestore.DocumentData) {
  if (afterData.status !== 'paid' || (afterData.paymentMethod === 'paypal' && !afterData.paymentId)) return
  try {
    // Get user email
    const userData = await getUser(afterData.userId)

    if (userData?.email) {
      // Send confirmation email to customer
      await sendEmail('paid-customer-' + orderId, {
        from: "Salkayyo Store <orders@salkayyo.com>",
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
          afterData.paymentMethod,
          APP_URL,
        ),
      });

      console.log(`Confirmation email sent for order ${orderId}`)

      // Notify admin about new order
      await sendEmail('paid-admin-' + orderId, {
        from: "Salkayyo Store <orders@salkayyo.com>",
        to: ADMIN_EMAIL,
        subject: `🔔 New Order #${orderId.slice(0, 8).toUpperCase()} - $${afterData.total.toFixed(2)}`,
        html: `
          <h1>New Order Received!</h1>
          <p><strong>Order #:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
          <p><strong>Customer:</strong> ${escapeHtml(afterData.recipientData.fullName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(userData.email)}</p>
          <p><strong>Total:</strong> $${afterData.total.toFixed(2)}</p>
          <p><strong>Items:</strong> ${afterData.items.length}</p>
          <p><a href="${APP_URL}/en/admin/orders">View in Admin</a></p>
        `,
      });
    }

  } catch (error) {
    console.error('Error processing paid order:', error)
    throw error
  }
}

export const onPaidOrderCreated = functions.runWith({ failurePolicy: true }).firestore
  .document('orders/{orderId}')
  .onCreate((snapshot, context) => notifyPaidOrder(context.params.orderId, snapshot.data()))

export const onOrderPaid = functions.runWith({ failurePolicy: true }).firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    if (change.before.data().status === 'paid') return
    await notifyPaidOrder(context.params.orderId, change.after.data())
  })

// Send shipping notification when order status changes to 'shipped'
export const onOrderShipped = functions.runWith({ failurePolicy: true }).firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status === 'paid' && afterData.status === 'shipped') {
      try {
        const userData = await getUser(afterData.userId)

        if (userData?.email) {
          await sendEmail('shipped-' + orderId, {
            from: "Salkayyo Store <orders@salkayyo.com>",
            to: userData.email,
            subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Shipped! 📦`,
            html: orderShippedTemplate(
              orderId,
              afterData.recipientData.fullName,
              afterData.recipientData,
              afterData.trackingNumber,
              afterData.carrier,
              afterData.estimatedDelivery,
            ),
          });

          console.log(`Shipping notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending shipping notification:', error)
        throw error
      }
    }
  })

// Send delivery notification when order status changes to 'delivered'
export const onOrderDelivered = functions.runWith({ failurePolicy: true }).firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status === 'shipped' && afterData.status === 'delivered') {
      try {
        const userData = await getUser(afterData.userId)

        if (userData?.email) {
          const deliveredAt = new Date(context.timestamp).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })

          await sendEmail('delivered-' + orderId, {
            from: "Salkayyo Store <orders@salkayyo.com>",
            to: userData.email,
            subject: `Your Order #${orderId.slice(0, 8).toUpperCase()} Has Been Delivered! 🎉`,
            html: orderDeliveredTemplate(
              orderId,
              afterData.recipientData.fullName,
              deliveredAt,
            ),
          });

          console.log(`Delivery notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending delivery notification:', error)
        throw error
      }
    }
  })

// Send cancellation notification when order status changes to 'cancelled'
export const onOrderCancelled = functions.runWith({ failurePolicy: true }).firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data()
    const afterData = change.after.data()
    const orderId = context.params.orderId

    if (beforeData.status !== 'cancelled' && afterData.status === 'cancelled') {
      try {
        const userData = await getUser(afterData.userId)

        if (userData?.email) {
          await sendEmail('cancelled-' + context.eventId, {
            from: "Salkayyo Store <orders@salkayyo.com>",
            to: userData.email,
            subject: `Order #${orderId.slice(0, 8).toUpperCase()} Has Been Cancelled`,
            html: orderCancelledTemplate(
              orderId,
              afterData.recipientData.fullName,
              afterData.total,
              afterData.cancellationReason,
              APP_URL,
            ),
          });

          console.log(`Cancellation notification sent for order ${orderId}`)
        }
      } catch (error) {
        console.error('Error sending cancellation notification:', error)
        throw error
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
      .limit(100)
      .get()

    for (const doc of pendingOrders.docs) {
      await db.runTransaction(async transaction => {
        const order = (await transaction.get(doc.ref)).data()
        if (order?.status !== 'pending' || order.inventoryReserved || order.paymentMethod === 'paypal') return
        transaction.update(doc.ref, {
          status: 'cancelled',
          cancellationReason: 'Payment timeout',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      })
    }
  })

// Welcome email on new user creation
export const onUserCreated = functions.runWith({ failurePolicy: true }).firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    const userData = await getUser(snapshot.id)

    if (userData?.email) {
      try {
        await sendEmail('welcome-' + context.eventId, {
          from: "Salkayyo Store <welcome@salkayyo.com>",
          to: userData.email,
          subject: "Welcome to Salkayyo Store! 🎉",
          html: welcomeEmailTemplate(userData.displayName || "there", APP_URL),
        });

        console.log(`Welcome email sent to ${userData.email}`)
      } catch (error) {
        console.error('Error sending welcome email:', error)
        throw error
      }
    }
  })
