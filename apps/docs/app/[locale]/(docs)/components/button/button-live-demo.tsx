"use client";

import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { LiveCode } from "@/components/live-code";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

/**
 * Button 페이지 상단의 기본 라이브 데모.
 *
 * react-live 의 scope 로 Button 컴포넌트(함수) 를 넘겨야 하는데 서버 컴포넌트 → 클라이언트 컴포넌트
 * 경계로는 함수를 직렬화할 수 없다. 그래서 이 작은 client wrapper 안에서 `scope: { Button }` 을
 * 직접 구성한다. 페이지 본체는 서버 컴포넌트 + `force-static` 으로 유지된다.
 *
 * Tabs 프리미티브로 직접 React/Flutter 탭을 구성한다 — React 탭만 LiveCode 로 렌더하고,
 * Flutter 탭은 정적 CodePanel 로 렌더. CodeTabs 에 docs-only `live:true` 옵션을 두지 않기 위함.
 */
export function ButtonLiveDemo() {
  return (
    <Tabs defaultValue="react">
      <TabsList>
        <TabsIndicator />
        <TabsTrigger value="react">React</TabsTrigger>
        <TabsTrigger value="flutter">Flutter</TabsTrigger>
      </TabsList>
      <TabsContent value="react">
        <LiveCode scope={{ Button }} code={`<Button>저장</Button>`} />
      </TabsContent>
      <TabsContent value="flutter">
        <CodePanel
          language="dart"
          code={`ShUiButton(
  onPressed: () {},
  child: const Text('저장'),
)`}
        />
      </TabsContent>
    </Tabs>
  );
}
