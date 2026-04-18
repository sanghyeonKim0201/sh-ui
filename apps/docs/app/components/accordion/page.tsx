export const dynamic = "force-static";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { AccordionSingleDemo } from "./_demos/basic";

export default function AccordionPage() {
  return (
    <main className="container">
      <h1>Accordion</h1>
      <p className="muted">
        수직으로 쌓인 접이식 섹션. Base UI Accordion을 얇게 감쌌으며 기본은 다중
        확장(동시에 여러 개 열림), <code>value</code>/
        <code>defaultValue</code>로 제어할 수 있다.
      </p>
      <p className="muted">
        <em>Flutter 위젯은 아직 제공되지 않습니다. React 예제만 표시합니다.</em>
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Accordion defaultValue={["item-1"]}>
              <AccordionItem value="item-1">
                <AccordionTrigger>설치 방법이 궁금합니다</AccordionTrigger>
                <AccordionContent>
                  CLI를 사용하면 <code>npx sh-ui add accordion</code>으로
                  컴포넌트 파일이 <code>components/ui/accordion/</code>에
                  복사됩니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>테마는 어떻게 바꾸나요?</AccordionTrigger>
                <AccordionContent>
                  <code>tokens.css</code>의 CSS 변수를 덮어쓰면 전체 컴포넌트에
                  일괄 적용됩니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>접근성은 어떻게 챙겼나요?</AccordionTrigger>
                <AccordionContent>
                  내부적으로 Base UI를 사용해 키보드 네비게이션과 ARIA 속성이
                  자동으로 적용됩니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Accordion defaultValue={["item-1"]}>
  <AccordionItem value="item-1">
    <AccordionTrigger>설치 방법이 궁금합니다</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>테마는 어떻게 바꾸나요?</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel
        language="bash"
        showLineNumbers={false}
        code={`npx sh-ui add accordion`}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/accordion/</code>로
        복사한다. <code>@base-ui-components/react</code>가 필요하다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

<Accordion defaultValue={["a"]}>
  <AccordionItem value="a">
    <AccordionTrigger>질문 A</AccordionTrigger>
    <AccordionContent>답변 A</AccordionContent>
  </AccordionItem>
</Accordion>`}
      />

      <h2>Examples</h2>

      <h3>여러 항목 동시 열기 (multiple)</h3>
      <p className="muted">
        기본값이 <code>multiple={`{true}`}</code>라 여러 섹션을 동시에 펼칠 수
        있다. <code>defaultValue</code>에 배열로 여러 값을 주면 그만큼 초기 열림
        상태로 시작한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Accordion defaultValue={["item-a", "item-b"]}>
              <AccordionItem value="item-a">
                <AccordionTrigger>섹션 A</AccordionTrigger>
                <AccordionContent>
                  A는 처음부터 열려 있습니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-b">
                <AccordionTrigger>섹션 B</AccordionTrigger>
                <AccordionContent>
                  B도 같이 열려 있고, A와 독립적으로 토글됩니다.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-c">
                <AccordionTrigger>섹션 C</AccordionTrigger>
                <AccordionContent>
                  C를 열어도 A·B는 닫히지 않습니다.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Accordion defaultValue={["item-a", "item-b"]}>
  <AccordionItem value="item-a">
    <AccordionTrigger>섹션 A</AccordionTrigger>
    <AccordionContent>A는 처음부터 열려 있습니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-b">
    <AccordionTrigger>섹션 B</AccordionTrigger>
    <AccordionContent>B도 같이 열려 있습니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-c">
    <AccordionTrigger>섹션 C</AccordionTrigger>
    <AccordionContent>C를 열어도 A·B는 닫히지 않습니다.</AccordionContent>
  </AccordionItem>
</Accordion>`}
        />
      </Preview>

      <h3>한 번에 하나만 열기 (single)</h3>
      <p className="muted">
        <code>multiple={`{false}`}</code>로 한 번에 하나만 열리도록 제한할 수
        있다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <AccordionSingleDemo />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Accordion multiple={false}>
  <AccordionItem value="a">
    <AccordionTrigger>A</AccordionTrigger>
    <AccordionContent>A 내용</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger>B</AccordionTrigger>
    <AccordionContent>B 내용</AccordionContent>
  </AccordionItem>
</Accordion>`}
        />
      </Preview>

      <h3>비활성화된 항목</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Accordion>
              <AccordionItem value="a">
                <AccordionTrigger>열 수 있는 항목</AccordionTrigger>
                <AccordionContent>일반 동작.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b" disabled>
                <AccordionTrigger>비활성화된 항목</AccordionTrigger>
                <AccordionContent>이 내용은 열리지 않습니다.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<AccordionItem value="b" disabled>
  <AccordionTrigger>비활성화된 항목</AccordionTrigger>
  <AccordionContent>...</AccordionContent>
</AccordionItem>`}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          {
            name: "Accordion",
            description: (
              <>
                루트. Base UI <code>Accordion.Root</code>를 래핑.
              </>
            ),
          },
          {
            name: "AccordionItem",
            description: (
              <>
                <code>value</code>로 식별되는 섹션 컨테이너.
              </>
            ),
          },
          {
            name: "AccordionTrigger",
            description: <>헤더 버튼. chevron이 자동 회전한다.</>,
          },
          {
            name: "AccordionContent",
            description: <>열림/닫힘 전환되는 패널 본문.</>,
          },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        Props는 Base UI Accordion과 동일하다: <code>value</code>,{" "}
        <code>defaultValue</code>, <code>onValueChange</code>,{" "}
        <code>disabled</code>, <code>orientation</code> 등.
      </p>
    </main>
  );
}
