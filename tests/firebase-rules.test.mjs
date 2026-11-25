import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, doc, setDoc, updateDoc, getDoc } from 'firebase/firestore'
import { getStorage, connectStorageEmulator, ref, uploadBytes, deleteObject } from 'firebase/storage'
import { initializeApp as initializeAdmin, deleteApp as deleteAdmin } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'

test('profile roles, order fulfillment, and catalog images obey Firebase rules', async t => {
  const projectId = process.env.GCLOUD_PROJECT
  const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST
  const storageHost = process.env.FIREBASE_STORAGE_EMULATOR_HOST ?? process.env.STORAGE_EMULATOR_HOST?.replace(/^https?:\/\//, '')
  const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST
  assert.ok(projectId?.startsWith('demo-') && firestoreHost && authHost && storageHost,
    'Run with the Auth, Firestore and Storage emulators and a demo project')

  const app = initializeAdmin({ projectId })
  const adminDb = getAdminFirestore(app)
  const adminAuth = getAdminAuth(app)
  const suffix = randomUUID()
  const apps = []
  t.after(async () => {
    await Promise.all(apps.map(deleteApp))
    await deleteAdmin(app)
  })

  const [firestoreAddress, firestorePort] = firestoreHost.split(':')
  const [storageAddress, storagePort] = storageHost.split(':')
  const password = 'fixture-password'
  async function client(label) {
    const email = label + '-' + suffix + '@example.test'
    const account = await adminAuth.createUser({ email, password, emailVerified: true })
    const clientApp = initializeApp({ projectId, apiKey: 'fake-key', storageBucket: projectId + '.appspot.com' }, label)
    apps.push(clientApp)
    const auth = getAuth(clientApp)
    const db = getFirestore(clientApp)
    const storage = getStorage(clientApp)
    connectAuthEmulator(auth, 'http://' + authHost, { disableWarnings: true })
    connectFirestoreEmulator(db, firestoreAddress, Number(firestorePort))
    connectStorageEmulator(storage, storageAddress, Number(storagePort))
    await signInWithEmailAndPassword(auth, email, password)
    return { db, storage, uid: account.uid }
  }

  const buyer = await client('buyer')
  const staff = await client('staff')
  await adminDb.collection('users').doc(staff.uid).set({ role: 'admin' })
  const profile = doc(buyer.db, 'users', buyer.uid)
  await assert.rejects(setDoc(profile, { role: 'admin' }), { code: 'permission-denied' })
  await setDoc(profile, { role: 'user' })
  await updateDoc(profile, { name: 'Buyer' })
  await assert.rejects(updateDoc(profile, { role: 'admin' }), { code: 'permission-denied' })

  const orderId = 'order-' + suffix
  const buyerOrder = doc(buyer.db, 'orders', orderId)
  const staffOrder = doc(staff.db, 'orders', orderId)
  await assert.rejects(setDoc(buyerOrder, { userId: buyer.uid, status: 'pending' }), { code: 'permission-denied' })
  await adminDb.collection('orders').doc(orderId).set({ userId: buyer.uid, status: 'pending', total: 42, paymentMethod: 'paypal' })
  assert.equal((await getDoc(buyerOrder)).exists(), true)
  await assert.rejects(updateDoc(buyerOrder, { status: 'paid', total: 1 }), { code: 'permission-denied' })
  await assert.rejects(updateDoc(staffOrder, { status: 'paid' }), { code: 'permission-denied' })
  await adminDb.collection('orders').doc(orderId).update({ status: 'paid' })
  await assert.rejects(updateDoc(staffOrder, { status: 'shipped', total: 1 }), { code: 'permission-denied' })
  await updateDoc(staffOrder, { status: 'shipped' })
  await updateDoc(staffOrder, { status: 'delivered' })

  const path = 'products/' + suffix + '/test.png'
  const metadata = { contentType: 'image/png' }
  const bytes = new Uint8Array([137, 80, 78, 71])
  await assert.rejects(uploadBytes(ref(buyer.storage, path), bytes, metadata), { code: 'storage/unauthorized' })
  await uploadBytes(ref(staff.storage, path), bytes, metadata)
  await deleteObject(ref(staff.storage, path))
})
