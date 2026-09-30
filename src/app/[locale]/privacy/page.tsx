'use client'

import { useLocale, useTranslations } from 'next-intl'
import { PageHeader } from '@/components/common/PageHeader'
import { LegalContent } from '@/components/common/LegalContent'
import { LogoWatermarks } from '@/components/common/LogoWatermarks'
import type { Locale } from '@/i18n/config'

const LAST_UPDATED: Record<Locale, string> = {
  en: 'September 29, 2026',
  es: '29 de septiembre de 2026',
}

const CONTENT: Record<Locale, { heading: string; paragraphs: string[] }[]> = {
  en: [
    {
      heading: '1. Introduction',
      paragraphs: [
        'Saklayyo Store ("we", "us", or "our") respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and the choices you have.',
        'By creating an account or using our site, you agree to the collection and use of information as described in this policy.',
      ],
    },
    {
      heading: '2. Information We Collect',
      paragraphs: [
        'Account information: your name, email address, and password (stored securely by Firebase Authentication) when you register.',
        'Order and shipping information: recipient name, shipping address, phone number, and order history, used to fulfill and track your purchases.',
        'Payment information: payments are processed directly by Stripe and PayPal. We do not store your full card number or banking details on our servers.',
        'Usage information: we use your browser\'s local storage to remember your cart and wishlist, so we do not require an account just to browse.',
      ],
    },
    {
      heading: '3. How We Use Your Information',
      paragraphs: [
        'To process and fulfill your orders, including sending order confirmation, shipping, and delivery notifications by email.',
        'To manage your account, verify your email address, and help you reset your password when requested.',
        'To respond to customer support requests submitted through our contact form.',
        'To improve our products, services, and overall shopping experience.',
      ],
    },
    {
      heading: '4. How We Share Your Information',
      paragraphs: [
        'We do not sell your personal information. We share information only with trusted service providers who help us operate the store: Firebase/Google (authentication and database), Stripe and PayPal (payment processing), and Resend (transactional email delivery).',
        'We may disclose information when required by law or to protect the rights, property, or safety of Saklayyo Store, our customers, or others.',
      ],
    },
    {
      heading: '5. Data Security',
      paragraphs: [
        'We use Firebase Security Rules to restrict access to your data so that only you (or authorized administrators) can view or modify it, and all data is transmitted over encrypted (HTTPS) connections.',
        'While we take reasonable steps to protect your information, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.',
      ],
    },
    {
      heading: '6. Your Rights',
      paragraphs: [
        'You can access and update your account information at any time from your profile page.',
        'You may request deletion of your account and associated personal data by contacting us. Some information may be retained where required for legal, accounting, or fraud-prevention purposes.',
      ],
    },
    {
      heading: "7. Children's Privacy",
      paragraphs: [
        'Our site is not directed to children under 13, and we do not knowingly collect personal information from children.',
      ],
    },
    {
      heading: '8. Changes to This Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.',
      ],
    },
    {
      heading: '9. Contact Us',
      paragraphs: [
        'If you have any questions about this Privacy Policy, please reach out through our Contact page.',
      ],
    },
  ],
  es: [
    {
      heading: '1. Introducción',
      paragraphs: [
        'Saklayyo Store ("nosotros") respeta tu privacidad y se compromete a proteger la información personal que compartes con nosotros. Esta Política de Privacidad explica qué información recopilamos, cómo la usamos y qué opciones tienes.',
        'Al crear una cuenta o usar nuestro sitio, aceptas la recopilación y el uso de información como se describe en esta política.',
      ],
    },
    {
      heading: '2. Información que Recopilamos',
      paragraphs: [
        'Información de cuenta: tu nombre, correo electrónico y contraseña (almacenada de forma segura por Firebase Authentication) cuando te registras.',
        'Información de pedidos y envío: nombre del destinatario, dirección de envío, teléfono e historial de pedidos, usados para procesar y rastrear tus compras.',
        'Información de pago: los pagos son procesados directamente por Stripe y PayPal. No almacenamos el número completo de tu tarjeta ni tus datos bancarios en nuestros servidores.',
        'Información de uso: usamos el almacenamiento local de tu navegador para recordar tu carrito y tu lista de favoritos, así que no necesitas una cuenta solo para navegar.',
      ],
    },
    {
      heading: '3. Cómo Usamos tu Información',
      paragraphs: [
        'Para procesar y completar tus pedidos, incluyendo el envío de confirmaciones de pedido, notificaciones de envío y entrega por correo electrónico.',
        'Para administrar tu cuenta, verificar tu correo electrónico y ayudarte a restablecer tu contraseña cuando lo solicites.',
        'Para responder a las solicitudes de soporte enviadas a través de nuestro formulario de contacto.',
        'Para mejorar nuestros productos, servicios y la experiencia de compra en general.',
      ],
    },
    {
      heading: '4. Cómo Compartimos tu Información',
      paragraphs: [
        'No vendemos tu información personal. Compartimos información únicamente con proveedores de servicios de confianza que nos ayudan a operar la tienda: Firebase/Google (autenticación y base de datos), Stripe y PayPal (procesamiento de pagos) y Resend (envío de correos transaccionales).',
        'Podemos divulgar información cuando lo exija la ley o para proteger los derechos, la propiedad o la seguridad de Saklayyo Store, nuestros clientes u otras personas.',
      ],
    },
    {
      heading: '5. Seguridad de los Datos',
      paragraphs: [
        'Usamos Reglas de Seguridad de Firebase para restringir el acceso a tus datos, de modo que solo tú (o administradores autorizados) puedan verlos o modificarlos, y toda la información se transmite mediante conexiones cifradas (HTTPS).',
        'Aunque tomamos medidas razonables para proteger tu información, ningún método de transmisión o almacenamiento es 100% seguro, y no podemos garantizar una seguridad absoluta.',
      ],
    },
    {
      heading: '6. Tus Derechos',
      paragraphs: [
        'Puedes acceder y actualizar la información de tu cuenta en cualquier momento desde tu página de perfil.',
        'Puedes solicitar la eliminación de tu cuenta y datos personales asociados contactándonos. Parte de la información puede conservarse cuando así lo requieran fines legales, contables o de prevención de fraude.',
      ],
    },
    {
      heading: '7. Privacidad de los Menores',
      paragraphs: [
        'Nuestro sitio no está dirigido a menores de 13 años, y no recopilamos intencionalmente información personal de menores.',
      ],
    },
    {
      heading: '8. Cambios a esta Política',
      paragraphs: [
        'Podemos actualizar esta Política de Privacidad de vez en cuando. Los cambios se publicarán en esta página con una fecha de revisión actualizada.',
      ],
    },
    {
      heading: '9. Contáctanos',
      paragraphs: [
        'Si tienes preguntas sobre esta Política de Privacidad, contáctanos a través de nuestra página de Contacto.',
      ],
    },
  ],
}

export default function PrivacyPage() {
  const locale = useLocale() as Locale
  const tFooter = useTranslations('footer')
  const tLegal = useTranslations('legal')

  return (
    <div className="relative overflow-hidden">
      <LogoWatermarks />
      <div className="container relative z-10 py-8">
        <PageHeader
          title={tFooter('privacy')}
          description={tLegal('lastUpdated', { date: LAST_UPDATED[locale] })}
        />
        <LegalContent sections={CONTENT[locale]} />
      </div>
    </div>
  )
}
