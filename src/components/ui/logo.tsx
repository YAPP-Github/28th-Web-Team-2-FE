import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Logo — looky 워드마크 (상단 고정 로고)
 *
 * Figma 소스: fileKey TRXXVUvIwh8vh7FbBusXCO — instance "logo" (84×23.52)
 *
 * Figma 원본은 SVG/이미지 에셋이나 현재 코드엔 에셋 부재 → 텍스트 워드마크로 대체.
 *   ※ 브랜드 로고 SVG가 제공되면 이 컴포넌트 내부만 교체(호출처 무영향).
 *
 * 화면 전반에서 인라인으로 12회 반복되던 `<span>LOOKY</span>` 를 단일 소스로 통합.
 * 타이포: font-display1 + text-head1-{18,20} · 색 blue-500
 */
const logoVariants = cva("inline-block font-display1 text-blue-500 select-none", {
  variants: {
    size: {
      sm: "text-head1-18",
      md: "text-head1-20",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

function Logo({
  className,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof logoVariants>) {
  return (
    <span
      data-slot="logo"
      aria-label="looky"
      className={cn(logoVariants({ size, className }))}
      {...props}
    >
      LOOKY
    </span>
  )
}

export { Logo, logoVariants }
