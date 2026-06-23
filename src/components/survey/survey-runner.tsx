"use client";

import { useEffect, useRef, useState } from "react";

import { BtnSurvey } from "@/components/ui/btn-survey";
import { ArrowLeftIcon } from "@/components/ui/icons/arrow-left";
import { ProgressBar } from "@/components/ui/progress-bar";
import { NEUTRAL_CHOICE, type SurveyQuestion } from "@data/questions";

interface SurveyRunnerProps {
  questions: SurveyQuestion[];
  /** 상단 서브젝트 라벨. figma-loose: GUI 1차 설문 화면엔 미표시 → 현재 미렌더(prop은 유지). */
  subjectLabel?: string;
  /** 본인 설문이면 "잘 모르겠어요" 중립 선택지 추가 (domain.md §2) */
  includeNeutral?: boolean;
  /** 지문 `{name}` 토큰 치환값. 본인 설문=미전달("나") / 참여자 설문=게시자 닉네임 (product-spec #5). */
  subjectName?: string;
  /** 마지막 문항 완료 시. answers = 문항 id → 선택 인덱스 */
  onComplete: (answers: Record<string, number>) => void;
  /** 첫 문항에서 뒤로 (없으면 ← 숨김) */
  onBack?: () => void;
}

// 본인·참여자 공용 설문 진행기 (product-spec #3·#5 · Figma F03 node 414:13343).
// 한 화면 한 문항. 헤더(뒤로) → 전체폭 진행바 → n/8 + 지문 → 보기(btn_survey).
// 룰/Figma에서 느슨하게 처리한 지점은 `figma-loose:` 주석으로 표기(디자이너 합의용).
export function SurveyRunner({
  questions,
  includeNeutral = false,
  subjectName = "나",
  onComplete,
  onBack,
}: SurveyRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isPending, setIsPending] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  const total = questions.length;
  // 빈 문항 가드 — 공용 컴포넌트라 호출처가 늘어도 크래시 방지 (3종 상태: 빈).
  if (total === 0) {
    return (
      <div className="flex min-h-full items-center justify-center bg-gray-50 px-6 text-center">
        <p className="text-body-14-regular text-gray-300">
          불러올 문항이 없어요
        </p>
      </div>
    );
  }

  const question = questions[index];
  const choices = includeNeutral
    ? [...question.choices, NEUTRAL_CHOICE]
    : question.choices;
  // 지문 `{name}` → 설문 대상(본인="나" / 참여자=게시자 닉네임)으로 치환 (product-spec #5).
  // figma-loose: 더미 문항은 "{name}는/의" 형이라 닉네임 받침에 따라 조사(는/은)가 어긋날 수 있음 —
  //              정식 문항은 백엔드 풀에서 조사 처리된 지문으로 대체.
  const scenario = question.scenario.replaceAll("{name}", subjectName);

  const handleSelect = (choiceIndex: number) => {
    if (isPending) return;
    const next = { ...answers, [question.id]: choiceIndex };
    setAnswers(next);
    setIsPending(true);
    timer.current = window.setTimeout(() => {
      setIsPending(false);
      if (index + 1 < total) {
        setIndex(index + 1);
      } else {
        onComplete(next);
      }
    }, 500);
  };

  const handleBack = () => {
    if (index === 0) {
      onBack?.();
      return;
    }
    setIndex(index - 1);
  };

  const progress = Math.round(((index + 1) / total) * 100);

  // Figma: 화면 배경 gray-50, 헤더/진행바 전체폭, 지문·보기만 px-5(left-20)
  return (
    <div className="flex min-h-full flex-col bg-gray-50 pb-8">
      {/* 헤더 — Figma top44 h60. 뒤로 48×48 터치영역(icn 24, left-8) */}
      <header className="flex h-15 items-center px-2">
        {(onBack || index > 0) && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="이전 문항"
            className="flex size-12 items-center justify-center"
          >
            <ArrowLeftIcon className="text-gray-900" />
          </button>
        )}
      </header>

      {/* 진행바 — Figma top104, 전체폭, h-4(4px), 흰 트랙 */}
      <ProgressBar
        value={progress}
        className="h-1 rounded-none bg-white"
        aria-label={`설문 진행 ${index + 1} / ${total}`}
      />

      {/* 진행 표시 + 지문 — Figma top144 */}
      {/* Figma: 진행바 하단 → 지문 블록 gap 36px → mt-9 일치, 지문↔보기 안 gap-2(8px) 일치 */}
      <div className="mt-9 flex flex-col items-center gap-2 px-5 text-center">
        <p className="text-body-16-medium">
          <span className="text-blue-500">{index + 1}</span>
          <span className="text-gray-300"> / {total}</span>
        </p>
        {/* Figma: head-point1/24 = display1(Y Spotlight) 24px (기존 head1-20에서 교정) */}
        {/* 질문 최대 3줄(line-clamp-3) + 단어 단위 줄바꿈(break-keep: 한 단어가 잘리지 않게) */}
        <h1 className="line-clamp-3 break-keep text-head1-24 font-display1 text-gray-900">
          {scenario}
        </h1>
      </div>

      {/* 보기 — Figma top329, btn_survey 간 gap 16(gap-4) */}
      {/* Figma: 지문 블록 → 보기 gap 48px → mt-12 일치 */}
      <ul className={`mt-12 flex flex-col gap-4 px-5${isPending ? " pointer-events-none" : ""}`}>
        {choices.map((choice, i) => {
          const selected = answers[question.id] === i;
          const isNeutral = choice === NEUTRAL_CHOICE;
          return (
            <li key={`${question.id}-${i}`}>
              <BtnSurvey
                isActive={selected}
                onClick={() => handleSelect(i)}
                className={isNeutral && !selected ? "text-gray-300" : undefined}
              >
                {choice}
              </BtnSurvey>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
