"use client";

import { Button } from "@/components/ui/button";
import { CodeTabs } from "@/components/ui/code-tabs";

/**
 * Button 페이지 상단의 기본 라이브 데모.
 *
 * react-live 의 scope 로 Button 컴포넌트(함수) 를 넘겨야 하는데 서버 컴포넌트 → 클라이언트 컴포넌트
 * 경계로는 함수를 직렬화할 수 없다. 그래서 이 작은 client wrapper 안에서 `scope: { Button }` 을
 * 직접 구성한다. 페이지 본체는 서버 컴포넌트 + `force-static` 으로 유지된다.
 */
export function ButtonLiveDemo() {
  return (
    <CodeTabs
      items={[
        {
          value: "react",
          label: "React",
          language: "tsx",
          live: true,
          scope: { Button },
          code: `<Button>저장</Button>`,
        },
        {
          value: "flutter",
          label: "Flutter",
          language: "dart",
          code: `ShUiButton(
  onPressed: () {},
  child: const Text('저장'),
)`,
        },
      ]}
    />
  );
}
