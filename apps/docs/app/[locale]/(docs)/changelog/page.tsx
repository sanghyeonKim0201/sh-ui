export const dynamic = "force-static";

import changelog from "../../../../../../packages/changelog/versions.json";
import "./styles.css";

interface VersionEntry {
  version: string;
  date: string;
  title: string;
  type: "major" | "minor" | "patch";
  highlights: string[];
  url: string;
}

const typeLabel: Record<VersionEntry["type"], string> = {
  major: "MAJOR",
  minor: "MINOR",
  patch: "PATCH",
};

export default function ChangelogPage() {
  const versions = changelog.versions as VersionEntry[];

  return (
    <main className="container sh-ui-changelog">
      <h1>변경 내역</h1>
      <p className="muted">
        릴리즈별 주요 변경 사항. 전체 본문은 각 버전의 GitHub Release에서 확인.
      </p>

      <ol className="sh-ui-changelog__list">
        {versions.map((v) => (
          <li key={v.version} className="sh-ui-changelog__item">
            <header className="sh-ui-changelog__header">
              <a
                href={v.url}
                target="_blank"
                rel="noreferrer"
                className="sh-ui-changelog__version"
              >
                v{v.version}
              </a>
              <span className={`sh-ui-changelog__type sh-ui-changelog__type--${v.type}`}>
                {typeLabel[v.type]}
              </span>
              <time className="sh-ui-changelog__date" dateTime={v.date}>
                {v.date}
              </time>
            </header>
            <h2 className="sh-ui-changelog__title">{v.title}</h2>
            <ul className="sh-ui-changelog__highlights">
              {v.highlights.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
            <a
              href={v.url}
              target="_blank"
              rel="noreferrer"
              className="sh-ui-changelog__link"
            >
              GitHub에서 전체 보기 →
            </a>
          </li>
        ))}
      </ol>
    </main>
  );
}
