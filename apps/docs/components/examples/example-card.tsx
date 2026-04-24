import Link from "next/link";
import type { ExampleEntry } from "@/examples/types";

export interface ExampleCardProps {
  entry: ExampleEntry;
}

export function ExampleCard({ entry }: ExampleCardProps) {
  const { slug, title, category, description, Component } = entry;
  return (
    <Link href={`/examples/${slug}`} className="sh-ui-example-card">
      <div className="sh-ui-example-card__preview" aria-hidden="true">
        <div className="sh-ui-example-card__preview-inner">
          <Component />
        </div>
      </div>
      <div className="sh-ui-example-card__body">
        <span
          className={`sh-ui-example-card__badge sh-ui-example-card__badge--${category}`}
        >
          {category}
        </span>
        <h3 className="sh-ui-example-card__title">{title}</h3>
        <p className="sh-ui-example-card__desc">{description}</p>
      </div>
    </Link>
  );
}
