import { CodePanel } from "@/components/ui/code-panel";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { VARIANTS, type FrameworkKey } from "@/lib/variants.generated";

const LABEL: Record<FrameworkKey, string> = {
  plain: "plain",
  tailwind: "tailwind",
  "css-modules": "css-modules",
};

const ORDER: FrameworkKey[] = ["plain", "tailwind", "css-modules"];

export interface VariantSourceProps {
  /** registry 컴포넌트 디렉토리 이름 (예: "button"). */
  name: string;
}

/**
 * registry 컴포넌트의 plain · tailwind · css-modules 변종 소스를 탭으로 표시한다.
 * 변종 파일이 없으면 그 탭은 자동 생략 — 비-styled 컴포넌트(plain 만 있는 경우 등)도 자연스럽게 처리.
 *
 * 데이터는 `lib/variants.generated.ts` (빌드 전 `pnpm generate:variants` 가 emit)
 * 에서 정적으로 가져온다. 따라서 client component 페이지에서도 사용 가능.
 */
export function VariantSource({ name }: VariantSourceProps) {
  const data = VARIANTS[name];
  if (!data) return null;
  const present = ORDER.filter((fw) => data[fw] && data[fw]!.length > 0);
  if (present.length === 0) return null;

  return (
    <Tabs defaultValue={present[0]}>
      <TabsList>
        <TabsIndicator />
        {present.map((fw) => (
          <TabsTrigger key={fw} value={fw}>
            {LABEL[fw]}
          </TabsTrigger>
        ))}
      </TabsList>
      {present.map((fw) => (
        <TabsContent key={fw} value={fw}>
          {data[fw]!.map((f) => (
            <CodePanel
              key={f.filename}
              language={f.language}
              filename={`components/ui/${name}/${f.filename}`}
              code={f.code}
            />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
