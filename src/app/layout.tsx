import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

// ⚠️ Note: We use next/font/google instead of @import url() in globals.css
// because Turbopack (Next.js 13+ with App Router) cannot handle CSS @import url()
// after other rules - it will crash the build. next/font/google is faster,
// avoids FOUC, and won't break the build.

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: 'swap',
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "TipJar dApp - Decentralized Tipping Platform",
  description: "Send ETH tips on the blockchain with our futuristic decentralized application",
  keywords: ["blockchain", "ethereum", "dapp", "tips", "web3", "crypto"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} antialiased font-rajdhani`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
