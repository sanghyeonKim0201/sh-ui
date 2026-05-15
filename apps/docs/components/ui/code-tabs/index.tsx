import { CodePanel, type CodePanelProps } from "../code-panel";
import { LiveCode } from "../live-code";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "../tabs";

export interface CodeTabsItem extends Omit<CodePanelProps, "code"> {
  /** 탭 식별자 (Tabs 의 value 와 동일). */
  value: string;
  /** 탭 트리거에 표시될 라벨. */
  label: string;
  /** 표시할 코드. */
  code: string;
  /** true 이면 정적 highlighting 대신 react-live LiveCode 로 렌더 — 사용자가 코드 편집 + 라이브 preview. React tab 만 의미. */
  live?: boolean;
  /** live=true 일 때 react-live 가 평가할 scope (예: { Button, Card }). */
  scope?: Record<string, unknown>;
  /** live=true 일 때 react-live 의 noInline 모드 — render() 명시 호출 필요. */
  noInline?: boolean;
}

export interface CodeTabsProps {
  items: CodeTabsItem[];
  /** 초기 활성 탭 value. 미지정 시 첫 번째 항목. */
  defaultValue?: string;
}

/**
 * 같은 예제의 여러 코드 뷰(예: React / Flutter, 또는 "강조 부분 / 전체 코드") 를 탭으로 전환.
 * 각 탭의 내용은 기본적으로 `CodePanel` 로 렌더되어 shiki 하이라이팅 · 복사 버튼 · 파일명 헤더
 * 등을 그대로 사용한다. 아이템에 `live: true` 를 주면 해당 탭만 react-live `LiveCode` 로 렌더되어
 * 사용자가 코드 편집 + preview 를 인라인에서 볼 수 있다.
 */
export function CodeTabs({ items, defaultValue }: CodeTabsProps) {
  const initial = defaultValue ?? items[0]?.value;
  return (
    <Tabs defaultValue={initial}>
      <TabsList>
        <TabsIndicator />
        {items.map((item) => (
          <TabsTrigger key={item.value} value={item.value}>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map(({ value, label: _label, live, scope, noInline, code, language, ...panel }) => (
        <TabsContent key={value} value={value}>
          {live ? (
            <LiveCode
              code={code}
              scope={scope}
              noInline={noInline}
              language={language === "jsx" ? "jsx" : "tsx"}
            />
          ) : (
            <CodePanel {...panel} code={code} language={language} />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
