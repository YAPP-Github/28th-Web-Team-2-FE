"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { BgCloud } from "@/components/ui/bg-cloud";

// F05 결과 진입 로딩 — 순수 5초 고정 연출(데이터 대기 아님. 이 화면 진입 시 결과는 항상 READY).
// Figma node 1254-7607(A: 팔 내림) / 1254-7618(B: 팔 올림) — 1초마다 교차, 5초 후 onDone.
// 배경: grad/background_green (globals.css `bg-green-gradient`, node 1268-8343).
interface ResultLoadingProps {
  onDone: () => void;
}

export function ResultLoading({ onDone }: ResultLoadingProps) {
  const [showA, setShowA] = useState(true);

  useEffect(() => {
    const toggle = window.setInterval(() => {
      setShowA((prev) => !prev);
    }, 1000);
    const done = window.setTimeout(() => {
      onDone();
    }, 5000);

    return () => {
      window.clearInterval(toggle);
      window.clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDone은 마운트 시점 콜백 1회만 예약
  }, []);

  return (
    <main className="relative isolate flex h-full flex-col items-center justify-center bg-green-gradient px-5 text-center">
      <BgCloud />
      <div className="flex w-[350px] max-w-full flex-col items-center gap-11">
        <div className="flex flex-col items-center gap-5">
          <h1 className="text-head1-26 font-display1 text-gray-900">
            친구들의 답변을
            <br />
            종합하는 중..
          </h1>
          <p className="text-body-18-medium text-gray-300">
            AI가 친구들의 시선으로
            <br />
            네컷을 그리고 있어요
          </p>
        </div>

        <Image
          src={
            showA
              ? "/assets/img_character_hamster_down.png"
              : "/assets/img_character_hamster_up.png"
          }
          alt=""
          aria-hidden
          width={272}
          height={334}
          priority
          className="w-[272px] max-w-full select-none"
        />
      </div>
    </main>
  );
}
