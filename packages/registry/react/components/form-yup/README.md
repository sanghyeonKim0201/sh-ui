# form-yup

Yup 스키마를 sh-ui Form 에 붙이기 위한 Standard Schema v1 래퍼.

## Install

```bash
npm i yup
sh-ui add form-yup
```

## 사용

```tsx
import * as yup from "yup";
import { yupSchema } from "@/components/ui/form-yup";
import { Form } from "@/components/ui/form";

const schema = yupSchema(yup.object({ email: yup.string().required() }));

<Form schema={schema}>...</Form>
```
