# Form 컴포넌트 설계 — 라이브러리 비종속 + 멀티스텝/멀티섹션 1급

**작성일:** 2026-04-22
**상태:** Draft (승인 대기)
**관련 패키지:** `packages/registry/react/components/form`, `form-rhf`, `form-tanstack`, `form-yup`

---

## 1. 배경 & 문제

sh-ui 는 Input · Label · Checkbox · Radio · Select · Switch · Textarea 같은 폼 프리미티브를 이미 제공하지만, 이들을 묶어주는 **Form / Field 프리미티브가 없다**. 사용자는 매번 useState / useId / aria 속성 연결을 직접 쓰거나, RHF · TanStack Form 같은 라이브러리를 도입해야 한다.

기존 폼 라이브러리의 공통 불편:

- **Prop drilling 지옥** — `control` / `form` 인스턴스를 Card 마다 전달
- **필드 이름 충돌 · 네임스페이스 부재**
- **스텝별 검증이 번거로움** — `trigger(['a','b'])` 에 필드 이름 하드코딩
- **스텝 이동 시 값 유실** — unmount/remount 관리 필요
- **어느 카드 · 스텝에 에러 있는지 안 보임** — 직접 집계 필요
- **카드 · 스텝 간 필드 의존** — 아직 마운트 안 된 스텝 값 읽기 어려움
- **부분 저장 · 드래프트 저장** 까다로움

sh-ui 의 Form 은 이 모두를 1급으로 해결하되, **특정 라이브러리에 종속되지 않는다.**

## 2. 목표 / 비목표

### 목표

- **3가지 사용 모드를 하나의 API 로**
  1. 라이브러리 0개 — 바닐라 React (FormData + HTML5)
  2. 내장 훅 `useShUiForm()` — 얇은 내장 상태
  3. RHF · TanStack Form 어댑터 — 기존 사용자 지원
- **섹션 · 스텝 1급 취급** — 네임스페이스, 값 persistence, validity 집계, 스텝별 검증
- **재사용 컴포넌트가 Form 루트를 요구하지 않음** — 재사용 = Section 패턴
- **Standard Schema 표준 채택** — Zod v3.24+ · Valibot · Arktype 네이티브, Yup 만 래퍼
- **접근성 기본 내장** — id 연결, aria-invalid/describedby, role=alert, 첫 에러 자동 포커스

### 비목표 (이번 스펙 밖)

- Field Array (동적 리스트 필드)
- StepIndicator 시각 컴포넌트 (헤드리스 훅만)
- Draft 자동 저장 (localStorage 연동)
- 조건부 필드 컴포넌트 (`<Form.When>`)
- 다국어 에러 메시지 내장
- 스텝 분기 (branching wizard)
- Flutter 버전
- 포커스 트랩 / Optimistic submit

## 3. 아키텍처 & 상태 모델

### Form 루트 하나에 상태 집중

```
<Form>            ← 값·에러·touched·submitting 모두 여기
  <Card>
    <Form.Section name="profile">   ← 네임스페이스 + 섹션 validity read
      <Form.Field name="name">      ← 실제 경로: "profile.name"
  <Card>
    <Form.Steps>
      <Form.Step id="account">
        <Form.Field name="email">   ← "email" (스텝은 네임스페이스 아님)
```

- **네임스페이스 규칙:** `Form.Section` 만 경로에 붙는다. `Form.Step` 은 "어떤 필드가 이 스텝 소속인지" 만 추적, 값 경로에는 영향 없음. 섹션은 "도메인 그룹" 이고 스텝은 "UX 진행 단위" 이므로 직교.

### 내부 저장소 스키마

```ts
interface FormStoreState {
  values: Record<string, unknown>;    // flat, dot-path keyed
  errors: Record<string, FieldError | undefined>;
  touched: Record<string, boolean>;
  submitting: boolean;
  submitCount: number;
  activeStepId: string | null;
  fieldsByStep: Map<string, Set<string>>;       // stepId → fieldPath 집합
  fieldsBySection: Map<string, Set<string>>;    // sectionPath → fieldPath 집합
}
```

- **내부는 flat (`"profile.name"`), 외부로는 nested 변환해서 노출** — `form.getValues()` 는 `{ profile: { name, email }, ... }` 반환
- **값은 영구 보존** — 스텝 unmount 되어도 유지. `form.reset()` / Form unmount 시에만 소멸
- **에러 · touched 도 경로 키** — 섹션 validity 집계는 prefix 필터

### 3가지 사용 모드 공통 인터페이스

```ts
interface FormStore<T = unknown> {
  subscribe(listener: () => void): () => void;
  getFieldState(path: string): FieldState;
  setFieldValue(path: string, value: unknown): void;
  registerField(path: string, config: FieldConfig): () => void;
  validateStep(stepId: string): Promise<boolean>;
  getValues(scope?: string): unknown;
  submit(): Promise<void>;
  reset(defaults?: Partial<T>): void;
  setError(path: string, message: string): void;
  getState(): FormStoreState;
}
```

`Form.Field` 이하 컴포넌트는 **이 인터페이스만 바라본다.** 구현체는:

1. **기본**: `<Form>` 이 `form` prop 없이 마운트되면 내부에서 `createFormStore()` 호출
2. **내장 훅**: `useShUiForm()` 이 `FormStore` 반환 → `<Form form={store}>`
3. **어댑터**: `adaptReactHookForm(rhf)` 가 `FormStore` 반환 → `<Form form={store}>`

## 4. 재사용 규칙

**재사용 컴포넌트는 Form 루트를 요구하지 않는다.** Form 루트는 최종 소비자(페이지/화면)에서만 씌운다.

### 재사용 블록 패턴

```tsx
// ① 재사용 블록 — Form 루트 없음
export function AddressFields({ namePrefix = "address" }: Props) {
  return (
    <Form.Section name={namePrefix} schema={addressSchema}>
      <Form.Field name="zip" validate={validateZip}>
        <Form.Label>우편번호</Form.Label>
        <Form.Control><Input /></Form.Control>
        <Form.Error />
      </Form.Field>
      <Form.Field name="street" validate={(v) => v ? undefined : "필수"}>
        ...
      </Form.Field>
    </Form.Section>
  );
}

// ② 최종 소비자 — 여기서만 Form 루트
<Form onSubmit={handleSubmit}>
  <AddressFields namePrefix="shipping" />
  <AddressFields namePrefix="billing" />
  <Button type="submit">주문</Button>
</Form>

// ③ 독립 실행 래퍼 — 필요 시 별도 export
export function AddressForm({ onSubmit }: Props) {
  return (
    <Form onSubmit={onSubmit}>
      <AddressFields />
      <Button type="submit">저장</Button>
    </Form>
  );
}
```

**관용:**

- `*Fields` 접미어 = Form 루트 없음, 어디든 꽂음
- `*Form` 접미어 = Form 루트 포함, 독립 실행
- **`<Form>` 중첩 금지** — dev 모드에서 런타임 에러. 재사용은 Section 패턴으로 해결되므로 Form 안에 Form 둘 이유가 없고, 상태 섞임 모호성을 원천 차단

### 스키마 재사용

- **섹션 로컬 스키마** (`Form.Section schema={...}`) — 재사용 블록에 딸려 감
- **루트 스키마** (`Form schema={...}`) — 최종 소비자가 composite 으로 구성 (예: `z.object({ shipping: addressSchema, billing: addressSchema })`)
- 둘 다 있을 때 같은 필드에 대해서는 **섹션 schema 가 루트 schema 를 덮는다** (merge 아님). 재사용 블록의 자급 검증 보장.

## 5. Compound API

### 전체 트리

```
Form (optional: form, defaultValues, schema, onSubmit, validateOn, disabled)
├── Form.Section (optional: name, schema, as="fieldset"?)
│   ├── Form.SectionTitle
│   └── Form.Field (name, validate, validateOn?, required?, disabled?, readOnly?)
│       ├── Form.Label
│       ├── Form.Description
│       ├── Form.Control (valueAs?: "value" | "checked", render?)
│       └── Form.Error (matches?: string, children?: (err) => ReactNode)
├── Form.Steps (defaultStep, activeStep, onStepChange)
│   └── Form.Step (id, skipValidationOnNext?)
└── (submit 버튼은 일반 <button type="submit">, 따로 안 제공)

훅:
- useShUiForm(options)         ← 내장 모드 FormStore 생성
- useFormContext()              ← Form 내부 어디서나
- useFormField(name?)           ← 필드 상태
- useFormSection(name?)         ← 섹션 validity 집계
- useFormSteps()                ← activeStepId, next, prev, goTo, isStepValid
```

### 기본 예시

```tsx
<Form defaultValues={{ email: "" }} onSubmit={handleSubmit}>
  <Form.Field
    name="email"
    validate={(v) => v.includes("@") ? undefined : "이메일 형식 아님"}
  >
    <Form.Label>이메일</Form.Label>
    <Form.Description>회사 이메일 권장</Form.Description>
    <Form.Control>
      <Input type="email" required />
    </Form.Control>
    <Form.Error />
  </Form.Field>
  <button type="submit">가입</button>
</Form>
```

### `Form.Control` 바인딩

```tsx
// 1) 기본 (value 바인딩): Input, Textarea, Select
<Form.Control><Input /></Form.Control>

// 2) checked 바인딩: Checkbox, Switch, Radio
<Form.Control valueAs="checked"><Checkbox /></Form.Control>

// 3) 커스텀 매핑이 필요하면 render prop
<Form.Control render={(ctrl) => <ColorPicker color={ctrl.value} onSelect={ctrl.onChange} />} />
```

- `React.cloneElement` 로 단일 자식에 prop 주입. 여러 자식이면 dev 에러
- 주입 prop: `id`, `name`, `value` (또는 `checked`), `onChange`, `onBlur`, `aria-invalid`, `aria-describedby`, `aria-required`, `disabled`, `readOnly`, `required`
- `data-validating` 속성 (async validate 진행 중) → CSS 로 스피너 슬롯 가능

### `Form.Error`

```tsx
<Form.Error />                                              // state.error.message 자동
<Form.Error>{(err) => <Alert>{err.message}</Alert>}</Form.Error>   // 커스텀 렌더
<Form.Error matches="tooShort">최소 8자</Form.Error>        // HTML5 ValidityState 매칭
```

- 에러 없으면 DOM 에서 제거 (스크린리더 잡음 방지)
- `role="alert"` + `aria-live="polite"`
- id 가 `Form.Control` 의 `aria-describedby` 에 자동 포함

### `Form.Section`

```tsx
<Form.Section name="profile" schema={profileSchema}>
  <Form.SectionTitle>프로필</Form.SectionTitle>
  <Form.Field name="name">...</Form.Field>
</Form.Section>

function ProfileCard() {
  const { hasError, isDirty, isValid } = useFormSection("profile");
  return <Card data-invalid={hasError}>...</Card>;
}
```

- `name` 생략 가능 — "네임스페이스 없는 virtual section" (validity 집계만)
- 기본 마크업: `<div role="group" aria-labelledby="...">`. `as="fieldset"` 으로 `<fieldset><legend>` 도 가능

### `Form.Steps` / `Form.Step`

```tsx
<Form.Steps defaultStep="account">
  <Form.Step id="account">
    <Form.Field name="email">...</Form.Field>
  </Form.Step>
  <Form.Step id="profile">
    <Form.Field name="name">...</Form.Field>
  </Form.Step>
</Form.Steps>

function StepNav() {
  const { next, prev, isLastStep, activeStepId } = useFormSteps();
  return (
    <>
      <Button onClick={prev}>이전</Button>
      <Button onClick={next}>{isLastStep ? "제출" : "다음"}</Button>
    </>
  );
}
```

- `next()` 호출 시 **자동으로 현재 스텝 필드만 검증** → 통과해야 이동. 실패 시 `false` 반환, 이동 안 함
- 비활성 스텝 children 은 unmount. **값은 Form 루트에 보존**
- `<Form.Step skipValidationOnNext>` 로 특정 스텝 우회
- `useFormSteps().isStepValid(id)` / `isStepComplete(id)` 로 인디케이터 렌더

### `useShUiForm` 시그니처

```ts
function useShUiForm<T>(options?: {
  defaultValues?: Partial<T>;
  schema?: StandardSchemaV1<T>;
  validateOn?: "submit" | "blur" | "change";   // 기본 "blur"
  onSubmit?: (values: T, helpers: { reset; setError }) => void | Promise<void>;
}): FormStore<T>;
```

- Standard Schema `~standard` 프로토콜 사용
- 내부적으로 `useSyncExternalStore` 로 렌더 최소화

## 6. 검증 동작

### 트리거 모드

```ts
validateOn?: "submit" | "blur" | "change";   // 기본 "blur"
```

- 기본: blur 시 검증
- **첫 에러 발생 이후 해당 필드만 onChange 모드로 자동 전환** — 사용자가 고치는 동안 즉시 피드백
- `validateOn="change"` 강제 실시간
- `validateOn="submit"` 제출 때만
- `Form.Field validateOn` prop 으로 필드별 override

### 검증 소스 & 우선순위

한 필드에 대해 실행 순서:

```
1. HTML5 (required, type, pattern, minLength…)    ← 동기, 즉시
2. Form.Field 의 validate 함수                     ← 동기/비동기
3. Form.Section 의 schema (해당 경로만)
4. Form 루트의 schema (해당 경로만)
```

- **필드당 "첫 실패" 하나만 `Form.Error` 가 표시** — UX 혼란 방지
- **전체 에러는 `useFormField(name).state.errors` (배열) 로 접근 가능**
- **HTML5 실패면 JS 검증 스킵** — 빠른 단축
- **섹션 schema 가 루트 schema 를 덮음** — 재사용 블록 자급 보장

### 비동기 validate

```tsx
<Form.Field
  name="email"
  validate={{
    fn: async (value) => (await checkEmail(value)) ? undefined : "이미 사용 중",
    debounce: 500,   // change 모드일 때만. blur/submit 은 즉시
  }}
>
```

- 함수만 넘기면 `{ fn, debounce: 300 }` 기본
- **stale-check** — 값 재변경 시 이전 resolution 버림
- 검증 중: `state.isValidating = true`, Control 에 `data-validating`
- **제출 시 진행 중 async validate 모두 완료 대기** 후 `onSubmit`

### Schema — Standard Schema

```ts
import { z } from "zod";                  // v3.24+ 네이티브
<Form schema={z.object({...})}>

import { yupSchema } from "sh-ui/form/yup";
<Form schema={yupSchema(yupObj)}>
```

- `~standard` 프로토콜의 `issues[]` 를 필드 에러에 매핑
- 섹션 · 루트 schema 는 옵션 — HTML5 + field validate 만으로도 동작

### 스텝 검증

`useFormSteps().next()` 내부 동작:

1. `fieldsByStep.get(activeStepId)` → 스텝 필드 경로 집합
2. 그 경로들만 HTML5 + validate + schema 실행
3. 실패: 모두 `touched=true`, 첫 실패 필드에 포커스, 리턴 `false`
4. 통과: `setActiveStep(next)`, `onStepChange` 콜백

루트 schema 가 있으면 해당 스텝 경로로 partial 실행 (Zod 기준 `.pick(stepPaths)`).

### 제출 & 서버 에러

```tsx
<Form
  onSubmit={async (values, { setError, reset }) => {
    try {
      await api.signup(values);
      reset();
    } catch (e) {
      if (e.code === "EMAIL_TAKEN") setError("email", "이미 가입된 이메일");
    }
  }}
  onInvalid={(errors) => { /* 제출 거부 시 콜백. 토스트 등 */ }}
>
```

- `setError(path, message)` — 서버 응답 에러 주입. 다음 입력 시 자동 clear
- `reset(newDefaults?)` — 값 · 에러 · touched · submitCount 리셋
- **검증 실패 시 첫 에러 필드 자동 포커스** — 비활성 스텝이면 해당 스텝 활성화 후 포커스

### 에러 객체 형태

```ts
type FieldError = {
  message: string;
  type?: "required" | "pattern" | "minLength" | "custom" | string;
  source: "html5" | "validate" | "schema";
};
```

## 7. 외부 라이브러리 어댑터

### 배포 모델

```
sh-ui add form            # 코어
sh-ui add form-rhf        # React Hook Form
sh-ui add form-tanstack   # TanStack Form
sh-ui add form-yup        # Yup → Standard Schema 래퍼
```

어댑터는 **복사되는 소스** — peerDep 가드는 README + 타입 임포트 의존.

### 핵심 원칙 — "라이브러리가 boss"

여기서 "어댑터 모드" 는 **RHF · TanStack Form 같은 외부 라이브러리** 의 인스턴스를 `adaptXxx(...)` 로 감싸 `<Form form={...}>` 에 넘긴 경우만 가리킨다. `useShUiForm()` 은 어댑터가 아니라 **내장 모드** 로, 아래의 "무시" 규칙이 적용되지 않는다 (schema/validateOn 정상 동작).

어댑터 모드일 때 sh-ui 검증 설정 무시:

| sh-ui prop | 어댑터 모드 |
|---|---|
| `<Form validateOn>` | 무시 — 라이브러리 mode 사용 |
| `<Form schema>` | 무시 — 라이브러리 resolver |
| `<Form.Section schema>` | 무시 |
| `<Form.Field validate>` | 무시 — `rhf.register(name, { validate })` 권장 |
| **스텝 · 섹션 바운더리** | **여전히 sh-ui 소관** — `fieldsByStep` / `fieldsBySection` 별도 추적 |

### RHF 어댑터 사용

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adaptReactHookForm } from "sh-ui/form/rhf";

const rhf = useForm<FormValues>({
  defaultValues,
  resolver: zodResolver(signupSchema),
  mode: "onBlur",
});
const form = adaptReactHookForm(rhf);

<Form form={form} onSubmit={(values) => ...}>
  <Form.Steps>
    <Form.Step id="account">
      <Form.Field name="email">...</Form.Field>
    </Form.Step>
  </Form.Steps>
</Form>
```

### 어댑터 구현 스케치

```ts
export function adaptReactHookForm<T>(rhf: UseFormReturn<T>): FormStore<T> {
  const meta = createMetaStore();   // sh-ui 의 스텝·섹션 bookkeeping

  return {
    getFieldState: (path) => ({
      value: rhf.getValues(path),
      error: rhf.formState.errors[path]?.message,
      touched: !!rhf.formState.touchedFields[path],
      isValidating: rhf.formState.isValidating,
    }),
    setFieldValue: (path, v) => rhf.setValue(path, v, { shouldDirty: true }),
    registerField: (path, config) => {
      meta.register(path, config);
      rhf.register(path);
      return () => meta.unregister(path);
    },
    validateStep: async (stepId) => {
      const fields = Array.from(meta.fieldsByStep.get(stepId) ?? []);
      return rhf.trigger(fields);
    },
    submit: () => rhf.handleSubmit(onSubmit)(),
    subscribe: (listener) => rhf.subscribe({ formState: true, values: true }, listener),
    getValues: (scope) => extractScope(rhf.getValues(), scope),
    reset: (defaults) => rhf.reset(defaults),
    setError: (path, message) => rhf.setError(path, { message }),
    // ...
  };
}
```

TanStack Form 어댑터는 store 기반 구독을 `ts.store.subscribe` 에 바인딩하는 점만 다름, 구조 대칭.

### 재사용 블록의 이중 모드 관용

- `AddressFields` 는 `validate={...}` 를 **내장 모드 기준으로 부착** 해둠
- 어댑터 모드 사용자는 자기 스키마에 동일 규칙을 포함
- 문서에 이 규약 명시

## 8. 접근성 & UI 상태

### 자동 ARIA 연결

`Form.Field` 가 `useId()` 로 id 생성 → `id`, `{id}-desc`, `{id}-error` 파생.

- `Form.Label` → `htmlFor={id}`
- `Form.Description` → `id={descId}`, Control 의 `aria-describedby` 에 자동 포함
- `Form.Control` → `id`, `aria-invalid`, `aria-describedby`, `aria-required`
- `Form.Error` → `id={errorId}`, `role="alert"`, `aria-live="polite"`. 에러 없으면 unmount

### 제출 · 검증 상태

- `<Form>` 루트가 `aria-busy={submitting}` 자동
- Submit 버튼 disabled 는 sh-ui 가 **건드리지 않음** — 사용자가 `useFormContext().state.submitting` 읽어 직접 제어
- Control 의 `data-validating` 속성 (async validate 진행 중)

### 첫 에러 자동 포커스

submit / `next()` 실패 시:

1. 첫 에러 필드 (DOM 순서)
2. 비활성 Step 안이면 해당 Step 활성화
3. `element.focus({ preventScroll: true })`
4. `element.scrollIntoView({ block: "center", behavior })` — `prefers-reduced-motion` 에 따라 `"auto"` / `"smooth"`

비활성화: `<Form scrollToFirstError={false}>`, `<Form focusFirstError={false}>`.

### 모션

```css
.sh-ui-form-error { animation: fade-slide-in 150ms var(--easing-out); }

@media (prefers-reduced-motion: reduce) {
  .sh-ui-form-error { animation-duration: 0.01ms; }
}
```

토큰: `--duration-fast`, `--easing-out`.

### Section · Steps 시맨틱

- `Form.Section` 기본: `<div role="group" aria-labelledby="...">`. `as="fieldset"` 옵션
- Step 인디케이터(사용자 구현) 가이드: `<li aria-current={isActive ? "step" : undefined} aria-disabled={!reachable}>`
- `<Form.Steps aria-label="가입 절차">`

### 필수 / Disabled / ReadOnly

- `required` 표시: 기존 `Label` 컴포넌트의 `:has()` 로직 재사용 (`*` 자동)
- `<Form.Field required>` → Control 에 `required` + `aria-required` 전파
- `<Form disabled>` → 내부 모든 Control 에 `disabled` 전파 (제출 중 잠금 등)
- **비활성 이유 안내** — `Form.Description` 으로 사용자가 직접 작성 (맥락별 문구 다름)

### 키보드 · 터치

- **Enter 자동 submit** (네이티브 `<form>` 동작)
- Form.Step 전환 단축키는 없음 (버튼 onClick 만). 필요 시 사용자가 추가
- 버튼 터치 영역 ≥ 44×44 (기존 Button 컴포넌트 충족)

### Success 피드백

Form 이 자동 제공하지 않음. `onSubmit` 안에서 Toast · Redirect · Message 사용자가 선택.

## 9. 파일 구조 & 배포

### 코어

```
packages/registry/react/components/form/
├── index.tsx             # 공개 API 재export
├── form.tsx              # Form 루트 + Section + SectionTitle
├── field.tsx             # Form.Field + Label + Description + Control + Error
├── steps.tsx             # Form.Steps + Step
├── store.ts              # createFormStore (useSyncExternalStore)
├── use-sh-ui-form.ts     # useShUiForm
├── context.ts            # FormContext + useFormContext / Field / Section / Steps
├── validation.ts         # HTML5 + validate + Standard Schema 실행
├── utils.ts              # flatten/unflatten, getByPath, setByPath
├── types.ts              # FormStore, FieldState, FieldError 등
└── styles.css            # 에러 애니메이션 · Section · Steps
```

### 어댑터

```
packages/registry/react/components/form-rhf/{index.tsx, README.md}
packages/registry/react/components/form-tanstack/{index.tsx, README.md}
packages/registry/react/components/form-yup/{index.tsx, README.md}
```

### 듀얼 카피본 (CLAUDE.md 규칙)

모든 폴더를 `apps/docs/components/ui/<name>/` 로 동기 복제. 원본 수정 시 docs 복사본도 반드시 동반 수정.

### CLI 레지스트리

`packages/cli/` 색인에 `form`, `form-rhf`, `form-tanstack`, `form-yup` 엔트리 추가.

### 문서 페이지

`apps/docs/app/components/form/page.tsx`:

- Overview + 3모드 비교
- PropsTable (Form, Form.Field, Form.Section, Form.Steps, Form.Step, Form.Control, Form.Error)
- `<CodeTabs>` — **React 탭만**:
  - 기본 폼 (네이티브)
  - 내장 훅 + Zod
  - 멀티스텝 가입 폼
  - 멀티 Card 체크아웃 + 섹션 validity 인디케이터
  - 재사용 블록 `AddressFields`
  - RHF 어댑터
- 의사결정 트리 (어느 모드를 언제 쓸지)

### Flutter 대응

이번 스펙 범위 밖. 추후 별도 스펙.

### 버전 · Changelog

- 새 공개 API 대량 추가 → **MINOR**
- `packages/changelog/versions.json` prepend
- CLI 버전도 레지스트리 추가 반영

## 10. 테스트 전략

### 도구

- Vitest + React Testing Library + @testing-library/jest-dom + @testing-library/user-event
- 리포지토리에 테스트 러너 없으면 이 PR 에서 form 스코프 최소 셋업 도입

### 시나리오

| 영역 | 시나리오 |
|---|---|
| 바인딩 | `Form.Field` 마운트/언마운트 시 register/unregister |
| 바인딩 | `Form.Control` 이 자식에 id/value/onChange/aria-* 주입 |
| 바인딩 | `valueAs="checked"` 로 Checkbox 동작 |
| 검증 | `validateOn="blur"` → 에러 후 onChange 자동 전환 |
| 검증 | HTML5 실패 시 validate 함수 스킵 |
| 검증 | 비동기 validate stale-check |
| 검증 | 제출 시 진행 중 async validate 대기 |
| 스텝 | `next()` 현재 스텝만 검증 |
| 스텝 | unmount 후 재활성화 시 값 보존 |
| 스텝 | `skipValidationOnNext` 동작 |
| 섹션 | `useFormSection` prefix 매칭 집계 |
| 섹션 | 섹션 schema 가 루트 schema 덮음 |
| 제출 | 실패 시 첫 에러 필드 포커스 |
| 제출 | 비활성 스텝의 에러 시 해당 스텝 활성화 |
| 제출 | `setError` 서버 에러, 입력 시 자동 clear |
| 어댑터 | RHF — 값 변경 리렌더, errors 반영, trigger 연동 |
| 어댑터 | TanStack — 동일 |
| 재사용 | `AddressFields` 가 RHF/내장 양쪽에서 동일 마크업 |
| a11y | `Form.Error` role/live 속성 |
| a11y | Control 의 `aria-describedby` desc+error id 포함 |
| a11y | Enter 키 submit |

### 비범위

- 시각 회귀 (Playwright)
- axe 자동 스캔 전체 통합

## 11. YAGNI 제외 목록

| 빠진 것 | 이유 / 대안 |
|---|---|
| `Form.FieldArray` | 별도 스펙. 지금은 외부 훅을 Control 안에서 수동 사용 |
| StepIndicator 시각 컴포넌트 | 헤드리스 훅만. UI 는 showcase 예시 |
| Draft 자동 저장 | 레시피로 추후 — `useFormDraft()` |
| 조건부 필드 컴포넌트 | JSX 조건부로 충분 |
| 다국어 에러 메시지 내장 | validate/schema 안에서 사용자 i18n |
| 스텝 분기(branching) | 선형만. `skipValidationOnNext` + `goTo(id)` 수동 |
| Flutter 버전 | 별도 스펙 |
| 파일 업로드 전용 필드 | 기존 `file-upload` 를 Control 안에서 그대로 |
| 포커스 트랩 | Form 은 모달 아님 |
| Optimistic submit / rollback | onSubmit 안에서 사용자 처리 |

## 12. 향후 확장 가능성 (스펙 밖)

- `Form.FieldArray` — 동적 리스트 필드 (별도 컴포넌트 추가)
- `useFormDraft()` — localStorage 드래프트 저장 훅 레시피
- `Form.StepIndicator` — 스타일된 진행 표시 컴포넌트
- Flutter `form` / `form-rhf` 대응 (API 설계 다름)
- Playwright 기반 시각 회귀 테스트 셋업
- form 전용 axe a11y 자동 감사

---

**의사결정 요약:**

1. 3가지 사용 모드를 `FormStore` 인터페이스로 통일
2. 섹션 · 스텝 1급, 재사용은 Section 패턴 (Form 루트 없는 컴포넌트)
3. Form 중첩 금지 — dev 에러
4. 내부 flat state, 외부 nested 노출
5. 값은 스텝 unmount 에도 보존 — Form 루트가 단일 소스
6. 검증: blur 후 change 자동 전환, HTML5 우선, 섹션 schema 가 루트 덮음
7. Standard Schema 표준 — Yup 만 래퍼
8. 어댑터 모드 = 라이브러리가 boss, sh-ui 는 구조 + UI 만
9. 자동 ARIA 연결 + 첫 에러 자동 포커스 + prefers-reduced-motion 존중
10. 첫 릴리즈는 React 만, Flutter 는 별도 스펙
