# Variables de entorno para deploy en Vercel

Este archivo lista las variables que hay en `.env.local` y que deben configurarse en
**Vercel → Project Settings → Environment Variables** antes de hacer el deploy.

> ⚠️ `deploy.md` SÍ se sube a git (a diferencia de `.env.local`, que está en `.gitignore`).
> Por eso aquí **no se incluyen los valores secretos reales**, solo el nombre de la
> variable y de dónde sacar el valor. Copia los valores reales desde tu `.env.local`
> local directamente al dashboard de Vercel (o usa `vercel env add`), nunca los pegues
> en este archivo ni los commitees.

## Firebase (cliente — públicas, van en el bundle del browser)

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

Valores: Firebase Console → Project Settings → General → "Your apps" (Web app).

## Firebase Admin (servidor — secretas)

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` — pega el valor completo **entre comillas dobles**, con los
  `\n` literales tal como aparece en `.env.local` (Vercel soporta multilínea, pero si
  pegas el JSON del service account revisa que los saltos de línea queden como `\n`).

Valores: Firebase Console → Project Settings → Service Accounts → "Generate new private key".

## PayPal

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENVIRONMENT` (opcional, `sandbox` por defecto; usa `live` con credenciales de producción).
- `PAYPAL_WEBHOOK_ID`

Valores: PayPal Developer Dashboard → tu app.

Registra `https://<dominio>/api/paypal/webhook` para los eventos
`CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED` y `PAYMENT.CAPTURE.DENIED`
en el mismo entorno.
Si una captura falla y PayPal no muestra ningún cobro, el inventario reservado se
libera de inmediato. Si ese cobro llega a completarse después, el webhook crea el
pedido igualmente y descuenta el stock en ese momento (si ya no hay unidades, el
pedido queda marcado con `stockShortfall: true` para revisión). Un cobro en
revisión por PayPal (`PENDING`) conserva la reserva hasta su resultado final. El comprador también puede verificar el pago desde el
checkout. Los intentos se guardan en la colección privada `checkouts`.
Solo una captura completada y validada crea un documento en `orders`.

Para conciliar pedidos PayPal pendientes anteriores al cambio, consulta cada
`paypalOrderId` con la aplicación Sandbox que lo creó. Si PayPal confirma un
rechazo definitivo o un intento expirado sin captura, registra la cancelación
y devuelve las unidades reservadas en una sola transacción. Si la consulta
falla o PayPal muestra una captura pendiente, conserva el pedido para revisión.

Firebase Functions envía la confirmación, el aviso de envío y el aviso de
entrega. Configura `RESEND_API_KEY` y `APP_URL` también en el entorno de
Functions, además de Vercel.

Publica los disparadores de correo desde la raíz del proyecto con
`firebase deploy --only functions:onPaidOrderCreated,functions:onOrderPaid,functions:onOrderShipped,functions:onOrderDelivered`.
`onPaidOrderCreated` cubre los pedidos que nacen con estado pagado.
El despliegue de los disparadores no reenvía correos de eventos anteriores.

Despliega las reglas de Firestore y Storage junto con Firebase Functions.
Antes de habilitar el checkout, valida las cuentas con `role: admin` y coteja
los pedidos pagados pendientes de despacho con el proveedor. Retira del entorno
las credenciales y el webhook del proveedor anterior.

Ejecuta `npm test` para probar la conciliación con respuestas simuladas.
Para verificar las reglas de Firebase en un proyecto aislado, ejecuta
`firebase emulators:exec --project demo-salkayyo --only auth,firestore,storage "npm run test:rules"`.

## Resend (envío de emails)

- `RESEND_API_KEY`

Valor: Resend Dashboard → API Keys.

## Configuración de la app

- `NEXT_PUBLIC_APP_URL` — en producción debe ser la URL real, p. ej.
  `https://tu-dominio.vercel.app` (NO `http://localhost:3000`).
- `NEXT_PUBLIC_APP_NAME` — `Salkayyo Store` (no es secreto).

## Admin

- `ADMIN_EMAIL` — email real del admin (actualmente está en placeholder `admin@example.com`).

---

## Pasos para configurar en Vercel

1. `vercel link` (si el proyecto no está vinculado aún).
2. Por cada variable: `vercel env add NOMBRE_VARIABLE production` (repetir para
   `preview`/`development` si aplica), o agregarlas manualmente en
   Project Settings → Environment Variables.
3. Verificar que `NEXT_PUBLIC_APP_URL` apunte al dominio final antes del deploy.
4. Redeploy después de agregar/cambiar variables (`vercel --prod` o trigger desde el
   dashboard), ya que los env vars no se aplican a deploys ya existentes.
