# looky 결과 생성 프롬프트 규격 (원본 파일)

리소스에 그대로 넣는 프롬프트 자산 원본. 설명·배경은 상위 폴더 `looky-llm-prompt-guide.md` 참조.

## 파일 목록

| 파일 | 역할 | 투입 위치 |
| --- | --- | --- |
| `1_narrative.system.txt` | 1단계 시스템 프롬프트(instructions) 전문 | Responses API `instructions` |
| `1_narrative.user-input.template.txt` | 1단계 유저 입력 골격. `%s` 2개 = ①expectedSubmissionAnswerIds 목록 ②answer 블록 join | Responses API `input` |
| `1_narrative.answer-block.template.txt` | answer 1건 포맷. `%d`,`%s` = 답변 필드. 답변마다 반복 후 `\n\n`으로 join → 위 템플릿 2번째 `%s`에 삽입 | 〃 |
| `1_narrative.output.schema.json` | 1단계 구조화 출력 스키마(strict) | Responses API `text.format` |
| `2_image.prompt.template.txt` | 2단계 이미지 프롬프트. `{...}` 6개 = 1단계 `image` 필드 | images/edits `prompt` |

## 모델 / API

- 1단계: `gpt-5.4-mini` · `POST /v1/responses` (`text.format` = 위 schema, strict)
- 2단계: `gpt-image-2` · `POST /v1/images/edits` (multipart, `quality=low`, `output_format=png`, `n=1`, `image[]` = 메인 캐릭터 참조 PNG **1장**)
- 2단계는 사분면(OPEN/BLIND/HIDDEN/UNKNOWN)마다 1장씩, 각 카드의 `image` 6필드를 템플릿 `{...}`에 치환해 호출.

## 플레이스홀더 치환

`2_image.prompt.template.txt`

| 템플릿 토큰 | 1단계 출력 필드 |
| --- | --- |
| `{situationEmotion}` | `quadrants.<KEY>.image.situationEmotion` |
| `{gaze}` | `quadrants.<KEY>.image.gaze` |
| `{pose}` | `quadrants.<KEY>.image.pose` |
| `{props}` | `quadrants.<KEY>.image.props` |
| `{background}` | `quadrants.<KEY>.image.background` |
| `{lightingTone}` | `quadrants.<KEY>.image.lightingTone` |

## 참고

- 스키마로 못 잡는 의미 규칙(interpretation 70~90자·`~요`체, oneLineDefinition 관형형, adjectiveKeywords 2개, answerAdjectives ID 1:1)은 서버 자체검증 권장 → 상위 가이드 3절.
- `overall`(종합 분석) 필드는 폐기됨 — 이 규격에는 존재하지 않음.
