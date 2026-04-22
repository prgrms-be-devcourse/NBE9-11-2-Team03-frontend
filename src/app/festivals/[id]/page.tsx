"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/jwtDisplay";
import { useMyInfo } from "@/components/mypage/useMyInfo";
import BookMarkButton from "@/components/BookMarkButton";

type ApiRes<T> = {
    status: number | string;
    message: string;
    data: T;
};

type FestivalDetail = {
    id?: number;
    title: string;
    overview?: string;
    firstImageUrl?: string | null;
    averageRate?: number;
    viewCount?: number;
    bookMarkCount?: number;
    startDate: string;
    endDate: string;
    address?: string;
    contactNumber?: string;
    homepageUrl?: string;
    mapX?: number;
    mapY?: number;
    isBookmarked?: boolean;
};

type ReviewItem = {
    reviewId: number;
    memberId: number;
    festivalId: number;
    nickname: string;
    content: string;
    rating: number;
    image: string | null;
    likeCount: number;
    reportCount: number;
    createdAt: string;
};

type ReviewPageResponse = {
    festivalId: number;
    content: ReviewItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
};

type ReviewCreateResponse = {
    reviewId: number;
    festivalId: number;
    memberId: number;
    nickname: string;
    content: string;
    image: string | null;
    rating: number;
    likeCount: number;
    reportCount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
};

type ReviewUpdateResponse = {
    reviewId: number;
    festivalId: number;
    rating: number;
    content: string;
    image: string | null;
    updatedAt: string;
};

export default function FestivalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const festivalId = params.id;
    const { myInfo, isLoggedIn } = useMyInfo();

    const [festival, setFestival] = useState<FestivalDetail | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "location" | "review">("overview");
    const [loadingMap, errorMap] = useKakaoLoader({
        appkey: "66f9dd9bdc448822d3712fc5a4994579",
        libraries: ["services"]
    });

    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [reviewPage, setReviewPage] = useState(0);
    const [reviewSize] = useState(10);
    const [reviewTotalPages, setReviewTotalPages] = useState(0);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null);

    const [reviewForm, setReviewForm] = useState({
        content: "",
        image: "",
        rating: 5,
    });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = typeof window !== "undefined" ? localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) : null;
                const response = await fetch(`/api/festivals/${festivalId}`, {
                    cache: "no-store",
                    headers: {
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        Accept: "application/json",
                    },
                });
                const resData = await response.json();
                if (
                    resData.status === 200 ||
                    resData.status === "200" ||
                    resData.resultCode === "200"
                ) {
                    setFestival(resData.data);
                } else {
                    router.back();
                }
            } catch (err) {
                router.back();
            }
        };
        if (festivalId) fetchDetail();
    }, [festivalId, router]);

    const getAccessToken = () => {
        if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    };

    const fetchReviews = useCallback(async (page = 0) => {
        if (!festivalId) return;

        setReviewLoading(true);
        setReviewError("");

        try {
            const token = getAccessToken();
            const response = await fetch(
                `/api/festivals/${festivalId}/reviews?page=${page}&size=${reviewSize}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                }
            );

            const result: ApiRes<ReviewPageResponse> = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "리뷰 목록 조회에 실패했습니다.");
            }

            setReviews(result.data.content ?? []);
            setReviewPage(result.data.page ?? 0);
            setReviewTotalPages(result.data.totalPages ?? 0);
        } catch (error: any) {
            setReviewError(error.message || "리뷰를 불러오지 못했습니다.");
        } finally {
            setReviewLoading(false);
        }
    }, [festivalId, reviewSize]);

    useEffect(() => {
        if (activeTab === "review" && festivalId) {
            fetchReviews(0);
        }
    }, [activeTab, festivalId, fetchReviews]);

    const getStatusUI = (startStr: string, endStr: string) => {
        const now = new Date();
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (now < start) return { label: "예정", bg: "bg-blue-500" };
        if (now > end) return { label: "종료", bg: "bg-gray-400" };
        return { label: "진행중", bg: "bg-green-500" };
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getFullYear().toString().slice(2)}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    };

    const formatReviewDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
    };

    const renderStars = (rating: number) => {
        return "★".repeat(rating) + "☆".repeat(5 - rating);
    };

    const handleTabChange = (tab: "overview" | "location" | "review") => {
        setActiveTab(tab);
        setIsExpanded(false);
    };

    const resetReviewForm = () => {
        setReviewForm({ content: "", image: "", rating: 5 });
        setEditingReviewId(null);
    };

    const handleCreateReview = async () => {
        if (!festivalId) return;
        if (!isLoggedIn) {
            alert("로그인 후 리뷰를 작성할 수 있습니다.");
            return;
        }
        if (!reviewForm.content.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        try {
            const token = getAccessToken();
            const response = await fetch(`/api/festivals/${festivalId}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    content: reviewForm.content,
                    image: reviewForm.image || null,
                    rating: reviewForm.rating,
                }),
            });

            const result: ApiRes<ReviewCreateResponse> = await response.json();
            if (!response.ok) throw new Error(result.message || "리뷰 작성에 실패했습니다.");

            alert("리뷰 작성이 완료되었습니다.");
            resetReviewForm();
            setShowReviewForm(false);
            fetchReviews(0);
        } catch (error: any) {
            alert(error.message || "리뷰 작성에 실패했습니다.");
        }
    };

    const handleEditClick = (review: ReviewItem) => {
        setEditingReviewId(review.reviewId);
        setShowReviewForm(true);
        setReviewForm({
            content: review.content,
            image: review.image ?? "",
            rating: review.rating,
        });
    };

    const handleUpdateReview = async () => {
        if (!editingReviewId) return;
        if (!reviewForm.content.trim()) {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }

        try {
            const token = getAccessToken();
            const response = await fetch(`/api/reviews/${editingReviewId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    content: reviewForm.content,
                    image: reviewForm.image || null,
                    rating: reviewForm.rating,
                }),
            });

            const result: ApiRes<ReviewUpdateResponse> = await response.json();
            if (!response.ok) throw new Error(result.message || "리뷰 수정에 실패했습니다.");

            alert("리뷰가 수정되었습니다.");
            resetReviewForm();
            setShowReviewForm(false);
            fetchReviews(reviewPage);
        } catch (error: any) {
            alert(error.message || "리뷰 수정에 실패했습니다.");
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        const ok = confirm("정말 이 리뷰를 삭제하시겠습니까?");
        if (!ok) return;

        try {
            const token = getAccessToken();
            const response = await fetch(`/api/reviews/${reviewId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "리뷰 삭제에 실패했습니다.");

            alert("리뷰 삭제가 완료되었습니다.");
            fetchReviews(reviewPage);
        } catch (error: any) {
            alert(error.message || "리뷰 삭제에 실패했습니다.");
        }
    };

    const handleReportReview = async (reviewId: number) => {
        if (!isLoggedIn) {
            alert("로그인 후 신고할 수 있습니다.");
            return;
        }
        const ok = confirm("이 리뷰를 신고하시겠습니까?");
        if (!ok) return;

        try {
            const token = getAccessToken();
            const response = await fetch(`/api/reviews/${reviewId}/reports`, {
                method: "POST",
                headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "신고에 실패했습니다.");

            alert("리뷰 신고가 접수되었습니다.");
            fetchReviews(reviewPage);
        } catch (error: any) {
            alert(error.message || "신고 처리 중 오류가 발생했습니다.");
        }
    };

    if (!festival) return <div className="w-full h-screen flex justify-center items-center text-gray-400 font-bold">축제 정보를 불러오는 중입니다...</div>;

    const uiStatus = getStatusUI(festival.startDate, festival.endDate);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12 min-h-screen text-gray-900">
            {/* 상단 요약 카드 영역 */}
            <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-10 mb-10 relative">
                
                {/* 북마크 버튼 추가 */}
                <div className="absolute top-8 right-8 md:top-10 md:right-10 z-10">
                    <BookMarkButton 
                        festivalId={Number(festivalId)} 
                        initialIsBookmarked={festival.isBookmarked || false}
                        onToggle={(newIsBookmarked, newCount) => {
                            setFestival((prev: any) => ({
                                ...prev,
                                isBookmarked: newIsBookmarked,
                                bookMarkCount: newCount
                            }));
                        }}
                    />
                </div>

                {/* 왼쪽 포스터 */}
                <div className="w-full md:w-[280px] shrink-0 aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                    {festival.firstImageUrl ? (
                        <img src={festival.firstImageUrl} alt={festival.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xl">포스터</div>
                    )}
                </div>

                {/* 오른쪽 정보 */}
                <div className="flex flex-col justify-center flex-grow">
                    <span className={`w-fit px-3 py-1 rounded-full text-white font-bold text-xs shadow-sm mb-4 ${uiStatus.bg}`}>
                        {uiStatus.label}
                    </span>

                    <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-snug mb-3">{festival.title}</h1>

                    <div className="flex items-center gap-2 mb-8">
                        <span className="text-gray-900 font-bold">⭐ {festival.averageRate?.toFixed(1) || "0.0"}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-600 text-sm">조회 {festival.viewCount || 0}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-gray-600 text-sm">찜 {festival.bookMarkCount || 0}</span>
                    </div>

                    <hr className="border-gray-100 mb-8" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-[13px] font-bold text-gray-400 mb-1">기간</p>
                            <p className="text-lg font-bold text-gray-900">
                                {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-400 mb-1">장소</p>
                            <p className="text-lg font-bold text-gray-900 truncate" title={festival.address}>
                                {festival.address?.split(" ").slice(0, 2).join(" ") || "장소 미상"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-400 mb-1">문의</p>
                            <p className="text-lg font-bold text-gray-900">{festival.contactNumber || "정보 없음"}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 탭 메뉴 영역 */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 px-2">
                <button
                    onClick={() => handleTabChange("overview")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "overview" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    소개
                </button>
                <button
                    onClick={() => handleTabChange("location")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "location" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    위치
                </button>
                <button
                    onClick={() => handleTabChange("review")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "review" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    리뷰
                </button>
            </div>

            {/* 탭 콘텐츠 영역 */}
            <div className="min-h-[400px]">
                {activeTab === "overview" && (
                    <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm relative flex flex-col">
                        <h2 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">Overview</h2>
                        <div className={`text-lg md:text-xl text-gray-600 leading-relaxed font-medium transition-all ${isExpanded ? "" : "line-clamp-6"}`}>
                            {festival.overview || "등록된 소개 내용이 없습니다."}
                        </div>

                        {festival.overview && festival.overview.length > 150 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-6 self-start text-blue-600 hover:text-blue-800 font-bold text-lg transition-colors"
                            >
                                {isExpanded ? "접기 ▲" : "더보기 ▼"}
                            </button>
                        )}

                        {festival.homepageUrl && (
                            <div className="mt-8 pt-6 border-t border-gray-50">
                                <p className="text-[13px] font-bold text-gray-400 mb-1 uppercase">Website</p>
                                <a href={festival.homepageUrl} target="_blank" rel="noreferrer" className="text-lg font-bold text-blue-600 hover:underline block truncate">
                                    {festival.homepageUrl}
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "location" && (
                    <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location Map</h2>
                            <p className="text-gray-600 font-bold">{festival.address}</p>
                        </div>
                        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            {!loadingMap && !errorMap && festival.mapY && festival.mapX ? (
                                <Map center={{ lat: festival.mapY, lng: festival.mapX }} style={{ width: "100%", height: "100%" }} level={4}>
                                    <MapMarker position={{ lat: festival.mapY, lng: festival.mapX }} />
                                </Map>
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold">지도 데이터를 불러올 수 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "review" && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">사용자 리뷰</h2>
                            <button
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        alert("로그인 후 리뷰를 작성할 수 있습니다.");
                                        return;
                                    }
                                    resetReviewForm();
                                    setShowReviewForm((prev) => !prev);
                                }}
                                className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                            >
                                {showReviewForm ? "작성 닫기" : "리뷰 작성하기"}
                            </button>
                        </div>

                        {showReviewForm && (
                            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                                <h3 className="text-xl font-bold mb-6">{editingReviewId ? "리뷰 수정" : "리뷰 작성"}</h3>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">평점</label>
                                        <select
                                            value={reviewForm.rating}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                                        >
                                            {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num}점</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">리뷰 내용</label>
                                        <textarea
                                            value={reviewForm.content}
                                            onChange={(e) => setReviewForm((prev) => ({ ...prev, content: e.target.value }))}
                                            rows={5}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold">취소</button>
                                        <button onClick={editingReviewId ? handleUpdateReview : handleCreateReview} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold">완료</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {reviews.map((review) => (
                            <div key={review.reviewId} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">👤</div>
                                        <div>
                                            <p className="font-bold">{review.nickname}</p>
                                            <p className="text-yellow-500 text-sm">{renderStars(review.rating)}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-400">{formatReviewDate(review.createdAt)}</div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                    <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-xs text-gray-400 font-bold overflow-hidden">
                                        {review.image ? <img src={review.image} className="object-cover w-full h-full" alt="리뷰" /> : "사진 없음"}
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed flex-grow whitespace-pre-line">{review.content}</p>
                                </div>
                                <div className="mt-6 flex justify-end gap-3 border-t border-gray-50 pt-4">
                                    {myInfo?.memberId === review.memberId ? (
                                        <>
                                            <button onClick={() => handleEditClick(review)} className="text-sm font-bold text-gray-400 hover:text-gray-900">수정</button>
                                            <button onClick={() => handleDeleteReview(review.reviewId)} className="text-sm font-bold text-gray-400 hover:text-gray-900">삭제</button>
                                        </>
                                    ) : (
                                        <button onClick={() => handleReportReview(review.reviewId)} className="text-sm font-bold text-red-500 hover:text-red-700">신고하기</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}