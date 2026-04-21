import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "축제삼삼오오",
  description: "전국 축제 정보를 한눈에 찾는 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <SiteHeader />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} 오늘의 축제</p>
            <p>즐거운 축제를 더 쉽게 찾아보세요.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
