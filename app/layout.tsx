import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Lotus - Focus Timer & Productivity App",
  description:
    "Boost your productivity with Project Lotus. A beautiful Pomodoro timer app to help you focus, track your time, and earn points. Stay motivated with lofi beats and a stunning visual experience.",
  keywords: [
    "pomodoro",
    "focus timer",
    "productivity",
    "study timer",
    "pomodoro timer",
    "focus app",
    "time management",
    "lofi",
    "project lotus",
  ],
  authors: [{ name: "Project Lotus" }],
  creator: "Project Lotus",
  openGraph: {
    title: "Project Lotus - Focus Timer & Productivity App",
    description:
      "Boost your productivity with Project Lotus. A beautiful Pomodoro timer app to help you focus and stay motivated.",
    url: "https://project-lotus-8pfq.vercel.app",
    siteName: "Project Lotus",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Lotus - Focus Timer & Productivity App",
    description:
      "Boost your productivity with Project Lotus. A beautiful Pomodoro timer app to help you focus and stay motivated.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
