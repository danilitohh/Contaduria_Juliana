import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalDiagnostics } from "@/components/diagnostics/global-diagnostics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexo Admin",
  description: "Plataforma administrativa original para pequenas empresas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full bg-slate-50 text-slate-950 antialiased">
        {children}
        <GlobalDiagnostics />
      </body>
    </html>
  );
}
