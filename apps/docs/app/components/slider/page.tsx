export const dynamic = "force-static";

import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from "@/components/ui/slider";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { ControlledSliderDemo } from "./_demos/controlled";

export default function SliderPage() {
  return (
    <main className="container">
      <h1>Slider</h1>
      <p className="muted">
        값 범위 안에서 단일 값을 선택. 마우스/터치 드래그 + 키보드(화살표/Home/End/PageUp·Down) 지원.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={50} aria-label="기본" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Slider defaultValue={50} aria-label="기본" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `double _value = 50;

ShUiSlider(
  value: _value,
  onChanged: (v) => setState(() => _value = v),
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
            code: `npx sh-ui-cli add slider`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add slider

# 또는 수동 복사:
# packages/registry/flutter/widgets/sh_ui_slider.dart → lib/widgets/`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/slider/</code>로 복사한다.
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
            code: `import { Slider } from "@/components/ui/slider";

const [value, setValue] = useState(40);

<Slider value={value} onValueChange={setValue} aria-label="볼륨" />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import '../widgets/sh_ui_slider.dart';

double _value = 40;

ShUiSlider(
  value: _value,
  onChanged: (v) => setState(() => _value = v),
)`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>제어 모드</h3>
      <Preview>
        <Preview.Demo>
          <ControlledSliderDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [v, setV] = useState(40);

<Slider value={v} onValueChange={setV} aria-label="볼륨" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter의 ShUiSlider는 항상 제어 모드로 동작한다.
double _v = 40;

ShUiSlider(
  value: _v,
  onChanged: (next) => setState(() => _v = next),
)`,
            },
          ]}
        />
      </Preview>

      <h3>min / max / step</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={2.5} min={0} max={5} step={0.1} aria-label="별점" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Slider defaultValue={2.5} min={0} max={5} step={0.1} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `double _rating = 2.5;

ShUiSlider(
  value: _rating,
  min: 0,
  max: 5,
  step: 0.1,
  onChanged: (v) => setState(() => _rating = v),
)`,
            },
          ]}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={30} disabled aria-label="비활성" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Slider defaultValue={30} disabled />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiSlider(
  value: 30,
  enabled: false,
)`,
            },
          ]}
        />
      </Preview>

      <h3>Compound 구성</h3>
      <p className="muted">
        레이아웃을 커스터마이즈하려면 하위 컴포넌트를 직접 조합한다. 자식 생략 시 아래와 동일한 기본 구성이 렌더된다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={60} aria-label="compound">
              <SliderTrack>
                <SliderRange />
                <SliderThumb />
              </SliderTrack>
            </Slider>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Slider defaultValue={60} aria-label="compound">
  <SliderTrack>
    <SliderRange />
    <SliderThumb />
  </SliderTrack>
</Slider>`,
            },
          ]}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>Slider</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "number", description: "현재 값. 제어 모드에서 사용." },
          { prop: "defaultValue", type: "number", default: "0", description: "비제어 모드 초기값." },
          { prop: "onValueChange", type: "(value: number) => void", description: "값이 바뀔 때 호출." },
          { prop: "min", type: "number", default: "0" },
          { prop: "max", type: "number", default: "100" },
          { prop: "step", type: "number", default: "1", description: "증감 단위. Shift+화살표는 ×10." },
          { prop: "disabled", type: "boolean" },
          { prop: "aria-label", type: "string", description: "스크린리더용 라벨. 시각 라벨이 별도로 없으면 필수." },
          { prop: "children", type: "ReactNode", description: "생략 시 기본 Track/Range/Thumb 렌더. 제공 시 그대로 사용." },
        ]}
      />

      <h3>하위 컴포넌트</h3>
      <PropsTable
        rows={[
          { prop: "SliderTrack", type: "div", description: "클릭·드래그 수신 영역. 내부에 SliderRange/SliderThumb 배치." },
          { prop: "SliderRange", type: "div", description: "선택된 값까지의 진행 바." },
          { prop: "SliderThumb", type: "div", description: "키보드·포커스 수신 핸들. role=\"slider\"." },
          { prop: "useSliderState()", type: "hook", description: "Slider 내부에서 현재 value/min/max 등을 읽는 훅." },
        ]}
      />

      <h3>키보드</h3>
      <ul>
        <li><code>←</code> / <code>→</code>, <code>↑</code> / <code>↓</code> — ±step</li>
        <li><code>Shift + 화살표</code>, <code>PageUp</code> / <code>PageDown</code> — ±step×10</li>
        <li><code>Home</code> / <code>End</code> — min / max</li>
      </ul>
    </main>
  );
}
