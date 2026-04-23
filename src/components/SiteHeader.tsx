"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  clearAccessToken,
  clearHomeBackLock,
  enableLoginBackLock,
  fetchWithAuth,
  getStoredAccessToken,
} from "@/lib/authToken";
import { getUserDisplayName } from "@/lib/jwtDisplay";

type MeResponse = {
  data?: {
    nickname?: string;
    email?: string;
  };
};

type AuthStatus = "checking" | "loggedIn" | "loggedOut";

export function SiteHeader() {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [displayName, setDisplayName] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    try {
      const response = await fetchWithAuth("/api/users/me");
      const body = (await response.json().catch(() => null)) as MeResponse | null;

      if (!response.ok || !body?.data) {
        setAuthStatus("loggedOut");
        setDisplayName(null);
        return;
      }

      setAuthStatus("loggedIn");
      setDisplayName(body.data.nickname ?? body.data.email ?? "회원");
    } catch {
      setAuthStatus("loggedOut");
      setDisplayName(null);
    }
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      // 뒤로가기 했을 때 저장된 토큰이 있는지 먼저 확인한다.
      const accessToken = getStoredAccessToken();

      if (accessToken) {
        setAuthStatus("loggedIn");
        setDisplayName(getUserDisplayName(accessToken));
      } else {
        // accessToken이 없어도 refreshToken으로 재발급될 수 있어서 바로 로그아웃 처리하지 않는다.
        setAuthStatus("checking");
        setDisplayName(null);
      }

      void loadMe();
    };

    // 뒤로가기나 탭을 다시 열었을 때 로그인 상태를 다시 맞춘다.
    const timer = window.setTimeout(syncAuthState, 0);
    window.addEventListener("pageshow", syncAuthState);
    window.addEventListener("focus", syncAuthState);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
    };
  }, [loadMe]);

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // 화면 상태는 아래에서 정리한다.
    }
    clearAccessToken();
    clearHomeBackLock();
    enableLoginBackLock();
    setAuthStatus("loggedOut");
    setDisplayName(null);
    // 로그아웃 후 뒤로가기로 이전 로그인 화면이 남지 않게 replace를 사용한다.
    router.replace("/login");
    router.refresh();
  };

  const greeting = displayName ? `${displayName}님 환영합니다` : null;
  const isChecking = authStatus === "checking";
  const loggedIn = authStatus === "loggedIn";
  const linkClassName =
    "inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200";

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
          {isChecking ? (
            // 로그인 확인 중에는 버튼을 눌러도 이동하지 못하게 막는다.
            <>
              <button
                type="button"
                disabled
                className={`${linkClassName} cursor-not-allowed opacity-60`}
              >
                로그인
              </button>
              <button
                type="button"
                disabled
                className={`${linkClassName} cursor-not-allowed opacity-60`}
              >
                회원가입
              </button>
            </>
          ) : loggedIn ? (
            <>
              {greeting ? (
                <span className="hidden text-sm font-medium text-slate-600 sm:inline">
                  {greeting}
                </span>
              ) : null}
              <Link
                href="/mypage"
                className={linkClassName}
              >
                마이페이지
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={linkClassName}
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={linkClassName}
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className={linkClassName}
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
