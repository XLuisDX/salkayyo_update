import { z } from 'zod'
import { getAdminDb } from '@/firebase/admin'
import { CHECKOUTS, CheckoutError, checkoutError, paypalId, settleCheckout, verifyPayPalWebhook } from '../_checkout'

const schema = z.object({
  event_type: z.string(),
  resource: z.object({
    id: z.string().optional(),
    supplementary_data: z.object({ related_ids: z.object({ order_id: paypalId }) }).optional(),
  }),
})

// CHECKOUT.ORDER.APPROVED covers a buyer who approved the payment but closed the
// tab before the browser could ask us to capture it: we capture server-side.
const APPROVED = 'CHECKOUT.ORDER.APPROVED'
const CAPTURE_EVENTS = ['PAYMENT.CAPTURE.COMPLETED', 'PAYMENT.CAPTURE.DENIED', 'PAYMENT.CAPTURE.DECLINED']

export async function POST(request: Request) {
  try {
    const event = await request.json().catch(() => null)
    const parsed = schema.safeParse(event)
    if (!parsed.success) return new Response(null, { status: 400 })
    if (!await verifyPayPalWebhook(request, event)) return new Response(null, { status: 401 })

    const { event_type: type, resource } = parsed.data
    let providerId: string | undefined
    if (type === APPROVED) providerId = paypalId.safeParse(resource.id).data
    else if (CAPTURE_EVENTS.includes(type)) providerId = resource.supplementary_data?.related_ids.order_id
    else return new Response(null, { status: 204 })
    if (!providerId) return new Response(null, { status: 400 })

    const checkouts = await getAdminDb().collection(CHECKOUTS).where('paypalOrderId', '==', providerId).limit(1).get()
    const checkout = checkouts.docs[0]
    if (!checkout) return new Response(null, { status: 204 })

    try {
      await settleCheckout(checkout.id, { providerId, capture: type === APPROVED })
    } catch (error) {
      // Business outcomes (declined card, out of stock, needs review) will not
      // change on retry, so acknowledge them; anything else is retried by PayPal.
      if (!(error instanceof CheckoutError)) throw error
      console.warn('PayPal webhook settled with a checkout error', { type, providerId, code: error.code, message: error.message })
    }
    return new Response(null, { status: 204 })
  } catch (error) {
    return checkoutError(error)
  }
}
