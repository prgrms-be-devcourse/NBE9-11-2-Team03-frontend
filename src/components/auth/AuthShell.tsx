import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  description: string;
  footerHref: string;
  footerLabel: string;
  footerText: string;
  mode: "login" | "signup";
  title: string;
};

const imageUrl =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80";

export function AuthShell({
  children,
  description,
  footerHref,
  footerLabel,
  footerText,
  mode,
  title,
}: AuthShellProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-stretch">
        <section className="relative min-h-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 text-white shadow-sm lg:min-h-[620px]">
          <Image
            src={imageUrl}
            alt="축제 무대 앞에서 함께 환호하는 사람들"
            fill
            priority
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="mb-4 inline-flex rounded-md bg-white/90 px-3 py-1 text-sm font-bold text-slate-900">
              축제삼삼오오
            </p>
            <h1 className="max-w-xl text-3xl font-bold leading-snug sm:text-4xl">
              전국 축제 정보를 한눈에 보고, 나만의 축제를 저장하세요.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-100">
              지역별 축제 검색부터 리뷰, 찜한 축제 관리까지 이어지는 서비스입니다.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[420px] justify-self-center lg:justify-self-end">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-blue-600">
                {mode === "login" ? "LOGIN" : "SIGN UP"}
              </p>
              <h2 className="text-2xl font-bold leading-8 text-slate-900">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </div>

            {children}

            <p className="mt-8 text-center text-sm text-slate-500">
              {footerText}{" "}
              <Link
                href={footerHref}
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                {footerLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
