# Guía de Integración de Revolut Merchant API

Esta guía detalla paso a paso cómo integrar Revolut como pasarela de pagos en el e-commerce Saklayyo.

## Índice

1. [Requisitos Previos](#1-requisitos-previos)
2. [Crear Cuenta Revolut Business](#2-crear-cuenta-revolut-business)
3. [Configurar Sandbox (Entorno de Pruebas)](#3-configurar-sandbox-entorno-de-pruebas)
4. [Generar API Keys](#4-generar-api-keys)
5. [Configurar Variables de Entorno](#5-configurar-variables-de-entorno)
6. [Implementar Backend (API Routes)](#6-implementar-backend-api-routes)
7. [Implementar Frontend (Checkout)](#7-implementar-frontend-checkout)
8. [Configurar Webhooks](#8-configurar-webhooks)
9. [Probar en Sandbox](#9-probar-en-sandbox)
10. [Pasar a Producción](#10-pasar-a-produccion)

---

## 1. Requisitos Previos

### Necesitas:
- [ ] Cuenta de Revolut Business (plan Grow o superior para API)
- [ ] Cuenta de Merchant activada en Revolut Business
- [ ] Documento de identidad para verificación KYC
- [ ] Información de tu negocio (nombre, dirección, tipo de negocio)

### Documentación Oficial:
- [Merchant API Docs](https://developer.revolut.com/docs/merchant/merchant-api)
- [Accept Payments Guide](https://developer.revolut.com/docs/accept-payments)
- [Hosted Checkout Page](https://developer.revolut.com/docs/guides/accept-payments/online-payments/hosted-checkout-page/api)

---

## 2. Crear Cuenta Revolut Business

### Paso 2.1: Registrarse en Revolut Business
1. Ve a [business.revolut.com](https://business.revolut.com)
2. Click en "Get started" o "Abrir cuenta"
3. Selecciona tu país de residencia
4. Elige el tipo de negocio (Empresa, Autónomo, etc.)
5. Completa el registro con tu email

### Paso 2.2: Verificación KYC
1. Sube documento de identidad (DNI, Pasaporte)
2. Completa la información de tu negocio
3. Espera la aprobación (puede tomar 1-3 días)

### Paso 2.3: Activar Merchant Account
1. Una vez aprobado, entra al dashboard de Revolut Business
2. Ve a **Merchant** en el menú lateral
3. Sigue el proceso de activación de Merchant Account
4. Completa la información adicional requerida

---

## 3. Configurar Sandbox (Entorno de Pruebas)

> ⚠️ **IMPORTANTE**: El Sandbox es un entorno completamente separado. Necesitas crear credenciales específicas para pruebas.

### Paso 3.1: Crear Cuenta Sandbox
1. Ve a [sandbox-business.revolut.com](https://sandbox-business.revolut.com)
2. Crea una nueva cuenta (es diferente a tu cuenta de producción)
3. No requiere verificación KYC real
4. Al iniciar sesión, haz click en "Skip email verification"

### Paso 3.2: Activar Merchant en Sandbox
1. En el dashboard Sandbox, ve a **APIs** → **Merchant API**
2. La cuenta Merchant se activa automáticamente en Sandbox

### URLs del Entorno:

| Entorno | Base URL |
|---------|----------|
| **Sandbox** | `https://sandbox-merchant.revolut.com/api/` |
| **Production** | `https://merchant.revolut.com/api/` |

---

## 4. Generar API Keys

### Paso 4.1: Acceder a la Configuración de API
1. Inicia sesión en tu cuenta Revolut Business (Sandbox o Production)
2. Click en tu **icono de perfil** (esquina superior derecha)
3. Selecciona **APIs** → **Merchant API**

### Paso 4.2: Generar las Keys
1. Verás dos tipos de keys:
   - **Public Key** (`pk_...`): Para el frontend (checkout widget)
   - **Secret Key** (`sk_...`): Para el backend (crear órdenes) - **NUNCA expongas esta key en el frontend**
2. Click en **Generate** para crear tu Secret Key
3. Copia y guarda ambas keys de forma segura

### Paso 4.3: Keys para Sandbox vs Production

| Key | Sandbox | Production |
|-----|---------|------------|
| Public | `pk_sandbox_...` | `pk_live_...` |
| Secret | `sk_sandbox_...` | `sk_live_...` |

---

## 5. Configurar Variables de Entorno

### Paso 5.1: Actualizar `.env.local`

```env
# Revolut Merchant API
REVOLUT_PUBLIC_KEY=pk_sandbox_xxxxxxxxxx
REVOLUT_SECRET_KEY=sk_sandbox_xxxxxxxxxx
REVOLUT_WEBHOOK_SECRET=whsec_xxxxxxxxxx
REVOLUT_API_URL=https://sandbox-merchant.revolut.com/api
REVOLUT_API_VERSION=2024-05-01

# Para producción, cambiar a:
# REVOLUT_API_URL=https://merchant.revolut.com/api
```

### Paso 5.2: Exponer Public Key al Frontend

En `next.config.ts` o `.env.local`:
```env
NEXT_PUBLIC_REVOLUT_PUBLIC_KEY=pk_sandbox_xxxxxxxxxx
NEXT_PUBLIC_REVOLUT_MODE=sandbox
```

---

## 6. Implementar Backend (API Routes)

### Arquitectura de la Integración

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │ ──── │  Next.js    │ ──── │   Revolut   │
│  (Cliente)  │      │   API       │      │   API       │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │  1. Checkout       │                    │
       │ ─────────────────► │                    │
       │                    │  2. Create Order   │
       │                    │ ─────────────────► │
       │                    │                    │
       │                    │  3. checkout_url   │
       │                    │ ◄───────────────── │
       │  4. Redirect       │                    │
       │ ◄───────────────── │                    │
       │                    │                    │
       │  5. Payment on Revolut                  │
       │ ─────────────────────────────────────► │
       │                    │                    │
       │                    │  6. Webhook        │
       │                    │ ◄───────────────── │
       │                    │                    │
       │  7. Success Page   │                    │
       │ ◄───────────────── │                    │
```

### Paso 6.1: Crear el Endpoint de Checkout

Archivo: `src/app/api/revolut/checkout/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/firebase/admin'
import { getErrorMessage } from '@/lib/utils'

const REVOLUT_API_URL = process.env.REVOLUT_API_URL
const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY
const REVOLUT_API_VERSION = process.env.REVOLUT_API_VERSION || '2024-05-01'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

interface CartItem {
  productId: string
  title: string
  price: number
  quantity: number
  image?: string
}

interface RecipientData {
  fullName: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, recipientData, userId } = body as {
      items: CartItem[]
      recipientData: RecipientData
      userId: string
    }

    if (!items?.length || !recipientData || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate totals (amounts in minor units - cents)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = Math.round(subtotal * 0.09) // 9% tax
    const total = subtotal + tax

    // Create order in Firestore first
    const db = getAdminDb()
    const orderRef = db.collection('orders').doc()
    const orderId = orderRef.id

    await orderRef.set({
      userId,
      items,
      subtotal: subtotal / 100, // Store in dollars
      tax: tax / 100,
      total: total / 100,
      recipientData,
      status: 'pending',
      paymentMethod: 'revolut',
      createdAt: new Date(),
    })

    // Create Revolut order
    const revolutOrder = await fetch(`${REVOLUT_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REVOLUT_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Revolut-Api-Version': REVOLUT_API_VERSION,
      },
      body: JSON.stringify({
        amount: total, // Amount in minor units (cents)
        currency: 'USD',
        description: `Saklayyo Order #${orderId.slice(0, 8).toUpperCase()}`,
        merchant_order_ext_ref: orderId,
        customer_email: recipientData.email,
        redirect_url: `${APP_URL}/checkout/success?orderId=${orderId}`,
        cancel_url: `${APP_URL}/checkout/cancelled?orderId=${orderId}`,
        metadata: {
          orderId,
          userId,
        },
      }),
    })

    if (!revolutOrder.ok) {
      const errorData = await revolutOrder.json()
      console.error('Revolut API error:', errorData)

      // Delete the pending order since payment creation failed
      await orderRef.delete()

      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      )
    }

    const revolutData = await revolutOrder.json()

    // Update order with Revolut order ID
    await orderRef.update({
      revolutOrderId: revolutData.id,
      revolutToken: revolutData.token,
    })

    return NextResponse.json({
      orderId,
      checkoutUrl: revolutData.checkout_url,
      revolutOrderId: revolutData.id,
    })
  } catch (error: unknown) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
```

### Paso 6.2: Crear el Webhook Handler

Archivo: `src/app/api/revolut/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/firebase/admin'
import { sendOrderConfirmationEmail, sendNewOrderAdminNotification } from '@/services/email.service'
import crypto from 'crypto'

const REVOLUT_WEBHOOK_SECRET = process.env.REVOLUT_WEBHOOK_SECRET

// Verify webhook signature
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('revolut-signature') || ''

    // Verify signature (optional but recommended)
    if (REVOLUT_WEBHOOK_SECRET && signature) {
      const isValid = verifyWebhookSignature(payload, signature, REVOLUT_WEBHOOK_SECRET)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(payload)
    const db = getAdminDb()

    console.log('Revolut webhook event:', event.event)

    switch (event.event) {
      case 'ORDER_COMPLETED': {
        // Payment successful and captured
        const orderId = event.order?.merchant_order_ext_ref

        if (orderId) {
          const orderRef = db.collection('orders').doc(orderId)
          const orderDoc = await orderRef.get()

          if (orderDoc.exists) {
            const orderData = orderDoc.data()!

            // Update order status
            await orderRef.update({
              status: 'paid',
              paidAt: new Date(),
              revolutPaymentId: event.order?.id,
              updatedAt: new Date(),
            })

            // Get user email
            const userDoc = await db.collection('users').doc(orderData.userId).get()
            const userEmail = userDoc.data()?.email

            if (userEmail) {
              // Send confirmation email
              await sendOrderConfirmationEmail(
                userEmail,
                orderId,
                orderData.recipientData.fullName,
                orderData.items,
                orderData.subtotal,
                orderData.tax,
                orderData.total,
                orderData.recipientData,
                'revolut'
              )

              // Notify admin
              await sendNewOrderAdminNotification(
                orderId,
                orderData.recipientData.fullName,
                userEmail,
                orderData.items,
                orderData.subtotal,
                orderData.tax,
                orderData.total,
                orderData.recipientData,
                'revolut',
                new Date().toLocaleString()
              )
            }

            // Update product stock
            for (const item of orderData.items) {
              const productRef = db.collection('products').doc(item.productId)
              const productDoc = await productRef.get()
              if (productDoc.exists) {
                const currentStock = productDoc.data()?.stock || 0
                await productRef.update({
                  stock: Math.max(0, currentStock - item.quantity),
                  updatedAt: new Date(),
                })
              }
            }

            console.log(`Order ${orderId} marked as paid`)
          }
        }
        break
      }

      case 'ORDER_AUTHORISED': {
        // Payment authorized (for manual capture mode)
        const orderId = event.order?.merchant_order_ext_ref
        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'authorized',
            updatedAt: new Date(),
          })
        }
        break
      }

      case 'ORDER_CANCELLED':
      case 'ORDER_FAILED': {
        // Order cancelled or failed
        const orderId = event.order?.merchant_order_ext_ref
        if (orderId) {
          await db.collection('orders').doc(orderId).update({
            status: 'cancelled',
            cancellationReason: event.event === 'ORDER_FAILED' ? 'Payment failed' : 'Order cancelled',
            updatedAt: new Date(),
          })
        }
        break
      }

      case 'ORDER_PAYMENT_DECLINED':
      case 'ORDER_PAYMENT_FAILED': {
        // Individual payment attempt failed (order might still succeed with retry)
        console.log(`Payment attempt failed for order: ${event.order?.merchant_order_ext_ref}`)
        // Don't mark order as failed yet - customer can retry
        break
      }

      default:
        console.log(`Unhandled Revolut event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
```

### Paso 6.3: Endpoint para Verificar Estado de Orden

Archivo: `src/app/api/revolut/order-status/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getErrorMessage } from '@/lib/utils'

const REVOLUT_API_URL = process.env.REVOLUT_API_URL
const REVOLUT_SECRET_KEY = process.env.REVOLUT_SECRET_KEY
const REVOLUT_API_VERSION = process.env.REVOLUT_API_VERSION || '2024-05-01'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const revolutOrderId = searchParams.get('revolutOrderId')

    if (!revolutOrderId) {
      return NextResponse.json(
        { error: 'Missing revolutOrderId' },
        { status: 400 }
      )
    }

    const response = await fetch(`${REVOLUT_API_URL}/orders/${revolutOrderId}`, {
      headers: {
        'Authorization': `Bearer ${REVOLUT_SECRET_KEY}`,
        'Revolut-Api-Version': REVOLUT_API_VERSION,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to retrieve order' },
        { status: response.status }
      )
    }

    const orderData = await response.json()

    return NextResponse.json({
      id: orderData.id,
      state: orderData.state,
      amount: orderData.amount,
      currency: orderData.currency,
    })
  } catch (error: unknown) {
    console.error('Order status error:', error)
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 }
    )
  }
}
```

---

## 7. Implementar Frontend (Checkout)

### Opción A: Hosted Checkout Page (Recomendado - Más Simple)

Con esta opción, simplemente redirigimos al usuario a la página de checkout de Revolut.

Actualizar el componente de checkout para incluir Revolut como opción de pago.

### Opción B: Revolut Checkout Widget (Más Control)

Instalar el SDK:
```bash
npm install @revolut/checkout
```

Uso básico:
```typescript
import RevolutCheckout from '@revolut/checkout'

// Inicializar con el token del pedido
const { payWithPopup } = await RevolutCheckout({
  publicToken: orderToken, // Del response de create order
  mode: 'sandbox', // o 'production'
})

// Mostrar popup de pago
const result = await payWithPopup()
```

---

## 8. Configurar Webhooks

### Paso 8.1: Configurar URL del Webhook
1. En Revolut Business Dashboard → APIs → Merchant API → Webhooks
2. Click en "Add webhook"
3. URL: `https://tudominio.com/api/revolut/webhook`
4. Selecciona los eventos:
   - `ORDER_COMPLETED`
   - `ORDER_AUTHORISED`
   - `ORDER_CANCELLED`
   - `ORDER_FAILED`
   - `ORDER_PAYMENT_DECLINED`
   - `ORDER_PAYMENT_FAILED`
5. Guarda el Webhook Secret generado en tu `.env.local`

### Paso 8.2: Eventos Importantes

| Evento | Descripción | Acción |
|--------|-------------|--------|
| `ORDER_COMPLETED` | Pago exitoso y capturado | Confirmar orden, enviar email |
| `ORDER_AUTHORISED` | Pago autorizado (captura manual) | Preparar para captura |
| `ORDER_CANCELLED` | Orden cancelada | Liberar inventario |
| `ORDER_FAILED` | Orden expirada | Marcar como fallida |
| `ORDER_PAYMENT_DECLINED` | Intento de pago rechazado | Log (cliente puede reintentar) |
| `ORDER_PAYMENT_FAILED` | Error técnico en pago | Log (cliente puede reintentar) |

---

## 9. Probar en Sandbox

### Tarjetas de Prueba

| Número | Resultado |
|--------|-----------|
| `4929420573595709` | Pago exitoso |
| `4532158098738068` | Pago rechazado |
| `4485040371536584` | Requiere 3DS |

**CVV**: Cualquier 3 dígitos
**Fecha**: Cualquier fecha futura
**Nombre**: Cualquier nombre

### Checklist de Pruebas

- [ ] Crear orden desde el checkout
- [ ] Redirección a página de pago Revolut
- [ ] Pago exitoso con tarjeta de prueba
- [ ] Webhook recibido correctamente
- [ ] Estado de orden actualizado a "paid"
- [ ] Email de confirmación enviado
- [ ] Stock actualizado
- [ ] Pago rechazado manejado correctamente
- [ ] Orden cancelada manejada correctamente

---

## 10. Pasar a Producción

### Checklist Pre-Producción

1. [ ] Cuenta Revolut Business verificada y aprobada
2. [ ] Merchant Account activa
3. [ ] API Keys de producción generadas
4. [ ] Variables de entorno actualizadas:
   ```env
   REVOLUT_API_URL=https://merchant.revolut.com/api
   REVOLUT_PUBLIC_KEY=pk_live_xxxxxxxxxx
   REVOLUT_SECRET_KEY=sk_live_xxxxxxxxxx
   NEXT_PUBLIC_REVOLUT_MODE=production
   ```
5. [ ] Webhook configurado con URL de producción
6. [ ] Pruebas con pago real pequeño
7. [ ] Monitoreo de errores configurado

---

## Referencia Rápida de API

### Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/orders` | Crear orden |
| GET | `/api/orders/{id}` | Obtener estado de orden |
| POST | `/api/orders/{id}/capture` | Capturar pago autorizado |
| POST | `/api/orders/{id}/cancel` | Cancelar orden |
| POST | `/api/orders/{id}/refund` | Reembolsar orden |

### Headers Requeridos

```http
Authorization: Bearer sk_xxxxx
Content-Type: application/json
Revolut-Api-Version: 2024-05-01
```

### Estados de Orden

| Estado | Descripción |
|--------|-------------|
| `pending` | Orden creada, esperando pago |
| `processing` | Pago en proceso |
| `authorised` | Pago autorizado (captura manual) |
| `completed` | Pago completado |
| `cancelled` | Orden cancelada |
| `failed` | Orden fallida/expirada |

---

## Recursos Adicionales

- [Revolut Developer Portal](https://developer.revolut.com/)
- [Merchant API Reference](https://developer.revolut.com/docs/merchant/merchant-api)
- [GitHub Examples](https://github.com/revolut-engineering/revolut-checkout-example)
- [Postman Collection](https://www.postman.com/revolut-api/revolut-developers/documentation/5byeaqi/merchant-api)

---

## Soporte

Si tienes problemas:
1. Revisa los logs en la consola de Revolut Business
2. Verifica que las API keys sean correctas
3. Asegúrate de usar las URLs correctas (sandbox vs production)
4. Contacta soporte de Revolut: merchant-support@revolut.com
