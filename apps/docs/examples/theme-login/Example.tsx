import { Example as LoginCard } from "../login-card/Example";
import "./example.css";

const THEMES: { key: string; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "neon", label: "Neon" },
];

export function Example() {
  return (
    <div className="sh-ui-ex-theme-login">
      {THEMES.map((t) => (
        <section
          key={t.key}
          className="sh-ui-ex-theme-login__cell"
          data-example-theme={t.key}
          aria-label={`${t.label} 테마`}
        >
          <header className="sh-ui-ex-theme-login__label">{t.label}</header>
          <div className="sh-ui-ex-theme-login__stage">
            <LoginCard />
          </div>
        </section>
      ))}
    </div>
  );
}
