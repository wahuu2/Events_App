import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eventora-events-five.vercel.app"),

  title: {
    default: "Eventora | Modern Event Management Platform",
    template: "%s | Eventora",
  },

  description:
    "Eventora helps you discover, book, and manage events effortlessly — built for organizers and attendees who value simplicity and speed.",

  keywords: [
    "Eventora",
    "event management",
    "event booking",
    "event platform",
    "tickets",
    "organizer dashboard",
    "QR ticketing",
    "event analytics",
  ],

  authors: [{ name: "Eventora Team" }],
  creator: "Eventora",

  openGraph: {
    title: "Eventora | Modern Event Management Platform",
    description:
      "Create, manage, and promote events with ease using Eventora — your all‑in‑one event solution.",
    type: "website",
    locale: "en_KE",
    siteName: "Eventora",
    images: [
      {
        url: "/og-eventora.png",
        width: 1200,
        height: 630,
        alt: "Eventora — Discover and Manage Events Easily",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Eventora | Modern Event Management Platform",
    description:
      "Discover, book, and manage events with confidence using Eventora.",
    images: ["/og-eventora.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};


export const viewport: Viewport = {
  themeColor: "#0A66C2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}