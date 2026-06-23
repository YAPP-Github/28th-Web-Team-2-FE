// [더미] 결과물(인생네컷) 데이터 (와이어프레임 초안).
// 정식은 서버 AI 파이프라인이 본인·친구 답변에서 형용사 추출 → 조하리 4칸 배정 → 이미지/설명문 생성
// (domain.md §2 결과 산출, 기획.md 4-2~4-5). 여기선 리뷰용 더미.

import { type QuadrantKey } from "./quadrants";

export interface Quadrant {
  key: QuadrantKey;
  /** 칸 섹션 제목 (형용사대표 + nickname 형, 예 "탐험가 송이"). TODO(✍️): 정식은 AI 생성 필드. */
  title: string;
  /** 이 칸의 형용사/대표 표현 (긍정·중립만 — domain.md §1) */
  adjectives: string[];
  /** 칸 설명문 */
  description: string;
  /** ④처럼 내용 없는 빈 칸이면 고정 이미지로 대체 (product-spec #6) */
  empty?: boolean;
}

export interface DummyResult {
  nickname: string;
  /** 날짜 포맷 "2026. 06. 23" (Figma F05 캡션 스타일) */
  createdAt: string;
  /** 종합 분석 헤드라인 (성향 점수·수치 노출 금지 — domain.md §1). Figma 네컷 하단 캡션용("마음을 잘 여는 송이"). */
  headline: string;
  /** 종합분석 타이틀 그룹 2번째 줄 — 닉네임을 "사람"으로 치환한 형(Figma: "마음을 잘 여는 사람"). TODO(✍️): 정식은 AI 생성 필드. */
  headlinePhrase: string;
  /** 종합 분석 카드 강조 첫 줄 (Figma: "다정함 100프로, 모든 사람들에게 '편한 사람'"). TODO(✍️): 정식은 AI 생성 필드. */
  summaryTitle: string;
  summary: string;
  quadrants: Quadrant[];
  /** "이렇게 해봐요!" 팁 (Figma B-6 카피) */
  tip: string;
  /** 응답해준 친구 수 */
  respondentCount: number;
}

export const DUMMY_RESULT: DummyResult = {
  nickname: "송이",
  createdAt: "2026. 06. 23",
  headline: "마음을 잘 여는 송이",
  headlinePhrase: "마음을 잘 여는 사람",
  summaryTitle: "다정함 100프로, 모든 사람들에게 '편한 사람'",
  summary:
    "송이님은 ‘열린 나’가 절반을 차지할 만큼 자신을 자연스럽게 드러내는 사람이에요. 다정함과 성실함의 주변에 잘 스며들고, 처음 보는 사람에게도 ‘맏언니 같은’ 편안함을 줘요.",
  quadrants: [
    {
      key: "open",
      title: "탐험가 송이",
      adjectives: ["탐험 실험 다 좋아 인간", "새로운 거? 무조건 해봐야지"],
      description:
        "나도 알고 친구도 아는 모습. 새로운 걸 즐기고 먼저 나서는 에너지가 모두에게 보여요.",
    },
    {
      key: "blind",
      title: "챙김왕 송이",
      adjectives: ["은근 챙김왕", "분위기 메이커"],
      description:
        "나는 잘 몰랐지만 친구들이 본 모습. 곁을 살뜰히 챙기는 다정함이 자주 보였대요.",
    },
    {
      key: "hidden",
      title: "계획파 송이",
      adjectives: ["혼자만의 시간을 아는", "신중한 계획파"],
      description:
        "친구들은 잘 모르는, 나만 아는 모습. 혼자 정리하는 시간에서 힘을 얻어요.",
    },
    {
      key: "unknown",
      title: "아직 모르는 송이",
      adjectives: [],
      description:
        "아직 너를 다 발견하지 못했어 — 다른 사람들에게도 물어보면 새로운 칸이 채워져요.",
      empty: true,
    },
  ],
  tip: "혼자 끌어안은 완벽주의를, 가까운 사람에게 한 번쯤 꺼내 보세요. ‘숨겨진 나’가 ‘열린 나’로 옮겨갈수록 관계는 더 깊어지고, 당신도 한결 가벼워질 거예요.",
  respondentCount: 5,
};
