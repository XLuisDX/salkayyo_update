import { getAdminDb } from '@/firebase/admin'

const validToken = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
const html = (body: string) => new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Salkayyo newsletter</title><main>${body}</main></html>`, {
  headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
})

export function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!validToken(token)) return new Response(null, { status: 400 })
  return html(`<h1>Salkayyo newsletter</h1><form method="post"><input type="hidden" name="token" value="${token}"><button>Unsubscribe / Darse de baja</button></form>`)
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const token = form?.get('token')
  if (!validToken(token)) return new Response(null, { status: 400 })
  const db = getAdminDb()
  const matches = await db.collection('newsletterSubscriptions').where('token', '==', token).limit(1).get()
  const ref = matches.docs[0]?.ref
  if (ref) {
    await db.runTransaction(async transaction => {
      if ((await transaction.get(ref)).get('token') === token) transaction.delete(ref)
    })
  }
  return html('<h1>Unsubscribed / Baja confirmada</h1>')
}
