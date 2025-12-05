import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whop Exit-Intent Downsell",
  description: "Exit-intent downsell widget for Whop Storefront Apps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

