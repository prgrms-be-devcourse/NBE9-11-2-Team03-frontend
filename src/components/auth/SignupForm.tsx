"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthTextField } from "@/components/auth/AuthTextField";

type SignupResponse = {
  status?: number | string;
  message?: string;
};

type SignupErrors = {
  userName?: string;
  loginId?: string;
  nickname?: string;
  email?: string;
  password?: string;
  passwordConfirm?: string;
  form?: string;
};

function getSignupError(body: SignupResponse | null): SignupErrors {
  const message = body?.message ?? "";

  if (message.includes("아이디")) return { loginId: message };
  if (message.includes("이메일")) return { email: message };
  if (message.includes("닉네임")) return { nickname: message };

  return { form: message || "회원가입에 실패했습니다." };
}

export function SignupForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<SignupErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});
    setSuccessMessage("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

    if (password !== passwordConfirm) {
      setErrors({ passwordConfirm: "비밀번호가 일치하지 않습니다." });
      setSubmitting(false);
      return;
    }

    const payload = {
      userName: String(formData.get("userName") ?? "").trim(),
      loginId: String(formData.get("loginId") ?? "").trim(),
      nickname: String(formData.get("nickname") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password,
    };

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as SignupResponse | null;
      const status = String(body?.status ?? response.status);

      if (!response.ok || status !== "200") {
        setErrors(getSignupError(body));
        return;
      }

      setSuccessMessage("회원가입에 성공했습니다. 로그인 페이지로 이동합니다.");
      window.setTimeout(() => {
        router.replace("/login");
      }, 1200);
    } catch {
      setErrors({ form: "서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <AuthTextField
        id="userName"
        name="userName"
        type="text"
        label="이름"
        placeholder="이름을 입력하세요"
        autoComplete="name"
        errorText={errors.userName}
        required
      />
      <AuthTextField
        id="loginId"
        name="loginId"
        type="text"
        label="아이디"
        placeholder="로그인에 사용할 아이디"
        autoComplete="username"
        errorText={errors.loginId}
        required
      />
      <AuthTextField
        id="nickname"
        name="nickname"
        type="text"
        label="닉네임"
        placeholder="축제 친구들이 볼 이름"
        autoComplete="nickname"
        errorText={errors.nickname}
        minLength={2}
        maxLength={20}
        required
      />
      <AuthTextField
        id="email"
        name="email"
        type="email"
        label="이메일"
        placeholder="festival@example.com"
        autoComplete="email"
        errorText={errors.email}
        required
      />
      <AuthTextField
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        placeholder="비밀번호 4자 이상"
        autoComplete="new-password"
        errorText={errors.password}
        helperText="테스트 계정 생성 기준에 맞춰 4자 이상으로 입력해 주세요."
        minLength={4}
        required
      />
      <AuthTextField
        id="passwordConfirm"
        name="passwordConfirm"
        type="password"
        label="비밀번호 확인"
        placeholder="비밀번호를 한 번 더 입력하세요"
        autoComplete="new-password"
        errorText={errors.passwordConfirm}
        minLength={4}
        required
      />

      <label className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
        <input
          type="checkbox"
          name="terms"
          className="mt-1 h-4 w-4 rounded border-slate-300 accent-blue-600"
          required
        />
        <span>
          <Link
            href="#"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            이용약관
          </Link>
          과{" "}
          <Link
            href="#"
            className="font-bold text-blue-600 hover:text-blue-700"
          >
            개인정보 처리방침
          </Link>
          에 동의합니다.
        </span>
      </label>

      {successMessage ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700" aria-live="polite">
          {successMessage}
        </p>
      ) : null}
      {errors.form ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600" aria-live="polite">
          {errors.form}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting || Boolean(successMessage)}
        className="h-12 w-full rounded-md bg-blue-600 px-4 text-base font-bold text-white transition enabled:hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "가입 중..." : "회원가입"}
      </button>
    </form>
  );
}
