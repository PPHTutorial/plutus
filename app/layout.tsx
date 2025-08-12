import type { Metadata } from "next"
import "./globals.css"
import localFont from 'next/font/local'
import { DialogProvider } from "@/app/hooks/dialog"
import { Toaster } from "react-hot-toast";
import { ContentProvider } from "./hooks/context";
import { AuthProvider } from "./hooks/AuthContext";
import LiveTransactionPopup from "./components/LiveTransactionPopup";


export const metadata: Metadata = {
  title: "Plutus | Crypto Receipt && Real Crypto Flasher",
  description: "Plutus is a cryptocurrency wallet and exchange application that allows you to send flash transactions to any of the supported wallet addresses that can last for about 90 days.",

  keywords: "crypto, cc to btc, cryptocurrency, bitcoin, ethereum, flash transaction, wallet, exchange, blockchain, digital currency, crypto receipt, flash crypto, temporary transaction",
  authors: [{ name: "Plutus Team" }],
  creator: "Plutus",
  publisher: "Plutus",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://plutus.uno'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Plutus | Crypto Receipt && Real Crypto Flasher",
    description: "Plutus is a cryptocurrency wallet and exchange application that allows you to send flash transactions to any of the supported wallet addresses that can last for about 90 days.",
    url: 'https://plutus.uno',
    siteName: 'Plutus',
    images: [
      {
        url: 'https://plutus.uno/logo.jpg',
        width: 1200,
        height: 630,
        alt: 'Plutus - Crypto Receipt && Real Crypto Flasher',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Plutus | Crypto Receipt && Real Crypto Flasher",
    description: "Plutus is a cryptocurrency wallet and exchange application that allows you to send flash transactions to any of the supported wallet addresses that can last for about 90 days.",
    images: ['https://plutus.uno/logo.jpg'],
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
}


const geistSans = localFont({
  src: [
    {
      path: "../public/fonts/Geist.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-geist-sans",
})

const geistMono = localFont({
  src: [
    {
      path: "../public/fonts/GeistMono.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-geist-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className="h-full" lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-black h-full`}>
        <Toaster />
        <AuthProvider>
          <ContentProvider>
            <AuthProvider>
              <DialogProvider>
                {children}
                <LiveTransactionPopup />
              </DialogProvider>
            </AuthProvider>
          </ContentProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

