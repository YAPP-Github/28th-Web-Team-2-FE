---
name: backend-api-reference
description: 외부 Spring API 문서/스펙 읽는 법. 프론트 API 레이어가 백엔드에 정확히 맞추도록. api-developer가 참조.
---

# 백엔드 API 레퍼런스 (외부 Spring)

백엔드는 **별도 레포의 Spring.** 이 레포엔 백엔드 구현이 없다. 프론트는 백엔드 스펙을 **읽고 맞출 뿐.**

## 원칙
- **백엔드를 상상해서 만들지 않는다.** 엔드포인트·DTO·에러 포맷은 실제 스펙대로.
- 스펙이 없거나 모호하면 **멈추고 사용자/백엔드에 묻는다.**
- 프론트↔백 타입은 스펙을 단일 소스로 (drift 방지).

## TODO
- `TODO(✍️):` API 스펙 위치 (OpenAPI/Swagger URL? 문서 경로?)
- `TODO(✍️):` 인증 방식 (httpOnly 쿠키? 토큰?)
- `TODO(✍️):` 에러 응답 포맷
