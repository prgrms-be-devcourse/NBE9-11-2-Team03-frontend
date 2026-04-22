"use client";

import { useEffect, useState, useRef } from "react";
import { Map, MapMarker, CustomOverlayMap, useKakaoLoader, ZoomControl } from "react-kakao-maps-sdk";
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
    const DEFAULT_POS = { lat: 37.5665, lng: 126.9780 };

    const [myPos, setMyPos] = useState(DEFAULT_POS);
    const [mapCenter, setMapCenter] = useState(DEFAULT_POS);
    const [markers, setMarkers] = useState<any[]>([]);
    const [isInitialGpsLoaded, setIsInitialGpsLoaded] = useState(false);

    // 반경(km)에 따른 지도 줌 레벨 설정
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

    // 주변 축제 데이터 페칭
    const fetchNearbyFestivals = async (lat: number, lng: number, r: number) => {
        try {
            const response = await fetch(`/api/festivals/nearby?mapX=${lng}&mapY=${lat}&radiusKm=${r}`);
            if (!response.ok) return;

            const resData = await response.json();
            const fetchedMarkers = Array.isArray(resData) ? resData : (resData.data || []);

            setMarkers(fetchedMarkers);
        } catch {}
    };

    // 초기 GPS 위치 로드
    useEffect(() => {
        if (!navigator.geolocation) {
            setIsInitialGpsLoaded(true);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setMyPos({ lat: latitude, lng: longitude });
                setMapCenter(radiusKm >= 300 ? { lat: 36.3504, lng: 127.3845 } : { lat: latitude, lng: longitude });
                fetchNearbyFestivals(latitude, longitude, radiusKm);
                setIsInitialGpsLoaded(true);
            },
            () => {
                setMapCenter(radiusKm >= 300 ? { lat: 36.3504, lng: 127.3845 } : DEFAULT_POS);
                fetchNearbyFestivals(DEFAULT_POS.lat, DEFAULT_POS.lng, radiusKm);
                setIsInitialGpsLoaded(true);
            },
            { enableHighAccuracy: true }
        );
    }, []);

    // 반경 변경 시 데이터 리로드 및 중심점 이동
    useEffect(() => {
        if (!isInitialGpsLoaded) return;

        fetchNearbyFestivals(myPos.lat, myPos.lng, radiusKm);
        setMapCenter(radiusKm >= 300 ? { lat: 36.3504, lng: 127.3845 } : myPos);
    }, [radiusKm, isInitialGpsLoaded]);

    const handlePanToMyPos = () => {
        mapRef.current?.panTo(new kakao.maps.LatLng(myPos.lat, myPos.lng));
    };

    if (loading || !isInitialGpsLoaded) {
        return <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 font-bold text-sm">지도를 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 font-bold text-sm">지도 로드 중 오류가 발생했습니다.</div>;
    }

    return (
        <div className="w-full h-full relative">
            <Map
                center={mapCenter}
                level={getZoomLevel(radiusKm)}
                style={{ width: "100%", height: "100%" }}
                isPanto={true}
                ref={mapRef}
            >
                <ZoomControl position={"TOPRIGHT"} />
                <MapMarker position={myPos} />

                {markers.map((marker, index) => {
                    const lat = Number(marker.mapY || marker.mapy || marker.latitude);
                    const lng = Number(marker.mapX || marker.mapx || marker.longitude);

                    if (!lat || !lng) return null;

                    return (
                        <CustomOverlayMap
                            key={`festival-${marker.id || index}`}
                            position={{ lat, lng }}
                            yAnchor={1}
                            zIndex={100}
                        >
                            <div
                                onClick={() => router.push(`/festivals/${marker.id}`)}
                                className="relative group cursor-pointer"
                                style={{ width: '30px', height: '45px' }}
                            >
                                {/* 호버 시 표시되는 말풍선 */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                                    <div className="bg-gray-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap relative">
                                        {marker.title || "축제 정보"}
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                                    </div>
                                </div>

                                <img
                                    src="https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"
                                    alt="별 마커"
                                    className="absolute top-0 left-0 w-[30px] h-[45px] block drop-shadow-md"
                                    style={{ maxWidth: 'none' }}
                                />
                            </div>
                        </CustomOverlayMap>
                    );
                })}
            </Map>

            {/* 현재 위치 버튼 */}
            <button
                onClick={handlePanToMyPos}
                className="absolute bottom-6 right-6 z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
                <span className="text-xl">🎯</span>
            </button>
        </div>
    );
}