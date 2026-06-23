---
name: token-newcoinage-pattern
description: 화이트리스트(globals.css @theme) 밖 색·radius 토큰을 코드에서 신설할 때 따르는 팀 관례
metadata:
  type: project
---

Figma Variables에 없는 색/radius를 부득이 코드에서 신설할 때, `src/app/globals.css`의 `@theme` 블록에 추가하되 **"디자이너 검증 필요" 주석 + 출처(Figma node/원본 raw값) + 갱신 요망** 문구를 함께 단다. 기존 예: `--color-pink-400`(icn_star_pink), `--color-kakao`(카카오 브랜드), `--radius-field`/`--radius-cta`(Figma radius 토큰 부재).

**Why:** 토큰 진실 소스는 Figma(`design-guide.md §0`). 코드 신설은 drift 위험이 있어 임시이며, 디자이너가 나중에 Figma Variable로 정식화하면 갱신해야 한다. 주석이 없으면 임시 토큰인지 정식 토큰인지 구분 불가.

**How to apply:** 리뷰 시 신설 토큰에 검증 주석이 있으면 화이트리스트 위반으로 Critical 처리하지 말고, 주석/출처 적절성만 본다. 주석 없는 raw hex·arbitrary value는 여전히 flag. 관련: [[scope-token-overlap]].
