import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JMSA Builder — Attirez plus de clients en ligne gratuitement | JM Services Africa",
  description:
    "Créez votre espace digital avec site + blog + WhatsApp en quelques minutes. Gratuit pendant 45 jours. Solution conçue pour les entreprises africaines.",
  keywords: [
    "JMSA Builder",
    "JM Services Africa",
    "créer site web Cameroun",
    "site web gratuit Afrique",
    "blog gratuit",
    "visibilité en ligne",
    "attirer des clients",
    "site web entreprise Cameroun",
  ],
  authors: [{ name: "JM Services Africa" }],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "JMSA Builder — Attirez plus de clients en ligne gratuitement",
    description:
      "Créez votre espace digital avec site + blog + WhatsApp en quelques minutes. Gratuit pendant 45 jours.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Preload critical assets for faster initial render */}
        <link rel="preload" href="/logo.png" as="image" type="image/png" />
        <link rel="preload" href="/favicon-jmsabuilder.png" as="image" type="image/png" />
        <link rel="preload" href="/images/hero-illustration.png" as="image" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
