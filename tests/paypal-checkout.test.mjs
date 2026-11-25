import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = readFileSync(new URL('../src/app/api/paypal/_checkout.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText

/**
 * In-memory Firestore + PayPal stub. Each id gets a `checkouts/{id}` session
 * for buyer `{id}-buyer` with one unit of product `item` ($10.00 + 9% tax).
 */
function checkoutFixture(checkoutIds, stock = 1) {
  const records = new Map([['products/item', { stockQuantity: stock, active: true }]])
  const payments = new Map()
  const captureRequests = []
  const ref = (collection, id) => ({
    id,
    path: collection + '/' + id,
    async get() { return snapshot(this) },
  })
  const snapshot = reference => ({
    ref: reference,
    exists: records.has(reference.path),
    data: () => structuredClone(records.get(reference.path)),
    get: field => records.get(reference.path)?.[field],
  })
  let transactions = Promise.resolve()
  const db = {
    collection: name => ({ doc: id => ref(name, id) }),
    runTransaction(operation) {
      const result = transactions.then(async () => {
        const writes = new Map()
        const value = await operation({
          get: async reference => snapshot(reference),
          getAll: async (...references) => references.map(snapshot),
          create(reference, fields) {
            assert.ok(!records.has(reference.path), 'order already exists')
            writes.set(reference.path, fields)
          },
          update(reference, fields) {
            writes.set(reference.path, { ...(writes.get(reference.path) ?? records.get(reference.path)), ...fields })
          },
          create(reference, fields) {
            if (records.has(reference.path)) throw new Error('ALREADY_EXISTS ' + reference.path)
            writes.set(reference.path, fields)
          },
        })
        for (const [path, record] of writes) records.set(path, record)
        return value
      })
      transactions = result.catch(() => {})
      return result
    },
  }

  const amount = { currency_code: 'USD', value: '10.90' }
  for (const id of checkoutIds) {
    records.set('checkouts/' + id, {
      userId: id + '-buyer',
      status: 'created',
      paypalOrderId: id,
      subtotal: 10, tax: 0.9, total: 10.9,
      totalCents: 1090,
      items: [{ productId: 'item', quantity: 1, title: 'Item', price: 10, image: '' }],
      recipientData: { fullName: 'Buyer' },
      captureAttempt: 0,
    })
    payments.set(id, { id, status: 'APPROVED', purchase_units: [{ reference_id: id, amount: { ...amount } }] })
  }

  let captureStatus = 'COMPLETED'
  let captureError
  let serverError = false
  let loseCaptureResponse = false
  let timeoutBeforeCapture = false
  async function fetchStub(url, options) {
    if (url.endsWith('/v1/oauth2/token')) return Response.json({ access_token: 'fixture' })
    const [, id, operation] = new URL(url).pathname.match(/\/orders\/([^/]+)(?:\/(capture))?$/)
    const payment = payments.get(id)
    if (operation === 'capture') {
      captureRequests.push(options.headers['PayPal-Request-Id'])
      if (captureError) {
        return Response.json({ debug_id: 'ca5fd776ddd8c', details: [{ issue: captureError }] }, { status: 422 })
      }
      if (serverError) return Response.json({}, { status: 500 })
      if (timeoutBeforeCapture) {
        timeoutBeforeCapture = false
        throw new Error('Capture request timed out')
      }
      payment.status = 'COMPLETED'
      payment.purchase_units[0].payments = {
        captures: [{ id: id + 'CAPTURE', status: captureStatus, amount }],
      }
      if (loseCaptureResponse) throw new Error('Connection closed')
    }
    return Response.json(payment)
  }

  const exports = {}
  const imports = name => name === '@/firebase/admin' ? { getAdminDb: () => db } : require(name)
  new Function('exports', 'require', 'fetch', compiled)(exports, imports, fetchStub)
  return {
    records, payments, captureRequests,
    stock: () => records.get('products/item').stockQuantity,
    checkout: id => records.get('checkouts/' + id),
    order: id => records.get('orders/' + id),
    /** Buyer's onApprove → /api/paypal/capture */
    settle: (id, buyer = id + '-buyer') => exports.settleCheckout(id, { uid: buyer, capture: true }),
    /** PAYMENT.CAPTURE.* webhook */
    reconcile: id => exports.settleCheckout(id, { providerId: id }),
    /** CHECKOUT.ORDER.APPROVED webhook */
    approvedWebhook: id => exports.settleCheckout(id, { providerId: id, capture: true }),
    completeCaptureAtPayPal: id => {
      const payment = payments.get(id)
      payment.status = 'COMPLETED'
      payment.purchase_units[0].payments = { captures: [{ id: id + 'CAPTURE', status: 'COMPLETED', amount }] }
    },
    setCaptureStatus: status => { captureStatus = status },
    setCaptureError: issue => { captureError = issue },
    setServerError: value => { serverError = value },
    resume: id => exports.settleCheckout(id, { uid: id + '-buyer', resume: true }),
    timeoutNextCapture: () => { timeoutBeforeCapture = true },
    dropCaptureResponse: () => { loseCaptureResponse = true },
  }
}

test('rejects an unrelated buyer and a provider amount mismatch', async () => {
  const fixture = checkoutFixture(['ONE'])
  await assert.rejects(fixture.settle('ONE', 'someone-else'), { status: 404 })
  fixture.payments.get('ONE').purchase_units[0].amount.value = '0.01'
  await assert.rejects(fixture.settle('ONE'), { status: 409, code: 'RECONCILIATION_REQUIRED' })
  assert.equal(fixture.stock(), 1)
  assert.equal(fixture.order('ONE'), undefined)
  assert.deepEqual(fixture.captureRequests, [])
})

test('a completed capture creates exactly one paid order', async () => {
  const fixture = checkoutFixture(['ONE'])
  assert.deepEqual(await fixture.settle('ONE'), { status: 'paid', orderId: 'ONE', created: true })
  assert.deepEqual(await fixture.settle('ONE'), { status: 'paid', orderId: 'ONE', created: false })
  assert.deepEqual(await fixture.reconcile('ONE'), { status: 'paid', orderId: 'ONE', created: false })
  const order = fixture.order('ONE')
  assert.equal(order.status, 'paid')
  assert.equal(order.paymentId, 'ONECAPTURE')
  assert.equal(order.total, 10.9)
  assert.equal(order.stockShortfall, undefined)
  assert.equal(fixture.checkout('ONE').status, 'completed')
  assert.equal(fixture.stock(), 0)
  assert.deepEqual(fixture.captureRequests, ['capture-ONE-0'])
})

test('recovers a lost capture response and leaves stock unchanged on replay', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.dropCaptureResponse()
  await fixture.settle('ONE')
  await fixture.settle('ONE')
  await fixture.reconcile('ONE')
  assert.equal(fixture.order('ONE').paymentId, 'ONECAPTURE')
  assert.equal(fixture.stock(), 0)
  assert.deepEqual(fixture.captureRequests, ['capture-ONE-0'])
})

test('two buyers cannot capture the last unit', async () => {
  const fixture = checkoutFixture(['ONE', 'TWO'])
  const results = await Promise.allSettled([fixture.settle('ONE'), fixture.settle('TWO')])
  assert.deepEqual(results.map(result => result.status).sort(), ['fulfilled', 'rejected'])
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'OUT_OF_STOCK')
  assert.equal(fixture.captureRequests.length, 1)
  assert.equal(fixture.stock(), 0)
})

test('an abandoned checkout never becomes an order', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.payments.get('ONE').status = 'CREATED' // buyer closed the PayPal window
  assert.deepEqual(await fixture.reconcile('ONE'), { status: 'awaiting' })
  assert.equal(fixture.order('ONE'), undefined)
  assert.equal(fixture.stock(), 1)
})

test('a pending capture keeps its reservation and the webhook completes the order', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setCaptureStatus('PENDING')
  assert.deepEqual(await fixture.settle('ONE'), { status: 'pending' })
  assert.equal(fixture.order('ONE'), undefined)
  assert.equal(fixture.checkout('ONE').status, 'capture_pending')
  assert.equal(fixture.stock(), 0)
  fixture.payments.get('ONE').purchase_units[0].payments.captures[0].status = 'COMPLETED'
  assert.deepEqual(await fixture.reconcile('ONE'), { status: 'paid', orderId: 'ONE', created: true })
  assert.equal(fixture.order('ONE').status, 'paid')
  assert.equal(fixture.stock(), 0)
  assert.equal(fixture.captureRequests.length, 1)
})

test('a terminal failure releases the reservation once and creates no order', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setCaptureStatus('DECLINED')
  assert.deepEqual(await fixture.settle('ONE'), { status: 'failed' })
  assert.deepEqual(await fixture.reconcile('ONE'), { status: 'failed' })
  assert.equal(fixture.checkout('ONE').status, 'failed')
  assert.equal(fixture.order('ONE'), undefined)
  assert.equal(fixture.stock(), 1)
})

test('a declined card releases stock and permits a new funding attempt', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setCaptureError('INSTRUMENT_DECLINED')
  await assert.rejects(fixture.settle('ONE'), {
    status: 422,
    code: 'INSTRUMENT_DECLINED',
    debugId: 'ca5fd776ddd8c',
  })
  assert.equal(fixture.stock(), 1, 'stock is given back while the buyer picks another card')
  assert.equal(fixture.checkout('ONE').inventoryReserved, false)
  assert.equal(fixture.order('ONE'), undefined)
  fixture.setCaptureError(undefined)
  await fixture.settle('ONE')
  assert.deepEqual(fixture.captureRequests, ['capture-ONE-0', 'capture-ONE-1'])
  assert.equal(fixture.order('ONE').status, 'paid')
  assert.equal(fixture.stock(), 0)
})

test('a PayPal outage without a capture releases the reservation', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setServerError(true)
  await assert.rejects(fixture.settle('ONE'))
  assert.equal(fixture.stock(), 1, 'stock is never left stuck when PayPal shows no capture')
  assert.equal(fixture.checkout('ONE').inventoryReserved, false)
  assert.equal(fixture.checkout('ONE').status, 'created')
  assert.equal(fixture.checkout('ONE').captureAttempt, 1)
})

test('a capture that lands after the reservation was released still records the order', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setServerError(true)
  await assert.rejects(fixture.settle('ONE'))
  fixture.completeCaptureAtPayPal('ONE') // PayPal finished processing after our timeout
  assert.deepEqual(await fixture.reconcile('ONE'), { status: 'paid', orderId: 'ONE', created: true })
  assert.equal(fixture.stock(), 0)
  assert.equal(fixture.order('ONE').stockShortfall, undefined)
})

test('a late capture with no stock left is recorded and flagged for the admin', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.setCaptureError('INSTRUMENT_DECLINED')
  await assert.rejects(fixture.settle('ONE'))
  fixture.records.get('products/item').stockQuantity = 0 // sold to someone else meanwhile
  fixture.completeCaptureAtPayPal('ONE')
  await fixture.reconcile('ONE')
  assert.equal(fixture.order('ONE').status, 'paid')
  assert.equal(fixture.order('ONE').stockShortfall, true)
  assert.equal(fixture.stock(), 0)
})

test('the approval webhook captures when the buyer closed the tab', async () => {
  const fixture = checkoutFixture(['ONE'])
  assert.deepEqual(await fixture.approvedWebhook('ONE'), { status: 'paid', orderId: 'ONE', created: true })
  assert.deepEqual(await fixture.settle('ONE'), { status: 'paid', orderId: 'ONE', created: false })
  assert.equal(fixture.captureRequests.length, 1)
  assert.equal(fixture.stock(), 0)
})

test('an ambiguous timeout releases stock, and a capture that still lands is recorded', async () => {
  const fixture = checkoutFixture(['ONE'])
  fixture.timeoutNextCapture()
  await assert.rejects(fixture.settle('ONE'), /timed out/)
  assert.equal(fixture.records.has('orders/ONE'), false)
  assert.equal(fixture.stock(), 1)
  // Buyer retries: a fresh request id; PayPal captures and the order is created once.
  assert.equal((await fixture.settle('ONE')).status, 'paid')
  assert.deepEqual(fixture.captureRequests, ['capture-ONE-0', 'capture-ONE-1'])
  assert.equal(fixture.stock(), 0)
  assert.equal(fixture.order('ONE').stockShortfall, undefined)
})
