import type { Metadata, Viewport } from 'next';
import './globals.css';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Aryan Sharma | Developer Portfolio Card',
  description:
    'Aryan Sharma — TIPS BCA student building modern, responsive web applications with aesthetic precision and clean performance.',
  keywords: ['Aryan Sharma', 'portfolio', 'developer', 'web developer', 'Next.js', 'BCA'],
  authors: [{ name: 'Aryan Sharma' }],
  openGraph: {
    title: 'Aryan Sharma | Developer Portfolio Card',
    description:
      'Building modern, responsive web applications with aesthetic precision and clean performance.',
    url: siteUrl,
    siteName: 'Aryan Sharma — Portfolio Card',
    images: [{ url: '/images/aryanpic.jpeg', width: 1200, height: 1200, alt: 'Aryan Sharma' }],
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Aryan Sharma | Developer Portfolio Card',
    description:
      'Building modern, responsive web applications with aesthetic precision and clean performance.',
    images: ['/images/aryanpic.jpeg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060608',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router loads
            these on every route via the root layout; the rule targets pages/_document.js. */}
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        {/* Background atmosphere layer — same grid mesh + ambient lighting */}
        <div className="bg-canvas" aria-hidden="true">
          <div className="bg-glow bg-glow-1" />
          <div className="bg-glow bg-glow-2" />
          <div className="bg-grid" />
          <div className="bg-noise" />
        </div>

        {children}
      </body>
    </html>
  );
}
