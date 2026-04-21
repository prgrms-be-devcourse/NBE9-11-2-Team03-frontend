"use client";

import { useEffect, useState } from "react";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  getUserDisplayName,
} from "@/lib/jwtDisplay";

export function SiteHeader() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    try {
      const access = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      if (access) {
        setLoggedIn(true);
        setDisplayName(getUserDisplayName(access));
        return;
      }
      const refresh = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      if (refresh) {
        setLoggedIn(true);
        setDisplayName(getUserDisplayName(refresh));
        return;
      }
    } catch {
      /* 스토리지 비활성 등 */
    }
    setLoggedIn(false);
    setDisplayName(null);
  }, []);

  const greeting = displayName ? `${displayName}님 환영합니다` : null;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-300 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="inline-flex h-10 items-center rounded-md px-3 text-base font-bold text-slate-900 transition hover:bg-slate-100"
        >
          오늘의 축제
        </a>
        <div className="flex items-center gap-2">
          {loggedIn ? (
            <>
              {greeting ? (
                <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                  {greeting}
                </span>
              ) : null}
              <a
                href="/mypage"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                마이페이지
              </a>
              <a
                href="/logout"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                로그아웃
              </a>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                로그인
              </a>
              <a
                href="/signup"
                className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              >
                회원가입
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
