import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ProgressBar — 진행/수집 게이지 (트랙 + 채움 바)
 *
 * Figma 소스: fileKey TRXXVUvIwh8vh7FbBusXCO — frame "progress_bar"
 *
 * 설문 진행률(survey-runner)·응답 수집 게이지(share-view)에서 중복되던
 * "트랙 + width% 채움 바" 패턴을 단일 소스로 통합.
 *
 * value(0–100)는 내부에서 clamp. 높이는 className(track) / barClassName 으로 조정.
 * role="progressbar" + aria-value* 로 접근성 노출.
 */
type ProgressBarProps = {
  /** 진행률 0–100 (범위 밖 값은 clamp) */
  value: number
  /** 트랙(배경) className — 기본 h-1.5 bg-gray-100 */
  className?: string
  /** 접근성 라벨 */
  "aria-label"?: string
}

function ProgressBar({
  value,
  className,
  "aria-label": ariaLabel,
}: ProgressBarProps) {
  const pct = Math.min(Math.max(value, 0), 100)

  return (
    <div
      data-slot="progress-bar"
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-gray-100",
        className,
      )}
    >
      <div
        role="progressbar"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-full rounded-full bg-blue-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export { ProgressBar }
