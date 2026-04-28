# sh-ui-create (deprecated)

`sh-ui-create` 는 v0.20.0 부터 **deprecated** 입니다. 모든 기능은 `sh-ui-cli` 의 `sh-ui create` 서브커맨드로 통합됐습니다.

## 마이그레이션

```bash
# 기존
npx sh-ui-create my-app --platform next --structure standalone --yes

# 새 명령
npx sh-ui-cli create my-app --platform next --structure standalone --yes

# 또는 단축
npm create sh-ui my-app
```

이 패키지(`sh-ui-create`)를 직접 호출해도 자동으로 `npx sh-ui-cli create` 로 위임되니 기존 스크립트도 깨지지 않습니다.

## 왜 통합됐나

- **드리프트 제거** — MCP 서버(sh-ui-cli)와 스캐폴드 로직이 한 패키지에 살면 단일 진실원천. 한쪽만 바뀌어 다른 쪽이 옛 안내를 하는 일이 없음.
- **MCP `sh_ui_create_project` 툴** — 이제 IDE-내 AI 가 Bash 우회 없이 MCP 만으로 프로젝트 생성 가능 (예정).
- **사용자 멘탈 모델** — `sh-ui create / init / add` 가 모두 같은 명령 트리.

자세한 사용법은 [sh-ui-cli README](https://www.npmjs.com/package/sh-ui-cli) 참고.
