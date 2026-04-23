# form-rhf

React Hook Form 인스턴스를 sh-ui Form 에 연결하는 어댑터.

## Install

```bash
npm i react-hook-form
sh-ui add form-rhf
```

## 사용

```tsx
import { useForm } from "react-hook-form";
import { adaptReactHookForm } from "@/components/ui/form-rhf";
import { Form } from "@/components/ui/form";

const rhf = useForm({ defaultValues, mode: "onBlur" });
const form = adaptReactHookForm(rhf);

<Form form={form}>
  <Form.Field name="email">...</Form.Field>
</Form>
```

어댑터 모드에선 sh-ui 의 `validateOn` / `schema` prop 은 무시된다. 검증 규칙은 RHF 쪽 `resolver`/`register` 옵션에 둔다.
