"use client";

import { useEffect, useRef, useState } from "react";

import { BtnSurvey } from "@/components/ui/btn-survey";
import { ArrowLeftIcon } from "@/components/ui/icons/arrow-left";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { AnswerEntry, SurveyQuestion } from "@/apis/survey/types";

interface SurveyRunnerProps {
  questions: SurveyQuestion[];
  /** 상단 서브젝트 라벨. figma-loose: GUI 1차 설문 화면엔 미표시 → 현재 미렌더(prop은 유지). */
  subjectLabel?: string;
  /** 마지막 문항 완료 시. answers = questionId → 선택된 answerOptionId */
  onComplete: (answers: AnswerEntry[]) => void;
  /** 첫 문항에서 뒤로 (없으면 ← 숨김) */
  onBack?: () => void;
}

// 본인·참여자 공용 설문 진행기 (product-spec #3·#5 · Figma F03 node 414:13343).
// 한 화면 한 문항. 헤더(뒤로) → 전체폭 진행바 → n/8 + 지문 → 보기(btn_survey).
// 룰/Figma에서 느슨하게 처리한 지점은 `figma-loose:` 주석으로 표기(디자이너 합의용).
export function SurveyRunner({
  questions,
  onComplete,
  onBack,
}: SurveyRunnerProps) {
  const [index, setIndex] = useState(0);
  // questionId → 선택된 answerOptionId
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [isPending, setIsPending] = useState(false);
  const timer = useRef<number | null>(null);

  // ── 브라우저/시스템 back → 전 문항 (popstate 가로채기) ──────────────────────
  // 8문항이 한 페이지 안 index state라 history엔 문항 기록이 없다 → 그냥 두면 back 한 번에
  // 설문을 통째로 이탈(닉네임으로). 모바일 주 타겟이라 사용자는 이 back을 가장 많이 누른다.
  //
  // 방식: 마운트 시 가짜 history entry("가드") 1개를 쌓아 둔다. back을 누르면 가드가 pop되며
  // popstate가 뜨고 → 문항이 남았으면 가드를 다시 쌓고(머무름) index만 1 감소,
  // 첫 문항이면 가드를 소진한 채 onBack으로 설문 밖(닉네임)으로 내보낸다.
  // ※ 완료 시엔 가드를 남겨둔 채 결과로 replace → 결과에서 back 시 설문 재진입은
  //    survey/page.tsx의 done-flag(isSelfSurveyDone)가 막는다.
  const completingRef = useRef(false);
  const guardPushedRef = useRef(false);
  const indexRef = useRef(index);
  indexRef.current = index;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;
    // StrictMode 재마운트로 effect가 두 번 돌아도 가드는 1개만 (ref 가드)
    if (!guardPushedRef.current) {
      window.history.pushState({ lookySurveyGuard: true }, "");
      guardPushedRef.current = true;
    }
    const onPop = () => {
      if (completingRef.current) return; // 완료 후 전환 중이면 무시
      if (indexRef.current > 0) {
        window.history.pushState({ lookySurveyGuard: true }, ""); // 재장전 → 페이지에 머무름
        setIndex((i) => Math.max(0, i - 1));
      } else {
        // 첫 문항에서의 back → 설문 밖(닉네임)으로 이어서 나간다
        onBackRef.current?.();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSelect = (answerOptionId: number) => {
    if (isPending) return;
    const next = { ...selected, [question.questionId]: answerOptionId };
    setSelected(next);
    setIsPending(true);
    timer.current = window.setTimeout(() => {
      setIsPending(false);
      if (index + 1 < total) {
        // 가드는 항상 history 맨 위에 유지(forward는 history 안 건드림) → back 시 가드 pop
        setIndex(index + 1);
      } else {
        // Record<number, number> → {questionId, answerOptionId}[] 변환
        const answers = Object.entries(next).map(([qId, optId]) => ({
          questionId: Number(qId),
          answerOptionId: optId,
        }));
        completingRef.current = true; // 결과로의 replace 중 popstate 무시
        onComplete(answers);
      }
    }, 500);
  };

  const handleBack = () => {
    if (index === 0) {
      onBack?.();
      return;
    }
    // 화면 ← 버튼도 브라우저 back과 같은 경로로 통일(가드 pop → popstate → 재장전 + index-1)
    // → history 싱크를 한 곳(popstate)에서만 관리.
    window.history.back();
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
          {question.content}
        </h1>
      </div>

      {/* 보기 — Figma top329, btn_survey 간 gap 16(gap-4) */}
      {/* Figma: 지문 블록 → 보기 gap 48px → mt-12 일치 */}
      <ul className={`mt-12 flex flex-col gap-4 px-5${isPending ? " pointer-events-none" : ""}`}>
        {question.options.map((option) => {
          const isActive = selected[question.questionId] === option.answerOptionId;
          return (
            <li key={option.answerOptionId}>
              <BtnSurvey
                isActive={isActive}
                onClick={() => handleSelect(option.answerOptionId)}
              >
                {option.content}
              </BtnSurvey>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
