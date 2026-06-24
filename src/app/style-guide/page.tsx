import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "looky · 스타일가이드",
};

/** 디자인 시스템 토큰 확인용 쇼케이스. Figma Variables → @theme 토큰 검증 화면. */

const COLOR_GROUPS = [
  {
    group: "gray",
    shades: [
      { token: "gray-50", cls: "bg-gray-50", hex: "#F5F6FB" },
      { token: "gray-100", cls: "bg-gray-100", hex: "#E5E7EF" },
      { token: "gray-200", cls: "bg-gray-200", hex: "#C2C6D1" },
      { token: "gray-300", cls: "bg-gray-300", hex: "#828794" },
      { token: "gray-400", cls: "bg-gray-400", hex: "#626670" },
      { token: "gray-700", cls: "bg-gray-700", hex: "#40444D" },
      { token: "gray-800", cls: "bg-gray-800", hex: "#272E3F" },
      { token: "gray-900", cls: "bg-gray-900", hex: "#0F172A" },
    ],
  },
  {
    group: "blue",
    shades: [
      { token: "blue-100", cls: "bg-blue-100", hex: "#D2E2FF" },
      { token: "blue-200", cls: "bg-blue-200", hex: "#9BBEFF" },
      { token: "blue-300", cls: "bg-blue-300", hex: "#8AB3FF" },
      { token: "blue-400", cls: "bg-blue-400", hex: "#659BFF" },
      { token: "blue-500", cls: "bg-blue-500", hex: "#4E8CFF" },
    ],
  },
  {
    group: "red / base",
    shades: [
      { token: "red-300", cls: "bg-red-300", hex: "#FF5858" },
      { token: "white", cls: "bg-white border border-gray-200", hex: "#FFFFFF" },
    ],
  },
];

const TYPE_GROUPS = [
  {
    label: "head-point1 · Y SpotlightOTF",
    items: [
      { token: "head1/26", cls: "font-display1 text-head1-26" },
      { token: "head1/24", cls: "font-display1 text-head1-24" },
      { token: "head1/20", cls: "font-display1 text-head1-20" },
      { token: "head1/18", cls: "font-display1 text-head1-18" },
      { token: "head1/16", cls: "font-display1 text-head1-16" },
    ],
  },
  {
    label: "head-point2 · YPairingFont",
    items: [
      { token: "head2/26", cls: "font-display2 text-head2-26" },
      { token: "head2/24", cls: "font-display2 text-head2-24" },
      { token: "head2/20", cls: "font-display2 text-head2-20" },
      { token: "head2/18", cls: "font-display2 text-head2-18" },
      { token: "head2/16", cls: "font-display2 text-head2-16" },
    ],
  },
  {
    label: "body · Pretendard",
    items: [
      { token: "body/18-semibold", cls: "text-body-18-semibold" },
      { token: "body/18-medium", cls: "text-body-18-medium" },
      { token: "body/18-regular", cls: "text-body-18-regular" },
      { token: "body/16-bold", cls: "text-body-16-bold" },
      { token: "body/16-semibold", cls: "text-body-16-semibold" },
      { token: "body/16-medium", cls: "text-body-16-medium" },
      { token: "body/16-regular", cls: "text-body-16-regular" },
      { token: "body/14-medium", cls: "text-body-14-medium" },
      { token: "body/14-regular", cls: "text-body-14-regular" },
    ],
  },
  {
    label: "caption · Pretendard",
    items: [
      { token: "caption/12-medium", cls: "text-caption-12-medium" },
      { token: "caption/12-regular", cls: "text-caption-12-regular" },
    ],
  },
];

const SAMPLE = "친구들이 본 나를 인생네컷으로";

export default function StyleGuidePage() {
  return (
    <main className="flex flex-col gap-10 px-5 py-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display2 text-head2-24 text-gray-900">
          looky 스타일가이드
        </h1>
        <p className="text-body-14-regular text-gray-400">
          Figma Variables → @theme 토큰
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-body-16-semibold text-gray-900">컬러</h2>
        {COLOR_GROUPS.map((group) => (
          <div key={group.group} className="flex flex-col gap-2">
            <p className="text-caption-12-medium text-gray-400">{group.group}</p>
            <div className="grid grid-cols-4 gap-2">
              {group.shades.map((shade) => (
                <div key={shade.token} className="flex flex-col gap-1">
                  <div className={`h-12 w-full rounded-lg ${shade.cls}`} />
                  <p className="text-caption-12-medium text-gray-900">
                    {shade.token}
                  </p>
                  <p className="text-caption-12-regular text-gray-400">
                    {shade.hex}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-body-16-semibold text-gray-900">타이포그래피</h2>
        {TYPE_GROUPS.map((group) => (
          <div key={group.label} className="flex flex-col gap-3">
            <p className="text-caption-12-medium text-gray-400">{group.label}</p>
            <ul className="flex flex-col gap-3">
              {group.items.map((item) => (
                <li
                  key={item.token}
                  className="flex flex-col gap-0.5 border-b border-gray-100 pb-3"
                >
                  <span className="text-caption-12-regular text-gray-300">
                    {item.token}
                  </span>
                  <span className={`${item.cls} text-gray-900`}>{SAMPLE}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}
