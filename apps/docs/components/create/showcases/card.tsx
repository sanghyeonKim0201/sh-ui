import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ maxWidth: 480 }}>
    <Card>
      <CardHeader>
        <CardTitle>알림 설정</CardTitle>
        <CardDescription>이메일과 푸시 알림을 받을지 선택하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>현재 모든 알림이 꺼져 있습니다. 언제든 다시 켤 수 있습니다.</p>
      </CardContent>
      <CardFooter>
        <Button variant="secondary">나중에</Button>
        <Button>설정하기</Button>
      </CardFooter>
    </Card>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "card",
  label: "Card",
  category: "display",
  Demo,
};

export default showcase;
