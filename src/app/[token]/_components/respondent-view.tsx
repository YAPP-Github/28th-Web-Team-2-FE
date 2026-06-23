"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SurveyRunner } from "@/components/survey/survey-runner";
import { BgCloud } from "@/components/ui/bg-cloud";
import { Cta } from "@/components/ui/cta";
import { Logo } from "@/components/ui/logo";
import { pickQuestions } from "@data/questions";

// 참여자 플로우 (product-spec #5 · Figma F06 intro node 414:13450) — GUI 1차 전경 정합.
// intro(자동 전환 splash) → 설문(8) → 완료 + "나도 만들기"(바이럴 루프). 신원·로그인 없음.
// 룰/Figma에서 느슨하게 처리한 지점은 `figma-loose:` 주석으로 표기(디자이너 합의용).
type Step = "intro" | "survey" | "done";

export function RespondentView({ nickname }: { nickname: string }) {
  const [step, setStep] = useState<Step>("intro");

  // Figma 주석: intro 화면 2초 지속 후 설문으로 자동 전환(버튼 없음).
  useEffect(() => {
    if (step !== "intro") return;
    const t = window.setTimeout(() => setStep("survey"), 2000);
    return () => window.clearTimeout(t);
  }, [step]);

  if (step === "intro") {
    return (
      // figma-loose: 로고 top Figma 106px(프레임, status bar 44px 포함) → pt-16(64px) 근사
      <main className="relative isolate flex min-h-full flex-col items-center overflow-hidden bg-sky-gradient px-5 pb-8 pt-16 text-center">
        {/* 배경: 하늘 그라데이션(Figma 그대로) + 구름(BgCloud) */}
        <BgCloud />

        <Logo />

        {/* figma-loose: 타이틀 top Figma 184px(21.8%) → 로고 아래 mt-8 근사 */}
        <h1 className="mt-8 text-head1-26 font-display1 text-gray-900">
          <span className="text-blue-500">{nickname}</span>님은
          <br />
          어떤 사람인가요?
        </h1>

        {/* 카운트다운 GIF = 디자이너 프레임 대기. Figma도 흰 박스(350×332)로 자리만. */}
        <div className="mt-7 flex aspect-[350/332] w-full flex-col items-center justify-center gap-1 rounded-2xl bg-white text-center">
          <span className="text-body-18-semibold text-gray-200">[GIF]</span>
          <span className="text-body-18-semibold text-gray-200">
            3, 2, 1 카운터하는 캐릭터 삽입 예정
          </span>
          <span className="text-body-18-semibold text-gray-200">
            *대략적인 위치만 참고해 주세요
          </span>
        </div>

        {/* Figma: body/16-medium gray-700, 하단 고정 */}
        <p className="mt-auto pt-8 text-body-16-medium text-gray-700">
          친구들의 답변이 모이면,
          <br />
          {nickname}님의 네컷이 완성돼요
        </p>
      </main>
    );
  }

  if (step === "survey") {
    // 참여자 설문: 첫 문항 뒤로(onBack) 없음 — 자동 전환 splash로 되돌아갈 필요 없음
    return (
      <SurveyRunner
        questions={pickQuestions(8)}
        onComplete={() => setStep("done")}
      />
    );
  }

  // done — Figma F06 완료 화면 노드 414:13540 정합.
  // 배경: bg-sky-gradient + BgCloud (intro와 동일 패턴).
  return (
    // figma-loose: 로고 top Figma 104px(프레임, status bar 44px 포함) → pt-16(64px) 근사. intro(pt-16)와 동일.
    <main className="relative isolate flex min-h-full flex-col items-center overflow-hidden bg-sky-gradient px-5 pb-6 pt-16 text-center">
      {/* 배경: 하늘 그라데이션(Figma 그대로) + 구름(BgCloud) */}
      <BgCloud />

      <Logo />

      {/* figma-loose: 타이틀 top Figma 176px(로고 bottom 132 → 타이틀 top 176 = gap 44px) → mt-10(40px) 근사.
          intro의 mt-8(32px)과 다르나 토큰 단위 내 최근사 mt-10 선택. */}
      <h1 className="mt-10 text-head1-24 font-display1 text-gray-900">
        <span className="text-blue-500">{nickname}</span>님에게
        <br />
        답변을 전했어요!
      </h1>

      {/* Figma: 타이틀↔서브텍스트 gap 12px → mt-3(12px) 일치 */}
      <p className="mt-3 text-body-16-medium text-gray-300">
        방금 답변이 {nickname}님의
        <br />
        네컷을 완성하는 데 보탬이 됐어요
      </p>

      {/* 일러스트 placeholder — Figma top 344, w350 h332, 흰 박스. 실제 일러스트는 디자이너 프레임 대기.
          figma-loose: public/assets/character-insight.png 미삽입(Figma도 빈 박스). */}
      <div className="mt-7 flex aspect-[350/332] w-full flex-col items-center justify-center gap-1 rounded-2xl bg-white text-center">
        <span className="text-body-18-semibold text-gray-200">
          일러스트 이미지 삽입 예정
        </span>
        <span className="text-body-18-semibold text-gray-200">
          *대략적인 위치만 참고해 주세요
        </span>
      </div>

      {/* 하단 고정 블록 — Figma: bottom 0, pb-[24px] pt-[8px] px-[20px], gap-[12px] 중앙.
          mt-auto로 바닥 고정. 안내문↔CTA gap-3(12px)·하단 pb-6(24px)·px-5(20px) 모두 Figma 일치. */}
      <div className="mt-auto flex w-full flex-col gap-3 pt-8">
        {/* Figma: body/14-medium gray-800 중앙 */}
        <p className="text-body-14-medium text-gray-800">
          남이 본 내 모습이 궁금하다면?
        </p>
        {/* Figma 주석: "클릭 시 F01_온보딩 이동" → href="/" (랜딩 페이지, product-spec #5 바이럴 루프) */}
        <Cta asChild>
          <Link href="/">나도 만들기</Link>
        </Cta>
      </div>
    </main>
  );
}
