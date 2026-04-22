import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | 축제삼삼오오",
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
      <SignupForm />
    </AuthShell>
  );
}
