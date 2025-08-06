import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SheVoices - Empowering Women Through Stories",
  description:
    "A safe digital space for women to share their stories, opinions, and experiences. Join our community and add your voice to the conversation.",
  keywords: ["women", "stories", "community", "empowerment", "safe space", "female voices", "podcast"],
  authors: [{ name: "SheVoices Team" }],
  openGraph: {
    title: "SheVoices - Empowering Women Through Stories",
    description: "A safe digital space for women to share their stories, opinions, and experiences.",
    type: "website",
    locale: "en_US",
    url: "https://shevoices.com",
    siteName: "SheVoices",
  },
  twitter: {
    card: "summary_large_image",
    title: "SheVoices - Empowering Women Through Stories",
    description: "A safe digital space for women to share their stories, opinions, and experiences.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
