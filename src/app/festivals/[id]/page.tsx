"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/jwtDisplay";
import { fetchWithAuth } from "@/lib/authToken";
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
    liked: boolean;
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

type ReviewLikeResponse = {
    reviewId: number;
    memberId: number;
    liked: boolean;
    likeCount: number;
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

    const [reviewForm, setReviewForm] = useState<{
        content: string;
        image: File | string | null;
        rating: number;
        deleteImage: boolean;
    }>({
        content: "",
        image: null,
        rating: 5,
        deleteImage: false,
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetchWithAuth(`/api/festivals/${festivalId}`, {
                    cache: "no-store",
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
        setReviewForm({ content: "", image: null, rating: 5, deleteImage: false });
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
            const formData = new FormData();

            const requestDto = {
                content: reviewForm.content,
                rating: reviewForm.rating,
            };
            formData.append(
                "requestDto",
                new Blob([JSON.stringify(requestDto)], { type: "application/json" })
            );

            if (reviewForm.image instanceof File) {
                formData.append("image", reviewForm.image);
            }

            const response = await fetch(`/api/festivals/${festivalId}/reviews`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
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
            content: review.content || "",
            image: review.image || null,
            rating: review.rating,
            deleteImage: false,
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
            const formData = new FormData();

            const requestDto = {
                content: reviewForm.content,
                rating: reviewForm.rating,
                deleteImage: reviewForm.deleteImage
            };
            
            formData.append(
                "requestDto",
                new Blob([JSON.stringify(requestDto)], { type: "application/json" })
            );

            if (reviewForm.image instanceof File) {
                formData.append("image", reviewForm.image);
            }

            const response = await fetch(`/api/reviews/${editingReviewId}`, {
                method: "PATCH",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
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

    const handleLikeReview = async (reviewId: number, isLiked: boolean) => {
        if (!isLoggedIn) {
            alert("로그인 후 좋아요를 누를 수 있습니다.");
            return;
        }

        try {
            const token = getAccessToken();
            const response = await fetch(`/api/reviews/${reviewId}/like`, {
                method: isLiked ? "DELETE" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const result: ApiRes<ReviewLikeResponse> = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "좋아요 처리에 실패했습니다.");
            }

            // 즉시 화면 업데이트 (API에서 받아온 데이터를 화면에 바로 적용)
            setReviews((prev) =>
                prev.map((review) =>
                    review.reviewId === reviewId
                        ? {
                              ...review,
                              liked: result.data.liked, // 👈 isLiked가 아니라 liked 입니다!
                              likeCount: result.data.likeCount,
                          }
                        : review
                )
            );

        } catch (error: any) {
            alert(error.message || "좋아요 처리 중 오류가 발생했습니다.");
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
                {/* 1. 소개 탭 */}
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

                {/* 2. 위치 탭 */}
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

                {/* 3. 리뷰 탭 */}
                {activeTab === "review" && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">사용자 리뷰</h2>
                            <button
                                onClick={() => {
                                    if (!isLoggedIn) {
                                        router.push("/login");
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

                        {/* 비로그인: 블러 + 로그인 유도 오버레이 */}
                        {!isLoggedIn && (
                            <div className="relative rounded-2xl overflow-hidden">
                                {/* 가짜 스켈레톤 리뷰 (블러 처리) */}
                                <div className="blur-sm pointer-events-none select-none space-y-4">
                                    {[0, 1].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-20" />
                                                    <div className="h-3 bg-gray-200 rounded w-14" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-gray-200 rounded w-[90%]" />
                                                <div className="h-4 bg-gray-200 rounded w-[70%]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* 중앙 로그인 유도 오버레이 */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                    <div className="text-5xl mb-4">🔒</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">로그인하고 리뷰 확인하기</h3>
                                    <p className="text-gray-500 text-sm mb-6">다른 사용자들의 생생한 후기를 확인해보세요</p>
                                    <button
                                        onClick={() => router.push("/login")}
                                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95"
                                    >
                                        로그인하러 가기
                                    </button>
                                </div>
                            </div>
                        )}

                        {isLoggedIn && showReviewForm && (
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

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">사진 첨부 (선택)</label>

                                        {reviewForm.image ? (
                                            <div className="relative inline-block mb-3">
                                                <img
                                                    src={
                                                        reviewForm.image instanceof File
                                                            ? URL.createObjectURL(reviewForm.image) 
                                                            : `http://localhost:8080/uploads/${reviewForm.image}` 
                                                    }
                                                    alt="미리보기"
                                                    className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setReviewForm(prev => ({
                                                        ...prev,
                                                        image: null,
                                                        deleteImage: true 
                                                    }))}
                                                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md transition-colors"
                                                    title="이미지 삭제"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : null}

                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files ? e.target.files[0] : null;
                                                setReviewForm((prev) => ({
                                                    ...prev,
                                                    image: file,
                                                    deleteImage: false, 
                                                }));
                                                e.target.value = '';
                                            }}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-white"
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <button onClick={() => setShowReviewForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 font-bold">취소</button>
                                        <button onClick={editingReviewId ? handleUpdateReview : handleCreateReview} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold">완료</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 로그인 시 리뷰 목록 */}
                        {isLoggedIn && reviews.map((review) => (
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
                                    {review.image ? (
                                        <img
                                            src={`http://localhost:8080/uploads/${review.image}`}
                                            alt="리뷰 이미지"
                                            className="w-24 h-24 rounded-xl border border-gray-100 shrink-0 object-cover shadow-inner cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setSelectedImage(`http://localhost:8080/uploads/${review.image}`)}
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 shrink-0 overflow-hidden shadow-inner flex items-center justify-center text-xs text-gray-400 font-bold">
                                            사진 없음
                                        </div>
                                    )}
                                    <p className="text-lg text-gray-600 leading-relaxed flex-grow whitespace-pre-line">
                                        {review.content}
                                    </p>
                                </div>

                                <div className="mt-6 flex justify-between items-center border-t border-gray-50 pt-4">
                                    {/* 왼쪽: 좋아요 버튼 */}
                                    <button
                                        onClick={() => handleLikeReview(review.reviewId, review.liked)}
                                        className={`px-3 py-1 text-sm font-bold transition-colors ${
                                            review.liked
                                                ? "text-blue-600 hover:text-blue-700"
                                                : "text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        {review.liked ? "좋아요 취소" : "좋아요"} ({review.likeCount})
                                    </button>

                                    {/* 오른쪽: 수정/삭제/신고 */}
                                    {myInfo?.memberId === review.memberId ? (
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleEditClick(review)}
                                                className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(review.reviewId)}
                                                className="text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleReportReview(review.reviewId)}
                                            className="text-sm font-bold text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            신고하기
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* 글로벌 이미지 확대 모달 */}
                        {isLoggedIn && selectedImage && (
                            <div
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 transition-opacity"
                                onClick={() => setSelectedImage(null)}
                            >
                                <div className="relative max-w-4xl w-full flex flex-col items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedImage(null);
                                        }}
                                        className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
                                    >
                                        &times;
                                    </button>
                                    <img
                                        src={selectedImage}
                                        alt="확대된 리뷰 이미지"
                                        className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}