"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import "./example.css";

export function Example() {
  return (
    <div className="sh-ui-ex-settings">
      <aside className="sh-ui-ex-settings__side">
        <div className="sh-ui-ex-settings__brand">⚙️ 설정</div>
        <nav className="sh-ui-ex-settings__nav" aria-label="설정 섹션">
          <a href="#account" className="sh-ui-ex-settings__nav-item" data-active>
            계정
          </a>
          <a href="#team" className="sh-ui-ex-settings__nav-item">
            팀
          </a>
          <a href="#billing" className="sh-ui-ex-settings__nav-item">
            결제
          </a>
          <a href="#integrations" className="sh-ui-ex-settings__nav-item">
            통합
          </a>
          <a href="#api" className="sh-ui-ex-settings__nav-item">
            API 키
          </a>
        </nav>
      </aside>

      <main className="sh-ui-ex-settings__main">
        <header>
          <h1 className="sh-ui-ex-settings__title">계정 설정</h1>
          <p className="sh-ui-ex-settings__subtitle">
            프로필·보안·알림을 관리하세요.
          </p>
        </header>

        <Tabs defaultValue="profile" className="sh-ui-ex-settings__tabs">
          <TabsList>
            <TabsIndicator />
            <TabsTrigger value="profile">프로필</TabsTrigger>
            <TabsTrigger value="security">보안</TabsTrigger>
            <TabsTrigger value="notifications">알림</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="sh-ui-ex-settings__panel">
            <section className="sh-ui-ex-settings__section">
              <div className="sh-ui-ex-settings__avatar-row">
                <Avatar>
                  <AvatarImage src="" alt="" />
                  <AvatarFallback>민</AvatarFallback>
                </Avatar>
                <div>
                  <h2>프로필 사진</h2>
                  <p>PNG 또는 JPG · 최대 2MB</p>
                </div>
                <Button variant="secondary">업로드</Button>
              </div>
              <Separator />
              <div className="sh-ui-ex-settings__grid">
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-name">이름</Label>
                  <Input id="s-name" defaultValue="김민재" />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-email">이메일</Label>
                  <Input
                    id="s-email"
                    type="email"
                    defaultValue="minjae@example.com"
                  />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-lang">언어</Label>
                  <Select defaultValue="ko">
                    <SelectTrigger id="s-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-tz">시간대</Label>
                  <Select defaultValue="seoul">
                    <SelectTrigger id="s-tz">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="seoul">Asia/Seoul (UTC+9)</SelectItem>
                      <SelectItem value="tokyo">Asia/Tokyo (UTC+9)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="sh-ui-ex-settings__actions">
                <Button variant="secondary">취소</Button>
                <Button>저장하기</Button>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="security" className="sh-ui-ex-settings__panel">
            <section className="sh-ui-ex-settings__section">
              <h2>비밀번호 변경</h2>
              <div className="sh-ui-ex-settings__grid">
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-pw-current">현재 비밀번호</Label>
                  <Input id="s-pw-current" type="password" />
                </div>
                <div className="sh-ui-ex-settings__field">
                  <Label htmlFor="s-pw-new">새 비밀번호</Label>
                  <Input id="s-pw-new" type="password" />
                </div>
              </div>
              <Separator />
              <h2>2단계 인증</h2>
              <div className="sh-ui-ex-settings__switch-row">
                <div>
                  <p className="sh-ui-ex-settings__switch-title">TOTP 앱 사용</p>
                  <p className="sh-ui-ex-settings__switch-desc">
                    Authy, 1Password 등에서 6자리 코드를 입력합니다.
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </section>
          </TabsContent>

          <TabsContent
            value="notifications"
            className="sh-ui-ex-settings__panel"
          >
            <section className="sh-ui-ex-settings__section">
              <h2>이메일 알림</h2>
              {[
                { title: "주간 요약", desc: "매주 월요일 오전 지표 요약 전송" },
                { title: "제품 업데이트", desc: "새 기능·릴리즈 공지" },
                { title: "보안 경고", desc: "의심스러운 로그인 시도 감지" },
              ].map((n, i) => (
                <div key={i} className="sh-ui-ex-settings__switch-row">
                  <div>
                    <p className="sh-ui-ex-settings__switch-title">{n.title}</p>
                    <p className="sh-ui-ex-settings__switch-desc">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={i !== 1} />
                </div>
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
