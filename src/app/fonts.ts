import localFont from "next/font/local";

/**
 * 디자인 시스템 폰트 (Figma Variables 기준)
 * - Pretendard: 본문/캡션 (body/*, caption/*) — 가변폰트 1파일로 400/500/600 커버
 * - Y SpotlightOTF: head-point1 (디스플레이, Regular)
 * - YPairingFont: head-point2 (디스플레이, Bold)
 * 웹 임베드용 woff2(한글 전체+영문+문장부호 서브셋, 한자/희귀 글리프 제외)를 `_fonts/`에 둔다.
 * 원본 otf/ttf는 레포에 두지 않음 — 글리프 범위를 바꿔 재변환하려면 디자이너에게 원본을 받아
 * fonttools pyftsubset --flavor=woff2 로 다시 생성한다.
 */

export const pretendard = localFont({
  src: "./_fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

export const ySpotlight = localFont({
  src: "./_fonts/YSpotlight-Regular.woff2",
  variable: "--font-yspotlight",
  display: "swap",
  weight: "400",
});

export const yPairing = localFont({
  src: "./_fonts/YPairingFont-Bold.woff2",
  variable: "--font-ypairing",
  display: "swap",
  weight: "700",
});
