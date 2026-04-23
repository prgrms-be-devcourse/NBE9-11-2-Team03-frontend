"use client";

import type { ReactNode } from "react";
import { useMyInfo } from "@/components/mypage/useMyInfo";

type MyPageShellProps = {
  title: string;
  children: ReactNode;
};

export function MyPageShell({ title, children }: MyPageShellProps) {
  const { loading, error, myInfo, isLoggedIn, refetch } = useMyInfo();

  if (loading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-600">내 정보를 불러오는 중입니다...</p>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>
        <p className="mt-2 text-sm text-slate-600">
          로그인 후 내 정보를 확인할 수 있습니다.
        </p>
        <a
          href="/login"
          className="mt-4 inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
        >
          로그인하러 가기
        </a>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">마이페이지</h1>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          >
            다시 시도
          </button>
          {error.includes("로그인이 필요합니다") ? (
            <a
              href="/login"
              className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              로그인
            </a>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="grid min-h-[720px] grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="flex flex-col border-b border-slate-300 md:border-b-0 md:border-r">
          <div className="space-y-3 p-4">
            <div className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-800">
              {myInfo?.nickname ?? "닉네임"}
            </div>
            <div className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm text-slate-700">
              {myInfo?.email ?? "이메일"}
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-200 p-4">
            <a
              href="/mypage/reviews"
              className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            >
              내가 단 리뷰
            </a>
            <a
              href="/mypage/bookmarks"
              className="w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-800 transition hover:bg-slate-200"
            >
              내가 찜한 축제
            </a>
          </div>

          <div className="mt-auto border-t border-slate-200 p-4">
            <a
              href="/mypage/withdraw"
              className="block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-center text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              회원 탈퇴
            </a>
          </div>
        </aside>

        <div className="space-y-4 p-4 md:p-6">
          <div className="flex items-end justify-between">
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

