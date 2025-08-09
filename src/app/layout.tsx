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
    default: "Resume Scanner AI - AI-Powered Resume Analysis & ATS Optimization",
    template: "%s | Resume Scanner AI"
  },
  description: "Upload your resume and get AI-powered insights to improve your job prospects. Advanced analysis for skills, ATS optimization, and professional presentation. Free resume scanner with instant results.",
  keywords: [
    "resume scanner",
    "resume analysis",
    "ATS optimization",
    "AI resume review",
    "job application",
    "career development",
    "resume checker",
    "skills analysis",
    "professional resume",
    "resume improvement"
  ],
  authors: [{ name: "Resume Scanner AI" }],
  creator: "Resume Scanner AI",
  publisher: "Resume Scanner AI",
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
    title: "Resume Scanner AI - AI-Powered Resume Analysis",
    description: "Upload your resume and get AI-powered insights to improve your job prospects. Advanced analysis for skills, ATS optimization, and professional presentation.",
    url: '/',
    siteName: 'Resume Scanner AI',
    images: [
      {
        url: '/favicon-32x32.png',
        width: 1200,
        height: 630,
        alt: 'Resume Scanner AI - AI-Powered Resume Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Resume Scanner AI - AI-Powered Resume Analysis",
    description: "Upload your resume and get AI-powered insights to improve your job prospects. Advanced analysis for skills, ATS optimization, and professional presentation.",
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
              "name": "Resume Scanner AI",
              "description": "AI-powered resume analysis tool that provides insights on skills, ATS optimization, and professional presentation.",
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
