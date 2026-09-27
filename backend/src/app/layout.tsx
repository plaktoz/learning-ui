import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "note-app backend",
  description: "API-only Next.js app — no UI routes, see src/app/api/",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
