import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cobranza App",
  description: "Sistema de facturación y cobranza automatizada",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}
