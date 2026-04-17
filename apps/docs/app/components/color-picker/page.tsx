export const dynamic = "force-static";

import { ColorPicker } from "@/components/ui/color-picker";
import { CodePanel } from "@/components/ui/code-panel";
import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { ControlledColorPickerDemo } from "./_demos/controlled";

export default function ColorPickerPage() {
  return (
    <main className="container">
      <h1>ColorPicker</h1>
      <p className="muted">
        SV(채도/명도) 사각형 + Hue 슬라이더 + Hex 인풋으로 구성된 인라인 컬러 픽커. HSV 내부 상태로 드래그 정밀도를 유지한다.
      </p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#3B82F6" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `<ColorPicker defaultValue="#3B82F6" />`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/color-picker/index.tsx",
              code: `/* ───── color math ───── */

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const full = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const d = max - Math.min(rn, gn, bn);
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

function hsvToRgb({ h, s, v }: HSV): [number, number, number] {
  const c = v * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const [r, g, b] =
    hh < 1 ? [c, x, 0] : hh < 2 ? [x, c, 0] :
    hh < 3 ? [0, c, x] : hh < 4 ? [0, x, c] :
    hh < 5 ? [x, 0, c] : [c, 0, x];
  const m = v - c;
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

/* ───── pointer drag hook (SV / Hue 공용) ───── */

function useDrag(onMove: (e: PointerEvent, el: HTMLElement) => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    onMove(e.nativeEvent, el);
    const move = (ev: PointerEvent) => onMove(ev, el);
    const up = (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  };
  return { ref, onPointerDown };
}

/* ───── component ─────
 * HSV 내부 상태로 드래그 정밀도 유지.
 * 외부 value 변경 시 hsv/hexInput 동기화하되, 우리가 emit한 hex는 무시해 무한루프 방지. */

export function ColorPicker({ value: valueProp, onChange, defaultValue = "#000000" }: ColorPickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const value = isControlled ? valueProp! : internal;

  const [hsv, setHsv] = React.useState<HSV>(() => hexToHsv(value));
  const lastEmittedRef = React.useRef(value);

  React.useEffect(() => {
    if (value === lastEmittedRef.current) return;
    setHsv(hexToHsv(value));
  }, [value]);

  const emit = (nextHsv: HSV) => {
    const hex = hsvToHex(nextHsv);
    lastEmittedRef.current = hex;
    setHsv(nextHsv);
    if (!isControlled) setInternal(hex);
    onChange?.(hex);
  };

  const sv = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    const s = clamp((e.clientX - r.left) / r.width, 0, 1);
    const v = 1 - clamp((e.clientY - r.top) / r.height, 0, 1);
    emit({ ...hsv, s, v });
  });
  const hue = useDrag((e, el) => {
    const r = el.getBoundingClientRect();
    emit({ ...hsv, h: clamp((e.clientX - r.left) / r.width, 0, 1) * 360 });
  });

  // 렌더: SV 영역 / Hue 슬라이더 / Hex 인풋 (생략)
  return (/* ... */);
}`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add color-picker`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/color-picker/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { ColorPicker } from "@/components/ui/color-picker";

const [color, setColor] = useState("#3B82F6");

<ColorPicker value={color} onChange={setColor} />`}
      />

      <h2>Examples</h2>

      <h3>제어 모드 (Controlled)</h3>
      <Preview>
        <Preview.Demo>
          <ControlledColorPickerDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [color, setColor] = useState("#3B82F6");

<ColorPicker value={color} onChange={setColor} />`}
        />
      </Preview>

      <h3>비제어 모드 (Uncontrolled)</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 280 }}>
            <ColorPicker defaultValue="#10B981" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<ColorPicker defaultValue="#10B981" />`}
        />
      </Preview>

      <h2>API Reference</h2>

      <h3>ColorPicker</h3>
      <PropsTable
        rows={[
          { prop: "value", type: "string", description: "현재 색상 (hex). 제어 모드에서 사용." },
          { prop: "defaultValue", type: "string", default: `"#000000"`, description: "비제어 모드 초기값." },
          { prop: "onChange", type: "(hex: string) => void", description: "색상 변경 콜백. 항상 6자리 대문자 hex." },
          { prop: "className", type: "string" },
        ]}
      />

      <h3>내부 구성</h3>
      <p className="muted">단일 컴포넌트지만 시각적으로 세 영역으로 나뉨.</p>
      <ul>
        <li><strong>SV 영역</strong> — 드래그로 채도/명도 동시 조정</li>
        <li><strong>Hue 슬라이더</strong> — 색조 0~360°</li>
        <li><strong>Hex 인풋</strong> — 직접 입력 (Enter/blur로 커밋, 잘못된 값은 자동 복원)</li>
      </ul>
    </main>
  );
}