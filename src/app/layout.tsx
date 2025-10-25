import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tu Huella IA | IAx Mar Del Plata 2025",
  description: "Descubre cómo tus percepciones sobre la Inteligencia Artificial evolucionan durante el evento",
  keywords: "Inteligencia Artificial, IA, Mar del Plata, Global.IA, evento, tecnología",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
