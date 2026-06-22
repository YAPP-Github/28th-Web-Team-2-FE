"use client";

import { useState } from "react";

import { NEUTRAL_CHOICE, type SurveyQuestion } from "@data/questions";

interface SurveyRunnerProps {
  questions: SurveyQuestion[];
  /** 상단 서브젝트 라벨. 본인="나에 대해", 참여자="{닉네임}에 대해" 등 */
  subjectLabel?: string;
  /** 본인 설문이면 "잘 모르겠어요" 중립 선택지 추가 (domain.md §2) */
  includeNeutral?: boolean;
  /** 마지막 문항 완료 시. answers = 문항 id → 선택 인덱스 */
  onComplete: (answers: Record<string, number>) => void;
  /** 첫 문항에서 뒤로 (없으면 ← 숨김) */
  onBack?: () => void;
}

// 본인·참여자 공용 설문 진행기 (product-spec #3, #5).
// 한 화면 한 문항 · 큰 보기 버튼 · 진행 n/8.
export function SurveyRunner({
  questions,
  subjectLabel,
  includeNeutral = false,
  onComplete,
  onBack,
}: SurveyRunnerProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = questions.length;
  // 빈 문항 가드 — 공용 컴포넌트라 호출처가 늘어도 크래시 방지 (3종 상태: 빈).
  if (total === 0) {
    return (
      <div className="flex min-h-full items-center justify-center px-6 text-center">
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

  const handleSelect = (choiceIndex: number) => {
    const next = { ...answers, [question.id]: choiceIndex };
    setAnswers(next);

    if (index + 1 < total) {
      setIndex(index + 1);
    } else {
      onComplete(next);
    }
  };

  const handleBack = () => {
    if (index === 0) {
      onBack?.();
      return;
    }
    setIndex(index - 1);
  };

  const progress = Math.round(((index + 1) / total) * 100);

  return (
    <div className="flex min-h-full flex-col px-5 pb-8 pt-4">
      {/* 상단: 뒤로 + 프로그레스바 */}
      <div className="flex items-center gap-3">
        {(onBack || index > 0) && (
          <button
            type="button"
            onClick={handleBack}
            aria-label="이전 문항"
            className="-ml-1 flex size-8 items-center justify-center text-gray-900"
          >
            ←
          </button>
        )}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 진행 표시 + 지문 */}
      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        {subjectLabel && (
          <span className="text-caption-12-medium text-gray-300">
            {subjectLabel}
          </span>
        )}
        <span className="text-body-14-medium text-gray-300">
          {index + 1} / {total}
        </span>
        <h1 className="text-head1-20 font-display1 text-gray-900">
          {question.scenario}
        </h1>
      </div>

      {/* 보기 */}
      <ul className="mt-8 flex flex-col gap-3">
        {choices.map((choice, i) => {
          const selected = answers[question.id] === i;
          return (
            <li key={`${question.id}-${i}`}>
              <button
                type="button"
                onClick={() => handleSelect(i)}
                className={`w-full rounded-2xl border px-5 py-4 text-left text-body-14-medium transition-colors ${
                  selected
                    ? "border-blue-500 bg-blue-100 text-gray-900"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-blue-200"
                } ${choice === NEUTRAL_CHOICE ? "text-gray-300" : ""}`}
              >
                {choice}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
