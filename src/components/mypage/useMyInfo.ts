"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/lib/jwtDisplay";

type MyInfo = {
  memberId: number;
  email: string;
  nickname: string;
  reviewCount: number;
  bookMarkCount: number;
};

type MeResponse = {
  status: string;
  message: string;
  data: MyInfo;
};

type ApiErrorResponse = {
  status: number;
  message: string;
  data: null;
};

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.status === "number" && typeof v.message === "string";
}

export function useMyInfo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myInfo, setMyInfo] = useState<MyInfo | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) {
      setIsLoggedIn(false);
      setMyInfo(null);
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);

    try {
      const response = await fetch(`/api/users/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const body = (await response.json().catch(() => null)) as
        | MeResponse
        | ApiErrorResponse
        | null;

      if (!response.ok) {
        const message =
          body && isApiErrorResponse(body)
            ? body.message
            : `내 정보 조회 실패 (${response.status})`;

        if (response.status === 401) {
          try {
            localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
            localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
          } catch {
            // ignore
          }
          setIsLoggedIn(false);
        }

        throw new Error(message);
      }

      const result = body as MeResponse;
      setMyInfo(result.data);
    } catch (err) {
      setMyInfo(null);
      setError(
        err instanceof Error
          ? err.message
          : "내 정보를 불러오는 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { loading, error, myInfo, isLoggedIn, refetch } as const;
}

