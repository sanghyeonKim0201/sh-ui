export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { BasicFormDemo } from "./_demos/basic";
import { MultiStepFormDemo } from "./_demos/multi-step";
import { CheckoutFormDemo } from "./_demos/checkout";
import { ReusableFieldsDemo } from "./_demos/reusable";
import { RhfFormDemo } from "./_demos/rhf";
import { UseShUiFormDemo } from "./_demos/use-sh-ui-form";
import { ZodSchemaDemo } from "./_demos/zod-schema";
import { TanStackFormDemo } from "./_demos/tanstack";
import { YupSchemaDemo } from "./_demos/yup-schema";
import { AsyncValidateDemo } from "./_demos/async-validate";
import { ServerErrorDemo } from "./_demos/server-error";
import { CrossFieldDemo } from "./_demos/cross-field";
import { CheckboxSwitchDemo } from "./_demos/checkbox-switch";
import { CustomControlDemo } from "./_demos/custom-control";

export default function FormPage() {
  return (
    <main className="container">
      <h1>Form</h1>
      <p className="muted">
        검증·멀티스텝·섹션 유효성을 지원하는 폼 컴포넌트. 외부 라이브러리 없이 단독으로 쓰거나,
        React Hook Form / TanStack Form 어댑터를 연결해 기존 코드에 통합할 수 있다.
        스키마는{" "}
        <a href="https://standardschema.dev" target="_blank" rel="noreferrer">
          Standard Schema v1
        </a>
        을 준수하는 라이브러리(Zod, Valibot 등)를 직접 전달하고, Yup처럼 미지원 라이브러리는 얇은 래퍼로 연결한다.
      </p>

      {/* Hero */}
      <Preview>
        <Preview.Demo>
          <BasicFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

<Form
  defaultValues={{ email: "" }}
  onSubmit={(values) => console.log(values)}
>
  <Form.Field
    name="email"
    validate={(v) =>
      String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
    }
  >
    <Form.Label>이메일</Form.Label>
    <Form.Control>
      <Input type="email" placeholder="you@example.com" />
    </Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">가입</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* Installation */}
      <h2>Installation</h2>
      <CodeTabs
        items={[
          {
            value: "cli",
            label: "CLI",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui-cli add form`,
          },
          {
            value: "manual",
            label: "Manual",
            language: "bash",
            showLineNumbers: false,
            code: `# form 만 필요한 경우
npx sh-ui-cli add form

# 어댑터가 필요하면 함께 설치
npx sh-ui-cli add form-rhf      # React Hook Form 어댑터
npx sh-ui-cli add form-tanstack  # TanStack Form 어댑터
npx sh-ui-cli add form-yup       # Yup 래퍼`,
          },
        ]}
      />

      {/* Mode comparison */}
      <h2>언제 무엇을 쓸까?</h2>
      <p className="muted">
        세 가지 모드 중 하나를 고른다. 프로젝트에 이미 RHF·TanStack을 쓰고 있다면 어댑터,
        새 프로젝트에서 검증만 필요하다면 <code>useShUiForm</code> 또는 네이티브 모드면 충분하다.
      </p>
      <div className="sh-ui-props" style={{ marginBottom: "var(--space-5)" }}>
        <table className="sh-ui-props__table">
          <thead>
            <tr>
              <th>모드</th>
              <th>진입점</th>
              <th>언제</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>네이티브</strong></td>
              <td><code>defaultValues</code> + <code>onSubmit</code></td>
              <td className="sh-ui-props__desc">가장 단순. 외부 의존 없이 폼 하나를 빠르게 만들 때.</td>
            </tr>
            <tr>
              <td><strong>useShUiForm</strong></td>
              <td><code>useShUiForm({"{ defaultValues, schema, validateOn }"})</code></td>
              <td className="sh-ui-props__desc">Zod 스키마가 필요하거나, 폼 스토어를 컴포넌트 외부에서 참조해야 할 때.</td>
            </tr>
            <tr>
              <td><strong>어댑터</strong></td>
              <td><code>adaptReactHookForm(rhf)</code> / <code>adaptTanStackForm(ts)</code></td>
              <td className="sh-ui-props__desc">RHF·TanStack을 이미 쓰는 프로젝트에 sh-ui UI를 씌울 때.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Basic */}
      <h2>기본 사용</h2>
      <p className="muted">
        <code>defaultValues</code>와 <code>onSubmit</code>만으로 동작한다. <code>Form.Field</code>의{" "}
        <code>validate</code> prop에 함수를 전달하면 필드 단위 검증을 추가할 수 있다.
        기본 트리거는 <code>blur</code>이며, 에러가 발생한 필드는 이후 <code>change</code>로 전환된다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<Form
  defaultValues={{ email: "" }}
  validateOn="blur"
  onSubmit={async (values, { reset }) => {
    await save(values);
    reset();
  }}
>
  <Form.Field
    name="email"
    validate={(v) =>
      String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
    }
  >
    <Form.Label>이메일</Form.Label>
    <Form.Control>
      <Input type="email" />
    </Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">저장</Button>
</Form>`,
          },
        ]}
      />

      {/* Zod */}
      <h2>Zod 스키마 (Standard Schema 네이티브)</h2>
      <p className="muted">
        Zod v3.24 이상은 Standard Schema를 내장 구현하므로 어댑터 없이 <code>schema</code> prop에
        직접 전달할 수 있다. 스키마는 제출 시 전체 검증을 실행한다.{" "}
        <code>defaultValues</code>만 넘기면 내부 스토어가 자동으로 생성된다.
      </p>
      <Preview>
        <Preview.Demo>
          <ZodSchemaDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { z } from "zod";
import { Form } from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  email: z.string().email("이메일 형식이 아닙니다"),
  age: z.coerce.number().min(18, "만 18세 이상이어야 합니다"),
});

<Form
  schema={schema}
  defaultValues={{ name: "", email: "", age: "" }}
  onSubmit={(values) => console.log(values)}
>
  <Form.Field name="name">
    <Form.Label>이름</Form.Label>
    <Form.Control><Input /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Form.Field name="email">
    <Form.Label>이메일</Form.Label>
    <Form.Control><Input type="email" /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Form.Field name="age">
    <Form.Label>나이</Form.Label>
    <Form.Control><Input type="number" /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">확인</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* useShUiForm */}
      <h2>내장 훅 — useShUiForm</h2>
      <p className="muted">
        <code>useShUiForm</code>은 내부 스토어를 React 훅으로 노출한다.
        반환된 <code>form</code>을 <code>Form</code>의 <code>form</code> prop에 주입하면 된다.
        스토어를 다른 컴포넌트에 props로 넘기거나 외부 상태와 연동할 때 유용하다.
      </p>
      <Preview>
        <Preview.Demo>
          <UseShUiFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { z } from "zod";
import { Form, useShUiForm } from "@/components/ui/form";

const schema = z.object({
  username: z.string().min(2, "2자 이상 입력하세요"),
  email: z.string().email("이메일 형식이 아닙니다"),
  password: z.string().min(8, "8자 이상 입력하세요"),
});

type FormValues = z.infer<typeof schema>;

function MyForm() {
  const form = useShUiForm<FormValues>({
    defaultValues: { username: "", email: "", password: "" },
    schema,
    validateOn: "blur",
  });

  return (
    <Form
      form={form}
      onSubmit={(values) => console.log(values)}
    >
      <Form.Field name="username">
        <Form.Label>사용자명</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name="email">
        <Form.Label>이메일</Form.Label>
        <Form.Control><Input type="email" /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name="password">
        <Form.Label>비밀번호</Form.Label>
        <Form.Control><Input type="password" /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Button type="submit">가입하기</Button>
    </Form>
  );
}`,
            },
          ]}
        />
      </Preview>

      {/* Yup */}
      <h2>Yup 스키마</h2>
      <p className="muted">
        Yup은 Standard Schema를 구현하지 않아 얇은 래퍼가 필요하다.{" "}
        <code>form-yup</code> 컴포넌트를 먼저 추가한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "install",
            label: "설치",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add yup
npx sh-ui-cli add form-yup`,
          },
        ]}
      />
      <Preview>
        <Preview.Demo>
          <YupSchemaDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import * as yup from "yup";
import { Form } from "@/components/ui/form";
import { yupSchema } from "@/components/ui/form-yup";

const schema = yupSchema(
  yup.object({
    username: yup.string().required("사용자명을 입력하세요").min(2, "2자 이상"),
    email: yup.string().required("이메일을 입력하세요").email("이메일 형식이 아닙니다"),
    website: yup.string().url("올바른 URL을 입력하세요").optional(),
  })
);

<Form
  schema={schema}
  defaultValues={{ username: "", email: "", website: "" }}
  onSubmit={(values) => console.log(values)}
>
  {/* ... fields ... */}
  <Button type="submit">저장</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* RHF */}
      <h2>React Hook Form 어댑터</h2>
      <p className="muted">
        <code>adaptReactHookForm(rhf)</code>으로 RHF 인스턴스를 sh-ui와 연결한다.
        RHF의 <code>resolver</code>·<code>watch</code>·<code>setValue</code> 등 모든 RHF API를 그대로 사용할 수 있다.
      </p>
      <CodeTabs
        items={[
          {
            value: "install",
            label: "설치",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add react-hook-form
npx sh-ui-cli add form-rhf`,
          },
        ]}
      />
      <Preview>
        <Preview.Demo>
          <RhfFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { adaptReactHookForm } from "@/components/ui/form-rhf";

type FormValues = { email: string; name: string };

function MyForm() {
  const rhf = useForm<FormValues>({
    defaultValues: { email: "", name: "" },
    mode: "onBlur",
  });
  const form = adaptReactHookForm(rhf);

  return (
    <Form
      form={form}
      onSubmit={(values) => console.log(values)}
    >
      <Form.Field name="email" validate={(v) =>
        String(v).includes("@") ? undefined : "이메일 아님"
      }>
        <Form.Label>이메일</Form.Label>
        <Form.Control><Input type="email" /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name="name" validate={(v) => v ? undefined : "필수"}>
        <Form.Label>이름</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Button type="submit">제출</Button>
    </Form>
  );
}`,
            },
          ]}
        />
      </Preview>

      {/* TanStack */}
      <h2>TanStack Form 어댑터</h2>
      <p className="muted">
        <code>adaptTanStackForm(ts)</code>으로 TanStack Form 인스턴스를 연결한다.
        검증 로직은 TanStack 쪽에 두거나 <code>Form.Field</code>의 <code>validate</code> prop을 활용한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "install",
            label: "설치",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add @tanstack/react-form
npx sh-ui-cli add form-tanstack`,
          },
        ]}
      />
      <Preview>
        <Preview.Demo>
          <TanStackFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { useForm } from "@tanstack/react-form";
import { Form } from "@/components/ui/form";
import { adaptTanStackForm } from "@/components/ui/form-tanstack";

type FormValues = { email: string; name: string };

function MyForm() {
  const ts = useForm<FormValues>({
    defaultValues: { email: "", name: "" },
    onSubmit: async () => {},
  });

  const form = adaptTanStackForm(ts, {
    onSubmit: (values) => console.log(values),
  });

  return (
    <Form form={form}>
      <Form.Field name="email" validate={(v) =>
        String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
      }>
        <Form.Label>이메일</Form.Label>
        <Form.Control><Input type="email" /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name="name" validate={(v) => v ? undefined : "이름을 입력하세요"}>
        <Form.Label>이름</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Button type="submit">제출</Button>
    </Form>
  );
}`,
            },
          ]}
        />
      </Preview>

      <h3>어댑터 모드의 제약</h3>
      <p className="muted">
        어댑터 모드에서는 라이브러리 자체가 검증의 주체다. 아래 옵션은 <code>Form</code>에 넘겨도 무시된다.
      </p>
      <div className="sh-ui-props" style={{ marginBottom: "var(--space-5)" }}>
        <table className="sh-ui-props__table">
          <thead>
            <tr>
              <th>옵션</th>
              <th>어댑터 모드에서</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>schema</code></td>
              <td className="sh-ui-props__desc">무시. 라이브러리 <code>resolver</code>에서 처리하거나 <code>Form.Field validate</code>를 사용.</td>
            </tr>
            <tr>
              <td><code>validateOn</code></td>
              <td className="sh-ui-props__desc">무시. 라이브러리의 <code>mode</code>/<code>reValidateMode</code>로 제어.</td>
            </tr>
            <tr>
              <td><code>defaultValues</code></td>
              <td className="sh-ui-props__desc">무시. 라이브러리 인스턴스에 이미 지정됨.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Validation */}
      <h2>검증</h2>

      <h3>교차 필드 검증</h3>
      <p className="muted">
        <code>validate</code>의 두 번째 인자로 현재 폼 전체 값을 받는다.
        비밀번호 확인처럼 다른 필드 값과 비교할 때 사용한다.
      </p>
      <Preview>
        <Preview.Demo>
          <CrossFieldDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Form defaultValues={{ password: "", confirmPassword: "" }} onSubmit={...}>
  <Form.Field name="password"
    validate={(v) => String(v).length >= 8 ? undefined : "8자 이상 입력하세요"}
  >
    <Form.Label>비밀번호</Form.Label>
    <Form.Control><Input type="password" /></Form.Control>
    <Form.Error />
  </Form.Field>

  <Form.Field
    name="confirmPassword"
    validate={(v, allValues) => {
      const values = allValues as { password?: string };
      return v === values.password ? undefined : "비밀번호가 일치하지 않습니다";
    }}
  >
    <Form.Label>비밀번호 확인</Form.Label>
    <Form.Control><Input type="password" /></Form.Control>
    <Form.Error />
  </Form.Field>

  <Button type="submit">변경</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      <h3>비동기 검증</h3>
      <p className="muted">
        <code>validate</code>에 객체 형태로 <code>fn</code>과 <code>debounce</code>를 넘기면
        비동기 검증을 지원한다. 진행 중에는 <code>useFormField</code>의 <code>isValidating</code>이{" "}
        <code>true</code>가 된다. 완료 전에 submit하면 검증 완료를 기다렸다가 <code>onSubmit</code>을 호출한다.
      </p>
      <Preview>
        <Preview.Demo>
          <AsyncValidateDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `function EmailStatusIndicator() {
  const { isValidating, hasError, touched } = useFormField("email");
  if (isValidating) return <span>확인 중…</span>;
  if (touched && !hasError) return <span>사용 가능한 이메일입니다</span>;
  return null;
}

<Form.Field
  name="email"
  validate={{
    fn: async (v) => {
      if (!String(v).includes("@")) return "이메일 형식이 아닙니다";
      const ok = await checkAvailability(String(v));
      return ok ? undefined : "이미 사용 중인 이메일입니다";
    },
    debounce: 500,
  }}
>
  <Form.Label>이메일</Form.Label>
  <Form.Control><Input type="email" /></Form.Control>
  <EmailStatusIndicator />
  <Form.Error />
</Form.Field>`,
            },
          ]}
        />
      </Preview>

      <h3>서버 에러 주입</h3>
      <p className="muted">
        <code>onSubmit</code>의 두 번째 인자 <code>helpers</code>에서 <code>setError</code>를 제공한다.
        서버에서 돌아온 에러를 특정 필드에 주입할 수 있다.
        주입된 에러는 해당 필드에 다음 입력이 발생하면 자동으로 지워진다.
      </p>
      <Preview>
        <Preview.Demo>
          <ServerErrorDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<Form
  defaultValues={{ email: "", name: "" }}
  onSubmit={async (values, { setError }) => {
    try {
      await signUp(values);
    } catch (e) {
      // 서버에서 "이미 가입된 이메일"이 돌아온 경우
      setError("email", (e as Error).message);
    }
  }}
>
  <Form.Field name="email"
    validate={(v) => String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"}
  >
    <Form.Label>이메일</Form.Label>
    <Form.Control><Input type="email" /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">가입하기</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      <h3>검증 트리거 — blur → change 자동 전환</h3>
      <p className="muted">
        기본값은 <code>validateOn="blur"</code>다. 에러가 한 번 발생한 필드는 이후 <code>change</code>
        로 자동 전환되어 타이핑할 때마다 즉시 에러 여부를 갱신한다.
        이 동작을 바꾸려면 <code>Form</code>의 <code>validateOn</code> 또는
        개별 <code>Form.Field</code>의 <code>validateOn</code>으로 오버라이드한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `// 폼 전체: submit 시에만 검증
<Form validateOn="submit" ...>

// 특정 필드만 즉시(change) 검증
<Form.Field name="username" validateOn="change" ...>`,
          },
        ]}
      />

      <h3>Form.Error의 matches — HTML5 ValidityState 분기</h3>
      <p className="muted">
        <code>matches</code> prop에 <code>ValidityState</code> 키를 넘기면 해당 에러 타입일 때만 렌더한다.
        HTML5 네이티브 검증 메시지를 커스터마이즈할 때 유용하다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `<Form.Field name="password">
  <Form.Label>비밀번호</Form.Label>
  <Form.Control>
    <Input type="password" minLength={8} required />
  </Form.Control>
  <Form.Error matches="tooShort">최소 8자 이상 입력하세요</Form.Error>
  <Form.Error matches="valueMissing">비밀번호를 입력하세요</Form.Error>
  {/* matches 없으면 모든 에러 타입에서 렌더 */}
  <Form.Error />
</Form.Field>`,
          },
        ]}
      />

      {/* Form.Control binding */}
      <h2>Form.Control 바인딩</h2>

      <h3>checkbox / switch — valueAs="checked"</h3>
      <p className="muted">
        체크박스와 스위치는 <code>value</code> 대신 <code>checked</code>로 상태를 관리한다.{" "}
        <code>{"<Form.Control valueAs=\"checked\">"}</code>로 선언하면 바인딩 방향이 자동 전환된다.
      </p>
      <Preview>
        <Preview.Demo>
          <CheckboxSwitchDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

<Form defaultValues={{ agree: false, marketing: false }} onSubmit={...}>
  <Form.Field name="agree" required>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Form.Control valueAs="checked">
        <Checkbox />
      </Form.Control>
      <Form.Label>이용 약관에 동의합니다</Form.Label>
    </div>
    <Form.Error />
  </Form.Field>

  <Form.Field name="marketing">
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <Form.Label>이메일 마케팅 수신 동의</Form.Label>
      <Form.Control valueAs="checked">
        <Switch />
      </Form.Control>
    </div>
  </Form.Field>

  <Button type="submit">다음</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      <h3>render prop — 커스텀 컴포넌트</h3>
      <p className="muted">
        <code>children</code>으로 연결하기 어려운 컴포넌트는 <code>render</code> prop을 사용한다.
        <code>ctrl</code> 객체에는 <code>id</code>, <code>value</code>, <code>onChange</code>,{" "}
        <code>onBlur</code>, <code>aria-*</code> 등이 들어 있다. 아래 예시는 색상 선택기와
        글자 수 카운터를 보여준다.
      </p>
      <Preview>
        <Preview.Demo>
          <CustomControlDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// render prop — 완전 커스텀
<Form.Field name="favoriteColor" validate={(v) => v ? undefined : "색상을 선택하세요"}>
  <Form.Label>좋아하는 색상</Form.Label>
  <Form.Control
    render={(ctrl) => (
      <ColorSwatchGroup
        id={ctrl.id}
        value={ctrl.value}
        onChange={(e) => ctrl.onChange(e)}
        aria-describedby={ctrl["aria-describedby"]}
      />
    )}
  />
  <Form.Error />
</Form.Field>

// useFormField로 Form.Field 외부에서 상태 읽기
function CharCountField() {
  const { value } = useFormField("bio");
  return <span>{String(value ?? "").length} / 100</span>;
}`,
            },
          ]}
        />
      </Preview>

      {/* Multistep */}
      <h2>멀티스텝</h2>
      <p className="muted">
        <code>Form.Steps</code> + <code>Form.Step</code>으로 단계형 폼을 구성한다.{" "}
        <code>useFormSteps()</code>의 <code>next()</code>는 현재 스텝 필드를 검증한 뒤 다음 스텝으로 이동한다.
        스텝이 이동해도 값은 내부 스토어에 보존되며, 마지막 스텝에서 <code>next()</code>를 호출하면
        전체 제출로 연결된다.
      </p>
      <Preview>
        <Preview.Demo>
          <MultiStepFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { Form, useFormSteps } from "@/components/ui/form";

function StepNavButtons() {
  const { isFirstStep, isLastStep, next, prev } = useFormSteps();
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {!isFirstStep && (
        <Button type="button" variant="secondary" onClick={prev}>이전</Button>
      )}
      <Button type="button" onClick={() => void next()}>
        {isLastStep ? "완료" : "다음"}
      </Button>
    </div>
  );
}

<Form defaultValues={{ email: "", name: "", bio: "" }} onSubmit={handleSubmit}>
  <Form.Steps>
    <Form.Step id="account">
      <Form.Field name="email" validate={validateEmail}>
        <Form.Label>이메일</Form.Label>
        <Form.Control><Input type="email" /></Form.Control>
        <Form.Error />
      </Form.Field>
      <StepNavButtons />
    </Form.Step>

    <Form.Step id="profile">
      <Form.Field name="name" validate={(v) => v ? undefined : "필수"}>
        <Form.Label>이름</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <StepNavButtons />
    </Form.Step>

    <Form.Step id="review">
      {/* 입력값 확인 */}
      <StepNavButtons />
    </Form.Step>
  </Form.Steps>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* Checkout / Sections */}
      <h2>여러 카드에 나뉜 폼</h2>
      <p className="muted">
        <code>Form.Section</code>으로 폼을 논리적으로 구분한다.{" "}
        <code>useFormSection("sectionName")</code>의 <code>hasError</code>를 읽어
        카드 헤더에 오류 표시를 추가할 수 있다.
      </p>
      <Preview>
        <Preview.Demo>
          <CheckoutFormDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `import { Form, useFormSection } from "@/components/ui/form";

function SectionHeader({ sectionName, title }) {
  const { hasError } = useFormSection(sectionName);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <h3>{title}</h3>
      {hasError && (
        <span
          style={{ width: 8, height: 8, borderRadius: "50%",
            background: "var(--color-danger)", display: "inline-block" }}
          aria-label="입력 오류 있음"
        />
      )}
    </div>
  );
}

<Form
  defaultValues={{
    shipping: { name: "", address: "" },
    payment: { cardNumber: "", expiry: "" },
  }}
  onSubmit={handleSubmit}
>
  <Form.Section name="shipping" style={cardStyle}>
    <SectionHeader sectionName="shipping" title="배송 정보" />
    <Form.Field name="shipping.name" validate={(v) => v ? undefined : "필수"}>
      <Form.Label>수령인</Form.Label>
      <Form.Control><Input /></Form.Control>
      <Form.Error />
    </Form.Field>
  </Form.Section>

  <Button type="submit">결제하기</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* Reusable */}
      <h2>재사용 블록 패턴</h2>
      <p className="muted">
        <code>Form.Section</code> + <code>Form.Field</code>만으로 구성한 컴포넌트는
        <code>Form</code> 루트 없이도 정의할 수 있다. 같은 블록을 여러 섹션에 반복 배치할 때 유용하다.
      </p>
      <ul className="muted" style={{ marginTop: 0 }}>
        <li>
          <strong>*Fields 접미어</strong> — <code>Form</code> 루트 없음. 섹션·필드 조각만 정의.
          여러 폼에 끼워 넣을 수 있다.
        </li>
        <li>
          <strong>*Form 접미어</strong> — <code>Form</code> 루트 포함. 독립적으로 제출 가능.
        </li>
        <li>
          <code>Form</code>을 중첩하면 개발 모드에서 에러가 발생한다.
        </li>
      </ul>
      <Preview>
        <Preview.Demo>
          <ReusableFieldsDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `// Form 루트 없이 정의하는 재사용 블록
function AddressFields({ namePrefix, legend }) {
  return (
    <Form.Section name={namePrefix}>
      <Form.SectionTitle>{legend}</Form.SectionTitle>
      <Form.Field name={\`\${namePrefix}.name\`} validate={(v) => v ? undefined : "필수"}>
        <Form.Label>이름</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name={\`\${namePrefix}.city\`} validate={(v) => v ? undefined : "필수"}>
        <Form.Label>도시</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
    </Form.Section>
  );
}

<Form defaultValues={{ shipping: {}, billing: {} }} onSubmit={handleSubmit}>
  <AddressFields namePrefix="shipping" legend="배송지 주소" />
  <AddressFields namePrefix="billing" legend="청구지 주소" />
  <Button type="submit">저장</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      {/* Accessibility */}
      <h2>접근성</h2>
      <ul className="muted">
        <li>
          <code>Form.Label</code>의 <code>htmlFor</code>와 <code>Form.Control</code>의 <code>id</code>는
          자동으로 연결된다. 별도로 지정할 필요 없다.
        </li>
        <li>
          <code>Form.Description</code>은 <code>aria-describedby</code>로 컨트롤과 자동 연결된다.
        </li>
        <li>
          <code>Form.Error</code>는 에러 발생 시 <code>role="alert"</code> + <code>aria-live="polite"</code>로 렌더한다.
        </li>
        <li>
          에러가 있는 필드의 컨트롤에는 <code>aria-invalid="true"</code>가 자동으로 추가된다.
        </li>
        <li>
          제출 실패 시 첫 번째 에러 필드로 <strong>스크롤 + 포커스</strong>가 이동한다
          (<code>scrollToFirstError</code> / <code>focusFirstError</code> prop으로 제어).
        </li>
        <li>
          <code>prefers-reduced-motion</code> 환경에서는 폼 전환 애니메이션이 비활성화된다.
        </li>
      </ul>

      {/* FAQ */}
      <h2>FAQ · 함정</h2>
      <dl style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: <code>Form</code>을 중첩하면?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            개발 모드에서 에러가 발생한다. <code>Form</code>은 중첩 불가. 재사용 블록은 <code>Form.Section</code> + <code>Form.Field</code>만으로 구성하라.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: 어댑터 모드에서 <code>validate</code> / <code>schema</code> prop이 작동하나?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            <code>schema</code>와 폼 레벨 <code>validateOn</code>은 무시된다. 검증 규칙은 라이브러리(RHF <code>resolver</code> 등) 쪽에 두거나, <code>Form.Field validate</code>에서 개별 필드 단위로 처리한다.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: 스텝을 이동하면 이전 스텝의 값이 사라지나?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            아니다. 값은 스토어에 보존된다. 스텝 UI만 unmount되고 데이터는 남는다.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: 섹션 <code>schema</code>와 루트 <code>schema</code>가 충돌하면?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            섹션 <code>schema</code>가 해당 경로를 덮는다. merge가 아니라 override.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: 비동기 검증이 끝나기 전에 submit하면?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            Form이 모든 <code>isValidating</code> 상태가 해제될 때까지 <code>onSubmit</code> 호출을 지연시킨다.
          </dd>
        </div>
        <div>
          <dt style={{ fontWeight: 600 }}>Q: HTML5 검증(<code>required</code>, <code>minLength</code> 등)이 동작하지 않는다?</dt>
          <dd className="muted" style={{ margin: "var(--space-1) 0 0 0" }}>
            <code>Form</code>은 <code>noValidate</code>를 내부에서 사용한다. <code>required</code>·<code>pattern</code> 같은 HTML5 제약은 <code>Form.Field</code>의 <code>required</code> prop + <code>validate</code> 함수로 대체한다.
          </dd>
        </div>
      </dl>

      {/* API Reference */}
      <h2>API Reference</h2>

      <h3>구성 요소</h3>
      <SubComponents
        rows={[
          { name: "Form", description: "폼 루트. defaultValues / form / schema / validateOn / onSubmit / onInvalid 등을 받는다. 중첩 불가." },
          { name: "Form.Field", description: "개별 필드 래퍼. name / validate / validateOn / required / disabled / readOnly." },
          { name: "Form.Label", description: "Form.Field 내부 레이블. htmlFor를 자동 연결." },
          { name: "Form.Description", description: "필드 설명. aria-describedby로 컨트롤과 자동 연결." },
          { name: "Form.Error", description: "에러 메시지. 에러 없으면 null. matches prop으로 특정 에러 타입만 표시 가능." },
          { name: "Form.Control", description: "자식 input에 id / name / value / onChange / onBlur / aria-* 자동 주입. valueAs=\"checked\"로 checkbox/switch 지원." },
          { name: "Form.Section", description: "필드 그룹. name으로 중첩 경로, schema prop으로 섹션 단위 검증 지원." },
          { name: "Form.SectionTitle", description: "섹션 제목. fieldset > legend 역할." },
          { name: "Form.Steps", description: "멀티스텝 컨테이너. defaultStep / activeStep / onStepChange." },
          { name: "Form.Step", description: "개별 스텝. id 필수. activeStep과 일치할 때만 렌더." },
        ]}
      />

      <h3>&lt;Form&gt;</h3>
      <PropsTable
        rows={[
          { prop: "form", type: "FormStore<T>", description: "외부 스토어 — useShUiForm 또는 adaptXxx로 생성. 없으면 내부 스토어 자동 생성." },
          { prop: "defaultValues", type: "Partial<T>", description: "내부 스토어 초기값 (form prop 없을 때만)." },
          { prop: "schema", type: "StandardSchemaV1", description: "루트 스키마. 제출 시 전체 검증. Zod·Valibot 등 Standard Schema 구현체 직접 전달 가능." },
          { prop: "validateOn", type: '"submit" | "blur" | "change"', default: '"blur"', description: "기본 검증 트리거." },
          { prop: "onSubmit", type: "(values: T, helpers: SubmitHelpers<T>) => void | Promise<void>", description: "검증 통과 시 호출. helpers = { reset, setError }." },
          { prop: "onInvalid", type: "(errors: Record<string, FieldError>) => void", description: "검증 실패로 제출이 거부될 때 호출." },
          { prop: "scrollToFirstError", type: "boolean", default: "true", description: "제출 실패 시 첫 에러 필드로 스크롤." },
          { prop: "focusFirstError", type: "boolean", default: "true", description: "제출 실패 시 첫 에러 필드에 포커스." },
          { prop: "disabled", type: "boolean", description: "폼 전체 비활성. 모든 Form.Control에 disabled 전파." },
        ]}
      />

      <h3>&lt;Form.Field&gt;</h3>
      <PropsTable
        rows={[
          { prop: "name", type: "string", description: "필드 경로. 점 표기법으로 중첩 가능 (예: shipping.address)." },
          { prop: "validate", type: "FieldValidate", description: "필드 단위 검증 함수 또는 { fn, debounce } 객체. 에러 문자열 또는 undefined 반환." },
          { prop: "validateOn", type: '"blur" | "change" | "submit"', description: "이 필드만의 검증 트리거. Form validateOn을 오버라이드." },
          { prop: "required", type: "boolean", description: "필수 여부. Form.Control의 aria-required 자동 반영." },
          { prop: "disabled", type: "boolean", description: "필드 비활성." },
          { prop: "readOnly", type: "boolean", description: "읽기 전용." },
        ]}
      />

      <h3>&lt;Form.Control&gt;</h3>
      <PropsTable
        rows={[
          { prop: "children", type: "ReactElement", description: "단일 input 요소. id / name / value / onChange / onBlur / aria-* 자동 주입." },
          { prop: "valueAs", type: '"value" | "checked"', default: '"value"', description: '체크박스·스위치는 "checked"로 설정.' },
          { prop: "render", type: "(ctrl: ControlProps) => ReactElement", description: "children 대신 render prop. ctrl에 id / value / onChange / onBlur / aria-* 포함." },
        ]}
      />

      <h3>&lt;Form.Error&gt;</h3>
      <PropsTable
        rows={[
          { prop: "matches", type: "string", description: "ValidityState 키와 일치하는 에러 타입만 표시 (예: \"tooShort\", \"valueMissing\")." },
          { prop: "children", type: "ReactNode | ((err) => ReactNode)", description: "커스텀 에러 렌더. 생략 시 err.message를 출력." },
        ]}
      />

      <h3>&lt;Form.Section&gt;</h3>
      <PropsTable
        rows={[
          { prop: "name", type: "string", description: "섹션 네임스페이스. 하위 Form.Field의 경로 prefix가 된다." },
          { prop: "schema", type: "StandardSchemaV1", description: "섹션 단위 스키마. 루트 schema를 override." },
          { prop: "as", type: '"div" | "fieldset"', default: '"div"', description: "렌더링할 HTML 요소." },
        ]}
      />

      <h3>&lt;Form.Steps&gt;</h3>
      <PropsTable
        rows={[
          { prop: "defaultStep", type: "string", description: "초기 활성 스텝 id (uncontrolled)." },
          { prop: "activeStep", type: "string", description: "활성 스텝 id (controlled)." },
          { prop: "onStepChange", type: "(id: string) => void", description: "스텝 변경 콜백." },
        ]}
      />

      <h3>&lt;Form.Step&gt;</h3>
      <PropsTable
        rows={[
          { prop: "id", type: "string", description: "스텝 식별자. 필수." },
          { prop: "skipValidationOnNext", type: "boolean", description: "next() 호출 시 이 스텝의 검증을 건너뜀." },
        ]}
      />

      <h3>훅</h3>
      <PropsTable
        rows={[
          { prop: "useShUiForm(options?)", type: "FormStore<T>", description: "내부 스토어를 생성·반환. options: defaultValues / schema / validateOn 등." },
          { prop: "useFormContext()", type: "FormStore<T>", description: "<Form> 안에서 스토어에 직접 접근." },
          { prop: "useFormField(name?)", type: "FieldState & { path }", description: "필드 상태(value / error / touched / isValidating). name 생략 시 Form.Field 컨텍스트 경로." },
          { prop: "useFormSection(name?)", type: "{ hasError, errors, isValid, isDirty }", description: "섹션 단위 에러 집계." },
          { prop: "useFormSteps()", type: "{ activeStepId, next, prev, goTo, isStepValid, isFirstStep, isLastStep }", description: "멀티스텝 제어. Form.Steps 안에서만 사용." },
          { prop: "useFormState()", type: "FormStoreState", description: "전체 폼 상태(submitting / submitCount 등) 읽기 전용." },
        ]}
      />

      <h3>간격 / 레이아웃</h3>
      <p>
        Form · Form.Section · Form.Field 는 기본적으로 세로 flex 레이아웃 + 토큰
        간격(<code>--space-4</code>, <code>--space-1</code>)을 쓴다. 덮어쓰고 싶으면{" "}
        <code>style</code> · <code>className</code> 으로 직접. 별도 CSS 변수나
        prop 은 없다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "style / className / 외부 CSS",
            language: "tsx",
            code: `// 필드 간 간격
<Form style={{ gap: "2rem" }}>

// 필드 내부(label/control/error) 간격
<Form.Field name="email" style={{ gap: "0.5rem" }}>

// Tailwind 같은 utility
<Form className="gap-8">
<Form.Field name="email" className="gap-2">

// 아예 레이아웃 교체
<Form style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
<Form.Field name="email" style={{ flexDirection: "row", alignItems: "center" }}>

// 여러 Field 에 일괄 적용하고 싶으면 외부 CSS 로
// .my-form .sh-ui-form-field { gap: 0.5rem; }
<Form className="my-form">`,
          },
        ]}
      />

      <h3>타입</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "Types",
            language: "tsx",
            code: `import type {
  FormStore,       // 스토어 인터페이스 — useShUiForm / adaptXxx 반환값
  FormStoreState,  // 전체 폼 상태 스냅샷
  FieldState,      // 개별 필드 상태
  FieldError,      // { message: string; type?: string; source: ErrorSource }
  FieldConfig,     // Field 등록 설정
  FieldValidate,   // validate 함수 또는 { fn, debounce }
  ValidateOn,      // "submit" | "blur" | "change"
  StandardSchemaV1 // Standard Schema v1 인터페이스
} from "@/components/ui/form";`,
          },
        ]}
      />
    </main>
  );
}
