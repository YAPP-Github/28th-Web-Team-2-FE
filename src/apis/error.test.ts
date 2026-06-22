import { describe, expect, it } from "vitest";

import { ApiError, isApiError } from "@/apis/error";

describe("ApiError", () => {
  it("status·payload를 보존한다", () => {
    const error = new ApiError(404, "Not Found", { message: "없는 링크" });
    expect(error.status).toBe(404);
    expect(error.payload).toEqual({ message: "없는 링크" });
  });

  it("isApiError 타입 가드로 분기된다", () => {
    expect(isApiError(new ApiError(500, "Internal Server Error"))).toBe(true);
    expect(isApiError(new Error("plain"))).toBe(false);
  });
});
