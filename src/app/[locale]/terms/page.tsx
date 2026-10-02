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
      heading: "1. Acceptance of Terms",
      paragraphs: [
        "By accessing or using Salkayyo Store, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our site.",
      ],
    },
    {
      heading: "2. Use of the Site",
      paragraphs: [
        "You must be able to form a legally binding contract to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
        "You agree to provide accurate and current information when creating an account or placing an order.",
      ],
    },
    {
      heading: "3. Products and Pricing",
      paragraphs: [
        "Product descriptions, images, and prices are presented in good faith but may contain errors; we reserve the right to correct any pricing or listing errors and to change prices at any time without prior notice.",
        "Wholesale pricing is subject to the minimum order quantities and conditions listed on the Wholesale page.",
      ],
    },
    {
      heading: "4. Orders and Payment",
      paragraphs: [
        "Payments are processed securely through Stripe or PayPal. Placing an order constitutes an offer to purchase, which we may accept or decline (for example, due to stock availability or a pricing error).",
        "Order confirmation is sent by email once payment has been successfully processed.",
      ],
    },
    {
      heading: "5. Shipping and Delivery",
      paragraphs: [
        "Delivery times are estimates and are not guaranteed. Risk of loss and title for items purchased pass to you upon delivery to the shipping carrier.",
      ],
    },
    {
      heading: "6. Returns and Cancellations",
      paragraphs: [
        "If you receive a damaged, defective, or incorrect item, please contact us through the Contact page within a reasonable time of delivery so we can make it right.",
        "Orders that have already been shipped cannot be cancelled, but may be eligible for return depending on the condition of the product.",
      ],
    },
    {
      heading: "7. Intellectual Property",
      paragraphs: [
        "All content on this site, including text, graphics, logos, and images, is the property of Salkayyo Store or its licensors and is protected by applicable intellectual property laws.",
      ],
    },
    {
      heading: "8. Prohibited Conduct",
      paragraphs: [
        "You agree not to misuse the site, attempt to gain unauthorized access to any part of it, or use it for any unlawful purpose.",
      ],
    },
    {
      heading: "9. Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, Salkayyo Store shall not be liable for any indirect, incidental, or consequential damages arising from your use of the site or products purchased through it.",
      ],
    },
    {
      heading: "10. Changes to These Terms",
      paragraphs: [
        "We may revise these Terms of Service at any time. Continued use of the site after changes are posted constitutes acceptance of the updated terms.",
      ],
    },
    {
      heading: "11. Contact",
      paragraphs: [
        "Questions about these Terms of Service can be sent to us through our Contact page.",
      ],
    },
  ],
  es: [
    {
      heading: "1. Aceptación de los Términos",
      paragraphs: [
        "Al acceder o usar Salkayyo Store, aceptas quedar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, por favor no uses nuestro sitio.",
      ],
    },
    {
      heading: "2. Uso del Sitio",
      paragraphs: [
        "Debes tener capacidad legal para celebrar un contrato vinculante para crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda actividad que ocurra bajo tu cuenta.",
        "Aceptas proporcionar información precisa y actual al crear una cuenta o realizar un pedido.",
      ],
    },
    {
      heading: "3. Productos y Precios",
      paragraphs: [
        "Las descripciones, imágenes y precios de los productos se presentan de buena fe pero pueden contener errores; nos reservamos el derecho de corregir cualquier error de precio o listado y de cambiar los precios en cualquier momento sin previo aviso.",
        "Los precios de mayoreo están sujetos a las cantidades mínimas de pedido y condiciones indicadas en la página de Mayoreo.",
      ],
    },
    {
      heading: "4. Pedidos y Pago",
      paragraphs: [
        "Los pagos se procesan de forma segura a través de Stripe o PayPal. Realizar un pedido constituye una oferta de compra, que podemos aceptar o rechazar (por ejemplo, por falta de stock o un error de precio).",
        "La confirmación del pedido se envía por correo electrónico una vez que el pago se ha procesado correctamente.",
      ],
    },
    {
      heading: "5. Envío y Entrega",
      paragraphs: [
        "Los tiempos de entrega son estimados y no están garantizados. El riesgo de pérdida y la titularidad de los artículos comprados se transfieren a ti al momento de la entrega al transportista.",
      ],
    },
    {
      heading: "6. Devoluciones y Cancelaciones",
      paragraphs: [
        "Si recibes un artículo dañado, defectuoso o incorrecto, contáctanos a través de la página de Contacto dentro de un tiempo razonable tras la entrega para poder solucionarlo.",
        "Los pedidos que ya han sido enviados no se pueden cancelar, pero pueden ser elegibles para devolución según la condición del producto.",
      ],
    },
    {
      heading: "7. Propiedad Intelectual",
      paragraphs: [
        "Todo el contenido de este sitio, incluyendo textos, gráficos, logotipos e imágenes, es propiedad de Salkayyo Store o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables.",
      ],
    },
    {
      heading: "8. Conducta Prohibida",
      paragraphs: [
        "Aceptas no hacer un mal uso del sitio, no intentar obtener acceso no autorizado a ninguna parte de él, y no usarlo para ningún propósito ilegal.",
      ],
    },
    {
      heading: "9. Limitación de Responsabilidad",
      paragraphs: [
        "En la medida máxima permitida por la ley, Salkayyo Store no será responsable de daños indirectos, incidentales o consecuentes derivados del uso del sitio o de los productos adquiridos a través de él.",
      ],
    },
    {
      heading: "10. Cambios a estos Términos",
      paragraphs: [
        "Podemos revisar estos Términos de Servicio en cualquier momento. El uso continuado del sitio después de publicados los cambios constituye la aceptación de los términos actualizados.",
      ],
    },
    {
      heading: "11. Contacto",
      paragraphs: [
        "Las preguntas sobre estos Términos de Servicio pueden enviarse a través de nuestra página de Contacto.",
      ],
    },
  ],
};

export default function TermsPage() {
  const locale = useLocale() as Locale
  const tFooter = useTranslations('footer')
  const tLegal = useTranslations('legal')

  return (
    <div className="relative overflow-hidden">
      <LogoWatermarks />
      <div className="container relative z-10 py-8">
        <PageHeader
          title={tFooter('terms')}
          description={tLegal('lastUpdated', { date: LAST_UPDATED[locale] })}
        />
        <LegalContent sections={CONTENT[locale]} />
      </div>
    </div>
  )
}
