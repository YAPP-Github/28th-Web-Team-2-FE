import type { SubmissionStartedResponse } from "@/apis/survey/types";

// 자기 설문 진행 중 새로고침 시 POST 재호출(409) 방지용 캐시.
// surveyCode로 키를 묶어 다른 사람 설문 캐시와 섞이지 않게 한다.

const KEY = "looky.selfSurveySubmission";
// 자기 설문 제출 완료 표시 — 결과 페이지에서 back으로 설문에 재진입(재제출/409)하는 걸 막는다.
// 재설문 없음(domain.md) → 한 번 완료하면 영구. surveyCode로 묶어 다른 사람 설문과 섞이지 않게.
const DONE_KEY = "looky.selfSurveyDone";

interface SelfSurveyCache {
  surveyCode: string;
  data: SubmissionStartedResponse;
}

export function readSelfSurveyCache(surveyCode: string): SubmissionStartedResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as SelfSurveyCache;
    return cached.surveyCode === surveyCode ? cached.data : null;
  } catch {
    return null;
  }
}

export function saveSelfSurveyCache(surveyCode: string, data: SubmissionStartedResponse): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify({ surveyCode, data } satisfies SelfSurveyCache));
}

export function clearSelfSurveyCache(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** 자기 설문 제출 완료 표시 (제출 성공 시 호출) */
export function markSelfSurveyDone(surveyCode: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DONE_KEY, surveyCode);
}

/** 이 surveyCode의 자기 설문을 이미 제출했는지 — 설문 페이지 재진입 가드용 */
export function isSelfSurveyDone(surveyCode: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DONE_KEY) === surveyCode;
}
