import  FestivalMap  from "@/components/FestivalMap";

export default function Home() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">전국 축제 지도</h1>
      <div className="h-[650px] w-full overflow-hidden rounded-xl border shadow-lg">
        <FestivalMap />
      </div>
    </main>
  );
}
