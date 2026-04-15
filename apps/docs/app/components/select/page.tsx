import {
  MultiSelect,
  MultiSelectValue,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { ChipMultiSelectDemo } from "./_demos/chip-multi";

export default function SelectPage() {
  return (
    <main className="container">
      <h1>Select</h1>
      <p className="muted">
        단일 선택 드롭다운. <a href="https://base-ui.com/react/components/select" target="_blank" rel="noreferrer">Base UI</a>의 headless primitive 위에 ShUi 토큰 스타일을 입혔다.
      </p>

      <Preview>
        <Preview.Demo>
          <Select>
            <SelectTrigger style={{ width: "12rem" }}>
              <SelectValue placeholder="과일 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="grapes">Grapes</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="과일 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruits</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="grapes">Grapes</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx sh-ui add select`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/select/</code>로 복사하고, Base UI를 설치한다.
      </p>
      <CodePanel language="bash" showLineNumbers={false} code={`pnpm add @base-ui-components/react`} />
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`// 단일 선택
<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="선택하세요" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</Select>

// 다중 선택 (value: string[])
<MultiSelect value={values} onValueChange={setValues}>
  <SelectTrigger>
    <MultiSelectValue placeholder="여러 개 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</MultiSelect>`}
      />

      <h2>Examples</h2>

      <h3>그룹 + 구분선</h3>
      <Preview>
        <Preview.Demo>
          <Select>
            <SelectTrigger style={{ width: "14rem" }}>
              <SelectValue placeholder="국가 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>아시아</SelectLabel>
                <SelectItem value="kr">대한민국</SelectItem>
                <SelectItem value="jp">일본</SelectItem>
                <SelectItem value="tw">대만</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>유럽</SelectLabel>
                <SelectItem value="de">독일</SelectItem>
                <SelectItem value="fr">프랑스</SelectItem>
                <SelectItem value="uk">영국</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Select>
  <SelectTrigger><SelectValue placeholder="국가 선택" /></SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>아시아</SelectLabel>
      <SelectItem value="kr">대한민국</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>유럽</SelectLabel>
      <SelectItem value="de">독일</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
        />
      </Preview>

      <h3>비활성 항목 / 전체 disabled</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Select>
              <SelectTrigger style={{ width: "11rem" }}>
                <SelectValue placeholder="플랜 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="team" disabled>Team (준비중)</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger style={{ width: "11rem" }}>
                <SelectValue placeholder="선택 불가" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<SelectItem value="team" disabled>Team (준비중)</SelectItem>

<Select disabled>...</Select>`}
        />
      </Preview>

      <h3>다중 선택 (MultiSelect)</h3>
      <Preview>
        <Preview.Demo>
          <MultiSelect>
            <SelectTrigger style={{ width: "18rem" }}>
              <MultiSelectValue placeholder="과일을 여러 개 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
            </SelectContent>
          </MultiSelect>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<MultiSelect>
  <SelectTrigger>
    <MultiSelectValue placeholder="과일을 여러 개 선택" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
  </SelectContent>
</MultiSelect>`}
        />
      </Preview>

      <h3>Multi: 칩(chip) 형태로 표시</h3>
      <p className="muted">
        <code>render</code> prop으로 선택값 렌더링을 커스터마이즈. 기본은 쉼표 join.
      </p>
      <Preview>
        <Preview.Demo>
          <ChipMultiSelectDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<MultiSelect defaultValue={["apple", "grapes"]}>
  <SelectTrigger>
    <MultiSelectValue
      placeholder="과일 선택"
      render={(arr) => (
        <span className="sh-ui-select__chips">
          {arr.map((v) => (
            <span key={v} className="sh-ui-select__chip">{v}</span>
          ))}
        </span>
      )}
    />
  </SelectTrigger>
  <SelectContent>...</SelectContent>
</MultiSelect>`}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Select", description: <>루트. <code>value</code>, <code>defaultValue</code>, <code>onValueChange</code>, <code>disabled</code> 등 Base UI props 그대로.</> },
          { name: "SelectTrigger", description: "트리거 버튼. 열림 상태에 따라 아이콘이 회전." },
          { name: "SelectValue", description: "현재 선택값 또는 placeholder 표시." },
          { name: "SelectContent", description: "드롭다운 팝업 (Portal + Positioner + Popup 래퍼)." },
          { name: "SelectGroup", description: "항목 그룹." },
          { name: "SelectLabel", description: "그룹 라벨." },
          { name: "SelectItem", description: "선택 가능한 항목. 선택 시 체크 아이콘 표시." },
          { name: "SelectSeparator", description: "항목 사이 구분선." },
          { name: "MultiSelect", description: <><code>multiple</code> 모드 래퍼. value/onValueChange가 <code>string[]</code>.</> },
          { name: "MultiSelectValue", description: <>다중 선택 값 표시. <code>render</code> prop으로 칩 등 커스텀 가능.</> },
        ]}
      />

      <h2>API Reference</h2>

      <h3>SelectContent</h3>
      <PropsTable
        rows={[
          { prop: "container", type: "Element | RefObject", description: "Portal이 마운트될 노드. 기본 body. 토큰 스코프 안에 띄우려면 해당 컨테이너 ref 전달." },
        ]}
      />
    </main>
  );
}
