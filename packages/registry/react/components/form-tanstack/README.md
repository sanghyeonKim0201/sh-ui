# form-tanstack

TanStack Form 인스턴스를 sh-ui Form 에 연결하는 어댑터.

## Install

```bash
npm i @tanstack/react-form
sh-ui add form-tanstack
```

## 사용

```tsx
import { useForm } from "@tanstack/react-form";
import { adaptTanStackForm } from "@/components/ui/form-tanstack";
import { Form } from "@/components/ui/form";

const ts = useForm({ defaultValues, onSubmit: async () => {} });
const form = adaptTanStackForm(ts);

<Form form={form}>
  <Form.Field name="email">...</Form.Field>
</Form>
```

어댑터 모드에선 sh-ui 의 schema / validateOn prop 은 무시된다. 검증은 TanStack 의 validators 에 둔다.
