# form-rhf

React Hook Form 인스턴스를 sh-ui Form 에 연결하는 어댑터.

## Install

```bash
npm i react-hook-form
sh-ui add form-rhf
```

## 사용 — `useReactHookFormAdapter` (권장)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReactHookFormAdapter } from "@/components/ui/form-rhf";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("이메일 형식이 아닙니다"),
  name: z.string().min(1, "이름을 입력하세요"),
});
type Values = z.infer<typeof schema>;

function MyForm() {
  const rhf = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "" },
    mode: "onBlur",
  });
  const form = useReactHookFormAdapter<Values>(rhf);

  return (
    <Form form={form} onSubmit={(values) => console.log(values)}>
      <Form.Field name="email">
        {(field) => (
          <>
            <Form.Label>이메일</Form.Label>
            <Input
              id={field.id}
              name={field.name}
              type="email"
              value={field.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              aria-invalid={field.ariaInvalid}
              aria-describedby={field.ariaDescribedBy}
            />
            <Form.Error />
          </>
        )}
      </Form.Field>

      <Form.Field name="name">
        {(field) => (
          <>
            <Form.Label>이름</Form.Label>
            <Input
              id={field.id}
              name={field.name}
              value={field.value as string}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            <Form.Error />
          </>
        )}
      </Form.Field>

      <button type="submit">제출</button>
    </Form>
  );
}
```

## API

### `useReactHookFormAdapter<T>(rhf, config?)` (v0.114+)

Hook 변종. **`useRef` 로 어댑터 인스턴스를 mount 시점에 안정화** — 매 렌더 새
store 함정 회피.

### `adaptReactHookForm<T>(rhf, config?)` (저레벨)

순수 함수. 호출자가 `useMemo` 등으로 직접 안정화 책임. **일반 사용에선 hook
변종을 권장.**

## 패턴

### 권장 — render prop (`<Form.Field>{(field) => ...}</Form.Field>`)

`field` 객체:

| key | 설명 |
|---|---|
| `value` | 현재 값 |
| `errors` / `error` / `hasError` | 검증 에러 (배열 / 첫 에러 / boolean) |
| `touched` / `isValidating` | 상태 |
| `handleChange(next)` | **next value 자체** 받음 (event 아님) — input/select/checkbox/custom 통일 |
| `handleBlur()` | blur 처리 + 검증 트리거 |
| `name` / `id` | path / element id |
| `ariaInvalid` / `ariaDescribedBy` / `disabled` / `readOnly` / `required` | a11y · DOM 메타 |

### 다른 입력 종류

```tsx
{/* Checkbox */}
<Form.Field name="agreed">
  {(field) => (
    <Checkbox
      checked={field.value as boolean}
      onCheckedChange={(v) => field.handleChange(v === true)}
    />
  )}
</Form.Field>

{/* Select */}
<Form.Field name="role">
  {(field) => (
    <Select
      value={field.value as string}
      onValueChange={(v) => field.handleChange(v ?? "")}
    >
      ...
    </Select>
  )}
</Form.Field>

{/* Custom (직접 만든 입력) */}
<Form.Field name="emoji">
  {(field) => (
    <EmojiPicker
      value={field.value as string}
      onChange={field.handleChange}
    />
  )}
</Form.Field>
```

### Legacy — `Form.Control` (v0.114 deprecated)

cloneElement 기반의 단순 케이스 helper. 자식 1개 제한, custom value 미지원,
한 메이저 release 뒤 제거 예정. 신규 코드는 render prop 사용.

```tsx
<Form.Field name="email">
  <Form.Label>이메일</Form.Label>
  <Form.Control><Input /></Form.Control>  {/* deprecated */}
  <Form.Error />
</Form.Field>
```

검증 규칙은 RHF 쪽 `resolver` 에서 일괄 관리. sh-ui 의 `schema` / `validateOn`
prop 은 어댑터 모드에서 무시된다.
