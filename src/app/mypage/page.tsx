"use client";

import { useCallback, useEffect, useState } from "react";
import { clearAccessToken, fetchWithAuth } from "@/lib/authToken";
import Link from "next/link";

type MyInfo = {
  memberId: number;
  email: string;
  nickname: string;
  reviewCount: number;
  bookMarkCount: number;
  role?: "USER" | "ADMIN"
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

type MyReview = {
  reviewId: number;
  festivalId: number;
  festivalTitle: string;
  rating: number;
  content: string;
  reviewImageUrl: string;
  likeCount: number;
  createdAt: string;
};

type MyReviewsPage = {
  content: MyReview[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

type MyReviewsResponse = {
  status: string;
  message: string;
  data: MyReviewsPage;
};

type MyBookmark = {
  bookmarkId: number;
  festivalId: number;
  title: string;
  address: string;
  startDate: string;
  endDate: string;
  bookmarkedAt: string;
};

type MyBookmarksPage = {
  content: MyBookmark[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
};

type MyBookmarksResponse = {
  status: string;
  message: string;
  data: MyBookmarksPage;
};

type WithdrawData = {
  memberId: number;
  status: string;
};

type WithdrawResponse = {
  status: string;
  message: string;
  data: WithdrawData;
};

const REVIEWS_PAGE_SIZE = 5;
const BOOKMARKS_PAGE_SIZE = 5;

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
  const [activeTab, setActiveTab] = useState("profile");
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [myReviews, setMyReviews] = useState<MyReviewsPage | null>(null);
  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarksError, setBookmarksError] = useState<string | null>(null);
  const [bookmarksPage, setBookmarksPage] = useState(0);
  const [myBookmarks, setMyBookmarks] = useState<MyBookmarksPage | null>(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [withdrawPasswordConfirm, setWithdrawPasswordConfirm] = useState("");
  const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const closeWithdrawModal = useCallback(() => {
    setWithdrawModalOpen(false);
    setWithdrawPassword("");
    setWithdrawPasswordConfirm("");
    setWithdrawError(null);
    setWithdrawSubmitting(false);
  }, []);

  const submitWithdraw = useCallback(async () => {
    setWithdrawError(null);

    if (!withdrawPassword.trim()) {
      setWithdrawError("비밀번호를 입력해 주세요.");
      return;
    }
    if (withdrawPassword !== withdrawPasswordConfirm) {
      setWithdrawError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    setWithdrawSubmitting(true);

    try {
      const response = await fetchWithAuth(`/api/users/me/withdraw`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: withdrawPassword,
          passwordConfirm: withdrawPasswordConfirm,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | WithdrawResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        const message =
          body && isApiErrorResponse(body)
            ? body.message
            : `회원 탈퇴 실패 (${response.status})`;

        if (response.status === 401) {
          setIsLoggedIn(false);
        }

        throw new Error(message);
      }

      closeWithdrawModal();
      clearAccessToken();
      alert("회원 탈퇴가 성공적으로 처리되었습니다. 그동안 이용해 주셔서 감사합니다.");

      // 탈퇴 후 뒤로가기로 마이페이지가 다시 안 보이게 한다.
      window.location.replace("/login");
    } catch (err) {
      setWithdrawError(
        err instanceof Error
          ? err.message
          : "회원 탈퇴 처리 중 오류가 발생했습니다.",
      );
    } finally {
      setWithdrawSubmitting(false);
    }
  }, [
    closeWithdrawModal,
    withdrawPassword,
    withdrawPasswordConfirm,
  ]);

  const fetchMyInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    setIsLoggedIn(true);

    try {
      const response = await fetchWithAuth(`/api/users/me`, {
        method: "GET",
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
          // 로그아웃된 상태면 토큰을 지우고 로그인 페이지로 보낸다.
          setIsLoggedIn(false);
          setMyInfo(null);
          clearAccessToken();
          window.location.replace("/login");
          return;
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
    const syncMyInfo = () => {
      void fetchMyInfo();
    };

    // 뒤로가기나 탭 복귀 시 내 정보를 다시 불러와서 로그인 상태를 확인한다.
    const timer = window.setTimeout(syncMyInfo, 0);
    window.addEventListener("pageshow", syncMyInfo);
    window.addEventListener("focus", syncMyInfo);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pageshow", syncMyInfo);
      window.removeEventListener("focus", syncMyInfo);
    };
  }, [fetchMyInfo]);

  const fetchMyReviews = useCallback(async (page: number) => {
    setReviewsLoading(true);
    setReviewsError(null);

    try {
      const query = new URLSearchParams({
        page: String(page),
        size: String(REVIEWS_PAGE_SIZE),
      });
      query.append("sort", "createdAt,desc");

      const response = await fetchWithAuth(`/api/users/me/reviews?${query.toString()}`, {
        method: "GET",
      });

      const body = (await response.json().catch(() => null)) as
        | MyReviewsResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        const message =
          body && isApiErrorResponse(body)
            ? body.message
            : `내 리뷰 조회 실패 (${response.status})`;

        if (response.status === 401) {
          setIsLoggedIn(false);
        }

        throw new Error(message);
      }

      const result = body as MyReviewsResponse;
      setMyReviews(result.data);
    } catch (err) {
      setMyReviews(null);
      setReviewsError(
        err instanceof Error
          ? err.message
          : "내 리뷰를 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "reviews") return;
    void fetchMyReviews(reviewsPage);
  }, [activeTab, fetchMyReviews, reviewsPage]);

  const fetchMyBookmarks = useCallback(async (page: number) => {
    setBookmarksLoading(true);
    setBookmarksError(null);

    try {
      const query = new URLSearchParams({
        page: String(page),
        size: String(BOOKMARKS_PAGE_SIZE),
      });
      query.append("sort", "createdAt,desc");

      const response = await fetchWithAuth(
        `/api/users/me/bookmarks?${query.toString()}`,
        {
          method: "GET",
        },
      );

      const body = (await response.json().catch(() => null)) as
        | MyBookmarksResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        const message =
          body && isApiErrorResponse(body)
            ? body.message
            : `찜 목록 조회 실패 (${response.status})`;

        if (response.status === 401) {
          setIsLoggedIn(false);
        }

        throw new Error(message);
      }

      const result = body as MyBookmarksResponse;
      setMyBookmarks(result.data);
    } catch (err) {
      setMyBookmarks(null);
      setBookmarksError(
        err instanceof Error
          ? err.message
          : "찜한 축제 목록을 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setBookmarksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "bookmarks") return;
    void fetchMyBookmarks(bookmarksPage);
  }, [activeTab, bookmarksPage, fetchMyBookmarks]);

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


    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="mx-auto flex w-full flex-col gap-8 md:flex-row">
        {withdrawModalOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeWithdrawModal();
            }}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              role="dialog"
              aria-modal="true"
              aria-labelledby="withdraw-dialog-title"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <h3
                id="withdraw-dialog-title"
                className="text-lg font-bold text-slate-900"
              >
                회원 탈퇴
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                탈퇴 후에는 계정 복구가 어려울 수 있습니다. 본인 확인을 위해 비밀번호를
                입력해 주세요.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <label
                    htmlFor="withdraw-password"
                    className="block text-xs font-medium text-slate-500"
                  >
                    비밀번호
                  </label>
                  <input
                    id="withdraw-password"
                    type="password"
                    autoComplete="current-password"
                    value={withdrawPassword}
                    onChange={(e) => setWithdrawPassword(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 focus:border-blue-400 focus:ring-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="withdraw-password-confirm"
                    className="block text-xs font-medium text-slate-500"
                  >
                    비밀번호 확인
                  </label>
                  <input
                    id="withdraw-password-confirm"
                    type="password"
                    autoComplete="new-password"
                    value={withdrawPasswordConfirm}
                    onChange={(e) => setWithdrawPasswordConfirm(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none ring-blue-200 focus:border-blue-400 focus:ring-2"
                  />
                </div>
              </div>

              {withdrawError ? (
                <p className="mt-3 text-sm text-red-600">{withdrawError}</p>
              ) : null}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeWithdrawModal}
                  disabled={withdrawSubmitting}
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void submitWithdraw()}
                  disabled={withdrawSubmitting}
                  className="inline-flex h-10 items-center rounded-md border border-red-200 bg-red-600 px-4 text-sm font-medium text-white transition enabled:hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {withdrawSubmitting ? "처리 중..." : "탈퇴하기"}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <aside className="w-full shrink-0 md:w-80">
          <div className="sticky top-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 px-2 text-2xl font-bold text-slate-900">마이페이지</h2>

            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${activeTab === "profile"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                내 프로필
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${activeTab === "reviews"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                내가 단 리뷰
              </button>

              <button
                onClick={() => setActiveTab("bookmarks")}
                className={`flex w-full items-center rounded-xl px-4 py-3.5 text-base font-semibold transition-colors ${activeTab === "bookmarks"
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                내가 찜한 축제
              </button>
            </nav>

            {myInfo?.role === "ADMIN" && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Only</span>
                </div>
                <a
                  href="/admin"
                  className="flex w-full justify-center items-center rounded-xl px-4 py-3 text-base font-semibold text-white bg-slate-800 transition-colors hover:bg-slate-900 shadow-sm"
                >
                  관리자 대시보드
                </a>
              </div>
            )}

            {/* 회원탈퇴 영역 */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setWithdrawModalOpen(true)}
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
                  <div className="flex flex-col gap-1"> {/* 세로 정렬을 위해 div로 감싸고 간격을 줍니다 */}

                    {/* 닉네임 영역 */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-slate-400 w-12">닉네임</span>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {myInfo?.nickname ?? "이름 없음"}
                      </h2>
                    </div>

                    {/* 이메일 영역 */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-medium text-slate-400 w-12">이메일</span>
                      <p className="text-base text-slate-500">
                        {myInfo?.email ?? "이메일 정보 없음"}
                      </p>
                    </div>

                  </div>
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
              {reviewsLoading ? (
                <p className="mt-3 text-base text-slate-500">
                  작성하신 리뷰 목록을 불러오는 중입니다...
                </p>
              ) : null}

              {reviewsError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{reviewsError}</p>
                  <button
                    type="button"
                    onClick={() => void fetchMyReviews(reviewsPage)}
                    className="mt-3 inline-flex h-9 items-center rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    다시 시도
                  </button>
                </div>
              ) : null}

              {!reviewsLoading && !reviewsError && myReviews?.content.length === 0 ? (
                <p className="mt-3 text-base text-slate-500">
                  아직 작성한 리뷰가 없습니다.
                </p>
              ) : null}

              {!reviewsLoading &&
                !reviewsError &&
                myReviews &&
                myReviews.content.length > 0 ? (
                <>
                  <ul className="mt-5 space-y-3">
                    {myReviews.content.map((review) => (
                      <li key={review.reviewId}>
                        <Link
                          href={`/festivals/${review.festivalId}`}
                          className="block rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {review.festivalTitle}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              평점 {review.rating}/5
                            </span>
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm text-slate-700">
                            {review.content}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {myReviews.totalElements}개 중 {reviewsPage + 1} /{" "}
                      {myReviews.totalPages} 페이지
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setReviewsPage((prev) => Math.max(prev - 1, 0))}
                        disabled={reviewsPage === 0}
                        className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        이전
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setReviewsPage((prev) =>
                            myReviews.hasNext ? prev + 1 : prev,
                          )
                        }
                        disabled={!myReviews.hasNext}
                        className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* 3. '내가 찜한 축제' 탭 */}
          {activeTab === "bookmarks" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-900">내가 찜한 축제</h2>
              {bookmarksLoading ? (
                <p className="mt-3 text-base text-slate-500">
                  찜한 축제 목록을 불러오는 중입니다...
                </p>
              ) : null}

              {bookmarksError ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-600">{bookmarksError}</p>
                  <button
                    type="button"
                    onClick={() => void fetchMyBookmarks(bookmarksPage)}
                    className="mt-3 inline-flex h-9 items-center rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-100"
                  >
                    다시 시도
                  </button>
                </div>
              ) : null}

              {!bookmarksLoading &&
                !bookmarksError &&
                myBookmarks?.content.length === 0 ? (
                <p className="mt-3 text-base text-slate-500">
                  아직 찜한 축제가 없습니다.
                </p>
              ) : null}

              {!bookmarksLoading &&
                !bookmarksError &&
                myBookmarks &&
                myBookmarks.content.length > 0 ? (
                <>
                  <ul className="mt-5 space-y-3">
                    {myBookmarks.content.map((bookmark) => (
                      <li key={bookmark.bookmarkId}>
                        <Link
                          href={`/festivals/${bookmark.festivalId}`}
                          className="block rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {bookmark.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {bookmark.address}
                              </p>
                            </div>
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                              찜 {new Date(bookmark.bookmarkedAt).toLocaleDateString("ko-KR")}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-slate-700">
                            축제 기간:{" "}
                            {new Date(bookmark.startDate).toLocaleDateString("ko-KR")} -{" "}
                            {new Date(bookmark.endDate).toLocaleDateString("ko-KR")}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {myBookmarks.totalElements}개 중 {bookmarksPage + 1} /{" "}
                      {myBookmarks.totalPages} 페이지
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setBookmarksPage((prev) => Math.max(prev - 1, 0))
                        }
                        disabled={bookmarksPage === 0}
                        className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        이전
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setBookmarksPage((prev) =>
                            myBookmarks.hasNext ? prev + 1 : prev,
                          )
                        }
                        disabled={!myBookmarks.hasNext}
                        className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition enabled:hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
