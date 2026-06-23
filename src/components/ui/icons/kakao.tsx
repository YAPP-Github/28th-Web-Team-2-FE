import type { SVGProps } from "react"

import { cn } from "@/lib/utils"

// 카카오 심볼 (말풍선) — 브랜드 SVG 에셋 부재로 직접 제작한 대체 아이콘.
// 색은 currentColor 상속(카카오 버튼 텍스트색 gray-900). 공식 심볼 제공 시 교체 요망.
function KakaoIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <path
        d="M12 3.6C6.91 3.6 2.79 6.86 2.79 10.88c0 2.6 1.74 4.88 4.36 6.16-.19.69-.69 2.5-.79 2.89-.12.48.18.48.37.35.15-.1 2.39-1.62 3.36-2.28.62.09 1.26.14 1.91.14 5.09 0 9.21-3.26 9.21-7.28S17.09 3.6 12 3.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

export { KakaoIcon }
