import { beforeEach, describe, expect, it } from "vitest";

import {
  createToken,
  isOwner,
  readSession,
  saveSession,
} from "./local-session";

// 비회원 식별 = 고유 토큰 + 로컬스토리지 닉네임 (domain.md §2).
describe("local-session", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("저장한 세션을 그대로 읽는다", () => {
    const session = { nickname: "송이", token: "abc123", createdAt: 1000 };
    saveSession(session);
    expect(readSession()).toEqual(session);
  });

  it("저장된 게 없으면 null", () => {
    expect(readSession()).toBeNull();
  });

  it("손상된 값이면 null (throw하지 않음)", () => {
    window.localStorage.setItem("looky.session", "{깨진 json");
    expect(readSession()).toBeNull();
  });

  it("isOwner는 내 토큰일 때만 true", () => {
    saveSession({ nickname: "송이", token: "mine", createdAt: 1 });
    expect(isOwner("mine")).toBe(true);
    expect(isOwner("other")).toBe(false);
  });

  it("createToken은 매번 다르고 영숫자 토큰 (추측 불가 — domain.md §3)", () => {
    const tokens = new Set(Array.from({ length: 20 }, () => createToken()));
    // 20개가 전부 유일 (순번/충돌 없음)
    expect(tokens.size).toBe(20);
    for (const t of tokens) {
      expect(t.length).toBeGreaterThanOrEqual(8);
      expect(/^[a-z0-9]+$/i.test(t)).toBe(true);
    }
  });
});
