"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";
import BookMarkButton from "@/components/BookMarkButton";

export default function FestivalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const festivalId = params.id;

    const [festival, setFestival] = useState<any>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "location" | "review">("overview");
        const [loadingMap, errorMap] = useKakaoLoader({
        appkey: "66f9dd9bdc448822d3712fc5a4994579",
        libraries: ["services"]
    });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await fetch(`/api/festivals/${festivalId}`);
                const resData = await response.json();
                if (resData.status === "200" || resData.resultCode === "200") {
                    setFestival(resData.data);
                } else {
                    router.back();
                }
            } catch (err) {}
        };
        if (festivalId) fetchDetail();
    }, [festivalId, router]);

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
        return `${date.getFullYear().toString().slice(2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    const handleTabChange = (tab: "overview" | "location" | "review") => {
        setActiveTab(tab);
        setIsExpanded(false); 
    };

    if (!festival) return <div className="w-full h-screen flex justify-center items-center text-gray-400 font-bold">축제 정보를 불러오는 중입니다...</div>;

    const uiStatus = getStatusUI(festival.startDate, festival.endDate);

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12 min-h-screen text-gray-900">
                
                <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-10 mb-10 relative">
                
                <div className="absolute top-8 right-8 md:top-10 md:right-10 z-10">
                    <BookMarkButton 
                        festivalId={festival.id} 
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

            {/*  3. 탭(Tab) 메뉴 영역 */}
            <div className="flex gap-8 border-b border-gray-200 mb-8 px-2">
            <button 
                    onClick={() => handleTabChange("overview")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "overview" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    소개
                </button>
                <button 
                    onClick={() => setActiveTab("location")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "location" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    위치
                </button>
                <button 
                    onClick={() => setActiveTab("review")}
                    className={`pb-4 font-bold text-lg transition-colors ${activeTab === "review" ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                >
                    리뷰
                </button>
            </div>

            {/*  4. 탭 콘텐츠 영역 (조건부 렌더링) */}
            <div className="min-h-[400px]">
                
                {/* [소개 탭] */}
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
                        
                        {/* 홈페이지 정보는 소개 탭 하단에 배치 */}
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

                {/* [위치 탭] */}
                {activeTab === "location" && (
                    <div className="bg-white p-8 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Location Map</h2>
                            <p className="text-gray-600 font-bold">{festival.address}</p>
                        </div>
                        <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                            {!loadingMap && !errorMap && festival.mapY && festival.mapX ? (
                                <Map 
                                    center={{ lat: festival.mapY, lng: festival.mapX }} 
                                    style={{ width: "100%", height: "100%" }} 
                                    level={4}
                                >
                                    <MapMarker position={{ lat: festival.mapY, lng: festival.mapX }} />
                                </Map>
                            ) : (
                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold">지도 데이터를 불러올 수 없습니다.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* [리뷰 탭] */}
                {activeTab === "review" && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-gray-900">사용자 리뷰</h2>
                            <button className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
                                리뷰 작성하기
                            </button>
                        </div>
                        
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 relative hover:border-gray-200 transition-all shadow-sm mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">👤</div>
                                <div>
                                    <p className="font-bold text-gray-900">author</p>
                                    <p className="text-yellow-500 text-sm tracking-widest">★★★★★</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl border border-gray-100 shrink-0 overflow-hidden shadow-inner flex items-center justify-center text-xs text-gray-400 font-bold">
                                    사진
                                </div>
                                <p className="text-lg text-gray-600 leading-relaxed flex-grow font-medium">
                                    review content sample data
                                </p>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 border-t border-gray-50 pt-4">
                                <button className="px-3 py-1 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">수정</button>
                                <button className="px-3 py-1 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">삭제</button>
                                <button className="px-3 py-1 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">신고</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}