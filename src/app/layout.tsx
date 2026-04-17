import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-300 bg-white">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <a
              href="/"
              className="inline-flex h-10 items-center rounded-md px-3 text-base font-bold text-slate-900 transition hover:bg-slate-100"
            >
              오늘의 축제
            </a>
            <div className="flex items-center gap-2">
              <a
                href="/signup"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                회원가입
              </a>
              <a
                href="/login"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                로그인
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-sm text-slate-500 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} 축제삼삼오오</p>
            <p>즐거운 축제를 더 쉽게 찾아보세요.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
