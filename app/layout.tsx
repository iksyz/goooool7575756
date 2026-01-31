import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Goaltrivia",
  description:
    "Goaltrivia is a football-only quiz and trivia platform built for fans who want more than random questions. Here you can test your football IQ with fast, matchday-style rounds that reward recall, context, and confident decisions. Every quiz is designed around real football topics—leagues, tournaments, national teams, legends, records, tactics, and derby history—so your time is spent learning details that actually matter when you watch games, debate with friends, or follow a season. Whether you love European nights, domestic title races, or the drama of knockout football, Goaltrivia turns that passion into a repeatable way to sharpen knowledge.\n\nThe experience is intentionally competitive. Timed questions simulate the pressure of live football moments where you have to recognize a player, recall a season, connect a tactical pattern, or identify a milestone without overthinking. That format makes learning stick: short sessions help you build mental links between clubs, competitions, managers, iconic matches, and the records that define eras. Over time you start to remember not only the answer, but also the story around it—why a certain goal mattered, why a system worked, or why a rivalry became legendary.\n\nGoaltrivia also helps you explore football in a structured way. You can browse quizzes by category and difficulty, revisit topics to master them, and move from easy warm-ups to deeper challenges that separate casual knowledge from real expertise. The quizzes are crafted to stay focused on football and avoid filler, so each round feels like a meaningful drill for your memory and your understanding of the game’s culture. You will see themes like pressing and transitions, classic tournament runs, famous records, and the small details that fans search for when they want to relive a moment.\n\nIf you enjoy discovering football history, Goaltrivia is a place to do it quickly and consistently. The platform is built around the idea that football knowledge grows through smart repetition: the more you test yourself, the faster you recognize patterns and the easier it becomes to follow narratives across leagues and seasons. That makes every match you watch more enjoyable, because you notice the context behind the commentary—how styles evolve, how teams build identity, and how players become symbols of an era.\n\nStart with a featured quiz, take on the daily challenge, or browse the full catalog and pick what you care about most. Goaltrivia is made for football fans who want their trivia to feel like match preparation: focused, fast, and genuinely connected to the game.",
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
        className={`${inter.variable} antialiased bg-transparent text-emerald-950 font-sans overflow-x-hidden`}
      >
        <div className="relative min-h-screen">
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute inset-0 pitch-background" />
            <div className="absolute inset-0 pitch-vignette" />
            <div className="absolute inset-0 bg-stadium-white/55" />
          </div>
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
