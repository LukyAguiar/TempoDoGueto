import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Tempo Do Gueto",
    template: "%s | Tempo do Gueto",
  },
    icons: {
    icon: "/favicon.png",
  },
  description: "Sistema de agendamento para salões e barbearias",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics/>
      </body>
    </html>
  );
}
