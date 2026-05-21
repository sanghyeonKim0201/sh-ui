"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { ScrollArea } from "./components/ui/scroll-area";

const items = Array.from({ length: 30 }, (_, i) => \`항목 \${i + 1}\`);

export default function App() {
  return (
    <ScrollArea
      style={{
        height: 240,
        width: 280,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
      }}
      viewportClassName="p-3"
    >
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.25rem" }}>
        {items.map((label) => (
          <li
            key={label}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "var(--radius)",
              background: "var(--background-subtle)",
              fontSize: "var(--text-sm)",
            }}
          >
            {label}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
`;

export function ScrollAreaLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
}) {
  return (
    <ComponentSandbox
      componentName="scroll-area"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      demoCode={APP_TSX}
      editorHeight={460}
    />
  );
}
