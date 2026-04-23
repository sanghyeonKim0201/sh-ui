import { codeToHtml } from "shiki";
import { CodePanelCopyButton } from "./copy";
import "./styles.css";

function cx(...args: (string | undefined | false | null)[]) {
  return args.filter(Boolean).join(" ");
}

export interface CodePanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 하이라이팅할 코드 문자열. 자식(compound)을 제공하지 않을 때 필수. */
  code?: string;
  /** shiki가 지원하는 언어 ID (e.g. "tsx", "typescript", "bash", "json"). */
  language?: string;
  /** 상단 헤더에 표시할 파일명. 있으면 헤더가 그려지고 없으면 우상단 플로팅 복사 버튼만. */
  filename?: string;
  /** 줄 번호 표시 여부. 기본 true. */
  showLineNumbers?: boolean;
  /** 복사 버튼 숨기기. */
  hideCopy?: boolean;
  /** 직접 구성할 경우 CodePanelHeader / CodePanelBody 등 하위 컴포넌트를 넘긴다. */
  children?: React.ReactNode;
}

/**
 * 코드 블록 + 복사 버튼 패널. shiki로 SSR에서 하이라이팅.
 *
 * 기본 사용(자식 생략) — `code` prop만 넘기면 기본 레이아웃을 렌더한다.
 * 커스텀 구성 — `CodePanelHeader`, `CodePanelFilename`, `CodePanelCopy`,
 * `CodePanelBody`를 직접 조합하여 헤더 액션 추가·복사 버튼 위치 변경 등이 가능하다.
 */
export async function CodePanel({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  hideCopy,
  className,
  children,
  ...rest
}: CodePanelProps) {
  const classes = cx("sh-ui-code", className);

  if (children !== undefined) {
    return (
      <div className={classes} {...rest}>
        {children}
      </div>
    );
  }

  if (code === undefined) {
    throw new Error("CodePanel: `code` prop 또는 children 중 하나가 필요합니다.");
  }

  const trimmed = code.replace(/\n$/, "");

  return (
    <div className={classes} {...rest}>
      {filename ? (
        <CodePanelHeader>
          <CodePanelFilename>{filename}</CodePanelFilename>
          {!hideCopy && <CodePanelCopy code={trimmed} />}
        </CodePanelHeader>
      ) : (
        !hideCopy && (
          <div className="sh-ui-code__copy-floating">
            <CodePanelCopy code={trimmed} />
          </div>
        )
      )}
      <CodePanelBody
        code={trimmed}
        language={language}
        showLineNumbers={showLineNumbers}
      />
    </div>
  );
}

/* ───────── CodePanelHeader ───────── */

export function CodePanelHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("sh-ui-code__header", className)} {...props}>
      {children}
    </div>
  );
}

/* ───────── CodePanelFilename ───────── */

export function CodePanelFilename({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cx("sh-ui-code__filename", className)} {...props}>
      {children}
    </span>
  );
}

/* ───────── CodePanelCopy ─────────
 * 클립보드 복사 버튼. 내부적으로 client 컴포넌트를 사용한다.
 */

export interface CodePanelCopyProps {
  /** 복사할 코드 문자열. 부모가 명시적으로 전달한다. */
  code: string;
}

export function CodePanelCopy({ code }: CodePanelCopyProps) {
  return <CodePanelCopyButton code={code} />;
}

/* ───────── CodePanelBody ─────────
 * shiki로 코드를 하이라이팅하여 렌더하는 async 컴포넌트.
 */

export interface CodePanelBodyProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "children" | "dangerouslySetInnerHTML"
  > {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export async function CodePanelBody({
  code,
  language = "text",
  showLineNumbers = true,
  className,
  ...rest
}: CodePanelBodyProps) {
  const trimmed = code.replace(/\n$/, "");
  const html = await codeToHtml(trimmed, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div
      className={cx("sh-ui-code__body", className)}
      data-line-numbers={showLineNumbers || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
}

export { CodePanelCopyButton };
