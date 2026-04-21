"use client";
import { useEffect, useState } from "react";
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
    
    // 1. 내 실제 위치 
    const [myPos, setMyPos] = useState({ lat: 37.5665, lng: 126.9780 });
    
    // 2. 지도가 보여주는 화면의 중심 (전국 단위일 때 중앙으로 옮기기 위함)
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    
    const [markers, setMarkers] = useState<any[]>([]);

    const fetchNearbyFestivals = async (lat: number, lng: number, r: number) => {
        try {
            const response = await fetch(`/api/festivals/nearby?mapX=${lng}&mapY=${lat}&radiusKm=${r}`);
            const resData = await response.json();
            
            if (resData.status === "200" || resData.status === 200) {
                console.log(`📍 검색 반경: ${r}KM, 가져온 마커: ${resData.data.length}개`);
                setMarkers(resData.data);
            }
        } catch (err) {
            console.error("데이터 호출 실패", err);
        }
    };

    // 처음 켤 때 내 위치 잡기
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setMyPos({ lat: latitude, lng: longitude });
                    setMapCenter({ lat: latitude, lng: longitude });
                    fetchNearbyFestivals(latitude, longitude, radiusKm);
                },
                () => fetchNearbyFestivals(37.5665, 126.9780, radiusKm)
            );
        }
    }, []);

    //  슬라이더 값이 바뀔 때마다 실행
    useEffect(() => {
        if (myPos.lat) {
            // 1. 내 위치 기준으로 데이터는 다시 불러옵니다.
            fetchNearbyFestivals(myPos.lat, myPos.lng, radiusKm);
            
            // 2. 화면 포커스 스마트 조절
            if (radiusKm >= 300) {
                // 전국 단위(300km, 500km)일 때는 북한/바다를 피해서 '대한민국 정중앙(대전)'으로 화면 중심 이동!
                setMapCenter({ lat: 36.3504, lng: 127.3845 }); 
            } else {
                // 100km 이하일 때는 다시 내 위치로 화면 복귀
                setMapCenter(myPos); 
            }
        }
    }, [radiusKm, myPos]); 

    const getZoomLevel = (r: number) => {
        if (r >= 500) return 13; // 전국
        if (r >= 300) return 12; // 남한 전체
        if (r >= 100) return 11; // 광역권 (서울/경기 등)
        if (r >= 50) return 10;
        if (r >= 30) return 9;
        if (r >= 20) return 8;
        if (r >= 10) return 7;
        return 6; // 5km
    };

    if (loading) return <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold">지도 로딩 중...</div>;
    if (error) return <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-bold">카카오맵 로드 실패</div>;

    return (
        <Map 
            center={mapCenter} 
            style={{ width: "100%", height: "100%" }} 
            level={getZoomLevel(radiusKm)}
            isPanto={true} 
        >
            <ZoomControl position={"RIGHT_TOP"} />
            
            {/* 내 위치는 항상 그 자리에 파란색 기본 마커로 고정 */}
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
    );
}