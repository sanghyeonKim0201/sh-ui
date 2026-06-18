import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("Enter 는 onSubmit, Shift+Enter 는 줄바꿈 (ProseMirror handleKeyDown 경유)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    let editor: import("@tiptap/react").Editor | undefined;
    render(
      <RichTextEditor
        format="markdown"
        submitOnEnter
        onSubmit={onSubmit}
        onCreate={(e) => {
          editor = e;
        }}
        aria-label="c"
      />,
    );
    const el = await screen.findByLabelText("c");
    await vi.waitFor(() => expect(editor).toBeDefined());
    // user-event 로 실제 키 이벤트를 발생시켜 ProseMirror 의 handleKeyDown 플러그인
    // 체인을 진짜로 통과시킨다(raw dispatchEvent 는 PM view 를 거치지 않을 수 있음).
    editor!.commands.focus();
    el.focus();
    await user.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSubmit).toHaveBeenCalledTimes(1); // 늘지 않음(줄바꿈)
  });

  it("IME 조합 중(isComposing) Enter 는 제출하지 않고, 일반 Enter 는 제출한다", async () => {
    const onSubmit = vi.fn();
    let editor: import("@tiptap/react").Editor | undefined;
    render(
      <RichTextEditor
        format="markdown"
        submitOnEnter
        onSubmit={onSubmit}
        onCreate={(e) => {
          editor = e;
        }}
        aria-label="ime"
      />,
    );
    const el = await screen.findByLabelText("ime");
    await vi.waitFor(() => expect(editor).toBeDefined());
    editor!.commands.focus();
    el.focus();

    // 한글 조합 확정 Enter 는 isComposing: true 로 들어온다 — 제출되면 안 됨.
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
        // @ts-expect-error jsdom KeyboardEvent 는 isComposing 을 옵션으로 받음
        isComposing: true,
      }),
    );
    expect(onSubmit).not.toHaveBeenCalled();

    // 레거시 브라우저가 보내는 keyCode 229(조합 중) Enter 도 제출 금지.
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
        keyCode: 229,
      }),
    );
    expect(onSubmit).not.toHaveBeenCalled();

    // 조합이 끝난 일반 Enter 는 제출된다.
    el.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});

describe("RichTextEditor controlled-sync (C-2 루프/커서 점프 방지)", () => {
  it("동일 value 로 부모가 리렌더해도 setContent·셀렉션을 건드리지 않는다(커서 점프 방지)", async () => {
    let editor: import("@tiptap/react").Editor | undefined;
    let forceRerender: (() => void) | undefined;

    // controlled value 가 그대로인데 부모가 리렌더하는 흔한 상황. lastSyncedRef 비교 덕에
    // sync effect 가 우리 doc 을 다시 setContent 하지 않아 커서/셀렉션이 보존된다.
    // (직렬화 비교만 했다면 markdown 정규화 차이로 매 렌더 setContent → 점프 위험.)
    function Harness() {
      const [, tick] = React.useState(0);
      forceRerender = () => tick((n) => n + 1);
      return (
        <RichTextEditor
          format="markdown"
          value={"**hi**"}
          onChange={() => {}}
          onCreate={(e) => {
            editor = e;
          }}
          aria-label="sync"
        />
      );
    }

    render(<Harness />);
    await vi.waitFor(() => expect(editor).toBeDefined());
    await screen.findByText("hi");

    // 커서를 문서 끝으로 두고 위치 기록.
    editor!.commands.focus("end");
    const before = editor!.state.selection.from;
    expect(before).toBeGreaterThan(1);

    // 같은 value 로 부모 리렌더 — sync effect 가 echo 를 다시 주입하면 안 된다.
    const setContentSpy = vi.spyOn(editor!.commands, "setContent");
    await React.act(async () => {
      forceRerender!();
      // effect flush 까지 대기(setContent 가 일어난다면 여기서 일어난다).
      await Promise.resolve();
    });

    // setContent 미호출 + 셀렉션 그대로(점프 없음).
    expect(setContentSpy).not.toHaveBeenCalled();
    expect(editor!.state.selection.from).toBe(before);
    setContentSpy.mockRestore();
  });

  it("진짜 다른 외부 value 는 에디터에 로드된다 (채널 전환)", async () => {
    function Harness({ value }: { value: string }) {
      return <RichTextEditor format="markdown" value={value} aria-label="ext" />;
    }
    const { rerender } = render(<Harness value={"**first**"} />);
    await screen.findByText("first");

    // 외부에서 완전히 다른 value 주입 → 에디터에 반영돼야 한다.
    rerender(<Harness value={"**second**"} />);
    await screen.findByText("second");
    expect(screen.queryByText("first")).toBeNull();
  });

  it("html 모드에서도 controlled echo 루프가 발생하지 않는다", async () => {
    let editor: import("@tiptap/react").Editor | undefined;
    let lastEmitted = "";
    function Harness() {
      const [value, setValue] = React.useState("<p>hi</p>");
      return (
        <RichTextEditor
          value={value}
          onChange={(v) => {
            lastEmitted = v;
            setValue(v);
          }}
          onCreate={(e) => {
            editor = e;
          }}
          aria-label="html-sync"
        />
      );
    }
    render(<Harness />);
    await vi.waitFor(() => expect(editor).toBeDefined());
    await screen.findByText("hi");

    editor!.chain().focus("end").insertContent(" x").run();
    await vi.waitFor(() => expect(lastEmitted).toContain("x"));

    const setContentSpy = vi.spyOn(editor!.commands, "setContent");
    editor!.chain().focus("end").insertContent("y").run();
    await vi.waitFor(() => expect(lastEmitted).toContain("y"));
    expect(setContentSpy).not.toHaveBeenCalled();
    setContentSpy.mockRestore();
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
