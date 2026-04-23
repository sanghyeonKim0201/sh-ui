import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import "./example.css";

interface Kpi {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}

const kpis: Kpi[] = [
  { label: "MRR", value: "₩42.8M", delta: "+12.3%", trend: "up" },
  { label: "활성 사용자", value: "28,410", delta: "+4.1%", trend: "up" },
  { label: "이탈률", value: "1.8%", delta: "-0.3%", trend: "down" },
  { label: "NPS", value: "62", delta: "+5", trend: "up" },
];

interface Activity {
  who: string;
  what: string;
  when: string;
  tone: "positive" | "neutral" | "negative";
}

const activities: Activity[] = [
  { who: "김민재", what: "새 구독 Pro 계약 (₩190,000)", when: "2분 전", tone: "positive" },
  { who: "이지은", what: "지원 티켓 #4721 해결", when: "14분 전", tone: "neutral" },
  { who: "박서준", what: "결제 실패 재시도 중", when: "1시간 전", tone: "negative" },
  { who: "최유진", what: "대시보드 템플릿 공유", when: "2시간 전", tone: "neutral" },
];

const team = [
  { name: "Alex", role: "Product", used: 76, cap: 100 },
  { name: "Bo", role: "Engineering", used: 94, cap: 100 },
  { name: "Chae", role: "Design", used: 52, cap: 100 },
];

export function Example() {
  return (
    <div className="sh-ui-ex-dash">
      <header className="sh-ui-ex-dash__header">
        <div>
          <h1 className="sh-ui-ex-dash__title">안녕하세요, 김민재 👋</h1>
          <p className="sh-ui-ex-dash__subtitle">오늘의 핵심 지표와 움직임을 한눈에.</p>
        </div>
        <Badge>플랜: Pro</Badge>
      </header>

      <section className="sh-ui-ex-dash__kpis">
        {kpis.map((k) => (
          <Card key={k.label} className="sh-ui-ex-dash__kpi">
            <CardHeader>
              <CardDescription>{k.label}</CardDescription>
              <CardTitle>{k.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span
                className="sh-ui-ex-dash__delta"
                data-trend={k.trend}
              >
                {k.delta}
              </span>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="sh-ui-ex-dash__split">
        <Card className="sh-ui-ex-dash__activity">
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>팀 전체의 최신 이벤트</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="sh-ui-ex-dash__feed">
              {activities.map((a, i) => (
                <li key={i} className="sh-ui-ex-dash__feed-item">
                  <Avatar>
                    <AvatarImage src="" alt="" />
                    <AvatarFallback>{a.who.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="sh-ui-ex-dash__feed-main">
                    <p className="sh-ui-ex-dash__feed-text">
                      <strong>{a.who}</strong> {a.what}
                    </p>
                    <span className="sh-ui-ex-dash__feed-time">{a.when}</span>
                  </div>
                  <span
                    className="sh-ui-ex-dash__dot"
                    data-tone={a.tone}
                    aria-hidden="true"
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="sh-ui-ex-dash__team">
          <CardHeader>
            <CardTitle>팀 캐패시티</CardTitle>
            <CardDescription>이번 주 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="sh-ui-ex-dash__team-list">
              {team.map((t) => (
                <li key={t.name}>
                  <div className="sh-ui-ex-dash__team-head">
                    <span>
                      <strong>{t.name}</strong>
                      <span className="sh-ui-ex-dash__team-role"> · {t.role}</span>
                    </span>
                    <span className="sh-ui-ex-dash__team-used">{t.used}%</span>
                  </div>
                  <Progress value={t.used} max={t.cap} />
                  <Separator />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
