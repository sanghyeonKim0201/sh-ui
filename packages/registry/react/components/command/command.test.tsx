import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut,
} from "./index";

function Sample({ onSelect }: { onSelect?: (v: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="검색" />
      <CommandList>
        <CommandEmpty>결과 없음</CommandEmpty>
        <CommandGroup heading="페이지">
          <CommandItem value="components" keywords={["컴포넌트"]} onSelect={() => onSelect?.("components")}>
            컴포넌트 <CommandShortcut>⌘C</CommandShortcut>
          </CommandItem>
          <CommandItem value="tokens" keywords={["토큰"]} onSelect={() => onSelect?.("tokens")}>토큰</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="액션">
          <CommandItem value="theme" keywords={["테마 전환"]} onSelect={() => onSelect?.("theme")}>테마 전환</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("그룹/아이템을 렌더", () => {
    render(<Sample />);
    expect(screen.getByText("컴포넌트")).toBeTruthy();
    expect(screen.getByText("페이지")).toBeTruthy();
    expect(screen.getByRole("option", { name: /토큰/ })).toBeTruthy();
  });

  it("입력으로 아이템을 필터", () => {
    render(<Sample />);
    fireEvent.change(screen.getByPlaceholderText("검색"), { target: { value: "테마" } });
    expect(screen.getByText("테마 전환")).toBeTruthy();
    expect(screen.queryByText("토큰")).toBeNull();
  });

  it("매칭 없으면 CommandEmpty 표시", () => {
    render(<Sample />);
    fireEvent.change(screen.getByPlaceholderText("검색"), { target: { value: "zzzzz" } });
    expect(screen.getByText("결과 없음")).toBeTruthy();
  });

  it("아이템 클릭이 onSelect 호출", () => {
    const onSelect = vi.fn();
    render(<Sample onSelect={onSelect} />);
    fireEvent.click(screen.getByText("토큰"));
    expect(onSelect).toHaveBeenCalledWith("tokens");
  });
});
