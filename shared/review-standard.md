# 리뷰 기준 (단일 진실 소스 · 도구 무관)

> code-reviewer / design-reviewer 가 따른다. 팀 전원·모든 도구가 **같은 잣대 + 같은 출력 형식**.
> Codex 사용자가 짠 코드도 이 기준으로 검토 → 도구 섞여도 품질 일원화.

## 출력 형식 (고정 템플릿 — 그대로 사용)

```
## 🔍 코드 리뷰
### 🔴 Critical (머지 전 반드시 수정)
- [파일:줄] 내용

### 🟡 Warning (권장)
- [파일:줄] 내용

### 🟢 Suggestion (선택)
- [파일:줄] 내용

### ✅ agent가 자동 수정한 항목
- [파일:줄] 내용
```

- 특정 줄 문제 → 그 줄에 인라인 코멘트, 광범위한 건 요약. severity 규격은 위와 동일.
- 컨벤션 위반은 **자동 수정할 건 수정 + 나머지는 flag.** 린트/CI로 머지 막지 않음. 대신 **빡세게.**
- 머지 차단은 **Critical만.**

## 필수 체크 항목

- `any` 타입 (conventions #1)
- barrel export (#2)
- 모바일 퍼스트 위반 — 무프리픽스 모바일/`md:` 데스크탑 (#3)
- React hooks 순서 (#8)
- **로딩 / 에러 / 빈 상태 3종** 처리 누락 (가장 자주 빠짐)
- API 네이밍 (Query: `useGet*API`, Mutation: `use[Action]*API`) — `api-patterns` 참조
- 시크릿 노출 (#7)
- 디자인: 토큰 화이트리스트 밖 raw 값·arbitrary value(`[13px]`) — `figma-bridge` 참조
  - **예외: 와이어프레임/초안 산출물은 디자인 토큰 검사 면제**(코드 규칙은 적용) — `wireframe-drafting` 참조
- 범위 일탈 — 요청에 없는 변경 (#4)

## 탐지 패턴 (Grep — 기계적 1차 검출)

- `: any` / `as any` → any 타입
- `from ['"].*/index['"]` → barrel 의심
- arbitrary value: `\[[0-9]+px\]` / raw hex `#[0-9a-fA-F]{6}` (토큰 외)
