// 비회원 식별 — 서버 계정 없음. 주인공 기기에 닉네임+토큰만 저장 (domain.md §2).
// 와이어프레임용 간이 구현. 정식은 토큰 발급을 서버가, 여기선 로컬에서 흉내.

const KEY = "looky.session";

export interface LocalSession {
  nickname: string;
  /** 추측 불가능한 토큰 (정식은 서버 발급, 순번 ID 금지) */
  token: string;
  createdAt: number;
}

export function readSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as LocalSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: LocalSession): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(session));
}

/** 이 토큰이 내 기기에서 만든 것인지 = 주인공/참여자 구분 (domain.md §2) */
export function isOwner(token: string): boolean {
  return readSession()?.token === token;
}

/** 와이어프레임용 토큰 생성. 정식은 서버 발급. */
export function createToken(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.abs(Date.now() ^ (performance.now() * 1000)).toString(36);
  return rand;
}
