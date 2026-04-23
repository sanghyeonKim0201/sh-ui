export const dynamic = "force-static";

import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";

export default function TabsPage() {
  return (
    <main className="container">
      <h1>Tabs</h1>
      <p className="muted">
        패널 전환용 탭. <a href="https://base-ui.com/react/components/tabs" target="_blank" rel="noreferrer">Base UI</a> Tabs 위에 sh-ui 토큰 스타일을 입혔다. 키보드 내비게이션(←/→, Home/End)과 활성 인디케이터 내장.
      </p>

      <Preview>
        <Preview.Demo>
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
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsIndicator />
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="usage">Usage</TabsTrigger>
    <TabsTrigger value="api">API</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">패널 전환 컴포넌트입니다.</TabsContent>
  <TabsContent value="usage">defaultValue / value + onValueChange.</TabsContent>
  <TabsContent value="api">TabsTrigger의 value로 TabsContent와 매칭.</TabsContent>
</Tabs>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTabs(
  tabs: const [
    ShUiTab(label: 'Overview', child: Text('패널 전환 컴포넌트입니다.')),
    ShUiTab(label: 'Usage', child: Text('initialIndex / onChanged.')),
    ShUiTab(label: 'API', child: Text('label + child로 구성.')),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui add tabs` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui add tabs` },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        React: registry의 <code>components/ui/tabs/</code> 파일을 복사하고 Base UI를 설치.
        Flutter: <code>packages/registry/flutter/widgets/sh_ui_tabs.dart</code>를 <code>lib/widgets/</code>로 복사.
      </p>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `pnpm add @base-ui-components/react` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `# 별도 의존성 없음 (sh_ui_tokens.dart 필요)` },
        ]}
      />
      <ul>
        <li><code>index.tsx</code> / <code>styles.css</code> (React)</li>
        <li><code>sh_ui_tabs.dart</code> (Flutter)</li>
      </ul>

      <h2>Examples</h2>

      <h3>Controlled</h3>
      <p className="muted">
        <code>value</code> + <code>onValueChange</code>로 외부 상태와 동기화. 다른 탭 그룹과 연동하거나 URL 해시와 맞출 때 사용.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsIndicator, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ControlledTabs() {
  const [tab, setTab] = useState("a");
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsIndicator />
        <TabsTrigger value="a">A</TabsTrigger>
        <TabsTrigger value="b">B</TabsTrigger>
      </TabsList>
      <TabsContent value="a">패널 A</TabsContent>
      <TabsContent value="b">패널 B</TabsContent>
    </Tabs>
  );
}`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `// initialIndex + onChanged로 외부 상태와 동기화
int _index = 0;

ShUiTabs(
  initialIndex: _index,
  onChanged: (i) => setState(() => _index = i),
  tabs: const [
    ShUiTab(label: 'A', child: Text('패널 A')),
    ShUiTab(label: 'B', child: Text('패널 B')),
  ],
)`,
          },
        ]}
      />

      <h3>Variants</h3>
      <p className="muted">
        <code>variant</code>으로 외형을 바꾼다. 기본은 <code>underline</code>.
      </p>

      <h4>underline (기본)</h4>
      <Preview>
        <Preview.Demo>
          <Tabs defaultValue="a">
            <TabsList>
              <TabsIndicator />
              <TabsTrigger value="a">Overview</TabsTrigger>
              <TabsTrigger value="b">Usage</TabsTrigger>
              <TabsTrigger value="c">API</TabsTrigger>
            </TabsList>
            <TabsContent value="a">underline 변형</TabsContent>
            <TabsContent value="b">하단 라인이 이동</TabsContent>
            <TabsContent value="c">문서형 UI에 적합</TabsContent>
          </Tabs>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Tabs variant="underline">...</Tabs>` },
            { value: "flutter", label: "Flutter", language: "dart", code: `ShUiTabs(variant: ShUiTabsVariant.underline, tabs: [...])` },
          ]}
        />
      </Preview>

      <h4>pill (세그먼트)</h4>
      <Preview>
        <Preview.Demo>
          <Tabs defaultValue="a" variant="pill">
            <TabsList>
              <TabsIndicator />
              <TabsTrigger value="a">Overview</TabsTrigger>
              <TabsTrigger value="b">Usage</TabsTrigger>
              <TabsTrigger value="c">API</TabsTrigger>
            </TabsList>
            <TabsContent value="a">pill 변형</TabsContent>
            <TabsContent value="b">세그먼트 컨트롤 형태</TabsContent>
            <TabsContent value="c">설정 패널 등에 적합</TabsContent>
          </Tabs>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Tabs variant="pill">...</Tabs>` },
            { value: "flutter", label: "Flutter", language: "dart", code: `ShUiTabs(variant: ShUiTabsVariant.pill, tabs: [...])` },
          ]}
        />
      </Preview>

      <h4>plain (컨테이너 없음)</h4>
      <Preview>
        <Preview.Demo>
          <Tabs defaultValue="a" variant="plain">
            <TabsList>
              <TabsTrigger value="a">Overview</TabsTrigger>
              <TabsTrigger value="b">Usage</TabsTrigger>
              <TabsTrigger value="c">API</TabsTrigger>
            </TabsList>
            <TabsContent value="a">plain 변형</TabsContent>
            <TabsContent value="b">배경·테두리 없이 텍스트만</TabsContent>
            <TabsContent value="c">툴바나 조밀한 영역에 적합</TabsContent>
          </Tabs>
        </Preview.Demo>
        <CodeTabs
          items={[
            { value: "react", label: "React", language: "tsx", code: `<Tabs variant="plain">...</Tabs>` },
            { value: "flutter", label: "Flutter", language: "dart", code: `ShUiTabs(variant: ShUiTabsVariant.plain, tabs: [...])` },
          ]}
        />
      </Preview>

      <h3>Vertical</h3>
      <Preview>
        <Preview.Demo>
          <Tabs defaultValue="one" orientation="vertical">
            <TabsList>
              <TabsIndicator />
              <TabsTrigger value="one">One</TabsTrigger>
              <TabsTrigger value="two">Two</TabsTrigger>
              <TabsTrigger value="three">Three</TabsTrigger>
            </TabsList>
            <TabsContent value="one">세로 배치 탭 1</TabsContent>
            <TabsContent value="two">세로 배치 탭 2</TabsContent>
            <TabsContent value="three">세로 배치 탭 3</TabsContent>
          </Tabs>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Tabs defaultValue="one" orientation="vertical">...</Tabs>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiTabs(
  orientation: ShUiTabsOrientation.vertical,
  tabs: const [
    ShUiTab(label: 'One', child: Text('세로 배치 탭 1')),
    ShUiTab(label: 'Two', child: Text('세로 배치 탭 2')),
    ShUiTab(label: 'Three', child: Text('세로 배치 탭 3')),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Tabs", description: "루트. value/defaultValue/onValueChange/orientation." },
          { name: "TabsList", description: "탭 버튼을 담는 리스트. 키보드 내비게이션 처리." },
          { name: "TabsTrigger", description: "탭 버튼. value로 Content와 연결." },
          { name: "TabsIndicator", description: "활성 탭 뒤로 움직이는 배경 인디케이터 (선택)." },
          { name: "TabsContent", description: "패널. value가 일치할 때만 표시." },
          { name: "useTabsVariant", description: "현재 Tabs의 variant 값을 읽는 훅." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Tabs</h3>
      <PropsTable
        rows={[
          { prop: "defaultValue", type: "string | number", description: "초기 활성 탭 (uncontrolled)." },
          { prop: "value", type: "string | number", description: "활성 탭 (controlled)." },
          { prop: "onValueChange", type: "(value: string | number) => void", description: "활성 탭 변경 콜백." },
          { prop: "orientation", type: `"horizontal" | "vertical"`, default: `"horizontal"`, description: "방향." },
          { prop: "variant", type: `"underline" | "pill" | "plain"`, default: `"underline"`, description: "외형 변형." },
        ]}
      />

      <h3>TabsTrigger</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string | number", description: "TabsContent의 value와 매칭되는 식별자." },
          { prop: "disabled", type: "boolean", description: "비활성화. 키보드 내비게이션에서 건너뜀." },
        ]}
      />

      <h3>TabsContent</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string | number", description: "매칭될 탭의 value." },
          { prop: "keepMounted", type: "boolean", default: "false", description: "비활성 패널도 DOM에 유지." },
        ]}
      />

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        Tabs · TabsList · TabsTrigger · TabsContent 모두 네이티브 HTML 속성
        (<code>style</code>·<code>className</code>·<code>data-*</code>)을 그대로 받는다.
        탭 정렬·간격·인디케이터 위치 조정은 <code>style</code> / <code>className</code>
        으로 직접 — <a href="/guidelines">가이드라인</a> 참조.
      </p>
    </main>
  );
}
