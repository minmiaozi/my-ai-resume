import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/components/AuthProvider";
import CookieBanner from "@/components/CookieBanner";
import { JsonLd } from "@/components/JsonLd";
import { rootMetadata } from "@/lib/site-metadata";
import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from "@/lib/structured-data";
import "./globals.css";
import "./resumeaipro.css";
import "./home.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = rootMetadata;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${dmSans.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <JsonLd data={[websiteJsonLd(), softwareApplicationJsonLd(), organizationJsonLd()]} />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
