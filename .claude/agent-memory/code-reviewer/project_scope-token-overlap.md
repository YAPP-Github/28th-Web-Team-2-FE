---
name: scope-token-overlap
description: globals.css의 공유 토큰은 여러 미추적 컴포넌트 작업이 동시에 의존 — 리뷰 시 함부로 제거 금지
metadata:
  type: project
---

`src/app/globals.css @theme`의 신설 토큰은 **여러 작업 스트림이 공유**한다. 한 리뷰 요청 범위(예: 아이콘+pink) 밖에 보이는 토큰(`--color-kakao`, `--radius-field`, `--radius-cta`)이라도, 다른 미추적 컴포넌트(`cta.tsx`, `cta-small.tsx`, `btn-survey.tsx`, `textfield.tsx`)가 `bg-kakao`/`rounded-field`/`rounded-cta`로 **실사용 중**이라 제거하면 sibling 작업이 깨진다.

**Why:** 컴포넌트들이 한꺼번에 untracked 상태로 작업되고 있어 globals.css 한 파일에 여러 작업의 토큰이 섞여 들어온다. 범위 일탈(conventions #4)처럼 보여도 실제론 병렬 작업의 공유 자원.

**How to apply:** 범위 밖 토큰 발견 시 자동 삭제하지 말고, grep으로 사용처를 먼저 확인. 사용처가 있으면 "이 리뷰 범위 밖(다른 컴포넌트 소관)"으로 분리해 flag만 하고 손대지 않는다. 관련: [[token-newcoinage-pattern]].
