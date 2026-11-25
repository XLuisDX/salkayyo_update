import { z } from 'zod'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/firebase/admin'
import { calculateTax } from '@/lib/utils'
import { CHECKOUTS, CheckoutError, checkoutError, documentId, findReservedCheckout, paypalRequest, paypalToken, verifiedBuyer } from '../_checkout'

const input = z.object({
  recipientId: documentId,
  items: z.array(z.object({ productId: documentId, quantity: z.number().int().min(1).max(999) })).min(1).max(50),
  expectedTotalCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
})

const shipping = z.object({
  fullName: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  country: z.string(),
  phone: z.string(),
})

export async function POST(request: Request) {
  try {
    const uid = await verifiedBuyer(request)
    const parsed = input.safeParse(await request.json().catch(() => null))
    if (!parsed.success) throw new CheckoutError('Invalid checkout details')
    const { recipientId, items: cart, expectedTotalCents } = parsed.data
    if (new Set(cart.map(item => item.productId)).size !== cart.length) {
      throw new CheckoutError('Duplicate products')
    }

    const db = getAdminDb()
    const [recipient, products, pendingCheckoutId] = await Promise.all([
      db.collection('recipients').doc(recipientId).get(),
      db.getAll(...cart.map(item => db.collection('products').doc(item.productId))),
      findReservedCheckout(uid),
    ])
    if (pendingCheckoutId) throw new CheckoutError('Another PayPal payment is being verified', 409, 'PAYMENT_PENDING')
    if (recipient.data()?.userId !== uid) throw new CheckoutError('Recipient not found', 404)
    const address = shipping.safeParse(recipient.data())
    if (!address.success) throw new CheckoutError('Invalid delivery address')

    let subtotalCents = 0
    const items = products.map((snapshot, index) => {
      const product = snapshot.data()
      const { quantity, productId } = cart[index]
      const stock = Number(product?.stockQuantity ?? product?.stock)
      const title = product?.name ?? product?.title
      const price = Number(product?.pricePerUnit ?? product?.price)
      const cents = Math.round(price * 100)
      if (!product || (product.active ?? product.isActive) === false || !Number.isSafeInteger(stock) || stock < quantity ||
          !Number.isSafeInteger(cents) || cents < 1 || typeof title !== 'string') {
        throw new CheckoutError('An item is no longer available', 409, 'OUT_OF_STOCK')
      }
      subtotalCents += cents * quantity
      const images = Array.isArray(product.images) ? product.images : []
      const firstImage = typeof images[0] === 'string'
        ? images[0]
        : images.filter(image => typeof image?.url === 'string')
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]?.url
      return { productId, title, quantity, price: cents / 100, image: firstImage || '' }
    })
    const taxCents = Math.round(calculateTax(subtotalCents / 100) * 100)
    const totalCents = subtotalCents + taxCents
    if (totalCents !== expectedTotalCents) throw new CheckoutError('Cart prices changed', 409, 'CART_CHANGED')

    // Pre-payment state goes to the server-only `checkouts` collection; the order
    // itself is only created once PayPal confirms the capture (see settleCheckout).
    const checkout = db.collection(CHECKOUTS).doc()
    const token = await paypalToken()
    await checkout.create({
      userId: uid,
      items,
      recipientData: address.data,
      subtotal: subtotalCents / 100,
      tax: taxCents / 100,
      total: totalCents / 100,
      totalCents,
      status: 'created',
      inventoryReserved: false,
      captureAttempt: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
    try {
      const payment = await paypalRequest(token, '', {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: checkout.id,
          description: 'Salkayyo Store',
          amount: { currency_code: 'USD', value: (totalCents / 100).toFixed(2) },
        }],
        // Not `payment_source.paypal`: that would pin the funding source and
        // conflict with the guest "Debit or Credit Card" button.
        application_context: {
          brand_name: 'Salkayyo Store',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }, `create-${checkout.id}`)
      await checkout.update({ paypalOrderId: payment.id })
      return Response.json({ orderId: payment.id, checkoutId: checkout.id })
    } catch (error) {
      await checkout.update({ status: 'failed', updatedAt: FieldValue.serverTimestamp() }).catch(() => {})
      throw error
    }
  } catch (error) {
    return checkoutError(error)
  }
}
