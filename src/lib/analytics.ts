// 믹스패널 트래킹 래퍼 — KPI 검증(1차 마케팅 실험)용.
// 토큰 미설정(로컬 등) 시 초기화·트래킹 모두 조용히 무시 — 개발 환경에서 에러 없이 동작.
import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let initialized = false;

/** 앱 최초 마운트 시 1회 호출 (providers.tsx). */
export function initAnalytics(): void {
  if (initialized || !MIXPANEL_TOKEN) return;
  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
  });
  initialized = true;
}

/** 커스텀 이벤트 트래킹. 이벤트명 목록은 각 페이지 주석 참조. */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!initialized) return;
  mixpanel.track(event, properties);
}
