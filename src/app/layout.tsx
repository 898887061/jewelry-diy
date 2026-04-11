import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "珠宝定制 · DIY 手串",
  description: "定制手串与珠宝 DIY 平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
