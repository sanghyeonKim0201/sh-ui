# @sh-ui/tokens

sh-ui 디자인 시스템의 **원시(primitive)** 및 **의미(semantic)** 토큰 정의.

## 파일

- `src/primitives.json` — 실제 값. 플랫폼/테마 무관. (colors, spacing, radius, typography)
- `src/semantic.json` — primitive 참조 + `light`/`dark` 분기. `{base}`, `{radius}` 등 자리표시자는 CLI가 `sh-ui.config.json`으로 치환한다.

## 계층 규칙

1. primitive는 오직 값만 담는다. 참조/조건 없음.
2. semantic은 오직 primitive만 참조한다.
3. 컴포넌트는 오직 semantic만 참조한다. primitive 직접 참조 금지.

## 치환 예시

`sh-ui.config.json`:
```json
{ "theme": { "base": "neutral", "radius": "md" } }
```

`semantic.json` 내 `{color.{base}.950}` → `{color.neutral.950}` → `#0A0A0A`로 변환되어 최종 파일(tokens.css 등)에 써진다.
