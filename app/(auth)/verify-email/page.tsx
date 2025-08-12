import { EmailVerificationForm } from '@/app/components/auth/EmailVerificationForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: "Plutus | Crypto Receipt && Real Crypto Flasher",
  description: "Plutus is a cryptocurrency wallet and exchange application that allows you to send flash transactions to any of the supported wallet addresses that can last for about 90 days.",

  keywords: "crypto, cryptocurrency, bitcoin, ethereum, flash transaction, wallet, exchange, blockchain, digital currency, crypto receipt, flash crypto, temporary transaction",
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
    title: "Plutus Verify Email | Crypto Receipt && Real Crypto Flasher",
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailVerificationForm />
    </Suspense>
  )
}
