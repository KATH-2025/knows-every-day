import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "每日一识",
  description: "每天一个小知识，积累对世界的理解。",
  openGraph: {
    title: "每日一识",
    description: "每天一个小知识，积累对世界的理解。",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <head />
      <body>{children}</body>
    </html>
  );
}
