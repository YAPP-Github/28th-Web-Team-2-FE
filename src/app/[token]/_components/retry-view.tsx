"use client";

import Image from "next/image";

import { BgCloud } from "@/components/ui/bg-cloud";
import { Cta } from "@/components/ui/cta";
import { Logo } from "@/components/ui/logo";

// 응답 미달 재시도 뷰 (product-spec #7 · Figma F05 결과물 생성 실패 노드 414:13591) — GUI 전경 정합.
// 24h 경과 + 응답 3건 미달. 결과 네컷 생성 안 함. 좌절감 줄이는 톤 + 재시도 유도.
// 룰/Figma에서 느슨하게 처리한 지점은 `figma-loose:` 주석으로 표기(디자이너 합의용).
export function RetryView({
  nickname: _nickname,
  respondentCount: _respondentCount,
  onRetry,
}: {
  nickname: string;
  respondentCount: number;
  onRetry: () => void;
}) {
  return (
    // figma-loose: 로고 top Figma 106px(프레임, status bar 44px 포함) → pt-16(64px) 근사.
    // 배경: bg-gray-gradient(white→gray-200, sky 아닌 회색 그라데이션) + BgCloud.
    <main className="relative flex min-h-full flex-col items-center overflow-hidden bg-gray-gradient px-5 pb-6 pt-16 text-center">
      {/* 배경 구름 */}
      <BgCloud />

      <Logo />

      {/* 타이틀 블록 — Figma top 192, gap 12 */}
      {/* figma-loose: 로고 bottom → 타이틀 top gap Figma ≈ 44px → mt-10(40px) 근사. */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {/* figma-loose: Figma "3명" 하드코딩 → 목표 상수 3으로. respondentCount(모인 수)는 여기 미사용. */}
        <h1 className="text-head1-24 font-display1 text-gray-900">
          앗! 3명이 모이지 않았어요..
        </h1>
        <p className="text-body-18-medium text-gray-300">다시 시작해 볼까요?</p>
      </div>

      {/* 캐릭터 일러스트 — Figma top 351, w204 h259.5. 실제 에셋 사용(투명 PNG). */}
      {/* figma-loose: Figma w204 h259.5 → width=204 height=260 정수 근사. 장식 이미지라 alt="". */}
      <Image
        src="/assets/character-sad.png"
        alt=""
        width={204}
        height={260}
        priority
        className="mt-8"
      />

      {/* 하단 고정 블록 — Figma bottom 0, gap 36 → gap-9(36px) 일치. */}
      <div className="mt-auto flex w-full flex-col items-center gap-9">
        <p className="text-body-16-medium text-gray-300">
          24시간 안에 친구 3명이 참여해야
          <br />
          네컷 결과를 만들 수 있어요
        </p>
        {/* figma-loose: Figma 주석 "클릭 시 F01 온보딩 이동"이나, props onRetry 콜백 시그니처 유지(호출부 결정). */}
        <Cta onClick={onRetry}>
          다시하기
        </Cta>
      </div>
    </main>
  );
}
