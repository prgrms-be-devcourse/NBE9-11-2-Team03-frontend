"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthTextField } from "@/components/auth/AuthTextField";
import {
  ACCESS_TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/lib/jwtDisplay";

type LoginResponse = {
  status?: number | string;
  message?: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

type LoginErrors = {
  loginId?: string;
  password?: string;
  form?: string;
};

function getLoginError(body: LoginResponse | null): LoginErrors {
  const message = body?.message ?? "";
  const status = String(body?.status ?? "");

  if (message.includes("비밀번호") || status === "401") {
    return { password: "잘못된 비밀번호입니다." };
  }

  if (message.includes("존재하지") || status === "404") {
    return { loginId: "잘못된 아이디입니다." };
  }

  return { form: message || "로그인에 실패했습니다." };
}

export function LoginForm() {
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      loginId: String(formData.get("loginId") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as LoginResponse | null;
      const status = String(body?.status ?? response.status);

      if (!response.ok || status !== "200" || !body?.data?.accessToken) {
        setErrors(getLoginError(body));
        return;
      }

      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, body.data.accessToken);
      if (body.data.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, body.data.refreshToken);
      }

      window.location.assign("/");
    } catch {
      setErrors({ form: "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AuthTextField
        id="loginId"
        name="loginId"
        type="text"
        label="아이디"
        placeholder="아이디를 입력하세요"
        autoComplete="username"
        errorText={errors.loginId}
        required
      />
      <AuthTextField
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요"
        autoComplete="current-password"
        errorText={errors.password}
        minLength={4}
        required
      />

      <div className="flex items-center justify-between gap-4 text-sm">
        <label className="inline-flex items-center gap-2 text-slate-500">
          <input
            type="checkbox"
            name="remember"
            className="h-4 w-4 rounded border-slate-300 accent-blue-600"
          />
          로그인 유지
        </label>
        <Link
          href="#"
          className="font-bold text-blue-600 hover:text-blue-700"
        >
          비밀번호 찾기
        </Link>
      </div>

      {errors.form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" aria-live="polite">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-md bg-blue-600 px-4 text-base font-bold text-white transition enabled:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "로그인 중..." : "로그인"}
      </button>

      <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        또는
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        className="h-12 w-full rounded-md border border-slate-300 bg-slate-100 px-4 text-base font-bold text-slate-700 transition hover:bg-slate-200"
      >
        카카오로 계속하기
      </button>
    </form>
  );
}
