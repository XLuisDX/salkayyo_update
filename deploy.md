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

## Stripe

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

En `.env.local` actualmente están con valores de **test** (`pk_test_xxx` / `sk_test_xxx`
son placeholders, hay que poner las claves reales de test o live). El webhook secret
se genera al crear el endpoint de webhook en Stripe Dashboard apuntando a
`https://<tu-dominio-vercel>/api/webhooks/stripe` (o la ruta que use el proyecto).

## PayPal

- `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`

Valores: PayPal Developer Dashboard → tu app.

## Resend (envío de emails)

- `RESEND_API_KEY`

Valor: Resend Dashboard → API Keys.

## Configuración de la app

- `NEXT_PUBLIC_APP_URL` — en producción debe ser la URL real, p. ej.
  `https://tu-dominio.vercel.app` (NO `http://localhost:3000`).
- `NEXT_PUBLIC_APP_NAME` — `Saklayyo Store` (no es secreto).

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
