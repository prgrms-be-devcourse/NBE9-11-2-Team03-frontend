"use client";

import { useEffect } from "react";
import {
  clearHomeBackLock,
  fetchWithAuth,
  isHomeBackLockEnabled,
} from "@/lib/authToken";

const HOME_HISTORY_STATE_KEY = "homeBackGuard";

function pushHomeState(path: string) {
  const currentState = window.history.state ?? {};

  if (currentState[HOME_HISTORY_STATE_KEY]) return;

  window.history.pushState(
    {
      ...currentState,
      [HOME_HISTORY_STATE_KEY]: true,
    },
    "",
    path,
  );
}

export function HomeBackGuard() {
  useEffect(() => {
    if (!isHomeBackLockEnabled()) return;

    const lockedPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    // 로그인 후 메인에서는 뒤로가기를 눌러도 메인에 남게 한다.
    pushHomeState(lockedPath);

    const checkLogin = async () => {
      const response = await fetchWithAuth("/api/users/me");

      if (!response.ok) {
        clearHomeBackLock();
      }
    };

    const handlePopState = () => {
      if (!isHomeBackLockEnabled()) return;

      // 메인에서 뒤로가기가 눌리면 다시 메인 기록을 하나 넣어서 빠져나가지 않게 한다.
      window.setTimeout(() => pushHomeState(lockedPath), 0);
    };

    void checkLogin();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
