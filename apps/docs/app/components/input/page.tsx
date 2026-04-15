import { Input, PasswordInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { EmailValidationDemo } from "./_demos/email-validation";
import { FormLayoutDemo } from "./_demos/form-layout";
import {
  BusinessNumberInputDemo,
  NumberInputDemo,
  PhoneInputDemo,
} from "./_demos/specialized";

export default function InputPage() {
  return (
    <main className="container">
      <h1>Input</h1>
      <p className="muted">텍스트 입력 필드. 네이티브 <code>&lt;input&gt;</code>에 토큰 스타일만 입혔다.</p>

      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320 }}>
            <Input placeholder="이름을 입력하세요" />
          </div>
        </Preview.Demo>
        <CodePanel language="tsx" code={`<Input placeholder="이름을 입력하세요" />`} />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodePanel language="bash" showLineNumbers={false} code={`npx hyeon add input`} />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/input/</code>로 복사한다.
      </p>
      <ul>
        <li><code>index.tsx</code></li>
        <li><code>styles.css</code></li>
      </ul>

      <h2>Usage</h2>
      <CodePanel
        language="tsx"
        code={`import { Input, PasswordInput } from "@/components/ui/input";

<Input placeholder="이름" />
<Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
<Input aria-invalid={hasError} />
<PasswordInput placeholder="비밀번호" />`}
      />

      <h2>Examples</h2>

      <h3>타입</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Input type="email" placeholder="email@example.com" />
            <PasswordInput placeholder="비밀번호 (토글 가능)" />
            <Input type="password" placeholder="type=password (토글 없음)" />
            <Input type="number" placeholder="0" />
            <Input type="date" />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Input type="email" placeholder="email@example.com" />
<PasswordInput placeholder="비밀번호 (토글 가능)" />
<Input type="password" placeholder="type=password (토글 없음)" />
<Input type="number" placeholder="0" />
<Input type="date" />`}
        />
      </Preview>

      <h3>상태</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Input defaultValue="값이 있는 상태" />
            <Input placeholder="disabled" disabled />
            <Input defaultValue="readonly" readOnly />
            <Input placeholder="invalid" aria-invalid />
          </div>
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<Input defaultValue="값이 있는 상태" />
<Input placeholder="disabled" disabled />
<Input defaultValue="readonly" readOnly />
<Input placeholder="invalid" aria-invalid />`}
        />
      </Preview>

      <h3>실시간 검증 (aria-invalid)</h3>
      <Preview>
        <Preview.Demo>
          <EmailValidationDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [email, setEmail] = useState("");
const invalid = email.length > 0 && !email.includes("@");

<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  aria-invalid={invalid || undefined}
/>`}
        />
      </Preview>

      <h3>NumberInput</h3>
      <p className="muted">
        정수 입력. 천 단위 콤마 자동 포맷, blur 시 min/max로 clamp.
      </p>
      <Preview>
        <Preview.Demo>
          <NumberInputDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [v, setV] = useState<number | undefined>(1234567);

<NumberInput value={v} onValueChange={setV} placeholder="금액" />`}
        />
      </Preview>

      <h3>PhoneInput (KR)</h3>
      <p className="muted">
        한국 전화번호 자동 하이픈. 010/02/0XX 모두 자동 분리. <code>onValueChange</code>는 숫자만의 문자열.
      </p>
      <Preview>
        <Preview.Demo>
          <PhoneInputDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [v, setV] = useState("01012345678");

<PhoneInput value={v} onValueChange={setV} />`}
        />
      </Preview>

      <h3>BusinessNumberInput (KR 사업자등록번호)</h3>
      <p className="muted">
        XXX-XX-XXXXX 자동 포맷. <code>validateChecksum</code>로 10자리 입력 시 체크섬 자동 검증 → 실패 시 <code>aria-invalid</code> 자동 부착.
      </p>
      <Preview>
        <Preview.Demo>
          <BusinessNumberInputDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`const [v, setV] = useState("1234567890");

<BusinessNumberInput
  value={v}
  onValueChange={setV}
  validateChecksum
/>`}
        />
      </Preview>

      <h3>폼 레이아웃</h3>
      <Preview>
        <Preview.Demo>
          <FormLayoutDemo />
        </Preview.Demo>
        <CodePanel
          language="tsx"
          code={`<form onSubmit={(e) => e.preventDefault()}>
  <label>
    <span>이름</span>
    <Input placeholder="홍길동" />
  </label>
  <label>
    <span>이메일</span>
    <Input type="email" placeholder="you@example.com" />
  </label>
  <Button type="submit">저장</Button>
</form>`}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Input", description: "단일 행 입력 필드. prefix/suffix 슬롯 지원." },
          { name: "PasswordInput", description: "type=password + 표시/숨김 토글 버튼이 내장." },
          { name: "NumberInput", description: "정수 입력. 천 단위 콤마 + min/max clamp." },
          { name: "PhoneInput", description: "한국 전화번호 자동 하이픈." },
          { name: "BusinessNumberInput", description: "한국 사업자등록번호 자동 하이픈 + 체크섬 검증(옵션)." },
          { name: "isValidBRN", description: "사업자등록번호 체크섬 검증 함수 (string → boolean)." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Input</h3>
      <p className="muted">
        네이티브 <code>&lt;input&gt;</code> 모든 속성을 그대로 받는다. 추가 prop은 다음과 같다.
      </p>
      <PropsTable
        rows={[
          { prop: "aria-invalid", type: `boolean | "true"`, description: "에러 상태. 보더가 --danger로 전환." },
          { prop: "disabled", type: "boolean" },
          { prop: "readOnly", type: "boolean" },
        ]}
      />
    </main>
  );
}
