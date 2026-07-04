# 1차 LLM 프롬프트 재설계 · 테스트 계획 (2026-07-04)

> 목표: **1차 LLM(서사/사분면) 호출 응답이 잘 나오는지 검증**. 이미지 생성(2차)까지는 안 감.
> 소스 진실: 프롬프트는 backend `looky-core/.../ResultPromptTemplates.java`. 이 레포엔 문서(`prompt-test.md`)만 존재 → 여기선 문서·테스트 하네스로 반복 개선 후, 확정본을 `prompt-test.md`에 반영.

## 배경 · 변경 요지

0. **`overall`(종합 분석) 개념 폐기** — keyword/analysisTitle/analysisBody/tip 전부 제거. 1차 출력 = `answerAdjectives` + `quadrants`만.
1. **2차 LLM 이미지 참조를 단일 이미지(메인 캐릭터)로 변경** — 문서 2단계 `image[]`가 base+variant 2장 → 1장. (본 작업 범위 밖, 문서만 갱신)
2. **2차 프롬프트 최종본 확정** — `prompt-test.md`의 "최종 2차 LLM 프롬프트"가 진실 소스. `[변수]` 6개가 카드별로 달라짐:
   - 상황/감정 · 시선 · 포즈 · 소품 · 배경 · 조명·톤
3. **1차 LLM JSON 재설계** — 기존 `imagePrompt`(영어 1줄) → **한국어 6변수 객체 `image`**로 교체. 2차 `[변수]`에 그대로 주입.
4. **텍스트 규격 업데이트(디자이너 요구 — quadrants에 적용)**:
   - `oneLineDefinition`(한줄 정의): 이름 수식어 `~하는` 형태(형용사/동사 활용, 행동·성향).
   - `definitionKeyword`(세부 유형 명): 명사형 유지, 띄어쓰기 허용.
   - `interpretation`(세부 유형 본문): `~요` 체 어미 통일, **공백 포함 70~90자**.

## 확정 가정 (사용자 부재 → 기본값, 복귀 시 조정 가능)
- Q1: **신규 필드 추가안** — `definitionKeyword`(명사) 유지 + `oneLineDefinition`(수식어) 신규. 기존 FE 비파괴.
- Q2: **6변수 완전 교체** — 영어 imagePrompt 제거.
- Q3: 모델 = **gpt-5.4-mini** (접근 확인 완료).

## 사분면별 JSON (재설계)
```
"OPEN": {
  "definitionKeyword": "겁 없는 탐험가",          // 세부 유형 명 (명사·띄어쓰기 O)
  "oneLineDefinition": "세상을 겁없이 누비는",     // 한줄 정의 (~하는 수식어)
  "adjectiveKeywords": ["일단 저지르고 봐", "..."],// 정확히 2개
  "interpretation": "...요.",                      // 세부 유형 본문 (~요체, 70~90자)
  "image": {
    "situationEmotion": "...",  // 상황/감정
    "gaze": "...",              // 시선
    "pose": "...",              // 포즈
    "props": "...",             // 소품
    "background": "...",        // 배경
    "lightingTone": "..."       // 조명·톤
  }
}
```

## 테스트 하네스
- `prompt-1st-system.txt` — 재설계된 1차 시스템 프롬프트(원본 유지 후 quadrants만 개편).
- `fixtures.json` — 샘플 설문(SELF 8 + FRIEND 보강 → 조하리 대비 검증용).
- `run.mjs` — Responses API(json_schema strict) 호출 → 구조 검증 + 글자수/어미/개수 규칙 자동 점검 리포트.
- env: scratchpad `.env`(레포 밖)에서 `OPENAI_API_KEY` 주입.

## 실행 순서
1. `run.mjs` 실행 → 출력 + 규칙 위반 리포트.
2. 위반(글자수 초과/어미/수식어형 등) 확인 → 프롬프트 문구 조정 → 재실행.
3. 안정화되면 `prompt-test.md` 1단계 섹션을 확정본으로 갱신 + 2단계 `[변수]` 주입 방식 명시.

## 보안
- 채팅에 노출된 API 키는 **폐기 권장**. 테스트는 노출 키를 scratchpad(.env, 레포 밖)에서만 사용, 코드/커밋에 하드코딩 안 함.
