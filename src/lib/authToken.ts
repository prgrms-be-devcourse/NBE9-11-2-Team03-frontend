"use client";

import { ACCESS_TOKEN_STORAGE_KEY } from "@/lib/jwtDisplay";

type TokenApiResponse = {
  status?: number | string;
  message?: string;
  data?: {
    accessToken?: string;
  };
};

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function saveAccessToken(accessToken: string) {
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, accessToken);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}

async function reissueAccessToken() {
  const response = await fetch("/api/auth/reissue", {
    method: "POST",
    credentials: "include",
  });
  const body = (await response.json().catch(() => null)) as TokenApiResponse | null;
  const accessToken = body?.data?.accessToken;

  if (!response.ok || !accessToken) {
    clearAccessToken();
    return null;
  }

  saveAccessToken(accessToken);
  return accessToken;
}

function withAccessToken(headers: HeadersInit | undefined, accessToken: string | null) {
  const nextHeaders = new Headers(headers);

  if (accessToken) {
    nextHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  return nextHeaders;
}

export async function fetchWithAuth(input: RequestInfo | URL, init: RequestInit = {}) {
  const requestInit: RequestInit = {
    ...init,
    credentials: init.credentials ?? "include",
    headers: withAccessToken(init.headers, getStoredAccessToken()),
  };

  const response = await fetch(input, requestInit);

  if (response.status !== 401) {
    return response;
  }

  const newAccessToken = await reissueAccessToken();

  if (!newAccessToken) {
    return response;
  }

  return fetch(input, {
    ...init,
    credentials: init.credentials ?? "include",
    headers: withAccessToken(init.headers, newAccessToken),
  });
}
