import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://got2get2work.com"),
  title: {
    default: "Got2Get2Work | Protect the shift",
    template: "%s | Got2Get2Work",
  },
  description:
    "A privacy-minded demonstration of coworker commute coordination and employer-sponsored mobility support for shift workers.",
  icons: {
    icon: "/got2get2work-logo.png",
    shortcut: "/got2get2work-logo.png",
  },
  openGraph: {
    title: "Got2Get2Work | Protect the shift",
    description:
      "Explore a privacy-minded commute coordination demonstration for hourly and essential workers.",
    url: "https://got2get2work.com",
    siteName: "Got2Get2Work",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Got2Get2Work commute coordination demonstration",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Got2Get2Work | Protect the shift",
    description:
      "A privacy-minded commute coordination demonstration for shift workers and employers.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
