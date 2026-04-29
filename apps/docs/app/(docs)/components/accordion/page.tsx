export const dynamic = "force-static";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { SubComponents } from "@/components/sub-components";
import { AccordionSingleDemo } from "./_demos/basic";

export default function AccordionPage() {
  return (
    <main className="container">
      <h1>Accordion</h1>
      <p className="muted">
        수직으로 쌓인 접이식 섹션. React는 Base UI Accordion을 얇게 감쌌으며
        기본이 다중 확장(multiple)이고 <code>value</code>/
        <code>defaultValue</code>로 제어한다. Flutter는{" "}
        <code>ShUiAccordion</code>에 <code>items</code>·<code>type</code>·
        <code>initialValue</code>를 넘겨 구성한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Accordion defaultValue={["item-1"]}>
              <AccordionItem value="item-1">
                <AccordionTrigger>설치 방법이 궁금합니다</AccordionTrigger>
                <AccordionContent>
                  CLI를 사용하면 <code>npx sh-ui-cli add accordion</code>으로
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Accordion defaultValue={["item-1"]}>
  <AccordionItem value="item-1">
    <AccordionTrigger>설치 방법이 궁금합니다</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>테마는 어떻게 바꾸나요?</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiAccordion(
  initialValue: const ['item-1'],
  items: [
    ShUiAccordionItem(
      value: 'item-1',
      title: '설치 방법이 궁금합니다',
      content: Text('CLI를 사용하면 "sh-ui add accordion"으로 위젯 파일이 lib/widgets/에 복사됩니다.'),
    ),
    ShUiAccordionItem(
      value: 'item-2',
      title: '테마는 어떻게 바꾸나요?',
      content: Text('ShUiTheme 토큰을 덮어쓰면 전체 위젯에 일괄 적용됩니다.'),
    ),
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
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add accordion`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add accordion

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_accordion.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/accordion/</code>로
        복사한다. <code>@base-ui/react</code>가 필요하다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import {
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
</Accordion>`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_accordion.dart';

ShUiAccordion(
  initialValue: const ['a'],
  items: [
    ShUiAccordionItem(
      value: 'a',
      title: '질문 A',
      content: Text('답변 A'),
    ),
  ],
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>여러 항목 동시 열기 (multiple)</h3>
      <p className="muted">
        React는 기본이 <code>multiple</code>이며{" "}
        <code>defaultValue</code>에 배열로 여러 값을 줄 수 있다. Flutter도{" "}
        <code>ShUiAccordionType.multiple</code>이 기본이며{" "}
        <code>initialValue</code>에 <code>List&lt;String&gt;</code>을 전달한다.
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Accordion defaultValue={["item-a", "item-b"]}>
  <AccordionItem value="item-a">
    <AccordionTrigger>섹션 A</AccordionTrigger>
    <AccordionContent>A는 처음부터 열려 있습니다.</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-b">
    <AccordionTrigger>섹션 B</AccordionTrigger>
    <AccordionContent>B도 같이 열려 있습니다.</AccordionContent>
  </AccordionItem>
</Accordion>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiAccordion(
  type: ShUiAccordionType.multiple,
  initialValue: const ['item-a', 'item-b'],
  items: [
    ShUiAccordionItem(value: 'item-a', title: '섹션 A', content: Text('A는 처음부터 열려 있습니다.')),
    ShUiAccordionItem(value: 'item-b', title: '섹션 B', content: Text('B도 같이 열려 있습니다.')),
    ShUiAccordionItem(value: 'item-c', title: '섹션 C', content: Text('C를 열어도 A·B는 닫히지 않습니다.')),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h3>한 번에 하나만 열기 (single)</h3>
      <p className="muted">
        React는 <code>multiple={`{false}`}</code>, Flutter는{" "}
        <code>type: ShUiAccordionType.single</code>로 한 번에 하나만 열리게 한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <AccordionSingleDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Accordion multiple={false}>
  <AccordionItem value="a">
    <AccordionTrigger>A</AccordionTrigger>
    <AccordionContent>A 내용</AccordionContent>
  </AccordionItem>
  <AccordionItem value="b">
    <AccordionTrigger>B</AccordionTrigger>
    <AccordionContent>B 내용</AccordionContent>
  </AccordionItem>
</Accordion>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiAccordion(
  type: ShUiAccordionType.single,
  initialValue: 'a',
  items: [
    ShUiAccordionItem(value: 'a', title: 'A', content: Text('A 내용')),
    ShUiAccordionItem(value: 'b', title: 'B', content: Text('B 내용')),
  ],
)`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<AccordionItem value="b" disabled>
  <AccordionTrigger>비활성화된 항목</AccordionTrigger>
  <AccordionContent>...</AccordionContent>
</AccordionItem>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiAccordionItem(
  value: 'b',
  title: '비활성화된 항목',
  disabled: true,
  content: Text('이 내용은 열리지 않습니다.'),
)`,
            },
          ]}
        />
      </Preview>

      <h3>size — 컴팩트 변형</h3>
      <p className="muted">
        좁은 사이드바·다중 섹션 패널에는 <code>size=&quot;sm&quot;</code> 으로
        트리거 패딩·폰트·chevron 을 줄인다. 디폴트는 <code>md</code>.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 520 }}>
            <Accordion size="sm" defaultValue={["a"]}>
              <AccordionItem value="a">
                <AccordionTrigger>여백</AccordionTrigger>
                <AccordionContent>--space-0 ~ --space-16</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>폰트 굵기</AccordionTrigger>
                <AccordionContent>--weight-regular ~ --weight-bold</AccordionContent>
              </AccordionItem>
              <AccordionItem value="c">
                <AccordionTrigger>모션</AccordionTrigger>
                <AccordionContent>--duration-* / --ease-*</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Accordion size="sm" defaultValue={["a"]}>
  <AccordionItem value="a">
    <AccordionTrigger>여백</AccordionTrigger>
    <AccordionContent>--space-0 ~ --space-16</AccordionContent>
  </AccordionItem>
</Accordion>`,
            },
          ]}
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
          {
            name: "ShUiAccordion",
            description: (
              <>
                Flutter 루트. <code>items</code>·<code>type</code>·
                <code>initialValue</code>·<code>onValueChange</code>를 받는다.
              </>
            ),
          },
          {
            name: "ShUiAccordionItem",
            description: (
              <>
                Flutter 항목 모델. <code>value</code>·<code>title</code>·
                <code>content</code>·<code>leadingIcon</code>·
                <code>disabled</code>.
              </>
            ),
          },
        ]}
      />

      <h2>API Reference</h2>
      <p className="muted">
        React Props는 Base UI Accordion과 동일하다: <code>value</code>,{" "}
        <code>defaultValue</code>, <code>onValueChange</code>,{" "}
        <code>disabled</code>, <code>orientation</code> 등. 추가로 sh-ui 가
        제공하는 prop:
      </p>
      <ul>
        <li>
          <code>size</code> — <code>&quot;sm&quot; | &quot;md&quot;</code> (기본
          <code>md</code>). <code>sm</code> 은 padding 8/4 + font 12px + chevron
          12px 로 좁은 사이드바·다중 섹션에 적합.
        </li>
      </ul>
      <p className="muted">
        Flutter: <code>type</code>이 <code>single</code>이면{" "}
        <code>initialValue</code>와 <code>onValueChange</code>의 값 타입이{" "}
        <code>String?</code>, <code>multiple</code>이면{" "}
        <code>List&lt;String&gt;</code>이다.
      </p>

      <h2>스타일 커스터마이즈</h2>
      <p className="muted">
        Accordion · AccordionItem · AccordionTrigger · AccordionContent 모두
        네이티브 HTML 속성을 그대로 받는다. 보더·패딩·간격 조정은
        <code>style</code> / <code>className</code> 으로 직접 —{" "}
        <a href="/guidelines">가이드라인</a> 참조.
      </p>
      <p className="muted">
        디폴트 hover 효과는 <code>--background-muted</code> 배경 틴트 (enabled
        상태일 때만). 다른 효과 (밑줄·글자색 변경·아이콘 회전 등) 가 필요하면{" "}
        <code>className</code> 을 통해 <code>:hover</code> 셀렉터로 override.
      </p>
    </main>
  );
}
