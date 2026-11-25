import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminAuth, getAdminDb } from '@/firebase/admin'
import type { OrderItem, RecipientData } from '@/types'

export const documentId = z.string().min(1).max(128).regex(/^[^/]+$/).refine(id => !['.', '..'].includes(id))
export const paypalId = z.string().regex(/^[A-Z0-9]{1,64}$/)

export class CheckoutError extends Error {
  constructor(message: string, readonly status = 400, readonly code?: string, readonly debugId?: string) {
    super(message)
  }
}

export function checkoutError(error: unknown) {
  if (error instanceof CheckoutError) {
    return Response.json({ error: error.message, code: error.code, debugId: error.debugId }, { status: error.status })
  }
  console.error('PayPal checkout failed', error)
  return Response.json({ error: 'Checkout temporarily unavailable' }, { status: 502 })
}

export async function verifiedBuyer(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/i)?.[1]
  if (!token) throw new CheckoutError('Sign in to continue', 401)
  const buyer = await getAdminAuth().verifyIdToken(token, true).catch(() => null)
  if (!buyer) throw new CheckoutError('Sign in to continue', 401)
  if (!buyer.email_verified) throw new CheckoutError('Verify your email to continue', 403)
  return buyer.uid
}

const baseUrl = process.env.PAYPAL_ENVIRONMENT === 'live'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

export async function paypalToken() {
  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`PayPal authentication returned ${response.status}`)
  return z.object({ access_token: z.string().min(1) }).parse(await response.json()).access_token
}

const paypalErrorBody = z.object({
  debug_id: z.string().regex(/^[a-z0-9-]{1,64}$/i).optional(),
  details: z.array(z.object({ issue: z.string().regex(/^[A-Z0-9_]{1,100}$/) })).optional(),
})

class PayPalRequestError extends Error {
  constructor(readonly status: number, readonly issue?: string, readonly debugId?: string) {
    super(`PayPal Orders API returned ${status}`)
  }
}

export async function paypalRequest(token: string, path: string, body?: object, requestId?: string) {
  const response = await fetch(`${baseUrl}/v2/checkout/orders${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(requestId ? { 'PayPal-Request-Id': requestId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    const parsed = paypalErrorBody.safeParse(await response.json().catch(() => null))
    const details = parsed.success ? parsed.data : undefined
    const issue = details?.details?.[0]?.issue
    console.warn('PayPal Orders request rejected', { path, status: response.status, issue, debugId: details?.debug_id })
    throw new PayPalRequestError(response.status, issue, details?.debug_id)
  }
  return paypalOrder.parse(await response.json())
}

export async function verifyPayPalWebhook(request: Request, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  if (!webhookId) return false
  const fields = ['auth-algo', 'cert-url', 'transmission-id', 'transmission-sig', 'transmission-time']
  const headers = fields.map(field => request.headers.get(`paypal-${field}`))
  if (headers.some(value => !value)) return false
  const token = await paypalToken()
  const response = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...Object.fromEntries(fields.map((field, index) => [field.replaceAll('-', '_'), headers[index]])),
      webhook_id: webhookId,
      webhook_event: event,
    }),
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`PayPal webhook verification returned ${response.status}`)
  return (await response.json()).verification_status === 'SUCCESS'
}

const money = z.object({ value: z.string(), currency_code: z.string() })
const paypalOrder = z.object({
  id: paypalId,
  status: z.string(),
  purchase_units: z.array(z.object({
    reference_id: z.string().optional(),
    amount: money.optional(),
    payments: z.object({
      captures: z.array(z.object({ id: paypalId, status: z.string(), amount: money })),
    }).optional(),
  })).optional(),
})

type PayPalOrder = z.infer<typeof paypalOrder>

/**
 * Pre-payment state lives in `checkouts/{id}` (server-only: Firestore rules deny
 * client access). The matching `orders/{id}` document (same id) is created only
 * once PayPal reports a COMPLETED capture, so abandoned or failed payments never
 * show up as orders, never trigger order e-mails and are never swept up by the
 * pending-order cleanup job.
 */
export const CHECKOUTS = 'checkouts'
const ORDERS = 'orders'
const PRODUCTS = 'products'

export async function findReservedCheckout(uid: string) {
  const active = await getAdminDb().collection(CHECKOUTS)
    .where('userId', '==', uid).where('inventoryReserved', '==', true).limit(1).get()
  return active.docs[0]?.id
}

export type CheckoutStatus = 'created' | 'capture_pending' | 'completed' | 'failed'

export interface CheckoutSession {
  userId: string
  status: CheckoutStatus
  items: OrderItem[]
  recipientData: RecipientData
  subtotal: number
  tax: number
  total: number
  totalCents: number
  paypalOrderId?: string
  paymentId?: string
  orderId?: string
  inventoryReserved?: boolean
  captureAttempt?: number
}

export type SettleResult =
  | { status: 'paid'; orderId: string; created: boolean }
  | { status: 'pending' }
  | { status: 'failed' }
  | { status: 'awaiting' }

type DocRef = FirebaseFirestore.DocumentReference
type DocData = FirebaseFirestore.DocumentData

function stockOf(data: DocData | undefined) {
  return Number(data?.stockQuantity ?? data?.stock)
}

function capturesOf(order: PayPalOrder) {
  return order.purchase_units?.flatMap(unit => unit.payments?.captures ?? []) ?? []
}

/** Reserves stock for the checkout. Returns the capture attempt number, or null if already paid. */
async function reserveInventory(ref: DocRef) {
  const db = getAdminDb()
  return db.runTransaction(async transaction => {
    const session = (await transaction.get(ref)).data() as CheckoutSession
    if (session.status === 'completed') return null
    if (session.status === 'failed') throw new CheckoutError('Checkout is closed', 409, 'PAYMENT_DECLINED')
    if (session.inventoryReserved) return session.captureAttempt ?? 0
    const refs = session.items.map(item => db.collection(PRODUCTS).doc(item.productId))
    const products = await transaction.getAll(...refs)
    const balances = products.map((product, index) => {
      const data = product.data()
      const stock = stockOf(data)
      const quantity = session.items[index].quantity
      if (!data || (data.active ?? data.isActive) === false || !Number.isSafeInteger(stock) || stock < quantity) {
        throw new CheckoutError('An item is no longer available in that quantity', 409, 'OUT_OF_STOCK')
      }
      return stock - quantity
    })
    refs.forEach((product, index) => transaction.update(product, {
      stockQuantity: balances[index],
      updatedAt: FieldValue.serverTimestamp(),
    }))
    transaction.update(ref, { inventoryReserved: true, updatedAt: FieldValue.serverTimestamp() })
    return session.captureAttempt ?? 0
  })
}

/** Gives reserved stock back. `nextAttempt` makes the next capture use a fresh PayPal-Request-Id. */
async function releaseInventory(ref: DocRef, options: { nextAttempt?: number; fail?: boolean }) {
  const db = getAdminDb()
  await db.runTransaction(async transaction => {
    const session = (await transaction.get(ref)).data() as CheckoutSession
    if (session.status === 'completed' ||
        (options.nextAttempt !== undefined && (session.captureAttempt ?? 0) >= options.nextAttempt)) return
    const restocks: Array<[DocRef, number]> = []
    if (session.inventoryReserved) {
      const refs = session.items.map(item => db.collection(PRODUCTS).doc(item.productId))
      const products = await transaction.getAll(...refs)
      products.forEach((product, index) => {
        if (!product.exists) return
        const stock = stockOf(product.data())
        restocks.push([product.ref, (Number.isSafeInteger(stock) ? stock : 0) + session.items[index].quantity])
      })
    }
    restocks.forEach(([product, stock]) => transaction.update(product, {
      stockQuantity: stock,
      updatedAt: FieldValue.serverTimestamp(),
    }))
    transaction.update(ref, {
      inventoryReserved: false,
      ...(options.nextAttempt !== undefined
        ? { captureAttempt: Math.max(session.captureAttempt ?? 0, options.nextAttempt) }
        : {}),
      ...(options.fail ? { status: 'failed' } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    })
  })
}

/**
 * Turns a checkout with a COMPLETED capture into a paid order, exactly once.
 * The money has already been taken, so the order is always recorded: if stock
 * was not reserved (e.g. the capture completed after a timeout) it is taken now
 * and any shortfall is flagged for the admin instead of failing.
 * Returns true only for the call that actually created the order.
 */
async function finalizeOrder(ref: DocRef, id: string, captureId: string, providerId: string) {
  const db = getAdminDb()
  return db.runTransaction(async transaction => {
    const session = (await transaction.get(ref)).data() as CheckoutSession
    if (session.status === 'completed') return false
    let stockShortfall = false
    const stockUpdates: Array<[DocRef, number]> = []
    if (!session.inventoryReserved) {
      const refs = session.items.map(item => db.collection(PRODUCTS).doc(item.productId))
      const products = await transaction.getAll(...refs)
      products.forEach((product, index) => {
        if (!product.exists) {
          stockShortfall = true
          return
        }
        const stock = stockOf(product.data())
        const remaining = (Number.isSafeInteger(stock) ? stock : 0) - session.items[index].quantity
        if (remaining < 0) stockShortfall = true
        stockUpdates.push([product.ref, Math.max(0, remaining)])
      })
    }
    stockUpdates.forEach(([product, stock]) => transaction.update(product, {
      stockQuantity: stock,
      updatedAt: FieldValue.serverTimestamp(),
    }))
    transaction.create(db.collection(ORDERS).doc(id), {
      userId: session.userId,
      items: session.items,
      recipientData: session.recipientData,
      subtotal: session.subtotal,
      tax: session.tax,
      total: session.total,
      totalCents: session.totalCents,
      status: 'paid',
      paymentMethod: 'paypal',
      paypalOrderId: providerId,
      paymentId: captureId,
      ...(stockShortfall ? { stockShortfall: true } : {}),
      createdAt: FieldValue.serverTimestamp(),
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    transaction.update(ref, {
      status: 'completed',
      inventoryReserved: false,
      paymentId: captureId,
      orderId: id,
      updatedAt: FieldValue.serverTimestamp(),
    })
    return true
  })
}

/**
 * Reconciles a checkout with PayPal. With `capture` (the buyer's onApprove, or
 * the CHECKOUT.ORDER.APPROVED webhook) an approved PayPal order is captured.
 * Safe to call repeatedly and concurrently.
 */
export async function settleCheckout(
  id: string,
  options: { uid?: string; providerId?: string; capture?: boolean; resume?: boolean } = {}
): Promise<SettleResult> {
  const { uid } = options
  const db = getAdminDb()
  const ref = db.collection(CHECKOUTS).doc(id)
  const initial = (await ref.get()).data() as CheckoutSession | undefined
  const payment = paypalId.safeParse(initial?.paypalOrderId)
  if (!initial || !payment.success || (uid && initial.userId !== uid) ||
      (options.providerId && initial.paypalOrderId !== options.providerId)) {
    throw new CheckoutError('Checkout not found', 404)
  }
  if (initial.status === 'completed') return { status: 'paid', orderId: initial.orderId ?? id, created: false }
  if (initial.status === 'failed') return { status: 'failed' }
  const providerId = payment.data
  const expectedAmount = (initial.totalCents / 100).toFixed(2)

  const token = await paypalToken()
  let providerOrder = await paypalRequest(token, `/${providerId}`)
  const unit = providerOrder.purchase_units?.[0]
  if (providerOrder.id !== providerId || providerOrder.purchase_units?.length !== 1 ||
      unit?.reference_id !== id || unit.amount?.currency_code !== 'USD' || unit.amount.value !== expectedAmount) {
    throw new CheckoutError('PayPal order does not match checkout', 409, 'RECONCILIATION_REQUIRED')
  }

  if ((options.capture || (options.resume && initial.inventoryReserved)) &&
      providerOrder.status === 'APPROVED' && capturesOf(providerOrder).length === 0) {
    const attempt = await reserveInventory(ref)
    if (attempt === null) return { status: 'paid', orderId: id, created: false }
    try {
      providerOrder = await paypalRequest(token, `/${providerId}/capture`, {}, `capture-${id}-${attempt}`)
    } catch (error) {
      providerOrder = await paypalRequest(token, `/${providerId}`)
      if (capturesOf(providerOrder).length === 0) {
        if (providerOrder.status === 'VOIDED') {
          await releaseInventory(ref, { fail: true })
          return { status: 'failed' }
        }
        // PayPal shows no capture: give the stock back so it is never stuck if
        // the buyer walks away, and use a fresh PayPal-Request-Id next time.
        // If an in-flight capture still lands later, finalizeOrder records the
        // order anyway (taking stock then, flagging stockShortfall if needed).
        await releaseInventory(ref, { nextAttempt: attempt + 1 })
        if (error instanceof PayPalRequestError && error.status === 422) {
          throw new CheckoutError('PayPal rejected the capture', 422, error.issue, error.debugId)
        }
        throw error
      }
    }
  }

  const captures = capturesOf(providerOrder)
  const capture = captures[0]
  if (providerOrder.status === 'VOIDED' ||
      (capture && ['DECLINED', 'DENIED', 'FAILED'].includes(capture.status))) {
    await releaseInventory(ref, { fail: true })
    return { status: 'failed' }
  }

  if (capture?.status === 'COMPLETED') {
    if (captures.length !== 1 || capture.amount.currency_code !== 'USD' || capture.amount.value !== expectedAmount) {
      console.error('PayPal capture does not match checkout', { id, providerId, captureId: capture.id })
      throw new CheckoutError('Payment requires manual review', 409, 'RECONCILIATION_REQUIRED')
    }
    const created = await finalizeOrder(ref, id, capture.id, providerId)
    return { status: 'paid', orderId: id, created }
  }

  if (capture?.status === 'PENDING') {
    // The money is on hold at PayPal (e.g. under review): keep the reservation
    // and wait for the PAYMENT.CAPTURE.COMPLETED / DENIED webhook.
    await db.runTransaction(async transaction => {
      const session = (await transaction.get(ref)).data() as CheckoutSession
      if (session.status !== 'created') return
      transaction.update(ref, {
        status: 'capture_pending',
        paymentId: capture.id,
        updatedAt: FieldValue.serverTimestamp(),
      })
    })
    return { status: 'pending' }
  }

  return { status: initial.inventoryReserved ? 'pending' : 'awaiting' }
}
