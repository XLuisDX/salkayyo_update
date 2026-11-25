import { z } from 'zod'
import { CheckoutError, checkoutError, documentId, findReservedCheckout, settleCheckout, verifiedBuyer } from '../_checkout'

const input = z.object({ checkoutId: documentId.optional(), resume: z.boolean().optional() })

export async function POST(request: Request) {
  try {
    const uid = await verifiedBuyer(request)
    const parsed = input.safeParse(await request.json().catch(() => null))
    if (!parsed.success) throw new CheckoutError('Invalid checkout details')
    const id = parsed.data.checkoutId ?? await findReservedCheckout(uid)
    if (!id) return Response.json({ status: 'none' })
    const result = await settleCheckout(id, { uid, resume: parsed.data.resume })
    return Response.json(result.status === 'paid' ? { status: result.status, orderId: result.orderId } : { status: result.status })
  } catch (error) {
    return checkoutError(error)
  }
}
