import { codeToHtml } from "shiki";
import { CodePanelCopyButton } from "./copy";


import { cn } from "@SH_UI_UTILS@";
export interface CodePanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  code?: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  hideCopy?: boolean;
  children?: React.ReactNode;
}

const rootClasses =
  "group relative border border-border rounded-[var(--radius)] bg-background-subtle overflow-hidden text-[0.8125rem] leading-relaxed my-[var(--space-4)] max-sm:text-[length:var(--text-xs)]";

export async function CodePanel({
  code, language = "text", filename, showLineNumbers = true, hideCopy, className, children, ...rest
}: CodePanelProps) {
  const classes = cn(rootClasses, className);

  if (children !== undefined) {
    return <div className={classes} {...rest}>{children}</div>;
  }
  if (code === undefined) throw new Error("CodePanel: `code` prop 또는 children 중 하나가 필요합니다.");

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
          <div className="absolute top-[var(--space-2)] right-[var(--space-2)] z-[1] opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100 group-focus-within:opacity-100">
            <CodePanelCopy code={trimmed} />
          </div>
        )
      )}
      <CodePanelBody code={trimmed} language={language} showLineNumbers={showLineNumbers} />
    </div>
  );
}

export function CodePanelHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-[var(--space-2)] py-[var(--space-2)] pl-[var(--space-4)] pr-[var(--space-3)] border-b border-border bg-background-muted text-[length:var(--text-xs)] text-foreground-muted",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CodePanelFilename({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-mono text-foreground", className)} {...props}>{children}</span>
  );
}

export interface CodePanelCopyProps { code: string; }
export function CodePanelCopy({ code }: CodePanelCopyProps) {
  return <CodePanelCopyButton code={code} />;
}

export interface CodePanelBodyProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "dangerouslySetInnerHTML"> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export async function CodePanelBody({
  code, language = "text", showLineNumbers = true, className, ...rest
}: CodePanelBodyProps) {
  const trimmed = code.replace(/\n$/, "");
  const html = await codeToHtml(trimmed, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div
      className={cn(
        "overflow-x-auto [&_pre]:m-0 [&_pre]:py-[var(--space-3)] [&_pre]:px-[var(--space-4)] [&_pre]:!bg-transparent [&_pre]:font-mono [&_pre]:text-[length:inherit] [&_pre]:leading-[inherit] [&_pre]:border-none [&_pre]:rounded-none [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-[length:inherit] [&_code]:block [&_.shiki]:!text-[var(--shiki-light)] [&_.shiki_span]:!text-[var(--shiki-light)] [&_.shiki]:!bg-transparent [&_.shiki_span]:!bg-transparent [.dark_&_.shiki]:!text-[var(--shiki-dark)] [.dark_&_.shiki_span]:!text-[var(--shiki-dark)] data-[line-numbers]:[&_pre_code]:[counter-reset:step] data-[line-numbers]:[&_pre_code_.line]:before:[content:counter(step)] data-[line-numbers]:[&_pre_code_.line]:before:[counter-increment:step] data-[line-numbers]:[&_pre_code_.line]:before:inline-block data-[line-numbers]:[&_pre_code_.line]:before:w-7 data-[line-numbers]:[&_pre_code_.line]:before:mr-[var(--space-4)] data-[line-numbers]:[&_pre_code_.line]:before:text-right data-[line-numbers]:[&_pre_code_.line]:before:text-foreground-muted data-[line-numbers]:[&_pre_code_.line]:before:opacity-70 data-[line-numbers]:[&_pre_code_.line]:before:select-none",
        className,
      )}
      data-line-numbers={showLineNumbers || undefined}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
}

export { CodePanelCopyButton };
