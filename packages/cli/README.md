# sh-ui-cli

sh-ui 디자인 시스템의 컴포넌트를 프로젝트로 복사하는 CLI. shadcn 방식 — 프로젝트가 소스를 소유한다.

## 설치

```bash
# 프로젝트 dev 의존성으로
npm i -D sh-ui-cli

# 또는 ad-hoc 실행
npx sh-ui-cli <command>
```

## 사용법

### init — 설정 파일 생성

```bash
npx sh-ui init
# 대화형 프롬프트:
#   platform: react | flutter
#   base:     neutral | zinc | slate
#   radius:   none | sm | md | lg | xl | full
#   mode:     light-dark | light | dark
```

비대화형 예:

```bash
npx sh-ui init --platform react --base neutral --radius md --mode light-dark --yes
```

### add — 컴포넌트 추가

```bash
npx sh-ui add button
npx sh-ui add card input
npx sh-ui add button --diff   # 파일 변경 미리보기(실제 쓰지 않음)
```

### list — 설치된 컴포넌트 목록

```bash
npx sh-ui list
```

### remove — 컴포넌트 제거

```bash
npx sh-ui remove button
```

### mcp — AI 에게 sh-ui 를 알려주기 (v0.21.0+)

`sh-ui mcp` 는 [Model Context Protocol](https://modelcontextprotocol.io) 서버를 stdio 로 시작한다. IDE-내 AI(Claude Code, Cursor, Windsurf 등) 가 sh-ui 컴포넌트를 자동으로 검색·설치할 수 있게 7개 툴을 노출한다.

**한 번만 등록하면 끝** — 빈 폴더에서도 _"다크 모던 sh-ui 로 세팅하고 button 추가해줘"_ 만 말하면 AI 가 알아서 처리.

#### 등록 방법

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
  "style": "default",
  "theme": { "base": "neutral", "radius": "md", "mode": "light-dark" },
  "paths": {
    "tokens": "src/shared/styles/tokens.css",
    "components": "src/shared/ui",
    "utils": "src/shared/lib/utils.ts"
  }
}
```

## 더 알아보기

- sh-ui 디자인 시스템: https://github.com/sanghyeonKim0201/sh-ui
- `sh-ui-create` (프로젝트 스캐폴드): https://www.npmjs.com/package/sh-ui-create

## 라이선스

MIT
