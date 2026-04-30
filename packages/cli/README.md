# sh-ui-cli

sh-ui 디자인 시스템의 통합 CLI. **프로젝트 스캐폴드**(create) + **컴포넌트 추가**(add/list/remove) + **IDE-내 AI용 MCP 서버**.

## 설치

```bash
# 프로젝트 dev 의존성으로
npm i -D sh-ui-cli

# 또는 ad-hoc 실행
npx sh-ui-cli <command>
```

## 사용법

### create — 프로젝트 스캐폴드

```bash
# 대화형
npx sh-ui-cli create

# 비대화형 (에이전트 / CI)
npx sh-ui-cli create my-app --platform next --structure standalone --yes
npx sh-ui-cli create my-app --platform next --structure monorepo --plugins sentry,next-intl,auth-jwt --yes
npx sh-ui-cli create my-app --platform flutter --yes
```

전체 옵션은 `npx sh-ui-cli create --help`. TTY 없는 환경에서는 누락된 필수 플래그가 있으면 prompt 대신 즉시 에러로 종료한다.

### init — 설정 파일 생성

```bash
npx sh-ui-cli init
# 대화형 프롬프트:
#   platform: react | flutter
#   base:     neutral | zinc | slate
#   radius:   none | sm | md | lg | xl | full
#   mode:     light-dark | light | dark
```

비대화형 예:

```bash
npx sh-ui-cli init --platform react --base neutral --radius md --mode light-dark --yes
```

### add — 컴포넌트 추가

```bash
npx sh-ui-cli add button
npx sh-ui-cli add card input
npx sh-ui-cli add button --diff   # 파일 변경 미리보기(실제 쓰지 않음)
```

### list — 설치된 컴포넌트 목록

```bash
npx sh-ui-cli list
```

### remove — 컴포넌트 제거

```bash
npx sh-ui-cli remove button
```

### mcp — AI 에게 sh-ui 를 알려주기 (v0.21.0+)

`sh-ui mcp` 는 [Model Context Protocol](https://modelcontextprotocol.io) 서버를 stdio 로 시작한다. IDE-내 AI(Claude Code, Cursor, Windsurf 등) 가 sh-ui 컴포넌트를 자동으로 검색·설치할 수 있게 7개 툴을 노출한다.

**한 번만 등록하면 끝** — 빈 폴더에서도 _"다크 모던 sh-ui 로 세팅하고 button 추가해줘"_ 만 말하면 AI 가 알아서 처리.

#### 자동 등록 (권장, v0.22.0+)

빈 폴더에서도 바로 — `sh-ui-cli` 설치 불필요, `-y` 플래그로 자동 확인:

```bash
npx -y sh-ui-cli mcp init --client claude-code      # → .mcp.json
npx -y sh-ui-cli mcp init --client cursor           # → .cursor/mcp.json
npx -y sh-ui-cli mcp init --client claude-desktop   # → 사용자 전역 (재시작 필요)

# 사용자 전역 설정에 등록하려면
npx -y sh-ui-cli mcp init --client claude-code --scope user
```

> 참고: 위 다른 명령들의 `npx sh-ui-cli ...` 표기는 `sh-ui-cli` 가 dev 의존성으로 설치된 상태를 가정한다. 빈 폴더에서 한 번에 쓰려면 동일하게 `npx -y sh-ui-cli ...` 로 호출.

기존 설정 파일이 있으면 다른 MCP 서버 엔트리를 보존하며 `sh-ui` 만 머지·갱신.

#### 수동 등록

**Claude Code** — `~/.claude/mcp.json` 또는 프로젝트 `.mcp.json`:

```json
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}
```

**Cursor** — `~/.cursor/mcp.json` 또는 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}
```

**Claude Desktop** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "sh-ui": {
      "command": "npx",
      "args": ["-y", "sh-ui-cli", "mcp"]
    }
  }
}
```

#### 노출되는 툴

| 툴 | 설명 |
|---|---|
| `sh_ui_describe_init` | platform/base/radius/mode 선택지 + 한글 설명 — 자연어 의도("다크 모던") → enum 매핑용 |
| `sh_ui_init` | `sh-ui.config.json` 생성 (비대화형) |
| `sh_ui_list_components` | 플랫폼별 전체 컴포넌트 + 요약 + deps |
| `sh_ui_get_component` | 단일 컴포넌트 메타·소스파일·deps |
| `sh_ui_add_component` | 컴포넌트 설치 (외부 패키지 자동 설치) |
| `sh_ui_remove_component` | 삭제 (수정 파일 보호) |
| `sh_ui_get_changelog` | 변경 내역 조회 |

## 지원 플랫폼

- **React (Next.js)** — `src/shared/ui/` 또는 `sh-ui.config.json` 에 지정된 경로로 복사
- **Flutter** — `lib/sh_ui/widgets/` 또는 지정 경로로 복사

## 설정 파일 (`sh-ui.config.json`)

```json
{
  "platform": "react",
  "cssFramework": "plain",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "src/shared/styles/tokens.css",
    "components": "src/shared/ui",
    "utils": "src/shared/lib/utils.ts"
  }
}
```

`cssFramework` 옵션:

- `"plain"` — CSS custom properties + 일반 .css 파일. 모든 컴포넌트 지원 (기본).
- `"tailwind"` — Tailwind v4 utility class TSX 변종 (`class-variance-authority` 기반). button/card/input 부터 시작해 점진적으로 확대 중. 변종 미제공 컴포넌트는 add 시 plain 으로 자동 fallback — Tailwind v4 의 `@theme inline` 브리지가 sh-ui 토큰을 매핑하므로 plain CSS 도 그대로 동작.

## 더 알아보기

- sh-ui 디자인 시스템: https://github.com/sanghyeonKim0201/sh-ui
- 변경 내역: `npx sh-ui-cli` 의 `sh_ui_get_changelog` MCP 툴 또는 GitHub Releases

## 라이선스

MIT
