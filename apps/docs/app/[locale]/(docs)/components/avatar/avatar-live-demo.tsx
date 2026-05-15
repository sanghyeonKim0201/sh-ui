"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";

export default function App() {
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
      <Avatar>
        <AvatarImage src="https://i.pravatar.cc/80?img=12" alt="김상현" />
        <AvatarFallback>상</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/this-will-fail.jpg" alt="로드 실패 예시" />
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>SK</AvatarFallback>
      </Avatar>
    </div>
  );
}
`;

export function AvatarLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="avatar"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
    />
  );
}
