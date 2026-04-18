"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/lib/jwtDisplay";

type MyInfo = {
  memberId: number;
  email: string;
  nickname: string;
  reviewCount: number;
  bookMarkCount: number;
};

type MeResponse = {
  status: string;
  message: string;
  data: MyInfo;
};

type ApiErrorResponse = {
  status: number;
  message: string;
  data: null;
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === "number" && typeof v.message === "string";
}

export default function MyPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab,setActiveTab] = useState("profile");

  const fetchMyInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setIsLoggedIn(false);
      setMyInfo(null);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      const response = await fetch(`/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = (await response.json().catch(() => null)) as
        | MeResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        const message =
          body && isApiErrorResponse(body)
            ? body.message
            : `내 정보 조회 실패 (${response.status})`;

        if (response.status === 401) {
          try {
            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          } catch {
            // ignore
          }
          setIsLoggedIn(false);
        }

        throw new Error(message);
      }

      const result = body as MeResponse;
      setMyInfo(result.data);
    } catch (err) {
      setMyInfo(null);
      setError(
        err instanceof Error
          ? err.message
          : "내 정보를 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMyInfo();
  }, [fetchMyInfo]);

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
            onClick={() => void fetchMyInfo()}
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
    <div className="mx-auto flex w-full flex-col gap-8 md:flex-row">
      <aside className="w-full shrink-0 md:w-80">
        <div className="sticky top-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 px-2 text-2xl font-bold text-slate-900">마이페이지</h2>
          
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                activeTab === "profile"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              내 프로필
            </button>
            
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                activeTab === "reviews"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              내가 단 리뷰
            </button>
            
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${
                activeTab === "bookmarks"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              내가 찜한 축제
            </button>
          </nav>

          {/* 회원탈퇴 영역 */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => {
                if (confirm("정말로 회원탈퇴를 진행하시겠습니까?")) {
                  console.log("회원탈퇴 클릭됨!");
                }
              }}
              className="flex w-full items-center rounded-xl px-4 py-3 text-base font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              회원탈퇴
            </button>
          </div>
        </div>
      </aside>

      {/*오른쪽: 메인 콘텐츠 영역 */}
      <main className="flex-1">
        
        {/*내 프로필 탭 */}
        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* 프로필 카드  */}
            <section className="flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {myInfo?.nickname ?? "이름 없음"}
                </h2>
                <p className="mt-2 text-base text-slate-500">
                  {myInfo?.email ?? "이메일 정보 없음"}
                </p>
              </div>
            </section>

            <dl className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <dt className="text-base font-medium text-slate-500">작성한 리뷰 수</dt>
                <dd className="mt-3 text-4xl font-bold text-slate-900">
                  {myInfo?.reviewCount ?? 0}
                </dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <dt className="text-base font-medium text-slate-500">찜한 축제 수</dt>
                <dd className="mt-3 text-4xl font-bold text-slate-900">
                  {myInfo?.bookMarkCount ?? 0}
                </dd>
              </div>
            </dl>
          </div>
        )}

        {/* 2. '내가 단 리뷰' 탭 */}
        {activeTab === "reviews" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-900">내가 단 리뷰</h2>
            <p className="mt-3 text-base text-slate-500">
              작성하신 리뷰 목록을 불러옵니다...
            </p>
          </div>
        )}

        {/* 3. '내가 찜한 축제' 탭 */}
        {activeTab === "bookmarks" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-slate-900">내가 찜한 축제</h2>
            <p className="mt-3 text-base text-slate-500">
              찜하신 축제 목록을 불러옵니다...
            </p>
          </div>
        )}

      </main>
    </div>
  );
}