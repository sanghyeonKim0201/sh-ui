# Command Phase 2 — docs search-dialog dogfooding 설계

- 작성일: 2026-06-19
- 대상 레포: sh-ui (apps/docs 전용)
- 상태: 설계 승인 대기

## 배경

v0.119.0 에서 `command`(cmdk 위 sh-ui) 컴포넌트를 배포했다. Phase 2 는 이 컴포넌트를 **docs 가 직접 사용(dogfooding)** 하는 것 — 기존 `apps/docs/components/search-dialog.tsx`(자체 Dialog+Input+listbox+키보드 네비)를 `CommandDialog` 기반으로 교체한다.

## 핵심 결정: MiniSearch 검색 유지 + cmdk 는 UI 만

기존 search-dialog 의 **MiniSearch full-text 검색**(필드 title/headings/body, boost title:4 headings:2, prefix, fuzzy 0.2, AND)이 검색 품질의 핵심이다. cmdk 의 기본 필터(value/keywords substring)로 대체하면 품질이 하락한다.

따라서 **MiniSearch 는 그대로 검색 엔진으로 두고**, `Command` 에 `shouldFilter={false}` 를 주어 cmdk 의 자체 필터를 끈다. cmdk 는 키보드 네비·active 하이라이트·스크롤·접근성(role/aria)만 담당한다. (shadcn docs 검색도 외부 검색 + cmdk `shouldFilter={false}` 패턴.)

## 목표

- `search-dialog.tsx` 를 `@/components/ui/command` 기반으로 재작성
- 자체 키보드 네비/`active` state/`scrollIntoView`/자체 listbox 마크업 **제거**(cmdk 가 대체) → 코드 단순화
- 검색 품질·기능 패리티 유지

## 비목표

- MiniSearch 교체·검색 인덱스 변경 — 그대로 유지.
- 배포 컴포넌트 변경 — `command` registry 컴포넌트는 손대지 않음(이미 v0.119.0).
- 버전 범프/릴리즈 — docs 전용 변경이라 versions.json·cli/package.json 안 건드림.

## 설계

### 교체 매핑

| 기존(search-dialog) | 변경 후 |
|---|---|
| `Dialog`/`DialogContent`/`DialogTitle` | `CommandDialog`(open/onOpenChange/title) |
| `Input` + `handleKeyDown`(ArrowUp/Down/Enter) + `active` state + `scrollIntoView` | `CommandInput`(value/onValueChange) — 키보드/active/스크롤은 cmdk |
| 자체 `role="listbox"` div + `role="option"` 버튼 | `CommandList` + `CommandGroup` + `CommandItem` |
| `query.trim() && hits.length===0` 빈 메시지 | `CommandEmpty` |
| `<Button>` 트리거 + kbd | 유지(그대로) |

### 데이터 흐름

```tsx
<CommandDialog open={open} onOpenChange={setOpen} title={t("dialogTitle")}>
  <Command shouldFilter={false}>            {/* cmdk 자체 필터 OFF — MiniSearch 가 검색 */}
    <CommandInput value={query} onValueChange={setQuery} placeholder={...} />
    <CommandList>
      <CommandEmpty>{t("empty")}</CommandEmpty>
      {/* 카테고리별 그룹 (등장 순서 보존, 기존 그룹화 로직 재사용) */}
      {groups.map((group) => (
        <CommandGroup key={...} heading={group.label}>
          {group.items.map(({ hit }) => (
            <CommandItem key={hit.id} value={hit.id} onSelect={() => go(hit.url)}>
              {/* highlight(title) + snippet/heading 서브텍스트 */}
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </CommandList>
  </Command>
</CommandDialog>
```

- `CommandDialog` 가 이미 내부에서 `Command` 를 렌더하므로, **`shouldFilter={false}` 를 `CommandDialog` 로 전달**(CommandDialog 는 `...props` 를 `Command` 로 전파 — 확인됨). 즉 실제 코드는 `<CommandDialog open onOpenChange shouldFilter={false}>` 형태로 단순화 가능. (CommandDialog 가 내부 Command 를 쓰므로 별도 `<Command>` 래핑 불필요.)
- `value={hit.id}` — cmdk 가 onSelect 식별·키보드 active 에 쓰는 키. 고유 id 사용. 검색은 MiniSearch 가 하므로 value 매칭은 무관(shouldFilter=false).
- `onSelect` → 기존 `go(url)`(setOpen(false) + router.push).

### 유지 항목 (그대로 이전)

- MiniSearch 인덱스 lazy load(`ensureIndex`, fetch `/search-index.json`), 검색 옵션.
- Cmd+K / `/` 단축키 effect.
- 카테고리 그룹화 로직(`categoryLabel`, 등장 순서 보존 groups 빌드).
- `buildSnippet`, `highlight`(mark), matchedHeading 서브텍스트.
- i18n(`useTranslations("search")`), `useRouter`.
- 트리거 `<Button>` + kbd 표시.

### 제거 항목 (cmdk 가 대체)

- `active` state, `handleKeyDown`, ArrowUp/Down/Enter 수동 처리.
- `scrollIntoView` effect(active 항목 스크롤) — cmdk 가 처리.
- `aria-activedescendant`/`aria-controls` 수동 배선 — cmdk 가 role/aria 제공.
- 자체 `role="listbox"`/`role="option"` 마크업.

### CSS

- `search-dialog.css` 의 listbox/item 스타일은 Command 컴포넌트 스타일(`sh-ui-command__*`)로 대체되는 부분 제거/정리. 트리거(`sh-ui-search-trigger__*`)·footer 힌트 스타일은 유지. 검색 특화(highlight `mark`, snippet 서브텍스트, 그룹 라벨)는 CommandItem 내부 커스텀 클래스로 유지.

## 검증

- `apps/docs` 빌드 성공(`pnpm build`) — search-dialog 가 모든 페이지 헤더에서 렌더되므로 빌드가 통합 검증.
- `pnpm tsc --noEmit` 에러 0.
- 수동 확인(필요 시 preview): Cmd+K/`/` 로 열림, 입력 시 MiniSearch 결과 표시, ↑↓ 네비·Enter 라우팅, 카테고리 그룹·highlight·snippet 표시, Esc 닫힘.
- 단위 테스트는 생략 — search-dialog 는 MiniSearch + next router + i18n 통합이라 빌드/수동이 적절한 게이트(기존에도 전용 테스트 없음).

## 릴리즈

- **없음.** docs 전용 변경 — versions.json·cli/package.json·react summary 모두 무관. dev → live 는 일반 docs PR(태그·npm publish 없음).

## 백로그 (후속, 별도)

- Command Phase 3 — 액션 자동 등록(컴포넌트·페이지·CLI 명령을 팔레트 액션으로), 검색 인덱스 자동화.
- Flutter command palette.
