import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const mont = localFont({
  src: [
    {
      path: "../public/fonts/Mont-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Mont-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Mont-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/Mont-Black.otf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-mont",
});

export const metadata: Metadata = {
  title: "Durom's Touch Clinic",
  description: "Healthcare without hassle",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${mont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
