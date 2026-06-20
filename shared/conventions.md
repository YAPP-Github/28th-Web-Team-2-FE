# 코딩 컨벤션 (단일 진실 소스 · 도구 무관)

> Claude `CLAUDE.md` 와 Codex `AGENTS.md` 가 이 문서를 참조한다. 팀 전원·모든 도구 공통 규격.

## 최상위 불변 규칙

1. **`any` 타입 금지** — proper 타입 정의
2. **Barrel export 금지** — `index.ts` re-export 하지 않고 직접 import
3. **모바일 퍼스트** — 무프리픽스 = 모바일(sm 기준), `md:` 부터 데스크탑. 예: `p-4 md:p-6`
4. **요청한 것만 변경** — 요청에 없는 리팩토링·정리·기능 추가 금지
5. **모르면 추측 말고 질문** — 의도 불분명·자료 없음 → 멈추고 한 가지 질문으로 확인 (전역)
6. **빌드는 최종 1회만** — 중간 빌드 금지, 작업 마무리 시점에만
7. **시크릿/키 클라이언트 노출 금지** — env 비밀값을 클라이언트 번들·로그에 노출하지 않음
8. **React hooks는 early return 앞에** — 모든 hook은 조건문/early return 이전
9. **개발 서버는 개발자가 실행** — agent는 `pnpm build`(타입체크/빌드 검증)까지만. **`pnpm dev`·`pnpm start` 등 dev/서버 실행 금지** (항상 개발자가 직접 띄운다)

## 스택 (확정)

- 프론트: **Next.js + Tailwind CSS** (프론트 전용 레포)
- 백엔드: **외부 Spring (별도 레포)** — 이 레포엔 백엔드 구현 없음
- 폼: **react-hook-form + zod**
- 패키지 매니저: **pnpm**
- 테스트: **Vitest(유닛) + Playwright(E2E)**, AI-native
- 디자인: **Figma + MCP**, 토큰은 Figma Variables → Tailwind config 자동 생성
- 다국어: 안 함 (한국어 only)

## 미정 (TODO — 건드리는 작업이면 사용자에게 묻고 여기 기록)

- `TODO(✍️):` Next.js 렌더링 전략 (SSR / Server Component / BFF) → Server/Client 경계 규칙의 전제
- `TODO(✍️):` 데이터 페칭 / 상태 관리 (백엔드와 논의)
- `TODO(✍️):` 컴포넌트 라이브러리 (shadcn? 디자인 시스템 보고)
- `TODO(✍️):` PWA 웹/앱 디자인 분리 전략
