"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
    <div className="sh-ui-ex-login">
      <div className="sh-ui-ex-login__aurora" aria-hidden="true" />
      <Card className="sh-ui-ex-login__card">
        <CardHeader>
          <CardTitle>어서오세요</CardTitle>
          <CardDescription>계정으로 로그인하거나 새로 시작하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="sh-ui-ex-login__tabs">
              <TabsIndicator />
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form
                className="sh-ui-ex-login__form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="login-email">이메일</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="login-pw">비밀번호</Label>
                  <Input
                    id="login-pw"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <Button type="submit" className="sh-ui-ex-login__submit">
                  로그인
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form
                className="sh-ui-ex-login__form"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-name">이름</Label>
                  <Input id="signup-name" placeholder="홍길동" />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-email">이메일</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="sh-ui-ex-login__field">
                  <Label htmlFor="signup-pw">비밀번호</Label>
                  <Input
                    id="signup-pw"
                    type="password"
                    placeholder="8자 이상"
                  />
                </div>
                <Button type="submit" className="sh-ui-ex-login__submit">
                  계정 만들기
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <Separator className="sh-ui-ex-login__sep" />
          <p className="sh-ui-ex-login__hint">
            계속하면 서비스 이용약관에 동의하는 것으로 간주됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
