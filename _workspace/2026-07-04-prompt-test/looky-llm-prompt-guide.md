# looky 결과 생성 LLM 프롬프트 — 백엔드 갱신 가이드 (2026-07-04)

> **대상**: 백엔드(외부 Spring). 결과 생성 파이프라인 프롬프트를 이 문서 기준으로 전면 갱신.
> **적용 위치**: 1단계 `ResultPromptTemplates.java` / 2단계 `ResultGenerationService.buildReferenceAwareImagePrompt()`.
> **호출**: OpenAI · 2단계. (1) 사분면 텍스트 생성 → (2) 사분면별 이미지 생성.
> 이 문서는 **자기완결형**입니다. 프롬프트 전문·JSON 스키마·검증 규칙·샘플 입출력이 모두 포함됨.

---

## 0. 변경 개요 (Before → After)

| 항목 | 변경 전 | 변경 후 |
| --- | --- | --- |
| **`overall` 블록** | `keyword / analysisTitle / analysisBody / tip` 출력 | **전면 삭제** (종합 분석 개념 폐기) |
| **1단계 출력 최상위 키** | `overall, answerAdjectives, quadrants` | **`answerAdjectives, quadrants`** |
| **사분면 필드** | `definitionKeyword, adjectiveKeywords, interpretation, imagePrompt` | `definitionKeyword, **oneLineDefinition(신규)**, adjectiveKeywords, interpretation, **image(신규)**` |
| **`imagePrompt` (영어 1줄)** | 존재 | **삭제** → 한국어 `image` 6변수 객체로 대체 |
| **`interpretation` 규격** | 별도 규격 없음 | **`~요`체 통일 · 공백 포함 70~90자** |
| **`definitionKeyword`** | 캐릭터명 명사 | 동일(세부 유형 명) — 띄어쓰기 허용 명시 |
| **2단계 참조 이미지** | `image[]` = base + variant **2장** | **메인 캐릭터 1장** |
| **2단계 프롬프트 본문** | 기존 서술형 | **최종본으로 교체**(캐릭터 동결/프레이밍/색/제약 블록 + `[변수]`) |

> ⚠️ **응답 계약 변경(프론트 영향)**: `overall.*` 필드 제거로 FE 결과 DTO/렌더가 깨질 수 있음. FE와 동시 배포 필요 — 8절 참조.

---

## 1. 1단계 — 사분면(quadrants) 생성 · 텍스트

- **모델**: `gpt-5.4-mini` (config `looky.result-generation.narrative-model`)
- **API**: OpenAI Responses API, 구조화 출력 `text.format = json_schema` (strict)
- **호출부**: `OpenAiResultNarrativeClient.generate()`

### 1-A. 시스템 프롬프트 (instructions) — 전문

```
너는 한국어 조하리 윈도우 결과 문구 생성기다. 입력된 completed survey answers를 바탕으로 결과 JSON만 출력하라. 설명, 머리말, 주석, 코드펜스 밖 텍스트는 절대 출력하지 마라.

반드시 지킬 공통 규칙:
- 출력은 JSON only.
- 출력 최상위 키 순서는 반드시 `answerAdjectives`, `quadrants`다.
- `answerAdjectives`는 입력의 모든 `submissionAnswerId`를 정확히 1번씩 포함해야 한다.
- `expectedSubmissionAnswerIds`의 개수와 `answerAdjectives`의 개수는 반드시 같아야 한다.
- 누락, 중복, 병합, 재번호부여, 신규 ID 생성 금지.
- `submissionAnswerId`가 같아 보이거나 답변이 비슷해도 절대 합치지 말고, 입력 순서대로 각 행을 그대로 분리해 출력한다.
- 이름, 원문 답변, 민감 정보는 어떤 필드에도 쓰지 않는다.
- 해석은 입력 답변에서만 근거를 뽑고, 과장된 진단이나 낙인 표현은 피한다. 부정 신호는 매력적이거나 중립적인 표현으로 환원한다.
- JSON 출력 전 내부적으로 자체 점검한다. 점검 결과는 출력하지 않는다.

quadrants 규칙:
- `quadrants`는 반드시 `OPEN`, `BLIND`, `HIDDEN`, `UNKNOWN` 순서로 작성한다.
- 각 quadrant마다 아래 6개 필드를 반드시 채운다.

  1) `definitionKeyword` (세부 유형 명): 캐릭터명 느낌의 짧은 명사구 1개.
     - 명사형으로 끝낸다. 띄어쓰기 허용(예: `겁 없는 탐험가`, `계획형 완벽러`).
     - 닉네임, 원문 답변, 이름을 포함하지 않는다.

  2) `oneLineDefinition` (한줄 정의): 이름 앞에 붙는 수식어 1개.
     - 행동이나 성향을 나타내는 형용사 또는 동사를 활용한다.
     - 반드시 관형형 어미(`~하는`, `~한`, `~는`, `~던` 등)로 끝낸다. 명사로 끝내지 않는다.
     - 닉네임을 포함하지 않는다. (화면에서 `{oneLineDefinition} {닉네임}` 으로 이어 붙는다. 예: `세상을 겁없이 누비는` → "세상을 겁없이 누비는 송이")

  3) `adjectiveKeywords`: 정확히 2개. `탐험 실험 다 좋아 인간`, `새로운 거? 무조건 해봐야지` 같은 말맛.
     - 가능하면 명사형으로 끝내고, 동사면 반말형으로 끝낸다.
     - 아래 예시 bank의 말맛·리듬을 최대한 반영하되, 입력 근거와 맞는 표현만 사용한다.

  4) `interpretation` (세부 유형 본문): 해당 사분면의 의미를 선명하게 설명하는 본문.
     - 모든 문장의 어미를 `~요` 체로 통일한다.
     - 공백 포함 최소 70자, 최대 90자. 90자를 넘기지 않는다. 애매하면 80자 안팎으로 맞춘다.

  5) `image`: 2단계 이미지 생성 프롬프트의 [변수] 6개. 모두 한국어 자연어 구로 작성한다.
     - `situationEmotion`(상황/감정), `gaze`(시선), `pose`(포즈), `props`(소품), `background`(배경), `lightingTone`(조명·톤).
     - 이 사분면의 성향/무드가 한눈에 드러나는 하나의 장면으로 구성한다.
     - 캐릭터(흰 햄스터) 자체의 이목구비·체형·색은 묘사하지 않는다. 상황·시선·포즈·소품·배경·조명만 쓴다.
     - 소품은 최소화(1~2개, 개수 명시). 배경은 "큰 면 위주 단순 구성"으로.
     - 다른 인물/캐릭터는 그리지 않는다(필요하면 "프레임 밖"으로 처리). 텍스트·하트·별·반짝이 금지.

adjectiveKeywords 예시 bank:
- 일단 저지르고 봐
- 디테일 집착
- 새로운 곳 좋아
- 텐션 담당
- 혼자가 편해
- 계획보다 즉흥
- 마이웨이가 최고
- 한 번 꽂히면 끝장
- 귀찮은 거 질색
- 분위기 메이커
- 챙겨주는 거 좋아해
- 완벽주의
- 하고 싶은 건 해야 해
- 사람 잘 챙기기 1순위
- 끝맺음 확실한 사람
- 하나에 푹 빠지는 타입
- 계획표 못 버려

image 필드 few-shot 예시 (형식·길이·톤 참고용 — 아래 리듬을 최대한 따른다):

예시 A (정적·이완):
  situationEmotion: 나른한 오후 창가에서 스르르 잠드는 편안한 순간
  gaze: 눈은 레퍼 그대로, 시선은 살짝 아래로 내려 나른하게
  pose: 푹신한 방석에 몸을 웅크리고 기대 앉아 이완, 고개 살짝 기울임
  props: 작은 담요 1
  background: 밝은 방 창가, 부드러운 미색 벽 — 큰 면 위주 단순 구성
  lightingTone: 따뜻한 오후 햇살, 미색·크림톤으로 통일, 포근하고 나른하게

예시 B (활동적·야외):
  situationEmotion: 바람 맞으며 자전거를 타는 상쾌하고 활기찬 순간
  gaze: 정면을 향해 시원하게 앞을 봄
  pose: 작은 자전거에 올라 페달을 밟으며 앞으로 나아가는 자세
  props: 작은 자전거 1
  background: 화창한 강변길, 완만한 초록 둔치와 하늘 — 큰 면 위주 단순 구성
  lightingTone: 맑은 낮 하이키, 산뜻한 하늘색·초록으로 통일, 상쾌하게

예시 C (사교·다른 인물은 프레임 밖):
  situationEmotion: 친구들과 둘러앉아 게임을 즐기는 왁자한 순간
  gaze: 화면 옆쪽(테이블 위)을 흥미롭게 바라봄
  pose: 테이블 앞에 앉아 한 손으로 게임 말을 옮기려는 자세, 상체 기울임
  props: 보드게임판 1, 카드 몇 장
  background: 아늑한 실내 모임 자리, 따뜻한 벽 — 큰 면 위주 단순. 다른 인물은 프레임 밖
  lightingTone: 따뜻한 저녁 실내광, 앰버·미색으로 통일, 화기애애하게

반환 JSON 형식:
{
  "answerAdjectives": [
    { "submissionAnswerId": 123, "adjectives": ["...", "..."] }
  ],
  "quadrants": {
    "OPEN": {
      "definitionKeyword": "...",
      "oneLineDefinition": "...",
      "adjectiveKeywords": ["...", "..."],
      "interpretation": "...",
      "image": {
        "situationEmotion": "...",
        "gaze": "...",
        "pose": "...",
        "props": "...",
        "background": "...",
        "lightingTone": "..."
      }
    },
    "BLIND": { "동일 구조" },
    "HIDDEN": { "동일 구조" },
    "UNKNOWN": { "동일 구조" }
  }
}
```

### 1-B. 유저 입력 프롬프트 — `composeNarrativeInput()`

전체 골격 (`%s` = expectedSubmissionAnswerIds 목록, answer 블록):

```
expectedSubmissionAnswerIds:
%s

completed survey answers:
- 각 입력 행은 서로 독립이다.
- `submissionAnswerId`가 다른 행은 답변 내용이 비슷해도 절대 합치지 않는다.
- `answerAdjectives`는 `expectedSubmissionAnswerIds`와 같은 개수, 같은 순서로 1:1 대응해야 한다.
%s
```

answer 블록 1개 형식 (답변마다 반복):

```
submissionAnswerId: %d
respondentLabel: %s
submitterType: %s
traitCode: %s
question: %s
answer: %s
```

### 1-C. 구조화 출력 JSON Schema (Responses API `text.format`, strict)

```json
{
  "type": "json_schema",
  "name": "looky_quadrants",
  "strict": true,
  "schema": {
    "type": "object",
    "additionalProperties": false,
    "required": ["answerAdjectives", "quadrants"],
    "properties": {
      "answerAdjectives": {
        "type": "array",
        "items": {
          "type": "object",
          "additionalProperties": false,
          "required": ["submissionAnswerId", "adjectives"],
          "properties": {
            "submissionAnswerId": { "type": "integer" },
            "adjectives": { "type": "array", "items": { "type": "string" } }
          }
        }
      },
      "quadrants": {
        "type": "object",
        "additionalProperties": false,
        "required": ["OPEN", "BLIND", "HIDDEN", "UNKNOWN"],
        "properties": {
          "OPEN":    { "$ref": "#/$defs/quadrant" },
          "BLIND":   { "$ref": "#/$defs/quadrant" },
          "HIDDEN":  { "$ref": "#/$defs/quadrant" },
          "UNKNOWN": { "$ref": "#/$defs/quadrant" }
        }
      }
    },
    "$defs": {
      "quadrant": {
        "type": "object",
        "additionalProperties": false,
        "required": ["definitionKeyword", "oneLineDefinition", "adjectiveKeywords", "interpretation", "image"],
        "properties": {
          "definitionKeyword": { "type": "string" },
          "oneLineDefinition": { "type": "string" },
          "adjectiveKeywords": { "type": "array", "items": { "type": "string" } },
          "interpretation": { "type": "string" },
          "image": {
            "type": "object",
            "additionalProperties": false,
            "required": ["situationEmotion", "gaze", "pose", "props", "background", "lightingTone"],
            "properties": {
              "situationEmotion": { "type": "string" },
              "gaze": { "type": "string" },
              "pose": { "type": "string" },
              "props": { "type": "string" },
              "background": { "type": "string" },
              "lightingTone": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

> `$ref`/`$defs`를 쓰지 않는 클라이언트라면 `quadrant` 정의를 OPEN/BLIND/HIDDEN/UNKNOWN에 그대로 인라인 복제.

### 1-D. 필드 규격 요약

| 필드 | 규격 | 화면 용도 |
| --- | --- | --- |
| `definitionKeyword` | 세부 유형 명. 명사형, 띄어쓰기 허용 | 카드 유형 라벨 |
| `oneLineDefinition` | 한줄 정의. 관형형(`~하는/한/는/던`)으로 끝, 명사 X, 닉네임 X | 카드 제목 = `{정의} {닉네임}` |
| `adjectiveKeywords` | 정확히 2개, 말맛 | 형용사 칩 |
| `interpretation` | `~요`체 통일, 공백 포함 70~90자 | 본문 |
| `image.*` | 한국어 6변수, 캐릭터 묘사 제외 | 2단계 [변수]로 주입 |
| `answerAdjectives` | expectedSubmissionAnswerIds와 1:1(개수·순서), ID 병합·신규 금지 | 내부 근거 |

---

## 2. 2단계 — 사분면 이미지 생성 · 이미지 편집(image-to-image)

- **모델**: `gpt-image-2` (config `looky.result-generation.image-model`)
- **API**: `POST https://api.openai.com/v1/images/edits` (multipart)
- **파라미터**: `quality=low`, `output_format=png`, `n=1`, `image[]` = **메인 캐릭터 참조 PNG 1장** (기존 base+variant 2장에서 단일화)
- 컷(사분면)마다 아래 프롬프트로 1장씩 생성 (OPEN/BLIND/HIDDEN/UNKNOWN)

### 2-A. `[변수]` 주입 매핑 (1단계 → 2단계)

2단계 프롬프트의 `[이번 카드 — 변수]` 6줄은 **1단계 `image` 객체**에서 채운다.

| 2단계 [변수] 라벨 | 1단계 `image` 필드 |
| --- | --- |
| 상황/감정 | `situationEmotion` |
| 시선 | `gaze` |
| 포즈 | `pose` |
| 소품 | `props` |
| 배경 | `background` |
| 조명·톤 | `lightingTone` |

### 2-B. 최종 2차 프롬프트 (고정부 + 변수 — `buildReferenceAwareImagePrompt()`)

```
[캐릭터 — 절대 동결 / DO NOT ALTER]
Reference 이미지 = 이 햄스터의 디자인 기준(character sheet). 이목구비·비율·색·재질을 재해석하지 말고 100% 동일하게 재현.
눈: 레퍼의 크기·형태·간격·위치 그대로. 유광 블랙. (크게/반짝/변형 금지)
코: 작은 분홍. 귀: 위치·크기·안쪽 핑크 유지.
두상/얼굴 비율, 뺨 둥근 정도 유지. 체형: 둥근 몸, 손가락 없는 짧은 팔, 짧은 다리. 흰색 무광.
입: 검정 윤곽선 없이 안쪽이 분홍인 벌린 입 (항상 이 형태, 검정 라인 두르지 말 것).
바꾸는 건 오직 포즈·시선·소품·배경뿐. 얼굴 구조는 레퍼 그대로.

[프레이밍 — 고정]
세로 포트레이트. 캐릭터 중앙에 크게, 약간 여백(하단 라벨 자리). 이목구비 중심 세로 ~50%.

[색/스타일 — 고정]
중채도 발랄+차분 톤, 무드에 맞춰 팔레트 통일. 부드러운 3D 렌더. 귀엽지만 담백.

[제약 — 고정]
과한 파스텔 도배 금지. 하트·별·반짝이·낙서 금지. 눈·입 형태 변경 금지. 벌린 입에 검정 라인 금지.
다른 인물·캐릭터 그리지 말 것. 배경 복잡·디테일 과다 금지(군중·잡동사니 없음). 명시 안 된 소품 금지. 텍스트·워터마크·테두리 금지.

[이번 카드 — 변수]   ← 1단계 image 객체에서 주입 (2-A 매핑)
상황/감정: {situationEmotion}
시선: {gaze}
포즈: {pose}
소품: {props}
배경: {background}
조명·톤: {lightingTone}
```

---

## 3. 서버측 자체검증 규칙 (LLM 출력 검수·재요청 트리거 권장)

strict 스키마로 구조는 보장되지만 아래 **의미 규칙**은 스키마로 못 잡으므로 서버에서 점검 후 위반 시 재요청 권장.

- `answerAdjectives` 개수 == `expectedSubmissionAnswerIds` 개수, ID 집합 완전 일치(누락·신규·중복 없음).
- 각 사분면 `interpretation`: **공백 포함 70~90자**, 모든 문장 어미가 `~요`로 끝남(`~다/음/네/습니다` 등 금지).
- 각 사분면 `oneLineDefinition`: 관형형 어미(`하는/한/는/운/던` 등)로 끝, 명사·닉네임 미포함.
- 각 사분면 `adjectiveKeywords`: 정확히 2개.
- 각 사분면 `image.*` 6필드 모두 비어있지 않음, 영어 단어 미혼입(한국어 자연어 구).
- `quadrants` 키 순서 `OPEN → BLIND → HIDDEN → UNKNOWN`.

---

## 4. 데이터 부족(친구 응답 적음) 처리 — 정책 확인 필요

`domain.md` 기준 24h·응답 3건 미달 시 결과 미생성. 다만 **친구 응답이 0~2건**이면 `BLIND`/`OPEN`(친구 근거 필요)의 사실 기반이 약해 LLM이 지어낼 위험.

- 권장: 내용 없는 칸은 1단계에서 채우지 말고(또는 서버가 스킵), **고정 이미지(안개·물음표) + 재참여 유도**로 대체(`product-spec.md` §6).
- `TODO(백엔드 확인)`: "내용 없는 칸" 판단을 1단계 LLM에 위임할지, 서버가 응답 구성으로 결정할지.

---

## 5. 참고 — 검증된 샘플 입출력 1건

**입력**: 본인 8문항 + 친구 6문항(traitCode O/C/E/A 분포). 상세 픽스처는 `_workspace/2026-07-04-prompt-test/fixtures.json`.

**출력 (gpt-5.4-mini · 입력 3,113 / 출력 1,531 토큰 · 규칙 위반 0)**

| 칸 | 세부 유형 명 | 한줄 정의 | 본문 요약 |
| --- | --- | --- | --- |
| OPEN | 신중한 관찰가 | 세상을 천천히 살피는 | 바로 뛰기보다 살피고 때를 기다림 |
| BLIND | 무대 체질인 사람 | 막상 하면 반짝해내는 | 본인은 부담이지만 남 앞에선 잘 해냄 |
| HIDDEN | 속마음 지키는 사람 | 속으론 계산하며 아끼는 | 겉은 무난, 속은 손해 줄이려 함 |
| UNKNOWN | 즉흥 돌파형 | 생각보다 바로 움직이는 | 흐름에 맞춰 움직일 때 힘이 남 |

칸별 카피·이미지 6변수·2차 완성 프롬프트 전문 → `_workspace/2026-07-04-prompt-test/design-review.md`.
재현 하네스(입력 구성·API 호출·검증) → 같은 폴더 `run.mjs` / `prompt-1st-system.txt`.

---

## 6. 백엔드 체크리스트

- [ ] `ResultPromptTemplates.NARRATIVE_INSTRUCTIONS` → 1-A 전문으로 교체 (overall 규칙 삭제, quadrants 6필드).
- [ ] 구조화 출력 스키마 → 1-C로 교체(overall 제거, `oneLineDefinition`·`image` 추가).
- [ ] 응답 DTO/파싱에서 `overall.*` 제거, `oneLineDefinition`·`image` 매핑 추가.
- [ ] `buildReferenceAwareImagePrompt()` → 2-B로 교체, `%s`(영어 imagePrompt) 주입 제거 → `image` 6변수 주입.
- [ ] 2단계 `image[]` 참조 이미지 **1장(메인 캐릭터)**으로 변경.
- [ ] 3절 자체검증 로직 추가(선택이지만 권장).
- [ ] 4절 데이터 부족 정책 프론트와 합의.
- [ ] **응답 계약 변경이므로 FE와 동시 배포** (`overall` 소비처 정리 완료 후).

---

## 7. config 요약

| 키 | 값 |
| --- | --- |
| `looky.result-generation.narrative-model` | `gpt-5.4-mini` |
| `looky.result-generation.image-model` | `gpt-image-2` |
| 1단계 API | `POST /v1/responses` (`text.format=json_schema`, strict) |
| 2단계 API | `POST /v1/images/edits` (multipart, `quality=low`, `n=1`, `image[]`×1) |
