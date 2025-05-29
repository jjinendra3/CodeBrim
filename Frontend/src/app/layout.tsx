import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeBrim",
  description:
    "Compile, share, and collaborate on code effortlessly and securely.",
  keywords: [
    "CodeBrim",
    "Code",
    "Compiler",
    "Share",
    "Collaborate",
    "Code Editor",
    "Code Compiler",
    "Code Sharing",
    "Code Collaboration",
    "Interview Preparation",
    "Competitive Programming",
  ],
  metadataBase: new URL("https://codebrim.online"),
  openGraph: {
    title: "CodeBrim",
    description:
      "Compile, share, and collaborate on code effortlessly and securely.",
    url: "https://codebrim.online",
    siteName: "CodeBrim",
    images: [
      {
        url: "/main.jpeg",
        width: 1200,
        height: 630,
        alt: "CodeBrim Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "CodeBrim",
    description:
      "Compile, share, and collaborate on code effortlessly and securely.",
    site: "@jjinendra3",
    creator: "@jjinendra3",
    images: ["/main.jpeg"],
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      {
        url: "/favicon/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/favicon/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/favicon/apple-touch-icon.png",
    shortcut: "/favicon/favicon.ico",
  },
  manifest: "/favicon/site.webmanifest",
  other: {
    "msapplication-TileColor": "#0f172a",
    "whatsapp:title": "CodeBrim",
    "whatsapp:description":
      "Compile, share, and collaborate on code effortlessly and securely.",
    "whatsapp:url": "https://codebrim.online",
    "whatsapp:image": "https://codebrim.online/main.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        <Toaster
          richColors
          duration={1000}
          position="bottom-right"
          theme="dark"
          expand={true}
        />
        {children}
      </body>
    </html>
  );
}
