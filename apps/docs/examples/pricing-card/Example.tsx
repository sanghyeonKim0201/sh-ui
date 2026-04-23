import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import "./example.css";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  featured?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₩0",
    period: "/ 월",
    description: "개인 프로젝트와 아이디어 검증",
    features: ["컴포넌트 전체", "커뮤니티 지원", "1개 프로젝트"],
    cta: "무료로 시작",
  },
  {
    name: "Pro",
    price: "₩19,000",
    period: "/ 월",
    description: "실무 팀과 제품 개발",
    features: [
      "Starter의 모든 기능",
      "무제한 프로젝트",
      "이메일 지원",
      "프리미엄 테마",
    ],
    cta: "Pro 시작하기",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "맞춤",
    period: "",
    description: "대규모 조직과 감사 요건",
    features: ["Pro의 모든 기능", "SSO·감사 로그", "전용 지원", "SLA"],
    cta: "문의하기",
  },
];

export function Example() {
  return (
    <div className="sh-ui-ex-pricing">
      <header className="sh-ui-ex-pricing__header">
        <h2 className="sh-ui-ex-pricing__title">필요에 딱 맞는 요금제</h2>
        <p className="sh-ui-ex-pricing__subtitle">
          언제든지 업그레이드하거나 다운그레이드할 수 있어요.
        </p>
      </header>
      <div className="sh-ui-ex-pricing__grid">
        {plans.map((p) => (
          <Card
            key={p.name}
            className={`sh-ui-ex-pricing__card ${p.featured ? "sh-ui-ex-pricing__card--featured" : ""}`}
          >
            {p.featured ? (
              <div className="sh-ui-ex-pricing__ribbon" aria-hidden="true" />
            ) : null}
            <CardHeader>
              <div className="sh-ui-ex-pricing__plan-row">
                <CardTitle>{p.name}</CardTitle>
                {p.featured ? <Badge>추천</Badge> : null}
              </div>
              <CardDescription>{p.description}</CardDescription>
              <div className="sh-ui-ex-pricing__price">
                <span className="sh-ui-ex-pricing__amount">{p.price}</span>
                <span className="sh-ui-ex-pricing__period">{p.period}</span>
              </div>
            </CardHeader>
            <Separator />
            <CardContent>
              <ul className="sh-ui-ex-pricing__features">
                {p.features.map((f) => (
                  <li key={f}>
                    <span
                      aria-hidden="true"
                      className="sh-ui-ex-pricing__check"
                    >
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="sh-ui-ex-pricing__cta"
                variant={p.featured ? "primary" : "secondary"}
              >
                {p.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
