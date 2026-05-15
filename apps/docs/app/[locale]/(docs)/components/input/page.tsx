export const dynamic = "force-static";

import {
  Input,
  InputAdornment,
  InputGroup,
} from "@/components/ui/input";
import { VariantSource } from "@/components/variant-source";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CodeTabs } from "@/components/ui/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { EmailValidationDemo } from "./_demos/email-validation";
import { FormLayoutDemo } from "./_demos/form-layout";
import {
  PasswordToggleLeftLockDemo,
  PasswordToggleRightDemo,
} from "./_demos/password-toggle";
import {
  BusinessNumberInputDemo,
  NumberInputDemo,
  PhoneInputDemo,
} from "./_demos/specialized";
import { loadComponentSources } from "@/components/sandbox-code/load-component-sources";
import { InputLiveDemo } from "./input-live-demo";

const sources = loadComponentSources("input");

export default function InputPage() {
  return (
    <main className="container">
      <h1>Input</h1>
      <p className="muted">텍스트 입력 필드. 네이티브 <code>&lt;input&gt;</code>에 토큰 스타일만 입혔다.</p>

      <InputLiveDemo
        source={sources.source}
        styles={sources.styles}
        tokens={sources.tokens}
      />

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          { value: "react", label: "React", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add input` },
          { value: "flutter", label: "Flutter", language: "bash", showLineNumbers: false, code: `npx sh-ui-cli add input` },
        ]}
      />

      <h3>Manual</h3>
      <VariantSource name="input" />

      <h2>Usage</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Input } from "@/components/ui/input";

<Input placeholder="이름" />
<Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
<Input aria-invalid={hasError} />
<Input type="password" placeholder="비밀번호" />`,
          },
          {
            value: "flutter",
            label: "Flutter",
            language: "dart",
            code: `import 'widgets/sh_ui_input.dart';

const ShUiInput(placeholder: '이름'),
ShUiInput(
  keyboardType: TextInputType.emailAddress,
  onChanged: (v) => setState(() => email = v),
),
ShUiInput(invalid: hasError),
const ShUiInput(placeholder: '비밀번호', obscureText: true),`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>타입</h3>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Input type="email" placeholder="email@example.com" />
            <Input type="password" placeholder="비밀번호" />
            <Input type="number" placeholder="0" />
            <DatePicker placeholder="날짜 선택" />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Input type="email" placeholder="email@example.com" />
<Input type="password" placeholder="비밀번호" />
<Input type="number" placeholder="0" />
<DatePicker placeholder="날짜 선택" />

{/* 표시/숨김 토글이 필요하면 아래 InputGroup 레시피 참고 */}`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiInput(
  placeholder: 'email@example.com',
  keyboardType: TextInputType.emailAddress,
),
const ShUiInput(
  placeholder: '비밀번호',
  obscureText: true,
),
const ShUiInput(
  placeholder: '0',
  keyboardType: TextInputType.number,
),
const ShUiDatePicker(placeholder: '날짜 선택'),`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Input defaultValue="값이 있는 상태" />
<Input placeholder="disabled" disabled />
<Input defaultValue="readonly" readOnly />
<Input placeholder="invalid" aria-invalid />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `const ShUiInput(initialValue: '값이 있는 상태'),
const ShUiInput(placeholder: 'disabled', enabled: false),
ShUiInput(
  readOnly: true,
  controller: TextEditingController(text: 'readonly'),
),
const ShUiInput(placeholder: 'invalid', invalid: true),`,
            },
          ]}
        />
      </Preview>

      <h3>필수 입력</h3>
      <p className="muted">
        <code>required</code> 속성을 주면 좌측에 accent 보더가 표시되어 시각적으로 필수 필드임을 알린다. <code>aria-invalid</code>와 함께 쓰면 danger 색으로 전환.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <Label htmlFor="demo-name" isRequired>이름</Label>
              <Input id="demo-name" placeholder="홍길동" required />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              <Label htmlFor="demo-email" isRequired>이메일</Label>
              <Input id="demo-email" type="email" placeholder="you@example.com" required aria-invalid />
            </div>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Label htmlFor="name" isRequired>이름</Label>
<Input id="name" placeholder="홍길동" required />

{/* invalid 상태와 함께 — 보더가 danger 색 */}
<Label htmlFor="email" isRequired>이메일</Label>
<Input id="email" type="email" required aria-invalid />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter에는 required accent border 구현이 없으며, isRequired는 Label의 * 마크 용도.
const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('이름'),
),
const ShUiInput(placeholder: '홍길동'),

// invalid 상태
const ShUiLabel(
  isRequired: true,
  child: ShUiLabelTitle('이메일'),
),
const ShUiInput(
  keyboardType: TextInputType.emailAddress,
  invalid: true,
),`,
            },
          ]}
        />
      </Preview>

      <h3>실시간 검증 (aria-invalid)</h3>
      <Preview>
        <Preview.Demo>
          <EmailValidationDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [email, setEmail] = useState("");
const invalid = email.length > 0 && !email.includes("@");

<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  aria-invalid={invalid || undefined}
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// StatefulWidget 내부
String _email = '';
bool get _invalid => _email.isNotEmpty && !_email.contains('@');

ShUiInput(
  placeholder: 'email@example.com',
  keyboardType: TextInputType.emailAddress,
  invalid: _invalid,
  onChanged: (v) => setState(() => _email = v),
)`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `const [v, setV] = useState<number | undefined>(1234567);

<NumberInput value={v} onValueChange={setV} placeholder="금액" />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `num? _amount = 1234567;

ShUiNumberInput(
  value: _amount,
  placeholder: '금액',
  min: 0,
  max: 99999999,
  onChanged: (v) => setState(() => _amount = v),
)`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `"use client";

import { useState } from "react";
import { NumberInput } from "@/components/ui/input";

export function AmountField() {
  const [v, setV] = useState<number | undefined>(1234567);
  return <NumberInput value={v} onValueChange={setV} placeholder="금액" />;
}`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/input/index.tsx",
              code: `const formatNumber = (digits: string, thousandsSeparator: boolean): string => {
  if (digits === "" || digits === "-") return digits;
  const negative = digits.startsWith("-");
  const body = negative ? digits.slice(1) : digits;
  if (!body) return negative ? "-" : "";
  const formatted = thousandsSeparator
    ? body.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",")
    : body;
  return negative ? \`-\${formatted}\` : formatted;
};

const parseNumber = (s: string): number | undefined => {
  const cleaned = s.replace(/[^\\d-]/g, "");
  if (!cleaned || cleaned === "-") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
};

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, defaultValue, onValueChange, thousandsSeparator = true, min, max, allowNegative = true, onBlur, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(
      defaultValue !== undefined ? formatNumber(String(defaultValue), thousandsSeparator) : ""
    );

    const display = isControlled
      ? value === undefined ? "" : formatNumber(String(value), thousandsSeparator)
      : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const allowedRe = allowNegative ? /[^\\d-]/g : /[^\\d]/g;
      let cleaned = e.target.value.replace(allowedRe, "");
      if (allowNegative) cleaned = cleaned.replace(/(?!^)-/g, "");
      const formatted = formatNumber(cleaned, thousandsSeparator);
      if (!isControlled) setInternal(formatted);
      onValueChange?.(parseNumber(cleaned));
    };

    // blur 시 min/max로 clamp
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      const n = parseNumber(display);
      if (n !== undefined) {
        let clamped = n;
        if (min !== undefined && clamped < min) clamped = min;
        if (max !== undefined && clamped > max) clamped = max;
        if (clamped !== n) {
          if (!isControlled) setInternal(formatNumber(String(clamped), thousandsSeparator));
          onValueChange?.(clamped);
        }
      }
      onBlur?.(e);
    };

    return (
      <Input ref={ref} type="text" inputMode="numeric"
        value={display} onChange={handleChange} onBlur={handleBlur} {...rest} />
    );
  }
);`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `const [v, setV] = useState("01012345678");

<PhoneInput value={v} onValueChange={setV} />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `String _digits = '01012345678';

ShUiPhoneInput(
  value: _digits,
  onChanged: (d) => setState(() => _digits = d),
)`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `"use client";

import { useState } from "react";
import { PhoneInput } from "@/components/ui/input";

export function ContactField() {
  const [v, setV] = useState("01012345678");
  return <PhoneInput value={v} onValueChange={setV} />;
}`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/input/index.tsx",
              code: `// 한국 전화번호 자동 하이픈: 02/010/0XX 모두 분리.
const formatPhoneKR = (digits: string): string => {
  const d = digits.replace(/\\D/g, "").slice(0, 11);
  if (d.length === 0) return "";

  // 02로 시작: [2, 3-4, 4]
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return \`\${d.slice(0, 2)}-\${d.slice(2)}\`;
    if (d.length <= 9) return \`\${d.slice(0, 2)}-\${d.slice(2, 5)}-\${d.slice(5)}\`;
    return \`\${d.slice(0, 2)}-\${d.slice(2, 6)}-\${d.slice(6, 10)}\`;
  }

  // 그 외(010, 031, …): [3, 3-4, 4]
  if (d.length <= 3) return d;
  if (d.length <= 6) return \`\${d.slice(0, 3)}-\${d.slice(3)}\`;
  if (d.length <= 10) return \`\${d.slice(0, 3)}-\${d.slice(3, 6)}-\${d.slice(6)}\`;
  return \`\${d.slice(0, 3)}-\${d.slice(3, 7)}-\${d.slice(7, 11)}\`;
};

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, defaultValue, onValueChange, onBlur, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(formatPhoneKR(defaultValue ?? ""));

    const display = isControlled ? formatPhoneKR(value ?? "") : internal;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\\D/g, "").slice(0, 11);
      if (!isControlled) setInternal(formatPhoneKR(digits));
      onValueChange?.(digits);
    };

    return (
      <Input ref={ref} type="tel" inputMode="tel" autoComplete="tel"
        value={display} onChange={handleChange} onBlur={onBlur} {...rest} />
    );
  }
);`,
            },
          ]}
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
        <CodeTabs
          items={[
            {
              value: "highlight",
              label: "강조",
              language: "tsx",
              code: `const [v, setV] = useState("1234567890");

<BusinessNumberInput
  value={v}
  onValueChange={setV}
  validateChecksum
/>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `String _digits = '1234567890';

ShUiBusinessNumberInput(
  value: _digits,
  validateChecksum: true,
  onChanged: (d) => setState(() => _digits = d),
)`,
            },
            {
              value: "full",
              label: "전체",
              language: "tsx",
              code: `"use client";

import { useState } from "react";
import { BusinessNumberInput, isValidBRN } from "@/components/ui/input";

export function BrnField() {
  const [v, setV] = useState("1234567890");
  const valid = v.length === 10 && isValidBRN(v);
  return (
    <div>
      <BusinessNumberInput value={v} onValueChange={setV} validateChecksum />
      {v.length === 10 && (
        <small>{valid ? "✓ 유효한 사업자등록번호" : "체크섬 불일치"}</small>
      )}
    </div>
  );
}`,
            },
            {
              value: "impl",
              label: "구현",
              language: "tsx",
              filename: "components/ui/input/index.tsx",
              code: `// XXX-XX-XXXXX (10자리) 포맷
const formatBRN = (digits: string): string => {
  const d = digits.replace(/\\D/g, "").slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 5) return \`\${d.slice(0, 3)}-\${d.slice(3)}\`;
  return \`\${d.slice(0, 3)}-\${d.slice(3, 5)}-\${d.slice(5)}\`;
};

/** 국세청 사업자등록번호 체크섬 알고리즘.
 *  9자리에 가중치 [1,3,7,1,3,7,1,3,5]를 곱해 합산,
 *  9번째 자리의 5배를 10으로 나눈 몫을 더한 후
 *  (10 - (합 mod 10)) mod 10 이 마지막 자리와 일치하면 유효. */
export function isValidBRN(digits: string): boolean {
  const d = digits.replace(/\\D/g, "");
  if (d.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i], 10) * w[i];
  sum += Math.floor((parseInt(d[8], 10) * 5) / 10);
  const check = (10 - (sum % 10)) % 10;
  return check === parseInt(d[9], 10);
}

export const BusinessNumberInput = React.forwardRef<HTMLInputElement, BusinessNumberInputProps>(
  ({ value, defaultValue, onValueChange, validateChecksum, onBlur, "aria-invalid": ariaInvalidProp, ...rest }, ref) => {
    const isControlled = value !== undefined;
    const [internal, setInternal] = React.useState(formatBRN(defaultValue ?? ""));

    const display = isControlled ? formatBRN(value ?? "") : internal;
    const digits = display.replace(/\\D/g, "");

    // 명시적 aria-invalid 우선, 없으면 validateChecksum 기반으로 자동 계산
    const invalid =
      ariaInvalidProp !== undefined
        ? ariaInvalidProp
        : validateChecksum && digits.length === 10 && !isValidBRN(digits);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value.replace(/\\D/g, "").slice(0, 10);
      if (!isControlled) setInternal(formatBRN(next));
      onValueChange?.(next);
    };

    return (
      <Input ref={ref} type="text" inputMode="numeric"
        value={display} onChange={handleChange} onBlur={onBlur}
        aria-invalid={invalid || undefined} {...rest} />
    );
  }
);`,
            },
          ]}
        />
      </Preview>

      <h3>InputGroup + InputAdornment (compound, React)</h3>
      <p className="muted">
        <code>prefix</code>/<code>suffix</code> prop 대신 합성 방식으로 좌/우
        adornment를 붙일 수 있다. <code>InputGroup</code>이 공용 보더와 포커스
        링을 제공하고, 내부 <code>Input</code>은 자체 보더를 감춘다. 기존
        prop 방식도 그대로 동작한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <InputGroup>
              <InputAdornment>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </InputAdornment>
              <Input placeholder="검색..." />
            </InputGroup>
            <InputGroup>
              <InputAdornment>@</InputAdornment>
              <Input placeholder="아이디" />
              <InputAdornment>.com</InputAdornment>
            </InputGroup>
            <InputGroup aria-invalid>
              <Input placeholder="invalid 상태" defaultValue="잘못된 값" />
              <InputAdornment>!</InputAdornment>
            </InputGroup>
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<InputGroup>
  <InputAdornment><SearchIcon /></InputAdornment>
  <Input placeholder="검색..." />
</InputGroup>

<InputGroup>
  <InputAdornment>@</InputAdornment>
  <Input placeholder="아이디" />
  <InputAdornment>.com</InputAdornment>
</InputGroup>

{/* 기존 prop 방식도 그대로 동작 */}
<Input prefix={<SearchIcon />} placeholder="검색..." />`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 prop 기반 유지.
const ShUiInput(placeholder: '검색...'),`,
            },
          ]}
        />
      </Preview>

      <h3>비밀번호 토글 (레시피)</h3>
      <p className="muted">
        <code>InputGroup</code> + <code>InputAdornment</code> 합성으로 비밀번호
        표시/숨김 토글을 직접 조립한다. 아이콘·위치·세부 동작을 자유롭게 바꿀 수 있고,
        토글 버튼은 <code>aria-pressed</code>로 상태를 노출하고 Tab 흐름에서 제외(<code>tabIndex=-1</code>)한다.
      </p>
      <Preview>
        <Preview.Demo>
          <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <PasswordToggleRightDemo />
            <PasswordToggleLeftLockDemo />
          </div>
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `"use client";

import { useState } from "react";
import { Input, InputAdornment, InputGroup } from "@/components/ui/input";

export function PasswordField() {
  const [visible, setVisible] = useState(false);
  return (
    <InputGroup>
      <Input type={visible ? "text" : "password"} placeholder="비밀번호" />
      <InputAdornment interactive>
        <button
          type="button"
          className="sh-ui-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
          aria-pressed={visible}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </InputAdornment>
    </InputGroup>
  );
}`,
            },
            {
              value: "left-lock",
              label: "왼쪽 자물쇠 + 우측 토글",
              language: "tsx",
              code: `<InputGroup>
  <InputAdornment><LockIcon /></InputAdornment>
  <Input type={visible ? "text" : "password"} placeholder="비밀번호" />
  <InputAdornment interactive>
    <button type="button" className="sh-ui-input__toggle" onClick={...}>
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </InputAdornment>
</InputGroup>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `// Flutter는 ShUiInput.suffix 슬롯에 직접 IconButton 을 넣는다.
class _PasswordFieldState extends State<PasswordField> {
  bool _visible = false;
  @override
  Widget build(BuildContext context) {
    return ShUiInput(
      placeholder: '비밀번호',
      obscureText: !_visible,
      suffix: IconButton(
        icon: Icon(_visible ? Icons.visibility_off_outlined : Icons.visibility_outlined),
        onPressed: () => setState(() => _visible = !_visible),
      ),
    );
  }
}`,
            },
          ]}
        />
      </Preview>

      <h3>폼 레이아웃</h3>
      <Preview>
        <Preview.Demo>
          <FormLayoutDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<form onSubmit={(e) => e.preventDefault()}>
  <Label htmlFor="name" isRequired>이름</Label>
  <Input id="name" placeholder="홍길동" required />

  <Label htmlFor="email" isRequired>이메일</Label>
  <Input id="email" type="email" placeholder="you@example.com" required />

  <Button type="submit">저장</Button>
</form>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `Column(
  crossAxisAlignment: CrossAxisAlignment.stretch,
  children: [
    const ShUiLabel(
      isRequired: true,
      child: ShUiLabelTitle('이름'),
    ),
    const SizedBox(height: 4),
    const ShUiInput(placeholder: '홍길동'),
    const SizedBox(height: 12),
    const ShUiLabel(
      isRequired: true,
      child: ShUiLabelTitle('이메일'),
    ),
    const SizedBox(height: 4),
    const ShUiInput(
      placeholder: 'you@example.com',
      keyboardType: TextInputType.emailAddress,
    ),
    const SizedBox(height: 16),
    ShUiButton(
      onPressed: () {},
      child: const Text('저장'),
    ),
  ],
)`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Input", description: "단일 행 입력 필드. prefix/suffix 슬롯 지원. InputGroup 내부에서는 자체 보더를 감추고 그룹의 포커스 링을 공유." },
          { name: "InputGroup", description: "Compound 컨테이너. 공용 보더·포커스 링·aria-invalid·disabled 상태를 제공." },
          { name: "InputAdornment", description: "InputGroup 내부에 배치하는 좌/우 adornment. 위치는 children 순서로 결정." },
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