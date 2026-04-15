import { Slider } from "@/components/ui/slider";
import { CodePanel } from "@/components/ui/code-panel";
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
        <CodePanel
          language="tsx"
          code={`<Slider defaultValue={50} aria-label="기본" />`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add slider`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/slider/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Slider } from "@/components/ui/slider";

const [value, setValue] = useState(40);

<Slider value={value} onValueChange={setValue} aria-label="볼륨" />`}
      />

      <h2>Examples</h2>

      <h3>제어 모드</h3>
      <Preview>
        <Preview.Demo>
          <ControlledSliderDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [v, setV] = useState(40);

<Slider value={v} onValueChange={setV} aria-label="볼륨" />`}
        />
      </Preview>

      <h3>min / max / step</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={2.5} min={0} max={5} step={0.1} aria-label="별점" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Slider defaultValue={2.5} min={0} max={5} step={0.1} />`}
        />
      </Preview>

      <h3>Disabled</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Slider defaultValue={30} disabled aria-label="비활성" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Slider defaultValue={30} disabled />`}
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
