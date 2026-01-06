import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/utils/constants";

export const siteConfig = {
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  ogImage: `${SITE_URL}/og-image.jpg`,
  links: {
    instagram: "https://www.instagram.com/odoraimports",
    tiktok: "https://www.tiktok.com/@odoraimports",
    email: "odoraimports@gmail.com",
    phone: "0972137968",
  },
} as const;

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "perfumes",
    "fragancias",
    "Paraguay",
    "ecommerce",
    "inteligencia artificial",
    "recomendaciones personalizadas",
  ],
  authors: [
    {
      name: "Odora Perfumes",
    },
  ],
  creator: "Odora Perfumes",
  openGraph: {
    type: "website",
    locale: "es_PY",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    creator: "@odoraimports",
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Agregar códigos de verificación cuando estén disponibles
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

