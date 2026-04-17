import { CodePanel, type CodePanelProps } from "@/components/ui/code-panel";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export interface CodeTabsItem extends Omit<CodePanelProps, "code"> {
  value: string;
  label: string;
  code: string;
}

export interface CodeTabsProps {
  items: CodeTabsItem[];
  defaultValue?: string;
}

/** 문서 전용: 같은 예제의 "강조 부분 / 전체" 같은 여러 코드 뷰를 탭으로 전환. */
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
