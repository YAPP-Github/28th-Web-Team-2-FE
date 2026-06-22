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

- 프론트: **Next.js (App Router) + Tailwind CSS v4** (프론트 전용 레포)
- 백엔드: **외부 Spring (별도 레포)** — 이 레포엔 백엔드 구현 없음
- **렌더링 전략 (확정 2026-06-22)**: **BFF·SSR·Server Component 안 씀.** 화면은 **클라이언트 컴포넌트** 중심, 서버 상태는 **TanStack Query**로 관리(CSR). → Server/Client 경계 고민 최소화. (예외가 필요해지면 이 줄을 갱신)
- **데이터 페칭/상태 (확정 2026-06-22)**: **TanStack Query**(서버 상태) + **native fetch 래퍼**(HTTP 클라이언트, `ApiError` throw). 전역 클라이언트 상태 도구는 필요해질 때 결정. → `api-patterns`·`data-fetching` 참조
- **컴포넌트 라이브러리 (확정 2026-06-22)**: **shadcn/ui**로 초안 → 추후 자체 디자인 시스템으로 확장. (토큰 진실 소스는 Figma — `design-guide.md §0`)
- 폼: **react-hook-form + zod**
- 패키지 매니저: **pnpm**
- 테스트: **Vitest(유닛) + Playwright(E2E)**, AI-native. **E2E(Playwright)는 추후 도입** — 초기엔 Vitest 위주.
- **PWA (확정 2026-06-22)**: **Serwist**(`@serwist/next`)로 패키징 — 서비스워커 + 매니페스트 + 오프라인 캐싱. **알림(Web Push) 발송 가능성**을 열어두기 위함. 웹/앱 디자인 분리 전략은 추후.
- 디자인: **Figma + MCP**, 토큰은 Figma Variables → Tailwind config 자동 생성
- 다국어: 안 함 (한국어 only)

## 미정 (TODO — 건드리는 작업이면 사용자에게 묻고 여기 기록)

- `TODO(✍️):` PWA 웹/앱 디자인 분리 전략 (패키징은 Serwist로 결정 — 디자인 분리만 미정)
- `TODO(✍️):` 전역 클라이언트 상태 관리 도구 (zustand 등 — 필요해질 때)
