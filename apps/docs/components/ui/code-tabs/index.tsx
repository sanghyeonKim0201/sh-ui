import { CodePanel, type CodePanelProps } from "../code-panel";
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
}

export interface CodeTabsProps {
  items: CodeTabsItem[];
  /** 초기 활성 탭 value. 미지정 시 첫 번째 항목. */
  defaultValue?: string;
}

/**
 * 같은 예제의 여러 코드 뷰(예: React / Flutter, 또는 "강조 부분 / 전체 코드") 를 탭으로 전환.
 * 각 탭의 내용은 그대로 `CodePanel` 로 렌더되므로 shiki 하이라이팅 · 복사 버튼 · 파일명 헤더
 * 등을 그대로 사용할 수 있다.
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
      {items.map(({ value, label: _label, ...panel }) => (
        <TabsContent key={value} value={value}>
          <CodePanel {...panel} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
