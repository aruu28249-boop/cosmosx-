import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import GlobalCosmos from "@/components/GlobalCosmos";

const cormorant = Cormorant_Garamond({
  variable: "--font-syne", // Keeping variable name same to avoid changing css/tailwind everywhere
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-space-grotesk", // Keeping variable name same
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CosmosX | MIRAI",
  description: "Emotional space exploration experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050816] text-white font-sans overflow-x-hidden">
        <GlobalCosmos />
        {children}
      </body>
    </html>
  );
}
