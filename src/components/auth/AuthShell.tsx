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
  const navHref = mode === "login" ? "/signup" : "/login";
  const navLabel = mode === "login" ? "회원가입" : "로그인";

  return (
    <div className="min-h-dvh bg-[#f4fbf7] text-[#202426]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-3 text-lg font-bold text-[#101414]"
          aria-label="오늘의 축제 로그인으로 이동"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#00a88f] text-sm font-black text-white">
            축
          </span>
          오늘의 축제
        </Link>
        <Link
          href={navHref}
          className="rounded-md border border-[#cbd8d3] bg-white px-4 py-2 text-sm font-semibold text-[#202426] transition hover:border-[#00a88f] hover:text-[#007c6c]"
        >
          {navLabel}
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-10 sm:px-8 lg:min-h-[calc(100dvh-86px)] lg:grid-cols-[1fr_440px] lg:items-center">
        <section className="relative min-h-[340px] overflow-hidden rounded-lg bg-[#101414] text-white lg:min-h-[620px]">
          <Image
            src={imageUrl}
            alt="축제 무대 앞에서 함께 환호하는 사람들"
            fill
            priority
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101414] via-[#101414]/45 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="mb-3 inline-flex rounded-md bg-[#ff5a5f] px-3 py-1 text-sm font-bold text-white">
              오늘 떠나는 축제
            </p>
            <h1 className="max-w-xl text-3xl font-black leading-snug sm:text-4xl">
              가까운 축제를 찾고, 함께 갈 순간을 놓치지 마세요.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-white/85">
              지역별 축제 소식부터 관심 행사 저장까지, 오늘의 일정이 더
              선명해집니다.
            </p>
          </div>
        </section>

        <section className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
          <div className="rounded-lg border border-[#dfe9e4] bg-white p-6 shadow-[0_18px_60px_rgba(20,32,28,0.12)] sm:p-8">
            <div className="mb-8">
              <p className="mb-2 text-sm font-bold text-[#00a88f]">
                {mode === "login" ? "Welcome back" : "Create account"}
              </p>
              <h2 className="text-2xl font-black leading-8 text-[#101414]">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#65706b]">
                {description}
              </p>
            </div>

            {children}

            <p className="mt-8 text-center text-sm text-[#65706b]">
              {footerText}{" "}
              <Link
                href={footerHref}
                className="font-bold text-[#007c6c] hover:text-[#ff5a5f]"
              >
                {footerLabel}
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
