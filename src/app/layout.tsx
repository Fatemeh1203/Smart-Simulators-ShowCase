import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/components/sim/i18n-provider";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "I&C Simulator | Fiber Optics, Kalman & Digital Twin",
  description:
    "Interactive simulator for I&C concepts: fiber optic sensing, Kalman filter, neutron flux, digital twin, IEC 61850 and standards mapping. Created by Fatemeh Shams.",
  keywords: [
    "I&C",
    "Fiber Optic",
    "Kalman Filter",
    "Digital Twin",
    "IEC 61850",
    "Neutron Flux",
    "Nuclear",
    "Smart Grid",
  ],
  authors: [{ name: "Fatemeh Shams" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${vazirmatn.variable} font-sans antialiased bg-background text-foreground`}
      >
        <I18nProvider>{children}</I18nProvider>
        <Toaster />
      </body>
    </html>
  );
}
