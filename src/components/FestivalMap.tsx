"use client";
import { useEffect, useState, useRef } from "react"; // 💡 useRef 추가
import { Map, MapMarker, useKakaoLoader, ZoomControl } from "react-kakao-maps-sdk";
import { useRouter } from "next/navigation";

interface FestivalMapProps {
    radiusKm: number; 
}

export default function FestivalMap({ radiusKm }: FestivalMapProps) {
    const router = useRouter();
    const [loading, error] = useKakaoLoader({
        appkey: "66f9dd9bdc448822d3712fc5a4994579",
        libraries: ["services", "clusterer"]
    });
    
    const mapRef = useRef<kakao.maps.Map>(null);

    // 서울시청 기본 좌표 (위치 못 잡을 경우 대비)
    const DEFAULT_POS = { lat: 37.5665, lng: 126.9780 };
    
    const [myPos, setMyPos] = useState(DEFAULT_POS);
    const [mapCenter, setMapCenter] = useState(DEFAULT_POS);
    const [markers, setMarkers] = useState<any[]>([]);

    const fetchNearbyFestivals = async (lat: number, lng: number, r: number) => {
        try {
            const response = await fetch(`/api/festivals/nearby?mapX=${lng}&mapY=${lat}&radiusKm=${r}`);
            const resData = await response.json();
            
            if (resData.status === "200" || resData.status === 200) {
                setMarkers(resData.data);
            }
        } catch (err) {
            console.error("데이터 호출 실패", err);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMyPos({ lat: latitude, lng: longitude });
                    setMapCenter({ lat: latitude, lng: longitude });
                    fetchNearbyFestivals(latitude, longitude, radiusKm);
                },
                () => fetchNearbyFestivals(DEFAULT_POS.lat, DEFAULT_POS.lng, radiusKm)
            );
        }
    }, []);

    useEffect(() => {
        if (myPos.lat) {
            fetchNearbyFestivals(myPos.lat, myPos.lng, radiusKm);
            if (radiusKm >= 300) setMapCenter({ lat: 36.3504, lng: 127.3845 }); 
            else setMapCenter(myPos); 
        }
    }, [radiusKm, myPos]); 

    const getZoomLevel = (r: number) => {
        if (r >= 500) return 13; 
        if (r >= 300) return 12; 
        if (r >= 100) return 11; 
        if (r >= 50) return 10;
        if (r >= 30) return 9;
        if (r >= 20) return 8;
        if (r >= 10) return 7;
        return 6; 
    };

    const handlePanToMyPos = () => {
        const map = mapRef.current;
        if (!map) return;

        const moveLatLon = new kakao.maps.LatLng(myPos.lat, myPos.lng);
        map.panTo(moveLatLon);
    };

    if (loading) return <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold">지도 로딩 중...</div>;
    if (error) return <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-bold">카카오맵 로드 실패</div>;

    return (
        <div className="w-full h-full relative">
            <Map 
                center={mapCenter} 
                style={{ width: "100%", height: "100%" }} 
                level={getZoomLevel(radiusKm)}
                isPanto={true} 
                ref={mapRef} // 💡 3. 지도 컴포넌트에 리모컨 연결
            >
                <ZoomControl position={"RIGHT_TOP"} />
                <MapMarker position={myPos} />
                
                {markers.map((marker) => (
                    <MapMarker
                        key={marker.id}
                        position={{ lat: Number(marker.mapY), lng: Number(marker.mapX) }}
                        onClick={() => router.push(`/festivals/${marker.id}`)}
                        image={{
                            src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                            size: { width: 24, height: 35 },
                        }}
                    >
                        <div style={{ padding: "5px", color: "#000", fontSize: "12px", whiteSpace: "nowrap" }}>
                            {marker.title}
                        </div>
                    </MapMarker>
                ))}
            </Map>

            {/* 💡 4. 버튼 클릭 시 handlePanToMyPos 실행 */}
            <button
                onClick={handlePanToMyPos}
                className="absolute bottom-6 right-6 z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-100 transition-all active:scale-95 group"
                title="내 위치로 이동"
            >
                <span className="text-2xl drop-shadow-sm group-hover:text-blue-500 transition-colors">
                    ⦿
                </span>
            </button>
        </div>
    );
}