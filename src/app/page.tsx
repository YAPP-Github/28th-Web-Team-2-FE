import Image from "next/image";
import Link from "next/link";

import { Cta } from "@/components/ui/cta";

// 랜딩 / 진입 (product-spec #1) — 대충 초안. 마스코트 히어로 + 시작 CTA.
// TODO(✍️): resume(로컬스토리지 진행 중 링크) 분기, landing_view 분석 이벤트
export default function Home() {
  return (
    <main className="flex min-h-full flex-col items-center justify-between px-6 pb-10 pt-14 text-center">
      <header className="flex flex-col items-center gap-2">
        <span className="text-caption-12-medium text-gray-300">또래 인식 서비스</span>
        <h1 className="font-display1 text-head1-26 text-gray-900">looky</h1>
      </header>

      <div className="flex flex-col items-center gap-6">
        {/* 마스코트 히어로 */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden
            className="absolute h-56 w-56 rounded-full bg-blue-100/70 blur-2xl"
          />
          <Image
            src="/mascot.png"
            alt="돋보기를 든 looky 마스코트"
            width={220}
            height={292}
            priority
            className="relative drop-shadow-sm"
          />
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="font-display1 text-head1-24 text-gray-900">
            친구들이 본 나를
            <br />
            인생네컷으로 발견하다
          </p>
          <p className="text-body-14-regular text-gray-300">
            친구들에게 설문을 보내면
            <br />
            그 친구들이 찍어준 네 컷이 완성돼요
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <Cta asChild>
          <Link href="/onboarding/nickname">시작하기</Link>
        </Cta>
        {/* TODO(✍️): 진행 중인 내 링크 있을 때만 노출 (resume) */}
        <Link
          href="/onboarding/nickname"
          className="text-body-14-medium text-gray-300 underline-offset-4 hover:underline"
        >
          이미 만들고 있다면 이어보기
        </Link>
      </div>
    </main>
  );
}
