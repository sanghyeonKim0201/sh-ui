export const dynamic = "force-static";

import { CodeTabs } from "@/components/code-tabs";
import { Preview } from "@/components/preview";
import { PropsTable } from "@/components/props-table";
import { SubComponents } from "@/components/sub-components";
import { DropdownMenuBasicDemo } from "./_demos/basic";
import { DropdownMenuCheckRadioDemo } from "./_demos/check";
import { DropdownMenuSubmenuDemo } from "./_demos/submenu";

export default function DropdownMenuPage() {
  return (
    <main className="container">
      <h1>DropdownMenu</h1>
      <p className="muted">
        트리거에서 펼쳐지는 명령 메뉴. 체크박스·라디오·서브메뉴·키보드 내비게이션을 지원한다.{" "}
        <a href="https://base-ui.com/react/components/menu" target="_blank" rel="noreferrer">
          Base UI Menu
        </a>{" "}
        위에 sh-ui 토큰 스타일을 얹음.
      </p>

      <Preview>
        <Preview.Demo>
          <DropdownMenuBasicDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="secondary">메뉴 열기</Button>} />
  <DropdownMenuContent align="start">
    <DropdownMenuGroup>
      <DropdownMenuLabel>내 계정</DropdownMenuLabel>
      <DropdownMenuItem>프로필</DropdownMenuItem>
      <DropdownMenuItem>설정</DropdownMenuItem>
      <DropdownMenuItem>청구 내역</DropdownMenuItem>
    </DropdownMenuGroup>
    <DropdownMenuSeparator />
    <DropdownMenuItem disabled>팀 (준비 중)</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>로그아웃</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
            },
            {
              value: "flutter",
              label: "Flutter",
              language: "dart",
              code: `ShUiDropdownMenu<String>(
  onSelected: (v) => print(v),
  items: const [
    ShUiDropdownMenuLabel('내 계정'),
    ShUiDropdownMenuItem(value: 'profile', label: '프로필'),
    ShUiDropdownMenuItem(value: 'settings', label: '설정'),
    ShUiDropdownMenuItem(value: 'billing', label: '청구 내역'),
    ShUiDropdownMenuDivider(),
    ShUiDropdownMenuItem(value: 'team', label: '팀 (준비 중)', disabled: true),
    ShUiDropdownMenuDivider(),
    ShUiDropdownMenuItem(value: 'signout', label: '로그아웃'),
  ],
  child: ShUiButton(
    variant: ShUiButtonVariant.secondary,
    onPressed: null,
    child: const Text('메뉴 열기'),
  ),
)`,
            },
          ]}
        />
      </Preview>

      <h2>Installation</h2>

      <h3>CLI</h3>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `npx sh-ui add dropdown-menu`,
          },
        ]}
      />

      <h3>Manual</h3>
      <p className="muted">
        registry에서 아래 파일을 <code>components/ui/dropdown-menu/</code>로 복사하고 Base UI를 설치한다.
      </p>
      <CodeTabs
        items={[
          {
            value: "react",
            label: "React",
            language: "bash",
            showLineNumbers: false,
            code: `pnpm add @base-ui-components/react`,
          },
        ]}
      />

      <h2>Examples</h2>

      <h3>체크박스 · 라디오 항목</h3>
      <Preview>
        <Preview.Demo>
          <DropdownMenuCheckRadioDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `const [notifications, setNotifications] = useState(true);
const [layout, setLayout] = useState("comfortable");

<DropdownMenu>
  <DropdownMenuTrigger render={<Button>환경설정</Button>} />
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem
      checked={notifications}
      onCheckedChange={setNotifications}
    >
      알림 받기
    </DropdownMenuCheckboxItem>
    <DropdownMenuSeparator />
    <DropdownMenuRadioGroup value={layout} onValueChange={setLayout}>
      <DropdownMenuRadioItem value="comfortable">넓게</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="compact">좁게</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>`,
            },
          ]}
        />
      </Preview>

      <h3>서브메뉴</h3>
      <Preview>
        <Preview.Demo>
          <DropdownMenuSubmenuDemo />
        </Preview.Demo>
        <CodeTabs
          items={[
            {
              value: "react",
              label: "React",
              language: "tsx",
              code: `<DropdownMenu>
  <DropdownMenuTrigger render={<Button>파일</Button>} />
  <DropdownMenuContent>
    <DropdownMenuItem>새로 만들기</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>공유</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem>이메일</DropdownMenuItem>
        <DropdownMenuItem>링크 복사</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>`,
            },
          ]}
        />
      </Preview>

      <h2>구성 요소</h2>
      <SubComponents
        rows={[
          { name: "DropdownMenu", description: "루트. open/onOpenChange 등 Base UI Menu.Root props 그대로." },
          { name: "DropdownMenuTrigger", description: "메뉴를 여는 트리거. render prop으로 Button 등과 결합." },
          { name: "DropdownMenuContent", description: "Portal + Positioner + Popup 래퍼. side/align/sideOffset props." },
          { name: "DropdownMenuItem", description: "기본 명령 항목. onClick·disabled 지원." },
          { name: "DropdownMenuCheckboxItem", description: "체크박스 항목. checked/onCheckedChange 지원." },
          { name: "DropdownMenuRadioGroup", description: "라디오 항목 그룹. value/onValueChange." },
          { name: "DropdownMenuRadioItem", description: "라디오 항목. value 필수." },
          { name: "DropdownMenuGroup", description: "그룹 래퍼. Label과 함께 써서 섹션 구분." },
          { name: "DropdownMenuLabel", description: "그룹 라벨(제목) 텍스트." },
          { name: "DropdownMenuSeparator", description: "구분선. role=\"separator\"." },
          { name: "DropdownMenuSub", description: "서브메뉴 루트." },
          { name: "DropdownMenuSubTrigger", description: "서브메뉴를 여는 항목. 자동으로 우측 ▶ 표시." },
          { name: "DropdownMenuSubContent", description: "서브메뉴 내용. DropdownMenuContent와 동일 API." },
        ]}
      />

      <h2>API Reference</h2>

      <h3>DropdownMenuContent</h3>
      <PropsTable
        rows={[
          { prop: "side", type: `"top" | "right" | "bottom" | "left"`, description: "트리거 기준 메뉴 배치 방향." },
          { prop: "align", type: `"start" | "center" | "end"`, description: "정렬." },
          { prop: "sideOffset", type: "number", default: "6", description: "트리거와의 간격 (px)." },
          { prop: "container", type: "Element | null", description: "Portal 마운트 노드." },
        ]}
      />

      <h3>키보드</h3>
      <ul>
        <li><code>↑</code> / <code>↓</code> — 이전/다음 항목</li>
        <li><code>Enter</code> / <code>Space</code> — 선택</li>
        <li><code>→</code> — 서브메뉴 열기, <code>←</code> — 서브메뉴 닫기</li>
        <li><code>Home</code> / <code>End</code> — 첫/마지막 항목</li>
        <li><code>Esc</code> — 닫기</li>
        <li>문자 타이핑 — 해당 문자로 시작하는 항목으로 이동</li>
      </ul>
    </main>
  );
}
