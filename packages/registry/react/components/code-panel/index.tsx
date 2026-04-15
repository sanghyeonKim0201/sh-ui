import { codeToHtml } from "shiki";
import { CodePanelCopyButton } from "./copy";
import "./styles.css";

export interface CodePanelProps {
  /** 하이라이팅할 코드 문자열 */
  code: string;
  /** shiki가 지원하는 언어 ID (e.g. "tsx", "typescript", "bash", "json") */
  language?: string;
  /** 상단 헤더에 표시할 파일명. 있으면 헤더가 그려지고 없으면 우상단 플로팅 복사 버튼만. */
  filename?: string;
  /** 줄 번호 표시 여부. 기본 true. */
  showLineNumbers?: boolean;
  /** 복사 버튼 숨기기. */
  hideCopy?: boolean;
  className?: string;
}

export async function CodePanel({
  code,
  language = "text",
  filename,
  showLineNumbers = true,
  hideCopy,
  className,
}: CodePanelProps) {
  const trimmed = code.replace(/\n$/, "");
  const html = await codeToHtml(trimmed, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false, // CSS 변수만 생성 → .dark 클래스로 토글
  });

  const classes = ["sh-ui-code", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      {filename ? (
        <div className="sh-ui-code__header">
          <span className="sh-ui-code__filename">{filename}</span>
          {!hideCopy && <CodePanelCopyButton code={trimmed} />}
        </div>
      ) : (
        !hideCopy && (
          <div className="sh-ui-code__copy-floating">
            <CodePanelCopyButton code={trimmed} />
          </div>
        )
      )}
      <div
        className="sh-ui-code__body"
        data-line-numbers={showLineNumbers || undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
