import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";

export const metadata: Metadata = {
  title: "회원가입 | 오늘의 축제",
};

export default function SignupPage() {
  return (
    <AuthShell
      mode="signup"
      title="이메일로 회원가입"
      description="이메일 인증으로 계정을 만들고 관심 지역과 축제 일정을 저장해 보세요."
      footerText="이미 계정이 있나요?"
      footerHref="/login"
      footerLabel="로그인"
    >
      <form action="#" className="space-y-5">
        <AuthTextField
          id="name"
          name="name"
          type="text"
          label="이름"
          placeholder="이름을 입력하세요"
          autoComplete="name"
          required
        />
        <AuthTextField
          id="nickname"
          name="nickname"
          type="text"
          label="닉네임"
          placeholder="축제 친구들이 볼 이름"
          autoComplete="nickname"
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
          required
        />
        <AuthTextField
          id="password"
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호 4자 이상"
          autoComplete="new-password"
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
          minLength={4}
          required
        />

        <label className="flex gap-3 rounded-md border border-[#dfe9e4] bg-[#f9fffc] p-4 text-sm leading-6 text-[#65706b]">
          <input
            type="checkbox"
            name="terms"
            className="mt-1 h-4 w-4 rounded border-[#cbd8d3] accent-[#00a88f]"
            required
          />
          <span>
            <Link
              href="#"
              className="font-bold text-[#007c6c] hover:text-[#ff5a5f]"
            >
              이용약관
            </Link>
            과{" "}
            <Link
              href="#"
              className="font-bold text-[#007c6c] hover:text-[#ff5a5f]"
            >
              개인정보 처리방침
            </Link>
            에 동의합니다.
          </span>
        </label>

        <button
          type="submit"
          className="h-12 w-full rounded-md bg-[#ff5a5f] px-4 text-base font-black text-white transition hover:bg-[#e44a4f] focus:outline-none focus:ring-4 focus:ring-[#ff5a5f]/25"
        >
          회원가입
        </button>
      </form>
    </AuthShell>
  );
}
