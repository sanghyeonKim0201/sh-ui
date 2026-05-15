export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { VariantSource } from "@/components/variant-source";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { AvatarLiveDemo } from "./avatar-live-demo";

const sources = loadComponentSources("avatar");

export default function AvatarPage() {
  return (
    <main className="container">
      <h1>Avatar</h1>
      <p className="muted">
        사용자 프로필 이미지 또는 이니셜 fallback.{" "}
        <a href="https://base-ui.com/react/components/avatar" target="_blank" rel="noreferrer">
          Base UI Avatar
        </a>{" "}
        래핑 — 이미지 로드 실패 시 자동으로 fallback 렌더.
      </p>

      <AvatarLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add avatar`,
          },
        ]}
      />
      <h3>Manual</h3>
      <VariantSource name="avatar" />


      <h2>Examples</h2>

      <h3>크기</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <Avatar size="sm"><AvatarFallback>SM</AvatarFallback></Avatar>
            <Avatar size="md"><AvatarFallback>MD</AvatarFallback></Avatar>
            <Avatar size="lg"><AvatarFallback>LG</AvatarFallback></Avatar>
            <Avatar size="xl"><AvatarFallback>XL</AvatarFallback></Avatar>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Avatar size="sm">...</Avatar>
<Avatar size="md">...</Avatar>
<Avatar size="lg">...</Avatar>
<Avatar size="xl">...</Avatar>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Avatar", description: "루트 span. size 변형 제공." },
          { name: "AvatarImage", description: "프로필 이미지(img). 로드 실패 시 Fallback으로 전환." },
          { name: "AvatarFallback", description: "이니셜/아이콘 fallback. delay prop으로 표시 지연 가능." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Avatar</h3>
      <PropsTable
        rows={[
          { prop: "size", type: `"sm" | "md" | "lg" | "xl"`, default: `"md"`, description: "크기 변형." },
        ]}
      />

      <h3>AvatarFallback</h3>
      <PropsTable
        rows={[
          { prop: "delay", type: "number", description: "로드 시도 중 flash 방지용 지연(ms)." },
        ]}
      />
    </main>
  );
}
