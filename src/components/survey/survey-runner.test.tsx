import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { NEUTRAL_CHOICE, type SurveyQuestion } from "@data/questions";

import { SurveyRunner } from "./survey-runner";

const QS: SurveyQuestion[] = [
  { id: "a", scenario: "질문 A", choices: ["a1", "a2", "a3", "a4", "a5"] },
  { id: "b", scenario: "질문 B", choices: ["b1", "b2", "b3", "b4", "b5"] },
];

describe("SurveyRunner", () => {
  // 진행 표시는 "1"(blue) + " / 2"(gray) 두 span으로 쪼개져 있어 textContent로 매칭
  const progress = (text: string) =>
    screen.getByText(
      (_, el) => el?.tagName === "P" && el.textContent === text,
    );

  it("첫 문항과 진행도(1/N)를 보여준다", () => {
    render(<SurveyRunner questions={QS} onComplete={vi.fn()} />);
    expect(screen.getByText("질문 A")).toBeInTheDocument();
    expect(progress("1 / 2")).toBeInTheDocument();
  });

  it("보기를 고르면 다음 문항으로 넘어간다", () => {
    render(<SurveyRunner questions={QS} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByText("a1"));
    expect(screen.getByText("질문 B")).toBeInTheDocument();
    expect(progress("2 / 2")).toBeInTheDocument();
  });

  it("마지막 문항 완료 시 onComplete에 답안 맵을 넘긴다", () => {
    const onComplete = vi.fn();
    render(<SurveyRunner questions={QS} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("a1")); // a → 0
    fireEvent.click(screen.getByText("b3")); // b → 2
    expect(onComplete).toHaveBeenCalledWith({ a: 0, b: 2 });
  });

  it("includeNeutral이면 '잘 모르겠어요' 중립 선택지가 붙는다", () => {
    render(
      <SurveyRunner questions={QS} includeNeutral onComplete={vi.fn()} />,
    );
    expect(screen.getByText(NEUTRAL_CHOICE)).toBeInTheDocument();
  });

  it("중립 선택지가 기본(본인 설문 아님)에선 없다", () => {
    render(<SurveyRunner questions={QS} onComplete={vi.fn()} />);
    expect(screen.queryByText(NEUTRAL_CHOICE)).not.toBeInTheDocument();
  });

  it("문항이 비면 빈 상태를 보여준다", () => {
    render(<SurveyRunner questions={[]} onComplete={vi.fn()} />);
    expect(screen.getByText("불러올 문항이 없어요")).toBeInTheDocument();
  });

  it("첫 문항에서 뒤로 누르면 onBack 호출", () => {
    const onBack = vi.fn();
    render(
      <SurveyRunner questions={QS} onComplete={vi.fn()} onBack={onBack} />,
    );
    fireEvent.click(screen.getByLabelText("이전 문항"));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
