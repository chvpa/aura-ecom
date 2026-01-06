import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { metadata as siteMetadata } from "@/lib/config/site";
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

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
