export const dynamic = "force-static";

import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import {
  UnitsDemo,
  SliderCompanionDemo,
  DisabledDemo,
} from "./_demos/basic";
import { VariantSource } from "@/components/variant-source";
import {
  loadComponentSources,
  loadExtraComponent,
} from "@/components/sandbox-code/load-component-sources";
import { NumericInputLiveDemo } from "./numeric-input-live-demo";

const sources = loadComponentSources("numeric-input");
const extras = [loadExtraComponent("slider")];

export default function NumericInputPage() {
  return (
    <main className="container">
      <h1>NumericInput</h1>
      <p className="muted">
        슬라이더 동반 · 토큰 편집기 같은 좁은 영역에 적합한 컴팩트 숫자 입력.
        값 표시 라벨처럼 보이지만 클릭 시 인라인 편집되고, 입력값은 onChange
        시점에 즉시 <code>min</code>/<code>max</code> 로 clamp 된다.
      </p>
      <p className="muted">
        일반 폼 입력에는 <a href="/components/input"><code>Input</code></a> /
        같은 모듈의 <code>NumberInput</code>(천 단위 콤마 자동) 을 권장한다.
      </p>

      <NumericInputLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
        extraComponents={extras}
      />

      <h2>Installation</h2>
      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add numeric-input` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="numeric-input" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { NumericInput } from "@/components/ui/numeric-input";

// Controlled
<NumericInput
  value={value}
  onValueChange={setValue}
  min={0}
  max={100}
  step={1}
  unit="%"
  aria-label="opacity"
/>

// Uncontrolled
<NumericInput defaultValue={50} min={0} max={100} unit="%" aria-label="opacity" />`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>단위 표시</h3>
      <Preview>
        <Preview.Demo>
          <UnitsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<NumericInput defaultValue={40} min={0} max={200} unit="px" />
<NumericInput defaultValue={120} min={0} max={1000} unit="ms" />
<NumericInput defaultValue={80} min={0} max={100} unit="%" />`,
            },
          ]}
        />
      </Preview>

      <h3>슬라이더 동반</h3>
      <p className="muted">
        슬라이더로 대략적인 값을 잡고 NumericInput 에 정확한 값을 타이핑하는
        패턴 — 토큰 편집기에서 가장 자주 쓰는 조합.
      </p>
      <Preview>
        <Preview.Demo>
          <SliderCompanionDemo />
        </Preview.Demo>
      </Preview>

      <h3>비활성화</h3>
      <Preview>
        <Preview.Demo>
          <DisabledDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<NumericInput defaultValue={42} disabled />`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>
      <PropsTable
        rows={[
          { prop: "value", type: "number", description: "제어 모드 값." },
          { prop: "defaultValue", type: "number", description: "비제어 모드 초기값." },
          { prop: "onValueChange", type: "(value: number) => void", description: "값 변경 콜백. min/max 범위로 clamp 된 값이 전달된다." },
          { prop: "min", type: "number", description: "허용 최솟값. 입력값이 작으면 자동 clamp." },
          { prop: "max", type: "number", description: "허용 최댓값. 입력값이 크면 자동 clamp." },
          { prop: "step", type: "number", default: "1", description: "화살표 버튼·키보드 step 폭." },
          { prop: "unit", type: "ReactNode", description: "값 우측에 부착할 단위 표시 (px / ms / % / ° 등)." },
          { prop: "disabled", type: "boolean", description: "비활성. opacity 줄어들고 cursor not-allowed." },
          { prop: "aria-label", type: "string", description: "스크린리더 라벨. 값만 보이고 시각 라벨이 없을 때 권장." },
        ]}
      />

      <h2>Input / NumberInput / NumericInput 어떤 걸?</h2>
      <ul>
        <li><strong>Input</strong> — 일반 한 줄 텍스트 입력. type 으로 password / email 등 변형.</li>
        <li><strong>NumberInput</strong> (Input 모듈 내) — 회계·금액·천 단위 콤마 자동. 폼 input 크기.</li>
        <li><strong>NumericInput</strong> — 슬라이더 동반·토큰 편집기 같은 컴팩트 영역. monospace 우측 정렬, 단위 suffix, 보더 없음.</li>
      </ul>
    </main>
  );
}
