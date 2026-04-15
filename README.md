# Hyeon Design System

**Hyeon (玄)** — 검고 그윽하다.

블랙 & 화이트를 기본으로, 당신의 설정대로 벼려져 내려받는 멀티 플랫폼 디자인 시스템.

## 철학

- **코드 소유권은 사용자에게** — shadcn처럼 컴포넌트 소스를 프로젝트로 복사하는 방식
- **하나의 토큰, 여러 플랫폼** — React(Next.js), Flutter, 그 이상
- **설정 파일 기반 변환** — `hyeon.config.json`에 정의한 테마/radius/스타일로 복사 시점에 변환

## 구조

```
hyeon-design-system/
├── packages/
│   ├── tokens/       # 디자인 토큰 (primitive / semantic)
│   ├── registry/     # 플랫폼별 컴포넌트 소스 (복사 대상)
│   └── cli/          # `hyeon` CLI
└── apps/
    └── docs/         # 문서 사이트
```

## 토큰 계층

1. **Primitive** — 실제 값 (`color.neutral.500`, `spacing.4`)
2. **Semantic** — primitive 참조 (`background.default`, `text.primary`)
3. **Component** — (선택) semantic 참조 (`button.primary.background`)

컴포넌트는 오직 **semantic** 계층만 참조한다.
