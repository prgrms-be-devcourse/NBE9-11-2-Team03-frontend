import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthTextField } from "@/components/auth/AuthTextField";

export const metadata: Metadata = {
  title: "로그인 | 오늘의 축제",
};

export default function LoginPage() {
  return (
    <AuthShell
      mode="login"
      title="로그인"
      description="가입할 때 만든 아이디로 저장해 둔 축제와 관심 지역을 이어서 확인해 보세요."
      footerText="아직 계정이 없나요?"
      footerHref="/signup"
      footerLabel="회원가입"
    >
      {/* TODO: 로그인 API 연동 및 성공 후 이동 페이지가 정해지면 제출 로직을 연결한다. */}
      <form action="#" className="space-y-5">
        <AuthTextField
          id="loginId"
          name="loginId"
          type="text"
          label="아이디"
          placeholder="아이디를 입력하세요"
          autoComplete="username"
          required
        />
        <AuthTextField
          id="password"
          name="password"
          type="password"
          label="비밀번호"
          placeholder="비밀번호를 입력하세요"
          autoComplete="current-password"
          minLength={4}
          required
        />

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex items-center gap-2 text-[#65706b]">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-[#cbd8d3] accent-[#00a88f]"
            />
            로그인 유지
          </label>
          <Link
            href="#"
            className="font-bold text-[#007c6c] hover:text-[#ff5a5f]"
          >
            비밀번호 찾기
          </Link>
        </div>

        <button
          type="submit"
          className="h-12 w-full rounded-md bg-[#00a88f] px-4 text-base font-black text-white transition hover:bg-[#008f7a] focus:outline-none focus:ring-4 focus:ring-[#00a88f]/25"
        >
          로그인
        </button>

        <div className="flex items-center gap-3 text-xs font-bold text-[#9aa6a1]">
          <span className="h-px flex-1 bg-[#e5eeea]" />
          또는
          <span className="h-px flex-1 bg-[#e5eeea]" />
        </div>

        <button
          type="button"
          className="h-12 w-full rounded-md border border-[#cbd8d3] bg-[#fee500] px-4 text-base font-black text-[#202426] transition hover:border-[#202426]"
        >
          카카오로 계속하기
        </button>
      </form>
    </AuthShell>
  );
}
