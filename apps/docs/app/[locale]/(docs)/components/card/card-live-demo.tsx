"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Button } from "./components/ui/button";

export default function App() {
  return (
    <Card style={{ maxWidth: 480 }}>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>이메일과 푸시 알림을 받을지 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary">나중에</Button>
        <Button>설정하기</Button>
      </CardFooter>
    </Card>
  );
}
`;

export function CardLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="card"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={420}
    />
  );
}
