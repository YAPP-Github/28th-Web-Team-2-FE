import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { shareInstagramStory, shareKakao } from "./share";

// 공유 유틸 — 인스타(이미지+링크 복사) / 카카오(SDK or 복사 fallback).
// 브라우저 API(clipboard·navigator.share·fetch·Kakao SDK)를 모킹해 폴백 분기를 검증.

const LINK = "https://looky.my/abc123";
const IMG = "https://looky.my/assets/story-share.png";

function setClipboard(ok: boolean) {
  const writeText = ok
    ? vi.fn().mockResolvedValue(undefined)
    : vi.fn().mockRejectedValue(new Error("denied"));
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  return writeText;
}

function setNavigatorShare(opts: { canShare?: boolean; share?: () => Promise<void> }) {
  Object.defineProperty(navigator, "canShare", {
    configurable: true,
    value: opts.canShare === undefined ? undefined : () => opts.canShare!,
  });
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: opts.share ?? vi.fn().mockResolvedValue(undefined),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete (window as { Kakao?: unknown }).Kakao;
});

// jsdom엔 createImageBitmap·canvas 인코딩이 없어 JPEG 변환 경로를 모킹한다.
function stubJpegPipeline() {
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 1080, height: 1920, close: vi.fn() }),
  );
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    drawImage: vi.fn(),
  } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(
    (cb: BlobCallback) => cb(new Blob(["jpeg"], { type: "image/jpeg" })),
  );
}

describe("shareInstagramStory", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        blob: () => Promise.resolve(new Blob(["x"], { type: "image/png" })),
      }),
    );
    stubJpegPipeline();
  });

  it("Web Share(files) 지원 시 'shared' — JPEG 파일만 공유(text 없이) + 링크는 클립보드로", async () => {
    const writeText = setClipboard(true);
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorShare({ canShare: true, share });

    const result = await shareInstagramStory({ link: LINK, imageUrl: IMG });

    expect(result).toBe("shared");
    expect(writeText).toHaveBeenCalledWith(LINK);
    expect(share).toHaveBeenCalledOnce();
    const arg = share.mock.calls[0][0] as { files: File[]; text?: string };
    expect(arg.text).toBeUndefined(); // files+text 동시 전달 금지 (이미지 누락 방지)
    expect(arg.files[0].type).toBe("image/jpeg"); // PNG 검정화면 회피
  });

  it("Web Share 미지원이면 'copied' (링크만 복사)", async () => {
    const writeText = setClipboard(true);
    setNavigatorShare({ canShare: undefined });

    const result = await shareInstagramStory({ link: LINK, imageUrl: IMG });

    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(LINK);
  });

  it("공유·복사 모두 불가면 'unsupported'", async () => {
    setClipboard(false);
    setNavigatorShare({ canShare: undefined });

    const result = await shareInstagramStory({ link: LINK, imageUrl: IMG });

    expect(result).toBe("unsupported");
  });

  it("JPEG 변환 실패 시 파일 공유 없이 'copied' 폴백", async () => {
    const writeText = setClipboard(true);
    const share = vi.fn().mockResolvedValue(undefined);
    setNavigatorShare({ canShare: true, share });
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn().mockRejectedValue(new Error("decode 실패")),
    );

    const result = await shareInstagramStory({ link: LINK, imageUrl: IMG });

    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(LINK);
    expect(share).not.toHaveBeenCalled();
  });
});

describe("shareKakao", () => {
  it("SDK/키 없으면 링크 복사 fallback ('copied')", async () => {
    const writeText = setClipboard(true);
    // window.Kakao 미정의 + 키 미설정 → fallback

    const result = await shareKakao({
      link: LINK,
      title: "t",
      description: "d",
      imageUrl: IMG,
    });

    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(LINK);
  });

  it("Kakao SDK 있으면 sendDefault 호출 + 'shared'", async () => {
    setClipboard(true);
    const sendDefault = vi.fn();
    (window as { Kakao?: unknown }).Kakao = {
      isInitialized: () => true,
      init: vi.fn(),
      Share: { sendDefault },
    };

    const result = await shareKakao({
      link: LINK,
      title: "t",
      description: "d",
      imageUrl: IMG,
    });

    expect(result).toBe("shared");
    expect(sendDefault).toHaveBeenCalledOnce();
  });
});
