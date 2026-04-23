"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "./example.css";

const STEPS = [
  { key: "welcome", label: "환영", emoji: "👋", bg: "sunset" },
  { key: "profile", label: "프로필", emoji: "🙂", bg: "meadow" },
  { key: "interests", label: "관심사", emoji: "✨", bg: "galaxy" },
  { key: "done", label: "완료", emoji: "🎉", bg: "confetti" },
] as const;

const INTERESTS = [
  "디자인 시스템",
  "프런트엔드",
  "백엔드",
  "DevOps",
  "데이터",
  "AI/ML",
  "모바일",
  "보안",
];

export function Example() {
  const [idx, setIdx] = useState(0);
  const step = STEPS[idx]!;

  return (
    <div className={`sh-ui-ex-onboard sh-ui-ex-onboard--${step.bg}`}>
      <div className="sh-ui-ex-onboard__wrap">
        <div className="sh-ui-ex-onboard__emoji" aria-hidden="true">
          {step.emoji}
        </div>
        {step.key === "welcome" ? <WelcomeStep /> : null}
        {step.key === "profile" ? <ProfileStep /> : null}
        {step.key === "interests" ? <InterestsStep /> : null}
        {step.key === "done" ? <DoneStep /> : null}

        <div className="sh-ui-ex-onboard__nav">
          <Button
            variant="secondary"
            onClick={() => setIdx((i) => Math.max(0, i - 1))}
            disabled={idx === 0}
          >
            이전
          </Button>
          <div className="sh-ui-ex-onboard__dots" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.key}
                className="sh-ui-ex-onboard__dot"
                data-active={i === idx ? "" : undefined}
              />
            ))}
          </div>
          <Button
            onClick={() => setIdx((i) => Math.min(STEPS.length - 1, i + 1))}
            disabled={idx === STEPS.length - 1}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}

function WelcomeStep() {
  return (
    <>
      <h1>환영합니다!</h1>
      <p>sh-ui에 오신 것을 환영해요. 3분만 투자하면 나에게 딱 맞는 경험을 준비해드릴게요.</p>
    </>
  );
}

function ProfileStep() {
  return (
    <>
      <h1>나에 대해 알려주세요</h1>
      <div className="sh-ui-ex-onboard__form">
        <div className="sh-ui-ex-onboard__field">
          <Label htmlFor="o-name">이름</Label>
          <Input id="o-name" placeholder="홍길동" />
        </div>
        <div className="sh-ui-ex-onboard__field">
          <Label htmlFor="o-role">역할</Label>
          <Input id="o-role" placeholder="예) 프런트엔드 개발자" />
        </div>
      </div>
    </>
  );
}

function InterestsStep() {
  return (
    <>
      <h1>어떤 주제에 관심이 있나요?</h1>
      <p>관심 영역에 맞춰 예제와 템플릿을 추천해드려요.</p>
      <div className="sh-ui-ex-onboard__interests">
        {INTERESTS.map((i, idx) => {
          const id = `o-interest-${idx}`;
          return (
            <div key={i} className="sh-ui-ex-onboard__chip">
              <Checkbox id={id} />
              <Label htmlFor={id}>{i}</Label>
            </div>
          );
        })}
      </div>
    </>
  );
}

function DoneStep() {
  return (
    <>
      <h1>준비 완료!</h1>
      <p>시작할 준비가 끝났어요. 대시보드에서 다음 단계를 이어가세요.</p>
    </>
  );
}
