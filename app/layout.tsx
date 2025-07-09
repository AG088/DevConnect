import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import SessionProviderWrapper from "./components/session-provider-wrapper"
import ClientLayout from "./components/client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DevConnect",
  description: "Connect with developers and collaborate on projects",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ClientLayout>
            {children}
          </ClientLayout>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}

