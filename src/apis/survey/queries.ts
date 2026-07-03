import { useQuery, type Query } from "@tanstack/react-query";
import { api } from "@/apis/http";
import { surveyKeys } from "@/apis/survey/keys";
import { ApiError } from "@/apis/error";
import type {
  SurveyStatusResponse,
  SurveyResultRawResponse,
  SurveyResultResponse,
  BackendQuadrant,
  QuadrantData,
} from "@/apis/survey/types";
import { BACKEND_QUADRANT_MAP } from "@/apis/survey/types";
import type { QuadrantKey } from "@data/quadrants";

// ─── 공통 옵션 타입 ──────────────────────────────────────────────────────────

// refetchInterval은 number/false 외에, 현재 데이터를 보고 간격을 정하는 함수 형태도 허용
// (resultStatus가 터미널이면 폴링 중단 등 — TanStack Query 표준 시그니처).
interface PollOptions<T> {
  enabled?: boolean;
  refetchInterval?:
    | number
    | false
    | ((query: Query<T, ApiError>) => number | false | undefined);
}

// ─── 결과 정규화 헬퍼 ───────────────────────────────────────────────────────

function normalizeSurveyResult(raw: SurveyResultRawResponse): SurveyResultResponse {
  // READY가 아니거나 rich quadrants가 없으면 아직 결과 없음 — 빈 결과로 정규화(폴링 지속 신호)
  if (raw.resultStatus !== "READY" || !raw.quadrants) {
    return {
      surveyCode: raw.surveyCode,
      resultStatus: raw.resultStatus,
      overallKeyword: null,
      overallAnalysisTitle: null,
      overallAnalysis: null,
      actionTip: null,
      quadrants: null,
    };
  }

  const backendKeys: BackendQuadrant[] = ["OPEN", "BLIND", "HIDDEN", "UNKNOWN"];
  const quadrants = {} as Record<QuadrantKey, QuadrantData>;

  for (const backendKey of backendKeys) {
    const frontKey = BACKEND_QUADRANT_MAP[backendKey];
    // rich quadrants 우선, 없는 필드는 요약 맵(quadrantImageUrls/Interpretations)으로 fallback
    const detail = raw.quadrants[backendKey];
    quadrants[frontKey] = {
      definitionKeyword: detail?.definitionKeyword ?? null,
      adjectiveKeywords: detail?.adjectiveKeywords ?? [],
      imageUrl: detail?.imageUrl ?? raw.quadrantImageUrls?.[backendKey] ?? null,
      interpretation:
        detail?.interpretation ?? raw.quadrantInterpretations?.[backendKey] ?? null,
    };
  }

  return {
    surveyCode: raw.surveyCode,
    resultStatus: raw.resultStatus,
    overallKeyword: raw.overallKeyword,
    overallAnalysisTitle: raw.overall?.analysisTitle ?? raw.overallAnalysisTitle ?? null,
    overallAnalysis: raw.overallAnalysis,
    actionTip: raw.actionTip,
    quadrants,
  };
}

// ─── useGetSurveyStatusAPI ───────────────────────────────────────────────────

export function useGetSurveyStatusAPI(
  surveyCode: string | undefined,
  options?: PollOptions<SurveyStatusResponse>,
) {
  return useQuery<SurveyStatusResponse, ApiError>({
    queryKey: surveyKeys.status(surveyCode ?? ""),
    queryFn: () => {
      if (!surveyCode) throw new ApiError(0, "surveyCode가 없습니다.");
      return api.get<SurveyStatusResponse>(`/api/v1/surveys/${surveyCode}/status`);
    },
    enabled: !!surveyCode && options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
    // 상태 폴링 전용 오버라이드 (전역 기본값: refetchOnWindowFocus:false / IntervalInBackground:false).
    // 주 타겟이 "인스타 공유 → 앱 이탈 → 복귀" 모바일 흐름이라, 백그라운드에서 폴링이 멈추고
    // 복귀해도 재요청이 없으면 수동 새로고침 전까진 GENERATING이 갱신 안 됨 → 아래 셋을 켠다.
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // 라이브 상태이므로 항상 최신 — 전역 staleTime(60s) 상속 시 복귀 직후 재요청이 스킵됨
    staleTime: 0,
  });
}

// ─── useGetSurveyResultAPI ───────────────────────────────────────────────────

export function useGetSurveyResultAPI(
  surveyCode: string | undefined,
  options?: PollOptions<SurveyResultResponse>,
) {
  return useQuery<SurveyResultResponse, ApiError>({
    queryKey: surveyKeys.result(surveyCode ?? ""),
    queryFn: async () => {
      if (!surveyCode) throw new ApiError(0, "surveyCode가 없습니다.");
      const raw = await api.get<SurveyResultRawResponse>(
        `/api/v1/surveys/${surveyCode}/result`,
      );
      return normalizeSurveyResult(raw);
    },
    enabled: !!surveyCode && options?.enabled !== false,
    refetchInterval: options?.refetchInterval,
  });
}
