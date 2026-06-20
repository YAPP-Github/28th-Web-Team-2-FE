# Git 워크플로우 (단일 진실 소스 · 도구 무관)

> diff-organizer / PR 작업이 따른다. **공동작업자 있음** 전제 — 공유 브랜치 안전이 최우선.

## 브랜치

- 작업마다 **작업 브랜치**에서. 공유 루트(`main`/`dev`)에 직접 푸시·force push 금지.
- 네이밍: `feat/<짧은설명>` `fix/<…>` `refactor/<…>` (팀 공통 규격)
- 루트는 **PR merge로만** 갱신.

## 커밋

- 형식: `feat(scope): 한국어 설명` (feat/fix/refactor/chore/style/docs)
- 논리 단위로 분리.

## PR 직전 흐름 (그대로 실행)

```
git switch feat/<…>
git fetch origin
git rebase origin/dev            # 루트 최신으로 rebase
# ⚠ 충돌 → agent는 자동 해결 금지. "어디를 어떻게 합칠지" 반드시 사용자에게 묻는다
git push --force-with-lease      # 내 작업 브랜치만 (--force 금지)
→ PR 생성
```

## 게이트 (⏸ 사용자 확인)

- 커밋·푸시 직전
- 위험 경로(인증·결제 등) 변경 직전
- 배포 직전
- rebase 충돌 발생 시

## PR 코멘트 규격

- 리뷰 출력은 `review-standard.md` 고정 템플릿. 팀 전원·모든 도구 동일 형식.
