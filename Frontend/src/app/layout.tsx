import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CodeState from "@/Data";
import ToastProvider from "../../toast.provider";
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ["latin"] });
import Head from "next/head";
export const metadata: Metadata = {
  title: "CodeBrim",
  description: "Compile, share, and collaborate on code effortlessly and securely.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
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
      <Analytics/>  
      <CodeState>
        <body className={inter.className}>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </CodeState>
    </html>
  );
}
