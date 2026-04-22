"use client";

import { useEffect } from "react";
import {
  clearHomeBackLock,
  fetchWithAuth,
  isHomeBackLockEnabled,
} from "@/lib/authToken";

const HOME_HISTORY_STATE_KEY = "homeBackGuard";

function pushHomeState() {
  const currentState = window.history.state ?? {};

  if (currentState[HOME_HISTORY_STATE_KEY]) return;

  window.history.pushState(
    {
      ...currentState,
      [HOME_HISTORY_STATE_KEY]: true,
    },
    "",
    "/",
  );
}

export function HomeBackGuard() {
  useEffect(() => {
    if (!isHomeBackLockEnabled()) return;

    // 로그인 후 홈에서는 뒤로가기를 눌러도 홈에 남게 한다.
    pushHomeState();

    const checkLogin = async () => {
      const response = await fetchWithAuth("/api/users/me");

      if (!response.ok) {
        clearHomeBackLock();
      }
    };

    const handlePopState = () => {
      if (!isHomeBackLockEnabled()) return;

      // 홈에서 뒤로가기가 눌리면 다시 홈 기록을 하나 넣어서 빠져나가지 않게 한다.
      window.setTimeout(pushHomeState, 0);
    };

    void checkLogin();
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
