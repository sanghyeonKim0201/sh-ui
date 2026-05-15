"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";

export default function App() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsIndicator />
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="usage">Usage</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">패널 전환 컴포넌트입니다.</TabsContent>
      <TabsContent value="usage">defaultValue / value + onValueChange.</TabsContent>
      <TabsContent value="api">TabsTrigger의 value로 TabsContent와 매칭.</TabsContent>
    </Tabs>
  );
}
`;

export function TabsLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="tabs"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={400}
    />
  );
}
