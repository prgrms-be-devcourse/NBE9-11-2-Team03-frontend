import  FestivalMap  from "@/components/FestivalMap";
import Image from "next/image";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">전국 축제 지도</h1>
      <div className="border shadow-lg rounded-xl overflow-hidden">
        <FestivalMap />
      </div>
    </main>
  );
}
