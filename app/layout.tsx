import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://goaltrivia.com"),
  title: {
    default: "Goaltrivia",
    template: "%s | Goaltrivia",
  },
  description:
    "Football-only quizzes built for matchday focus. Play fast, timed trivia across leagues, tournaments, legends, records, and tactics.",
  applicationName: "Goaltrivia",
  keywords: [
    "football quiz",
    "football trivia",
    "soccer quiz",
    "matchday quiz",
    "football knowledge",
    "football facts",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Goaltrivia",
    title: "Goaltrivia",
    description:
      "Football-only quizzes built for matchday focus. Play fast, timed trivia across leagues, tournaments, legends, records, and tactics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Goaltrivia",
    description:
      "Football-only quizzes built for matchday focus. Play fast, timed trivia across leagues, tournaments, legends, records, and tactics.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" data-pitch="light" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <meta httpEquiv="Content-Language" content="en" />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body
        className={`${inter.variable} antialiased bg-transparent text-emerald-950 font-sans overflow-x-hidden pb-[env(safe-area-inset-bottom)]`}
      >
        <div className="relative min-h-screen">
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 pitch-background" />
            <div className="absolute inset-0 pitch-vignette" />
            <div className="absolute inset-0 bg-stadium-white/55" />
          </div>
          <Providers>
            <Navbar />
            {children}
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
