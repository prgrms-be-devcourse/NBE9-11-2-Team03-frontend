"use client";
import { useEffect, useState } from "react";
import FestivalMap from "@/components/FestivalMap";
import { useRouter } from "next/navigation";

const REGIONS = [
    { code: "", name: "전체지역" },
    { code: "11", name: "서울특별시" },
    { code: "26", name: "부산광역시" },
    { code: "27", name: "대구광역시" },
    { code: "28", name: "인천광역시" },
    { code: "29", name: "광주광역시" },
    { code: "30", name: "대전광역시" },
    { code: "31", name: "울산광역시" },
    { code: "36", name: "세종특별자치시" },
    { code: "41", name: "경기도" },
    { code: "43", name: "충청북도" },
    { code: "44", name: "충청남도" },
    { code: "46", name: "전라남도" },
    { code: "47", name: "경상북도" },
    { code: "48", name: "경상남도" },
    { code: "50", name: "제주특별자치도" },
    { code: "51", name: "강원도" },
    { code: "52", name: "전라북도" },
];

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const SORTS = [
    { value: "startDate,asc", label: "시작일 임박순" },
    { value: "bookMarkCount,desc", label: "찜 많은 순" },
    { value: "viewCount,desc", label: "조회수 순" }
];

const RADIUS_STEPS = [5, 10, 20, 30, 50, 100, 300, 500];

export default function MainPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [festivals, setFestivals] = useState<any[]>([]);

    const [currentPage, setCurrentPage] = useState(0); // API가 0부터 시작한다고 가정
    const [totalPages, setTotalPages] = useState(0);

    const [searchInput, setSearchInput] = useState("");
    const [appliedKeyword, setAppliedKeyword] = useState("");

    const [regionCode, setRegionCode] = useState("");
    const [month, setMonth] = useState<number | "">("");
    const [status, setStatus] = useState<"ALL" | "ONGOING" | "UPCOMING" | "ENDED">("ALL");
    const [sort, setSort] = useState("startDate,asc");

    // 💡 반경 인덱스 상태 (0 ~ 7)
    const [radiusIndex, setRadiusIndex] = useState(0);
    const currentRadius = RADIUS_STEPS[radiusIndex];

    const [openDropdown, setOpenDropdown] = useState<"region" | "month" | "sort" | null>(null);

    const fetchFestivals = async () => {
        try {
            const params = new URLSearchParams();
            if (appliedKeyword) params.append("keyword", appliedKeyword);
            if (regionCode) params.append("regionCode", regionCode);
            if (month) params.append("month", month.toString());
            if (status !== "ALL") params.append("status", status);
            if (sort) params.append("sort", sort);

            params.append("page", currentPage.toString());
            params.append("size", "10"); // 백엔드 설정에 따라 조절 가능

            const response = await fetch(`/api/festivals?${params.toString()}`);
            const resData = await response.json();

            if (resData.resultCode === "200" || resData.status === "200") {
                setFestivals(resData.data.content);
                setTotalPages(resData.data.totalPages || 0);
            }
        } catch (error) {
            console.error("축제 목록 로드 실패:", error);
        }
    };

    useEffect(() => {
        fetchFestivals();
    }, [currentPage, regionCode, month, status, sort, appliedKeyword]);

    const handleSearchClick = () => {
        setAppliedKeyword(searchInput);
    };

    const getFestivalStatusUI = (startDateStr: string, endDateStr: string) => {
        const now = new Date();
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);

        if (now < start) return { label: "예정", bg: "bg-blue-500", text: "text-white" };
        if (now > end) return { label: "종료", bg: "bg-gray-500", text: "text-white" };
        return { label: "진행중", bg: "bg-green-500", text: "text-white" };
    };

    return (
        <div className="max-w-[1400px] mx-auto w-full px-4 pt-8 pb-10 min-h-screen">

            {/* 뷰 토글 영역 */}
            <div className="flex gap-0 mb-6 border border-gray-300 w-fit rounded overflow-hidden shadow-sm bg-white">
                <button
                    onClick={() => setViewMode("list")}
                    className={`px-8 py-3 font-bold text-lg transition-colors ${viewMode === "list" ? "bg-gray-200 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                    리스트뷰
                </button>
                <button
                    onClick={() => setViewMode("map")}
                    className={`px-8 py-3 font-bold text-lg border-l border-gray-300 transition-colors ${viewMode === "map" ? "bg-gray-200 text-black" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                >
                    지도뷰
                </button>
            </div>

            {/* 지도 뷰 영역 */}
            {viewMode === "map" && (
                <div className="w-full flex flex-col border border-gray-300 rounded-2xl overflow-hidden shadow-xl bg-white">
                    <div className="bg-gray-50 p-4 border-b border-gray-300">
                        <div className="w-1/2 flex items-center gap-6">
                            <span className="font-bold text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 whitespace-nowrap text-sm">
                                검색반경조절
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={RADIUS_STEPS.length - 1}
                                step="1"
                                value={radiusIndex}
                                onChange={(e) => setRadiusIndex(Number(e.target.value))}
                                className="flex-grow h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="font-black text-blue-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 min-w-[100px] text-center text-lg">
                                {currentRadius === 500 ? "전국" : `${currentRadius} KM`}
                            </span>
                        </div>
                    </div>
                    {/* 💡 지도: 높이를 h-[750px]로 늘리고 공백 제거 */}
                    <div className="w-full h-[750px] relative bg-gray-100">
                        <FestivalMap radiusKm={currentRadius} />
                    </div>
                </div>
            )}

            {/* 리스트 뷰 영역 */}
            {viewMode === "list" && (
                <div className="w-full">
                    {/* 상단 검색 & 드롭다운 영역 */}
                    <div className="flex gap-3 mb-6 relative">
                        <input
                            type="text"
                            placeholder="검색어를 입력해주세요"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
                            className="flex-grow border border-gray-400 p-3 text-lg outline-none rounded-sm focus:border-blue-500 transition-colors"
                        />

                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "region" ? null : "region")}
                                // 변경: 텍스트를 확실한 검은색(text-black)으로 지정
                                className="border border-gray-400 p-3 min-w-[180px] text-left text-lg flex justify-between items-center bg-white text-black rounded-sm"
                            >
                                {regionCode ? REGIONS.find(r => r.code === regionCode)?.name : "지역선택"} <span>▽</span>
                            </button>
                            {openDropdown === "region" && (
                                // 변경: 배경을 흰색(bg-white)으로 변경하여 대비를 높임
                                <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 z-20 max-h-80 overflow-y-auto text-base shadow-xl rounded-sm">
                                    {REGIONS.map((r) => (
                                        <li
                                            key={r.code}
                                            onClick={() => { setRegionCode(r.code); setOpenDropdown(null); }}
                                            // 변경: 텍스트 검은색(text-black), 마우스 오버 시 연한 회색(hover:bg-gray-100)으로 변경
                                            className="px-4 py-3 text-black hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <span className="w-5 text-blue-600 font-bold text-lg">{regionCode === r.code ? "✔" : ""}</span> {r.name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "month" ? null : "month")}
                                // 변경: 텍스트 검은색(text-black) 추가
                                className="border border-gray-400 p-3 min-w-[150px] text-left text-lg flex justify-between items-center bg-white text-black rounded-sm"
                            >
                                {month ? `${month}월` : "시기"} <span>▽</span>
                            </button>
                            {openDropdown === "month" && (
                                // 변경: 배경 흰색(bg-white)으로 변경
                                <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 z-20 max-h-80 overflow-y-auto text-base shadow-xl rounded-sm">
                                    {/* 전체 옵션 변경 */}
                                    <li onClick={() => { setMonth(""); setOpenDropdown(null); }} className="px-4 py-3 text-black hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors">
                                        <span className="w-5 text-blue-600 font-bold text-lg">{month === "" ? "✔" : ""}</span> 전체
                                    </li>
                                    {MONTHS.map((m) => (
                                        <li
                                            key={m}
                                            onClick={() => { setMonth(m); setOpenDropdown(null); }}
                                            // 변경: 텍스트 검은색, hover 색상 변경
                                            className="px-4 py-3 text-black hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors"
                                        >
                                            <span className="w-5 text-blue-600 font-bold text-lg">{month === m ? "✔" : ""}</span> {m < 10 ? `0${m}` : m}월
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <button
                            onClick={handleSearchClick}
                            className="bg-[#d9d9d9] px-12 py-3 font-bold border border-gray-400 text-lg hover:bg-gray-400 rounded-sm transition-colors"
                        >
                            검색
                        </button>
                    </div>

                    <div className="flex justify-between items-center mb-8 border-b border-gray-300 pb-4">
                        <div className="flex gap-3">
                            {["ALL", "ONGOING", "UPCOMING", "ENDED"].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatus(st as any)}
                                    className={`px-6 py-2 text-lg font-bold rounded-sm transition-colors ${status === st ? "bg-[#d9d9d9] text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                                >
                                    {st === "ALL" ? "전체" : st === "ONGOING" ? "진행중" : st === "UPCOMING" ? "예정" : "종료된 축제"}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
                                // 변경: 텍스트 검은색(text-black) 추가, 배경색 흰색 통일(선택사항)
                                className="bg-white text-black border border-gray-400 px-5 py-2 text-lg flex items-center gap-3 rounded-sm font-bold"
                            >
                                {SORTS.find(s => s.value === sort)?.label.split(" ")[0]} <span>▽</span>
                            </button>
                            {openDropdown === "sort" && (
                                // 변경: 배경 흰색(bg-white)으로 변경
                                <ul className="absolute top-full right-0 mt-1 w-40 bg-white z-20 text-lg border border-gray-300 shadow-xl rounded-sm">
                                    {SORTS.map((s) => (
                                        <li
                                            key={s.value}
                                            onClick={() => { setSort(s.value); setOpenDropdown(null); }}
                                            // 변경: 텍스트 검은색, hover 색상 변경
                                            className="px-4 py-3 text-black hover:bg-gray-100 cursor-pointer text-left transition-colors"
                                        >
                                            {s.label}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* 축제 카드 그리드 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {festivals.map((festival) => {
                            const uiStatus = getFestivalStatusUI(festival.startDate, festival.endDate);

                            return (
                                <div key={festival.id} onClick={() => router.push(`/festivals/${festival.id}`)} className="border border-gray-300 p-5 flex flex-col bg-white cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-lg">
                                    <div className="bg-[#f0f0f0] h-64 flex items-center justify-center mb-5 relative overflow-hidden rounded-md">
                                        {festival.thumbnail ? (
                                            <img src={festival.thumbnail} alt={festival.title} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <span className="text-gray-400 font-bold text-xl">축제 이미지</span>
                                        )}
                                        <span className={`absolute top-3 left-3 text-sm font-bold px-3 py-1.5 rounded shadow-md ${uiStatus.bg} ${uiStatus.text}`}>
                                            {uiStatus.label}
                                        </span>
                                        <span className="absolute top-3 right-3 text-4xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] hover:text-red-500 transition-colors">
                                            ♥
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="bg-[#e0e0e0] text-sm font-bold px-2 py-1 rounded whitespace-nowrap mt-1">축제명</span>
                                            <span className="font-bold text-gray-900 text-xl line-clamp-2 leading-snug">{festival.title}</span>
                                                                                    </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#e0e0e0] text-sm font-bold px-2 py-1 rounded whitespace-nowrap">기간</span>
                                            <span className="text-gray-600 text-base font-medium">
                                                {new Date(festival.startDate).toLocaleDateString()} ~ {new Date(festival.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="bg-[#e0e0e0] text-sm font-bold px-2 py-1 rounded whitespace-nowrap">지역</span>
                                            <span className="text-gray-600 text-base font-medium">{festival.address.split(" ").slice(0, 2).join(" ")}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 0 && (
                        <div className="flex justify-center items-center gap-2 mt-12 mb-8">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                disabled={currentPage === 0}
                                className="px-4 py-2 border border-gray-300 rounded font-bold transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                이전
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i)
                                .slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))
                                .map((pageNum) => (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-md font-bold transition-colors ${currentPage === pageNum
                                            ? "bg-blue-600 text-white border-blue-600"
                                            : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                ))}

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                disabled={currentPage === totalPages - 1}
                                className="px-4 py-2 border border-gray-300 rounded font-bold transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                다음
                            </button>
                        </div>
                    )}

                    {festivals.length === 0 && (
                        <div className="w-full py-40 flex flex-col gap-4 justify-center items-center text-gray-500">
                            <span className="text-5xl">📭</span>
                            <span className="text-2xl font-bold">조건에 맞는 축제가 없습니다.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}