import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import ts from 'typescript'

function loadFunctionModule(file, imports, fetch) {
  const text = readFileSync(new URL('../functions/src/' + file, import.meta.url), 'utf8')
  const compiled = ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const exports = {}
  new Function('exports', 'require', 'fetch', compiled)(exports, name => imports[name], fetch)
  return exports
}

test('customer receives one branded email for each confirmed order milestone', async () => {
  const delivered = new Set()
  const emails = []
  const templates = loadFunctionModule('email-templates.ts', {})
  const registration = { onWrite: fn => fn, onUpdate: fn => fn, onCreate: fn => fn }
  const firestore = Object.assign(() => ({
    collection: () => ({ doc: id => ({
      get: async () => ({ exists: delivered.has(id) }),
      set: async () => { delivered.add(id) },
    }) }),
  }), { FieldValue: { serverTimestamp: () => 1 } })
  const functions = loadFunctionModule('index.ts', {
    './email-templates': templates,
    'firebase-admin': {
      initializeApp() {},
      firestore,
      auth: () => ({ getUser: async () => ({ email: 'buyer@example.test' }) }),
    },
    'firebase-functions': {
      runWith: () => ({ firestore: { document: () => registration } }),
      pubsub: { schedule: () => ({ onRun: fn => fn }) },
    },
  }, async (_url, options) => {
    emails.push(JSON.parse(options.body))
    return Response.json({ id: 'accepted' })
  })
  const order = {
    userId: 'buyer', items: [{ productId: 'item', title: 'Example', quantity: 1, price: 10 }],
    subtotal: 10, tax: 0.9, total: 10.9, paymentMethod: 'paypal',
    recipientData: { fullName: 'Buyer', address: 'Example Street' },
  }
  const event = (before, after) => ({ before: { data: () => before }, after: { data: () => after } })
  const context = { params: { orderId: 'test-order' }, timestamp: '2026-11-25T00:00:00Z' }
  const unpaid = { ...order, status: 'pending' }
  await functions.onPaidOrderCreated({ data: () => unpaid }, context)
  await functions.onOrderPaid(event(unpaid, { ...order, status: 'paid' }), context)
  assert.equal(emails.length, 0)
  const paid = { ...order, status: 'paid', paymentId: 'CAPTURE' }
  const shipped = { ...paid, status: 'shipped' }
  const deliveredOrder = { ...shipped, status: 'delivered' }
  await functions.onPaidOrderCreated({ data: () => paid }, context)
  for (const [handler, before, after] of [
    [functions.onOrderPaid, unpaid, paid],
    [functions.onOrderShipped, paid, shipped],
    [functions.onOrderDelivered, shipped, deliveredOrder],
  ]) {
    await handler(event(before, after), context)
    await handler(event(before, after), context)
  }
  const customer = emails.filter(mail => mail.to === 'buyer@example.test')
  assert.equal(customer.length, 3)
  assert.match(customer[0].subject, /Confirmed/)
  assert.match(customer[1].subject, /Shipped/)
  assert.match(customer[2].subject, /Delivered/)
  for (const { html } of customer) {
    assert.match(html, /logo-email\.png/)
    assert.match(html, /#141414/)
    assert.match(html, /#99FF00/)
  }
  assert.match(customer[0].html, /\/en\/orders\/test-order/)
  assert.doesNotMatch(customer[1].html, /Track Your Order|\/en\/orders\/test-order/)
  assert.doesNotMatch(customer[2].html, /View my order|\/en\/orders\/test-order/)
})
