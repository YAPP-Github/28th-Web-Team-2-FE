import Link from "next/link";

// 닉네임 설정 (product-spec #2) — 스텁. 랜딩 CTA가 404나지 않게 자리만 잡음.
// TODO(✍️): 닉네임 입력(로컬스토리지 저장) → 자기 설문(#3)으로. 길이/금칙어 규칙 미정.
export default function NicknamePage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display1 text-head1-24 text-gray-900">닉네임 설정</h1>
      <p className="text-body-14-regular text-gray-300">아직 만드는 중이에요 🛠️</p>
      <Link
        href="/"
        className="text-body-14-medium text-blue-500 underline-offset-4 hover:underline"
      >
        ← 랜딩으로
      </Link>
    </main>
  );
}
