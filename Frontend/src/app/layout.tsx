import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CodeState from "@/Data";
import ToastProvider from "../../toast.provider";
import { Analytics } from "@vercel/analytics/react";
const inter = Inter({ subsets: ["latin"] });
import Head from "next/head";
export const metadata: Metadata = {
  title: "CodeBrim",
  description:
    "Compile, share, and collaborate on code effortlessly and securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link
        rel="icon"
        type="image/png"
        sizes="512x192"
        href="/images/android-chrome-512x512.png"
      />
      <Head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title as string}</title>
        <meta name="description" content={metadata.description ?? ""} />
        <meta
          name="keywords"
          content="CodeBrim, Code, Compiler, Share, Collaborate, Code Editor, Code Compiler, Code Sharing, Code Collaboration, Interview Preparation, Competitive Programming"
        />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content="CodeBrim" />
        <meta property="og:type" content="website" />
        <meta property="twitter:creator" content="@jjinendra3" />
        <meta property="twitter:site" content="@jjinendra3" />
        <meta property="og:title" content={metadata.title as string} />
        <meta property="og:description" content={metadata.description ?? ""} />
        <meta property="og:url" content="https://codebrim.online/main.jpeg" />
        <meta property="og:image" content="https://codebrim.online/main.jpeg" />
        <meta property="twitter:title" content={metadata.title as string} />
        <meta
          property="twitter:description"
          content={metadata.description ?? ""}
        />
        <meta property="twitter:url" content="https://codebrim.online" />
        <meta property="whatsapp:image" content="/main.jpeg" />
        <meta property="whatsapp:title" content={metadata.title as string} />
        <meta
          property="whatsapp:description"
          content={metadata.description ?? ""}
        />
        <meta property="whatsapp:url" content="https://codebrim.online" />
        <meta
          property="whatsapp:image"
          content="https://codebrim.online/main.jpeg"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x192"
          href="/favicon/android-chrome-512x512.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/favicon/android-chrome-192x192.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />

        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="theme-color" content="#0f172a" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/images/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/images/favicon-16x16.png"
        />
      </Head>
      <Analytics />
      <CodeState>
        <body className={inter.className}>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </CodeState>
    </html>
  );
}
