---
name: nextjs-app-router
description: Next.js App Router best practice — 단, 외부 Spring+httpOnly 환경 기준. Server/Client 경계를 공식 기본과 우리 제약 사이에서 판단. frontend-dev/code-reviewer/planner가 참조.
---

# Next.js App Router (Spring-aware)

> 출처: nextjs.org/docs (Server/Client Components). **공식 기본 = Server Component.**
> 하지만 우리는 **외부 Spring + httpOnly 인증** → 공식 가이드를 그대로 따르지 않는다. 아래 트레이드오프로 판단.

## 공식 기본 (사실)
- layout/page 기본은 **Server Component**.
- **Server 적합**: DB/API를 소스 가까이서 fetch, 시크릿(API 키) 숨김, JS 전송량↓, FCP↑/스트리밍
- **Client 적합**(`'use client'`): state·이벤트(onClick), `useEffect` 등 lifecycle, 브라우저 API(localStorage/window), 커스텀 훅, Context
- `'use client'`는 **경계** — 그 파일의 import·직접 렌더 컴포넌트가 클라 번들에 포함
- 시크릿: `NEXT_PUBLIC_` 안 붙은 env는 클라 번들에서 빈 문자열. 서버 전용은 `server-only` 패키지로 보호

## 우리 제약에서의 판단 (외부 Spring + httpOnly)
공식이 "무조건 Server"라 해도 우리 환경에선 다음을 저울질한다:
- **인증**: httpOnly 쿠키는 Server에서 `cookies()`로 읽어 Spring 호출 가능(SSR 가능). 단 클라 상호작용·캐싱(서버상태 라이브러리)을 쓰면 Client가 단순해짐.
- **상호작용·개인화 데이터**: 대부분 Client (state/이벤트/캐싱). → 페이지가 인터랙티브하면 Client 기본이 합리적인 경우 많음.
- **Server가 유리한 곳**: 정적 공개 페이지, `generateMetadata`(SEO), 정적 영역 JS 감축.

## 결정 (TODO)
- `TODO(✍️):` **렌더링 전략 확정**(SSR / Server Component 기본 / BFF 여부) — planner와 토론.
  - 정해지면 "기본은 Server냐 Client냐 + 판단 기준"을 여기 명시하고 code-reviewer 체크에 반영.
- `TODO(✍️):` API Route 용도 (BFF로 쓸지, webhook/metadata 정도만 쓸지)

## 공통 규칙
- 시크릿 클라 노출 금지 (`server-only`, `NEXT_PUBLIC_` 규칙)
- Provider는 트리 깊숙이 (정적 Server 부분 최적화 유지)
- 클라 번들 줄이려 인터랙티브 컴포넌트에만 `'use client'`
