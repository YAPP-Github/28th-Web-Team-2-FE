// 공유 유틸 — 핵심 유입 루프 (domain.md §1).
// 인스타 스토리는 링크 첨부 제약이 있어 → 스토리 이미지(story-share)는 공유 시트로, 링크는 클립보드 복사.
// 카카오톡은 Kakao JS SDK feed 템플릿. JS 키 없으면 링크 복사 fallback.

export type ShareResult =
  | "shared" // 네이티브 공유 시트 열림
  | "copied" // 링크만 클립보드 복사됨 (fallback)
  | "unsupported" // 공유·복사 모두 불가
  | "error";

// --- Kakao SDK 최소 타입 (any 회피) ---
interface KakaoLink {
  mobileWebUrl: string;
  webUrl: string;
}
interface KakaoSDK {
  isInitialized: () => boolean;
  init: (jsKey: string) => void;
  Share: {
    sendDefault: (settings: {
      objectType: "feed";
      content: {
        title: string;
        description: string;
        imageUrl: string;
        link: KakaoLink;
      };
      buttons?: { title: string; link: KakaoLink }[];
    }) => void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
const KAKAO_SDK_SRC = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";

async function copyLink(link: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch {
    return false;
  }
}

// 인스타 스토리는 PNG 파일을 공유하면 검정화면으로 깨지는 경우가 있어(특히 삼성 인터넷)
// canvas로 image/jpeg 로 재인코딩해서 넘긴다. (react-native-share#1137 동일 원인)
async function toJpegFile(blob: Blob, fileName: string): Promise<File> {
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context를 얻지 못함");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close?.();

  const jpeg = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!jpeg) throw new Error("JPEG 변환 실패");
  return new File([jpeg], fileName, { type: "image/jpeg" });
}

/** 인스타 스토리: 스토리 공유 이미지(imageUrl, 보통 story-share.png)를 공유 시트로 + 링크는 클립보드 복사 */
export async function shareInstagramStory({
  link,
  imageUrl,
}: {
  link: string;
  imageUrl: string;
}): Promise<ShareResult> {
  // 링크는 항상 먼저 클립보드로 (스토리에 붙여넣기 유도)
  const copied = await copyLink(link);

  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    const file = await toJpegFile(blob, "looky.jpg");
    // files + text 동시 전달은 일부 안드로이드/iOS 앱이 미디어를 무시(검정 캔버스)하므로
    // 링크는 위에서 이미 복사했고 여기선 이미지 파일만 공유한다.
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
      return "shared";
    }
  } catch {
    // 변환 실패·공유 취소(AbortError)·미지원 등 → 아래 복사 결과로 폴백
  }

  return copied ? "copied" : "unsupported";
}

function loadKakao(): Promise<KakaoSDK | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.Kakao?.isInitialized()) return Promise.resolve(window.Kakao);
  if (!KAKAO_JS_KEY) return Promise.resolve(null);

  return new Promise((resolve) => {
    const init = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(KAKAO_JS_KEY);
      }
      resolve(window.Kakao ?? null);
    };

    const existing = document.getElementById(
      "kakao-sdk",
    ) as HTMLScriptElement | null;
    if (existing) {
      if (window.Kakao) init();
      else existing.addEventListener("load", init);
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = KAKAO_SDK_SRC;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = init;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

/** 카카오톡 공유 (feed). 키 미설정/SDK 실패 시 링크 복사 fallback */
export async function shareKakao({
  link,
  title,
  description,
  imageUrl,
}: {
  link: string;
  title: string;
  description: string;
  imageUrl: string;
}): Promise<ShareResult> {
  const kakao = await loadKakao();
  if (!kakao?.Share) {
    return (await copyLink(link)) ? "copied" : "unsupported";
  }

  try {
    const linkObj: KakaoLink = { mobileWebUrl: link, webUrl: link };
    kakao.Share.sendDefault({
      objectType: "feed",
      content: { title, description, imageUrl, link: linkObj },
      buttons: [{ title: "네컷 보러가기", link: linkObj }],
    });
    return "shared";
  } catch {
    return (await copyLink(link)) ? "copied" : "error";
  }
}
