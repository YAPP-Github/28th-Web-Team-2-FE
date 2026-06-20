---
name: api-patterns
description: 프론트 API 레이어 패턴. keys/queries/mutations/types 폴더 구조, ApiError, queryKey 팩토리, Query/Mutation 훅 네이밍. api-developer/frontend-dev/code-reviewer가 참조.
---

# API 패턴

프론트 전용 레포 — 외부 Spring을 직접 호출. **백엔드를 상상하지 말고 스펙대로** (backend-api-reference 참조).

## 폴더 구조
```
apis/[domain]/
├─ keys.ts        # queryKey 팩토리 (인라인 배열 금지)
├─ queries.ts     # useGet[Resource]API
├─ mutations.ts   # use[Action][Resource]API
└─ types.ts       # Request/Response
```

## 규칙
- Query 훅: `useGet[Resource]API` / Mutation 훅: `use[Action][Resource]API`
- queryKey는 `keys.ts` 팩토리에서만 (인라인 배열 금지)
- 에러는 `ApiError` throw (not `new Error`), 타입 가드로 분기
- `any` 금지

## TODO
- `TODO(✍️):` HTTP 클라이언트 (ky/fetch/axios) — 데이터 페칭 결정과 함께 (data-fetching 참조)
