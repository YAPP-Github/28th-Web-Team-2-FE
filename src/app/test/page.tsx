import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "looky · CI/CD 배포 테스트",
};

export default function TestPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <h1 className="text-head1-24 font-display1">CI/CD Test Page</h1>
      <p className="text-gray-400">이 페이지가 보이면 배포가 정상적으로 완료된 것입니다.</p>
    </main>
  );
}
