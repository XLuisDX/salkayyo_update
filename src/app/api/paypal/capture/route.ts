import { z } from 'zod'
import { CheckoutError, checkoutError, documentId, paypalId, settleCheckout, verifiedBuyer } from '../_checkout'

const input = z.object({ checkoutId: documentId, orderId: paypalId.optional() })

export async function POST(request: Request) {
  try {
    const uid = await verifiedBuyer(request)
    const parsed = input.safeParse(await request.json().catch(() => null))
    if (!parsed.success) throw new CheckoutError('Invalid order details')
    const result = await settleCheckout(parsed.data.checkoutId, {
      uid,
      providerId: parsed.data.orderId,
      capture: true,
    })
    switch (result.status) {
      case 'paid':
        return Response.json({ status: 'paid', orderId: result.orderId })
      case 'pending':
        // Captured but held for review by PayPal; the webhook completes the order.
        return Response.json({ status: 'pending' }, { status: 202 })
      case 'failed':
        throw new CheckoutError('PayPal payment was declined', 409, 'PAYMENT_DECLINED')
      default:
        throw new CheckoutError('PayPal has not approved this payment', 409, 'NOT_APPROVED')
    }
  } catch (error) {
    return checkoutError(error)
  }
}
