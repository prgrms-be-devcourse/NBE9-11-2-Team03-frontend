// src/components/BookmarkButton.tsx
"use client";
import { useState, useEffect } from "react";

interface BookmarkButtonProps {
    festivalId: number;
    initialIsBookmarked: boolean;
    initialCount?: number;
    showCount?: boolean;
    onToggle?: (isBookmarked: boolean, bookmarkCount: number) => void;
    className?: string;
    isSmall?: boolean;
}

export default function BookmarkButton({
    festivalId,
    initialIsBookmarked,
    initialCount = 0,
    showCount = false,
    onToggle,
    className = "",
    isSmall = false
}: BookmarkButtonProps) {
    const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
    const [count, setCount] = useState(initialCount);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsBookmarked(initialIsBookmarked);
    }, [initialIsBookmarked]);

    const toggleBookmark = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (isLoading) return;
        setIsLoading(true);

        try {
            const method = isBookmarked ? "DELETE" : "POST";
            const response = await fetch(`/api/festivals/${festivalId}/bookmark`, {
                method: method,
            });

            if (response.status === 401 || response.status === 403) {
                alert("로그인이 필요한 서비스입니다.");
                // 필요시 로그인페이지로 이동 추가
                setIsLoading(false);
                return;
            }

            if (response.ok) {
                const resData = await response.json();
                setIsBookmarked(resData.data.isBookmarked);

                if (onToggle) {
                    onToggle(resData.data.isBookmarked, resData.data.bookmarkCount);
                }

            } else {
                const errorData = await response.json();
                alert(errorData.message || "찜하기 처리 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("찜하기 통신 실패:", error);
            alert("서버와 통신 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={toggleBookmark}
            className={`flex items-center gap-1 transition-transform active:scale-90 ${className}`}
            title={isBookmarked ? "찜 취소" : "찜하기"}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={isSmall ? "1.5" : "2"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`${isSmall ? "w-6 h-6" : "w-10 h-10"} transition-colors text-red-500 hover:text-red-600`}
            >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>

            {showCount && (
                <span className="text-lg font-bold text-gray-700">{count}</span>
            )}
        </button>
    );
}