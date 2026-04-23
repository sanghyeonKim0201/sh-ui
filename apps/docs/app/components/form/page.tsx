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

export default function FormPage() {
  return (
    <main className="container">
      <h1>Form</h1>
      <p className="muted">
        검증·멀티스텝·섹션 유효성을 지원하는 폼 컴포넌트. 네이티브 모드로 단독 사용하거나{" "}
        <code>adaptReactHookForm</code> / <code>adaptTanstackForm</code> / <code>adaptYup</code>
        로 서드파티 라이브러리와 연결한다.
      </p>

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
              code: `<Form
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
      <Input type="email" required placeholder="you@example.com" />
    </Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">가입</Button>
</Form>`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add form`,
          },
        ]}
      />

      <h2>Usage</h2>
      <p className="muted">
        세 가지 사용 모드를 지원한다.
      </p>
      <ul>
        <li>
          <strong>네이티브</strong> — <code>defaultValues</code> + <code>onSubmit</code> 만으로 사용. 외부 라이브러리 불필요.
        </li>
        <li>
          <strong>React Hook Form</strong> — <code>adaptReactHookForm(rhf)</code>으로 RHF 인스턴스를 <code>form</code> prop에 주입. RHF의 resolver·watch 기능과 병용 가능.
        </li>
        <li>
          <strong>TanStack Form</strong> — <code>adaptTanstackForm(tanstack)</code>으로 동일하게 연결.
        </li>
      </ul>
      <p className="muted">
        폼 레벨 스키마 검증은{" "}
        <a href="https://standardschema.dev" target="_blank" rel="noreferrer">
          Standard Schema v1
        </a>
        을 준수하는 라이브러리(Zod, Yup, Valibot 등)를 <code>schema</code> prop으로 전달하면 된다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "tsx",
            code: `import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// 네이티브 모드
<Form
  defaultValues={{ email: "", name: "" }}
  validateOn="blur"
  onSubmit={async (values) => {
    await save(values);
  }}
>
  <Form.Field name="email" validate={(v) =>
    String(v).includes("@") ? undefined : "이메일 형식이 아닙니다"
  }>
    <Form.Label>이메일</Form.Label>
    <Form.Control><Input type="email" /></Form.Control>
    <Form.Error />
  </Form.Field>
  <Button type="submit">저장</Button>
</Form>`,
          },
        ]}
      />

      <h2>멀티스텝</h2>
      <p className="muted">
        <code>Form.Steps</code> + <code>Form.Step</code>으로 단계형 폼을 구성한다.{" "}
        <code>useFormSteps()</code>의 <code>next()</code>는 현재 스텝 필드를 검증한 뒤
        다음 스텝으로 이동하고, 마지막 스텝에서는 <code>store.submit()</code>을 호출한다.
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
              code: `function StepNavButtons() {
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

<Form defaultValues={{ email: "", name: "" }} onSubmit={handleSubmit}>
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
  </Form.Steps>
</Form>`,
            },
          ]}
        />
      </Preview>

      <h2>여러 카드에 나뉜 폼</h2>
      <p className="muted">
        <code>Form.Section</code>으로 폼을 논리적으로 구분한다.{" "}
        <code>useFormSection("sectionName")</code>의 <code>hasError</code>를 활용해
        각 카드 헤더에 오류 표시를 추가할 수 있다.
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
              code: `function SectionHeader({ sectionName, title }) {
  const { hasError } = useFormSection(sectionName);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <h3>{title}</h3>
      {hasError && (
        <span style={{ width: 8, height: 8, borderRadius: "50%",
          backgroundColor: "var(--color-danger)" }} />
      )}
    </div>
  );
}

<Form defaultValues={{ shipping: { name: "", address: "" } }} onSubmit={handleSubmit}>
  <Form.Section name="shipping">
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

      <h2>재사용 블록</h2>
      <p className="muted">
        <code>Form.Section</code> + <code>Form.Field</code>만으로 구성한 컴포넌트는
        <code>Form</code> 루트 없이도 정의할 수 있다. 같은 블록을 여러 섹션에 반복 배치할 때 유용하다.
      </p>
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

      <h2>React Hook Form 어댑터</h2>
      <p className="muted">
        <code>adaptReactHookForm</code>으로 RHF 인스턴스를 sh-ui Form과 연결한다.
        RHF의 <code>resolver</code>(Zod, Yup 등), <code>watch</code>, <code>setValue</code> 등
        모든 RHF API를 그대로 사용할 수 있다. 어댑터를 사용하려면{" "}
        <code>react-hook-form</code>과 <code>form-rhf</code> 컴포넌트가 모두 필요하다.
      </p>
      <CodeTabs
        items={[
          {
            value: "install",
            label: "설치",
            language: "bash",
            showLineNumbers: false,
            code: `# react-hook-form 설치
pnpm add react-hook-form

# form-rhf 컴포넌트 추가
npx sh-ui add form-rhf`,
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

export function MyForm() {
  const rhf = useForm<FormValues>({
    defaultValues: { email: "", name: "" },
    mode: "onBlur",
  });
  const form = adaptReactHookForm(rhf);

  return (
    <Form form={form} onSubmit={(values) => console.log(values)}>
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

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "Form", description: "폼 루트. defaultValues / form / schema / validateOn / onSubmit / onInvalid 등을 받는다. <Form>은 중첩 불가." },
          { name: "Form.Field", description: "개별 필드 래퍼. name / validate / validateOn / required / disabled / readOnly." },
          { name: "Form.Label", description: "Form.Field 내부 레이블. htmlFor를 자동 연결." },
          { name: "Form.Description", description: "필드 설명. aria-describedby로 컨트롤과 자동 연결." },
          { name: "Form.Error", description: "에러 메시지 표시. 에러가 없으면 null 반환. render prop으로 커스텀 렌더 가능." },
          { name: "Form.Control", description: "자식 input 요소에 id / name / value / onChange / onBlur / aria-invalid 등을 자동 주입." },
          { name: "Form.Section", description: "필드 그룹. name prop으로 중첩 경로를 만들고 schema prop으로 섹션 단위 검증 지원." },
          { name: "Form.SectionTitle", description: "섹션 제목. fieldset > legend 역할." },
          { name: "Form.Steps", description: "멀티스텝 컨테이너. defaultStep / activeStep / onStepChange." },
          { name: "Form.Step", description: "개별 스텝. id 필수. activeStep과 id가 일치할 때만 렌더." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>Form</h3>
      <PropsTable
        rows={[
          { prop: "defaultValues", type: "Partial<T>", description: "초기값 (네이티브 모드)." },
          { prop: "form", type: "FormStore<T>", description: "외부 어댑터 store. 지정 시 defaultValues 무시." },
          { prop: "schema", type: "StandardSchemaV1", description: "폼 레벨 스키마 검증. Zod·Yup·Valibot 등." },
          { prop: "validateOn", type: `"blur" | "change" | "submit"`, default: `"blur"`, description: "기본 검증 트리거." },
          { prop: "onSubmit", type: "(values: T) => void | Promise<void>", description: "검증 통과 시 호출." },
          { prop: "onInvalid", type: "(errors) => void", description: "검증 실패 시 호출." },
          { prop: "scrollToFirstError", type: "boolean", default: "true", description: "제출 실패 시 첫 에러 필드로 스크롤." },
          { prop: "focusFirstError", type: "boolean", default: "true", description: "제출 실패 시 첫 에러 필드에 포커스." },
          { prop: "disabled", type: "boolean", description: "폼 전체 비활성." },
        ]}
      />

      <h3>Form.Field</h3>
      <PropsTable
        rows={[
          { prop: "name", type: "string", description: "필드 경로. 점 표기법으로 중첩 가능 (예: shipping.address)." },
          { prop: "validate", type: `(value, values) => string | undefined | Promise<...>`, description: "필드 단위 커스텀 검증 함수. 에러 문자열 또는 undefined 반환." },
          { prop: "validateOn", type: `"blur" | "change" | "submit"`, description: "이 필드에만 적용되는 검증 트리거. Form의 validateOn을 오버라이드." },
          { prop: "required", type: "boolean", description: "필수 여부. Form.Control의 aria-required에 자동 반영." },
          { prop: "disabled", type: "boolean", description: "필드 비활성." },
          { prop: "readOnly", type: "boolean", description: "읽기 전용." },
        ]}
      />

      <h3>Form.Control</h3>
      <PropsTable
        rows={[
          { prop: "children", type: "ReactElement", description: "단일 input 요소. id / name / value / onChange / onBlur / aria-* 를 자동 주입." },
          { prop: "valueAs", type: `"value" | "checked"`, default: `"value"`, description: `체크박스·스위치는 "checked"로 설정.` },
          { prop: "render", type: "(ctrl: ControlProps) => ReactElement", description: "children 대신 render prop으로 직접 제어할 때." },
        ]}
      />

      <h3>Form.Steps</h3>
      <PropsTable
        rows={[
          { prop: "defaultStep", type: "string", description: "초기 활성 스텝 id (uncontrolled)." },
          { prop: "activeStep", type: "string", description: "활성 스텝 id (controlled)." },
          { prop: "onStepChange", type: "(id: string) => void", description: "스텝 변경 콜백." },
        ]}
      />

      <h3>useFormSteps()</h3>
      <PropsTable
        rows={[
          { prop: "activeStepId", type: "string | null", description: "현재 활성 스텝 id." },
          { prop: "isFirstStep", type: "boolean", description: "첫 번째 스텝 여부." },
          { prop: "isLastStep", type: "boolean", description: "마지막 스텝 여부." },
          { prop: "next()", type: "() => Promise<boolean>", description: "현재 스텝 검증 후 다음 스텝으로 이동. 마지막 스텝에서는 submit." },
          { prop: "prev()", type: "() => void", description: "이전 스텝으로 이동." },
          { prop: "goTo(id)", type: "(id: string) => void", description: "특정 스텝으로 이동." },
        ]}
      />
    </main>
  );
}
