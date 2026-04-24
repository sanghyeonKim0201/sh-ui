import { Suspense } from "react";
import {
  ExampleGallery,
  type ExampleGalleryCard,
} from "@/components/examples/example-gallery";
import { ExampleCard } from "@/components/examples/example-card";
import { examples } from "@/examples";
import "./examples.css";

export const dynamic = "force-static";

export const metadata = {
  title: "실전 예제 — sh-ui",
  description: "sh-ui 컴포넌트를 조합한 실제 화면 예제 모음",
};

export default function ExamplesPage() {
  const cards: ExampleGalleryCard[] = examples.map((entry) => ({
    slug: entry.slug,
    category: entry.category,
    node: <ExampleCard entry={entry} />,
  }));
  return (
    <main className="sh-ui-examples-page">
      <header className="sh-ui-examples-page__header">
        <h1>실전 예제</h1>
        <p>
          sh-ui 컴포넌트로 만든 화면들. 카드를 클릭하면 풀스크린 쇼케이스와 소스
          코드를 볼 수 있어요.
        </p>
      </header>
      <Suspense fallback={null}>
        <ExampleGallery cards={cards} />
      </Suspense>
    </main>
  );
}
