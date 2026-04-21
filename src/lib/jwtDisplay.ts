export type JwtPayload = {
  exp?: number;
  name?: string;
  nickname?: string;
  username?: string;
  sub?: string;
};

/** 로그인 성공 후 저장할 때 이 키 이름을 백엔드/로그인 페이지와 맞춰야 합니다. */
export const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
export const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

function decodeBase64UrlToUtf8(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder("utf-8").decode(bytes);
}

export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payloadBase64Url] = token.split(".");
    if (!payloadBase64Url) return null;
    const payloadJson = decodeBase64UrlToUtf8(payloadBase64Url);
    return JSON.parse(payloadJson) as JwtPayload;
  } catch {
    return null;
  }
}

export function getUserDisplayName(token: string): string {
  const payload = parseJwtPayload(token);
  return payload?.name ?? payload?.nickname ?? payload?.username ?? payload?.sub ?? "회원";
}

export function isTokenActive(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  if (!payload.exp) return true;

  return payload.exp * 1000 > Date.now();
}
