"use client";

import { useEffect } from "react";
import { isLoginBackLockEnabled } from "@/lib/authToken";

const LOGIN_HISTORY_STATE_KEY = "loginBackGuard";

function pushLoginState() {
  const currentState = window.history.state ?? {};

  if (currentState[LOGIN_HISTORY_STATE_KEY]) return;

  window.history.pushState(
    {
      ...currentState,
      [LOGIN_HISTORY_STATE_KEY]: true,
    },
    "",
    "/login",
  );
}

export function LoginBackGuard() {
  useEffect(() => {
    if (!isLoginBackLockEnabled()) return;

    // 로그아웃 후 로그인 페이지에서는 뒤로가기로 이전 화면에 못 가게 한다.
    pushLoginState();

    const handlePopState = () => {
      if (!isLoginBackLockEnabled()) return;

      // 뒤로가기를 누르면 다시 로그인 페이지 기록을 넣는다.
      window.setTimeout(pushLoginState, 0);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
