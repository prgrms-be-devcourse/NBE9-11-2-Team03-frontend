import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginBackGuard } from "@/components/auth/LoginBackGuard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 축제삼삼오오",
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
      <LoginBackGuard />
      <LoginForm />
    </AuthShell>
  );
}
