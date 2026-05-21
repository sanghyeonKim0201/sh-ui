"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Button } from "./components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetCloseX,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./components/ui/sheet";

export default function App() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="secondary" />}>
        알림함 열기
      </SheetTrigger>
      <SheetContent side="right">
        <SheetCloseX />
        <SheetHeader>
          <SheetTitle>알림</SheetTitle>
          <SheetDescription>최근 활동 3 건이 있습니다.</SheetDescription>
        </SheetHeader>
        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
          {["배포 성공: v0.99.0", "PR #196 머지됨", "댓글 2 건"].map((t) => (
            <li
              key={t}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "var(--radius)",
                background: "var(--background-subtle)",
                fontSize: "var(--text-sm)",
              }}
            >
              {t}
            </li>
          ))}
        </ul>
        <SheetFooter>
          <SheetClose render={<Button variant="ghost">닫기</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
`;

export function SheetLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="sheet"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={520}
    />
  );
}
