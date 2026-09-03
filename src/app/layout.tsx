import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Eventora",
    template: "%s | Eventora",
  },
  description:
    "Eventora — The modern platform to discover, book, and manage events with confidence.",
  keywords: [
    "Eventora",
    "events",
    "event management",
    "event booking",
    "tickets",
    "event platform",
    "professional events",
    "organizer tools",
  ],
  authors: [{ name: "Eventora Team" }],
  themeColor: "#0A66C2", // LinkedIn-style bold blue
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
