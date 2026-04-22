"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAccessToken, fetchWithAuth } from "@/lib/authToken";

type MeResponse = {
  data?: {
    nickname?: string;
    email?: string;
  };
};

export function SiteHeader() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadMe = async () => {
      try {
        const response = await fetchWithAuth("/api/users/me");
        const body = (await response.json().catch(() => null)) as MeResponse | null;

        if (!active) return;

        if (!response.ok || !body?.data) {
          setLoggedIn(false);
          setDisplayName(null);
          return;
        }

        setLoggedIn(true);
        setDisplayName(body.data.nickname ?? body.data.email ?? "회원");
      } catch {
        if (!active) return;
        setLoggedIn(false);
        setDisplayName(null);
      }
    };

    void loadMe();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // 화면 상태는 아래에서 정리한다.
    }
    clearAccessToken();
    setLoggedIn(false);
    setDisplayName(null);
    router.push("/login");
    router.refresh();
  };

  const greeting = displayName ? `${displayName}님 환영합니다` : null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-300 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md px-3 text-base font-bold text-slate-900 transition hover:bg-slate-100"
        >
          오늘의 축제
        </Link>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              {greeting ? (
                <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                  {greeting}
                </span>
              ) : null}
              <Link
                href="/mypage"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                마이페이지
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
