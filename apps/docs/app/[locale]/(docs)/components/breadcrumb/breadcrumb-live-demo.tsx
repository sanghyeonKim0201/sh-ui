"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";

export default function App() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">컴포넌트</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
`;

export function BreadcrumbLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="breadcrumb"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={420}
    />
  );
}
