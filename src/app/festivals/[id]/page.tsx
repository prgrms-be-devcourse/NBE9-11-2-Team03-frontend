"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk";

export default function FestivalDetailPage() {
    const params = useParams();
    const router = useRouter();
    const festivalId = params.id;

    const [festival, setFestival] = useState<any>(null);
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

    if (!festival) return <div className="w-full h-screen flex justify-center items-center text-gray-400 font-bold">축제 정보를 불러오는 중입니다...</div>;

    const uiStatus = getStatusUI(festival.startDate, festival.endDate);

    return (
        <div className="max-w-[1400px] mx-auto px-6 py-12 min-h-screen bg-white text-gray-900">
            
            <div className="flex flex-col lg:flex-row gap-12 mb-16 items-start">
                
                {/* 이미지 + 요약 + 스케줄 */}
                <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 lg:sticky lg:top-8">
                    <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100">
                        {festival.firstImageUrl ? (
                            <img src={festival.firstImageUrl} alt={festival.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-2xl">NO IMAGE</div>
                        )}
                        <span className={`absolute top-4 left-4 px-3 py-1 rounded-md text-white font-bold text-xs shadow-sm ${uiStatus.bg}`}>
                            {uiStatus.label}
                        </span>
                    </div>
                    
                    <div className="mt-8 flex flex-col gap-3">
                        <h1 className="text-3xl xl:text-4xl font-bold tracking-tight leading-snug">{festival.title}</h1>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="text-gray-600 font-bold border-b border-yellow-400 pb-0.5">
                                ⭐ 평점 {festival.averageRate?.toFixed(1) || "0.0"}
                            </div>
                            <div className="text-gray-400 text-sm">조회 {festival.viewCount || 0} · 찜 {festival.bookMarkCount || 0}</div>
                        </div>
                        <button className="w-full mt-5 bg-gray-100 text-gray-800 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all active:scale-[0.98]">
                            찜하기
                        </button>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Schedule</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 mb-1">시작일</p>
                                <p className="text-lg font-bold text-gray-700">{new Date(festival.startDate).toLocaleDateString()}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                                <p className="text-[11px] font-bold text-gray-400 mb-1">종료일</p>
                                <p className="text-lg font-bold text-gray-700">{new Date(festival.endDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 우측 영역 (오버뷰 -> 디테일 -> 지도) */}
                <div className="flex-grow flex flex-col gap-12 w-full">
                    
                    <section>
                        <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Overview</h2>
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-lg md:text-xl text-gray-600 leading-relaxed font-medium shadow-sm">
                            {festival.overview || "등록된 소개 내용이 없습니다."}
                        </div>
                    </section>

                    <section className="flex flex-col gap-6">
                        <h2 className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Details</h2>
                        <div className="flex flex-col gap-4">
                            {/* Address */}
                            <div className="p-6 bg-gray-50 rounded-xl border  border-gray-100 w-full">
                                <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Address</p>
                                <p className="text-lg font-bold text-gray-700">{festival.address || "주소 정보 없음"}</p>
                            </div>
                            
                            {/* Website */}
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 w-full overflow-hidden">
                                <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Website</p>
                                <a href={festival.homepageUrl || "#"} target="_blank" rel="noreferrer" className="text-lg font-bold text-gray-700 hover:underline block truncate">
                                    {festival.homepageUrl || "정보 없음"}
                                </a>
                            </div>

                            {/* Contact (전화번호) */}
                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 w-full">
                                <p className="text-[11px] font-bold text-gray-400 mb-1 uppercase">Contact</p>
                                <p className="text-lg font-bold text-gray-700">{festival.contactNumber || "정보 없음"}</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Location Map</h2>
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
                    </section>
                </div>
            </div>

            {/* 리뷰 섹션 */}
            <div className="mt-20 pt-16 border-t border-gray-100">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold tracking-tight">리뷰</h2>
                    <button className="text-base font-bold text-white bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl transition-all shadow-md active:scale-95">
                        리뷰 작성하기
                    </button>
                </div>
                
                <div className="bg-white rounded-[32px] p-8 md:p-10 border border-gray-100 relative hover:border-gray-200 transition-all shadow-sm mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                        <div>
                            <p className="font-bold text-lg">author</p>
                            <p className="text-yellow-500 text-sm tracking-widest">★★★★★</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-28 h-28 md:w-32 md:h-32 bg-gray-50 rounded-2xl border border-gray-100 shrink-0 overflow-hidden shadow-inner flex items-center justify-center text-xs text-gray-400 font-bold">
                            리뷰 사진
                        </div>
                        <p className="text-lg text-gray-600 leading-relaxed flex-grow font-medium">
                            review content sample data
                        </p>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t border-gray-50 pt-6">
                        <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">수정</button>
                        <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors">삭제</button>
                        <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors">신고</button>
                    </div>
                </div>
            </div>
        </div>
    );
}