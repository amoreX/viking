import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Providers from "@/components/providers";
import Navbar from "@/components/ui/navbar";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIKING - Vibecoder Leaderboard",
  description:
    "Connect GitHub. See how many lines your AI agents shipped. Climb the vibecoder leaderboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="viking"
      className={`dark ${jetbrainsMono.variable} antialiased`}
    >
      <body>
        <Providers>
          <Navbar />
          <main className="pt-14">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
