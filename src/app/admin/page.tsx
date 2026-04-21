"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/lib/authToken";

// --- Swagger 기반 타입 정의 ---
type Member = {
    memberId: number;
    loginId: string;
    email: string;
    nickname: string;
    reportCount: number;
    status: string; // ACTIVE, WITHDRAWN 등
    role: string;
    createdAt: string;
};

type MemberPageResponse = {
    content: Member[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

// 리뷰 관련 타입 정의
type ReportedReview = {
    reviewId: number;
    festivalTitle: string;
    memberId: number;
    authorNickname: string;
    content: string;
    reportCount: number;
    createdAt: string;
    status: string; // ACTIVE, BLIND 등
};

type ReportedReviewPageResponse = {
    content: ReportedReview[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("members");
    const [memberFilter, setMemberFilter] = useState<"all" | "reported">("all");
    const [loading, setLoading] = useState(true);
    const [memberData, setMemberData] = useState<MemberPageResponse | null>(null);
    const [reviewData, setReviewData] = useState<ReportedReviewPageResponse | null>(null);

    // 1. 회원 목록 조회 API
    const fetchMembers = useCallback(async () => {
        setLoading(true);

        try {
            const endpoint = memberFilter === "all"
                ? "/api/admin/members"
                : "/api/admin/members/reported";

            const response = await fetchWithAuth(`${endpoint}?page=0&size=10`, {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
            });

            const body = await response.json();

            if (response.ok) {
                setMemberData(body.data);
            } else if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            } else {
                console.error("조회 실패:", body.message);
                setMemberData(null);
            }
        } catch (error) {
            console.error("네트워크 오류:", error);
        } finally {
            setLoading(false);
        }
    }, [memberFilter]);

    // 2. 회원 강제 탈퇴 처리 API (PATCH)
    const handleWithdraw = async (memberId: number, nickname: string) => {
        // 실수 방지를 위한 확인창
        if (!confirm(`[${nickname}] 회원을 강제 탈퇴 처리하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            const response = await fetchWithAuth(`/api/admin/members/${memberId}/withdraw`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const result = await response.json();

            if (response.ok) {
                alert("성공적으로 탈퇴 처리되었습니다.");
                void fetchMembers(); // 목록 새로고침
            } else if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            } else {
                alert(`실패: ${result.message || "알 수 없는 오류"}`);
            }
        } catch (error) {
            console.error("강제 탈퇴 요청 오류:", error);
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    //신고된 리뷰 목록 조회 API
    const fetchReportedReviews = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetchWithAuth(`/api/admin/reviews/reported?page=0&size=10`);
            const body = await response.json();
            if (response.ok) setReviewData(body.data);
            else if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("리뷰 조회 에러:", error);
        } finally {
            setLoading(false);
        }
    }, []);
    //리뷰 상태 변경 (BLIND / DISMISS) API
    const handleReviewAction = async (reviewId: number, action: "BLIND" | "DISMISS") => {
        const actionText = action === "BLIND" ? "블라인드" : "무혐의(신고 초기화)";
        if (!confirm(`해당 리뷰를 ${actionText} 처리하시겠습니까?`)) return;

        try {
            const response = await fetchWithAuth(`/api/admin/reviews/${reviewId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ action }),
            });

            const body = await response.json();
            if (response.ok) {
                alert(body.message || "처리가 완료되었습니다.");
                void fetchReportedReviews(); // 처리 후 목록 새로고침
            } else if (response.status === 401) {
                alert("로그인이 필요합니다.");
                window.location.href = "/login";
            } else {
                alert(`실패: ${body.message}`);
            }
        } catch {
            alert("서버 통신 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        if (activeTab === "members") void fetchMembers();
        if (activeTab === "reviews") void fetchReportedReviews();
    }, [activeTab, fetchMembers, fetchReportedReviews]);

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* 🟢 왼쪽 사이드바 */}
            <aside className="w-64 flex-shrink-0 bg-slate-900 text-white">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
                </div>
                <nav className="mt-6 flex flex-col gap-2 px-4">
                    <button
                        onClick={() => setActiveTab("members")}
                        className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${activeTab === "members" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                    >
                        👥 회원 관리
                    </button>
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${activeTab === "reviews" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                    >
                        🚨 신고 리뷰 관리
                    </button>
                    <button
                        onClick={() => setActiveTab("festivals")}
                        className={`rounded-lg px-4 py-3 text-left font-medium transition-colors ${activeTab === "festivals" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                            }`}
                    >
                        🎉 축제 데이터 관리
                    </button>
                </nav>
            </aside>

            {/* 🟢 오른쪽 메인 콘텐츠 */}
            <main className="flex-1 p-8 text-slate-900">

                {/* 회원 관리 탭 화면 */}
                {activeTab === "members" && (
                    <div className="animate-in fade-in duration-300">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800">회원 관리</h2>

                            {/* 필터 토글 버튼 그룹 */}
                            <div className="flex flex-wrap gap-1 rounded-lg bg-slate-200 p-1">
                                <button
                                    onClick={() => setMemberFilter("all")}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${memberFilter === "all" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    전체 회원
                                </button>
                                <button
                                    onClick={() => setMemberFilter("reported")}
                                    className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${memberFilter === "reported" ? "bg-white text-red-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                        }`}
                                >
                                    ⚠️ 신고 누적(5회↑)
                                </button>
                            </div>
                        </div>

                        {/* 데이터 테이블 */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">ID</th>
                                        <th className="px-6 py-4 font-semibold">닉네임(계정)</th>
                                        <th className="px-6 py-4 font-semibold">이메일</th>
                                        <th className="px-6 py-4 font-semibold">신고수</th>
                                        <th className="px-6 py-4 font-semibold">상태</th>
                                        <th className="px-6 py-4 font-semibold text-center">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                                데이터를 불러오는 중입니다...
                                            </td>
                                        </tr>
                                    ) : !memberData || memberData.content.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                                                조회된 회원이 없습니다.
                                            </td>
                                        </tr>
                                    ) : (
                                        memberData.content.map((member) => (
                                            <tr key={member.memberId} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-slate-500">{member.memberId}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{member.nickname}</div>
                                                    <div className="text-xs text-slate-400">{member.loginId}</div>
                                                </td>
                                                <td className="px-6 py-4">{member.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-bold ${member.reportCount >= 5 ? "text-red-600" : "text-slate-700"}`}>
                                                        {member.reportCount}회
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {member.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {member.status === "ACTIVE" ? (
                                                        <button
                                                            onClick={() => handleWithdraw(member.memberId, member.nickname)}
                                                            className="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
                                                        >
                                                            강제 탈퇴
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">탈퇴 처리됨</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            {!loading && memberData && (
                                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                                    <p className="text-xs text-slate-500">
                                        총 <span className="font-semibold text-slate-700">{memberData.totalElements}</span>명의 회원이 있습니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 리뷰 및 축제 관리 탭 (생략 가능) */}
                {activeTab === "reviews" && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="mb-6 text-2xl font-bold text-slate-800">신고 누적 리뷰 관리</h2>
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="border-b border-slate-200 bg-slate-50 text-slate-900">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">축제명</th>
                                        <th className="px-6 py-4 font-semibold">작성자</th>
                                        <th className="w-1/3 px-6 py-4 font-semibold">리뷰 내용</th>
                                        <th className="px-6 py-4 font-semibold">신고수</th>
                                        <th className="px-6 py-4 font-semibold">상태</th>
                                        <th className="px-6 py-4 text-center font-semibold">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {loading ? (
                                        <tr><td colSpan={6} className="px-6 py-10 text-center">불러오는 중...</td></tr>
                                    ) : !reviewData || reviewData.content.length === 0 ? (
                                        <tr><td colSpan={6} className="px-6 py-10 text-center">신고된 리뷰가 없습니다.</td></tr>
                                    ) : reviewData.content.map((r) => (
                                        <tr key={r.reviewId} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">{r.festivalTitle}</td>
                                            <td className="px-6 py-4">{r.authorNickname}</td>
                                            <td className="px-6 py-4"><p className="line-clamp-2">{r.content}</p></td>
                                            <td className="px-6 py-4 font-bold text-red-600">{r.reportCount}회</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {r.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleReviewAction(r.reviewId, "BLIND")}
                                                            className="rounded bg-red-600 px-3 py-1 text-xs text-white transition hover:bg-red-700"
                                                        >
                                                            블라인드
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleReviewAction(r.reviewId, "DISMISS")}
                                                        className="rounded border border-slate-300 px-3 py-1 text-xs transition hover:bg-slate-100"
                                                    >
                                                        무혐의
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "festivals" && (
                    <div className="animate-in fade-in duration-300">
                        <h2 className="mb-6 text-2xl font-bold text-slate-800">축제 데이터 관리</h2>
                        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                            <p className="text-slate-500">이 기능은 현재 준비 중입니다.</p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
