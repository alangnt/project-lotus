"use client";

import { Inter } from "next/font/google";
import "./globals.css";

import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen bg-black`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
