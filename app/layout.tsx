import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { metadata as siteMetadata } from "@/lib/config/site";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { OrganizationStructuredData, WebsiteStructuredData } from "@/components/shared/StructuredData";
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from "@/lib/utils/constants";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://fonts.cdnfonts.com/css/pp-neue-montreal" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <OrganizationStructuredData
          name={SITE_NAME}
          url={SITE_URL}
          email="odoraimports@gmail.com"
          phone="+595972137968"
          address={{
            addressLocality: "Asunción",
            addressCountry: "PY",
          }}
          socialMedia={{
            instagram: "https://www.instagram.com/odoraimports",
            tiktok: "https://www.tiktok.com/@odoraimports",
          }}
        />
        <WebsiteStructuredData
          name={SITE_NAME}
          url={SITE_URL}
          description={SITE_DESCRIPTION}
        />
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-screen">{children}</div>}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
