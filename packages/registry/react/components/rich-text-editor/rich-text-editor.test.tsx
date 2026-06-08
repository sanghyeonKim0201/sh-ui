import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Extension } from "@tiptap/core";
import { RichTextEditor } from "./index";

void React;

describe('RichTextEditor format="markdown"', () => {
  it("markdown defaultValue 를 받아 굵게 마크로 렌더한다", async () => {
    render(<RichTextEditor format="markdown" defaultValue={"**굵게**"} />);
    // 에디터가 굵게 마크로 렌더(strong 존재)
    await screen.findByText("굵게");
    expect(screen.getByText("굵게").closest("strong")).not.toBeNull();
  });

  it("편집 시 onChange 가 markdown 문자열을 돌려준다", async () => {
    const onChange = vi.fn();
    let editor: import("@tiptap/react").Editor | undefined;
    render(
      <RichTextEditor
        format="markdown"
        defaultValue={"*기울임*"}
        onChange={onChange}
        onCreate={(e) => {
          editor = e;
        }}
      />,
    );
    await screen.findByText("기울임");
    await vi.waitFor(() => expect(editor).toBeDefined());
    // 본문 끝에 굵은 텍스트를 추가하는 편집을 트랜잭션으로 일으켜 onUpdate 를 트리거.
    editor!.chain().focus("end").insertContent(" **굵게**").run();
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const out = onChange.mock.calls.at(-1)![0] as string;
    // markdown(HTML 아님) 으로 직렬화됐는지 검증: 굵게 마크 + 태그 부재.
    expect(out).toContain("**굵게**");
    expect(out).not.toContain("<strong>");
    // _italic_ 은 CommonMark 정규화로 *italic* 형태(별표 기반)로 나온다.
    expect(out).toContain("*기울임*");
  });

  it("html 모드(기본)에서는 markdown storage 가 없다(직렬화 미등록)", async () => {
    let editor: import("@tiptap/react").Editor | undefined;
    render(
      <RichTextEditor
        defaultValue={"<p><em>기울임</em></p>"}
        onCreate={(e) => {
          editor = e;
        }}
      />,
    );
    await screen.findByText("기울임");
    await vi.waitFor(() => expect(editor).toBeDefined());
    const storage = editor!.storage as { markdown?: unknown };
    expect(storage.markdown).toBeUndefined();
  });
});

describe("RichTextEditor submitOnEnter", () => {
  it("Enter 는 onSubmit, Shift+Enter 는 줄바꿈", async () => {
    const onSubmit = vi.fn();
    render(
      <RichTextEditor
        format="markdown"
        submitOnEnter
        onSubmit={onSubmit}
        aria-label="c"
      />,
    );
    const el = await screen.findByLabelText("c");
    el.focus();
    el.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        bubbles: true,
      }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1); // 늘지 않음
  });
});

describe("RichTextEditor extensions/onCreate", () => {
  it("추가 확장이 등록되고 onCreate 로 editor 에 접근한다", async () => {
    const onCreate = vi.fn();
    const marker = Extension.create({ name: "spikeMarker" });
    render(
      <RichTextEditor
        format="markdown"
        extensions={[marker]}
        onCreate={onCreate}
      />,
    );
    await vi.waitFor(() => expect(onCreate).toHaveBeenCalled());
    const editor = onCreate.mock.calls[0][0];
    expect(
      editor.extensionManager.extensions.some(
        (e: { name: string }) => e.name === "spikeMarker",
      ),
    ).toBe(true);
  });
});

describe("RichTextEditor 하위호환 (default html)", () => {
  it("기본 format(html)에서 편집 시 onChange 가 HTML 을 돌려준다", async () => {
    const onChange = vi.fn();
    let editor: import("@tiptap/react").Editor | undefined;
    render(
      <RichTextEditor
        defaultValue={"<p><strong>굵게</strong></p>"}
        onChange={onChange}
        onCreate={(e) => {
          editor = e;
        }}
      />,
    );
    await screen.findByText("굵게");
    expect(screen.getByText("굵게").closest("strong")).not.toBeNull();
    await vi.waitFor(() => expect(editor).toBeDefined());
    editor!.chain().focus("end").insertContent(" 추가").run();
    await vi.waitFor(() => expect(onChange).toHaveBeenCalled());
    const out = onChange.mock.calls.at(-1)![0] as string;
    // html 모드(기본)이므로 태그 문자열이 그대로 나와야 한다(markdown 별표 아님).
    expect(out).toContain("<strong>");
    expect(out).toContain("<p>");
    expect(out).not.toContain("**");
  });
});
