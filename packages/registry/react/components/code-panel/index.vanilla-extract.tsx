import { codeToHtml } from "shiki";
import { CodePanelCopyButton } from "./copy";
import { byKey, code, code__header, code__filename, codeCopyFloating, code__copy, codeCopyLabel, code__body, dark } from "./styles.css";


import { cn } from "@SH_UI_UTILS@";
export interface CodePanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** 하이라이팅할 코드 문자열. children을 제공하지 않을 때 필수. */
  code?: string;
  /**
   * shiki가 지원하는 언어 ID (예: `"tsx"`, `"typescript"`, `"bash"`, `"json"`).
   * 미지원 언어면 plain text로 폴백.
   *
   * @default "text"
   */
  language?: string;
  /**
   * 상단 헤더에 표시할 파일명. 지정하면 헤더가 그려지고 그 안에 복사 버튼이 들어가며,
   * 미지정 시 우상단에 floating 복사 버튼만 표시된다.
   */
  filename?: string;
  /**
   * 좌측 줄 번호 표시 여부.
   * @default true
   */
  showLineNumbers?: boolean;
  /**
   * 복사 버튼 숨기기. 코드 발췌가 클립보드 복사용이 아닐 때 사용.
   * @default false
   */
  hideCopy?: boolean;
  /**
   * compound 모드. 직접 `CodePanelHeader`/`CodePanelFilename`/`CodePanelCopy`/`CodePanelBody`를
   * 조합해 헤더 액션 추가나 복사 버튼 위치 변경 등을 한다. 지정 시 `code`/`language` 등은 무시.
   */
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
  const classes = cn(code, className);

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
          <div className={codeCopyFloating}>
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

/** 파일명·복사 버튼 등을 담는 코드 블록 상단 바. CodePanel 자식으로 사용. */
export function CodePanelHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(code__header, className)} {...props}>
      {children}
    </div>
  );
}

/* ───────── CodePanelFilename ───────── */

/** CodePanelHeader 안에 표시되는 파일명 라벨. */
export function CodePanelFilename({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn(code__filename, className)} {...props}>
      {children}
    </span>
  );
}

/* ───────── CodePanelCopy ─────────
 * 클립보드 복사 버튼. 내부적으로 client 컴포넌트를 사용한다.
 */

export interface CodePanelCopyProps {
  /** 클립보드에 복사할 코드 문자열. 부모(주로 CodePanel)가 명시적으로 전달한다. */
  code: string;
}

/** 클립보드 복사 버튼. 부모가 복사할 코드 문자열을 명시적으로 전달한다. */
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
  /** 하이라이팅할 코드 문자열. */
  code: string;
  /**
   * shiki 언어 ID.
   * @default "text"
   */
  language?: string;
  /**
   * 좌측 줄 번호 표시 여부.
   * @default true
   */
  showLineNumbers?: boolean;
}

/**
 * shiki로 코드를 SSR 하이라이팅하여 렌더하는 async 컴포넌트.
 * 라이트/다크 테마는 `github-light`/`github-dark`를 사용하며, 부모 테마 클래스에 따라 자동 전환된다.
 */
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
      className={cn(code__body, className)}
      data-line-numbers={showLineNumbers || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
}

export { CodePanelCopyButton };
