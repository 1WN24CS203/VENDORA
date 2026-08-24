import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vendora — Vendor Registration & Management",
  description: "A professional vendor onboarding and management platform. Register, track, and manage all your vendors in one place.",
  keywords: "vendor management, vendor registration, supplier management, procurement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
