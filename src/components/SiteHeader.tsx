"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  getUserDisplayName,
  isTokenActive,
} from "@/lib/jwtDisplay";

const AUTH_STORAGE_EVENT = "auth-storage";

function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

function getStoredAuthToken() {
  if (typeof window === "undefined") return "";

  const access = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  if (access && isTokenActive(access)) return access;

  const refresh = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  if (refresh && isTokenActive(refresh)) return refresh;

  if (access || refresh) {
    clearStoredTokens();
  }

  return "";
}

function subscribeAuthStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_STORAGE_EVENT, onStoreChange);
  };
}

export function SiteHeader() {
  const router = useRouter();
  const authToken = useSyncExternalStore(
    subscribeAuthStorage,
    getStoredAuthToken,
    () => "",
  );
  const loggedIn = Boolean(authToken);
  const displayName = authToken ? getUserDisplayName(authToken) : null;

  const handleLogout = () => {
    clearStoredTokens();
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
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
