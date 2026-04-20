import  FestivalMap  from "@/components/FestivalMap";
import Image from "next/image";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">전국 축제 지도</h1>
      <div className="order shadow-lg rounded-xl overflow-hidden h-[750px]">
        <FestivalMap radiusKm={100} />
      </div>
    </main>
  );
}
