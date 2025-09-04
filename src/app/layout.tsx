import ToastProvider from '@/components/ToastProvider';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ATS Resume Scanner - See Why Your Resume Gets Ignored | 100% Free",
    template: "%s | ATS Resume Scanner"
  },
  description: "See why your applications are getting ignored. Use this Instant ATS scanner to understand why recruiters aren't calling you back. Professional insights in seconds. No signup required, 100% free.",
  keywords: [
    "ATS resume scanner",
    "resume scanner",
    "ATS optimization",
    "resume analysis",
    "why resume ignored",
    "free resume checker",
    "instant ATS scanner",
    "AI resume review",
    "job application",
    "resume improvement"
  ],
  authors: [{ name: "ATS Resume Scanner" }],
  creator: "ATS Resume Scanner",
  publisher: "ATS Resume Scanner",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "ATS Resume Scanner - See Why Your Resume Gets Ignored",
    description: "See why your applications are getting ignored. Use this Instant ATS scanner to understand why recruiters aren't calling you back. Professional insights in seconds.",
    url: '/',
    siteName: 'ATS Resume Scanner',
    images: [
      {
        url: '/favicon-32x32.png',
        width: 1200,
        height: 630,
        alt: 'ATS Resume Scanner - See Why Your Resume Gets Ignored',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ATS Resume Scanner - See Why Your Resume Gets Ignored",
    description: "See why your applications are getting ignored. Use this Instant ATS scanner to understand why recruiters aren't calling you back. Professional insights in seconds.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
        <ToastProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "ATS Resume Scanner",
              "description": "Instant ATS scanner to see why your applications are getting ignored. Get professional insights in seconds with no signup required.",
              "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "AI-powered resume analysis",
                "ATS optimization scoring",
                "Skills gap identification",
                "Professional formatting assessment",
                "Actionable improvement recommendations"
              ]
            })
          }}
        />
      </body>
    </html>
  );
}
