import FestivalMap from "@/components/FestivalMap";
import Link from "next/link"; // Next.js의 Link 컴포넌트

export default function Home() {
  return (
    <main className="p-8">
      {/* 상단 네비게이션 및 타이틀 영역 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">전국 축제 지도</h1>
        
        {/* 상단에 축제 보러가기 로직 추가 */}
        <nav>
          <Link 
            href="/festivals" 
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            축제 보러가기
          </Link>
        </nav>
      </div>

      {/* 지도 영역 */}
      <div className="border shadow-lg rounded-xl overflow-hidden">
        <FestivalMap />
      </div>
    </main>
  );
}