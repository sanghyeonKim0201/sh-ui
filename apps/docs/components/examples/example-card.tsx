import Link from "next/link";
import type { ExampleEntry } from "@/examples/types";

export interface ExampleCardProps {
  entry: ExampleEntry;
}

export function ExampleCard({ entry }: ExampleCardProps) {
  const { slug, title, category, description, Component } = entry;
  const titleId = `sh-ui-example-card-title-${slug}`;
  return (
    <article className="sh-ui-example-card" aria-labelledby={titleId}>
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
        <h3 id={titleId} className="sh-ui-example-card__title">
          <Link href={`/examples/${slug}`} className="sh-ui-example-card__title-link">
            {title}
          </Link>
        </h3>
        <p className="sh-ui-example-card__desc">{description}</p>
      </div>
    </article>
  );
}
