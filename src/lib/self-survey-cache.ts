import type { SubmissionStartedResponse } from "@/apis/survey/types";

// 자기 설문 진행 중 새로고침 시 POST 재호출(409) 방지용 캐시.
// surveyCode로 키를 묶어 다른 사람 설문 캐시와 섞이지 않게 한다.

const KEY = "looky.selfSurveySubmission";

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
