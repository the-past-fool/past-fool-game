import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Past Fool — Fact or Cap?",
  description: "Swipe history: real or nonsense?",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
