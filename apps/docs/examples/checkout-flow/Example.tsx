"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import "./example.css";

type StepKey = "shipping" | "payment" | "review";
const STEPS: { key: StepKey; label: string }[] = [
  { key: "shipping", label: "배송지" },
  { key: "payment", label: "결제" },
  { key: "review", label: "확인" },
];

export function Example() {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx]!.key;
  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  const go = (delta: number) =>
    setStepIdx((i) => Math.min(STEPS.length - 1, Math.max(0, i + delta)));

  return (
    <div className="sh-ui-ex-checkout">
      <div className="sh-ui-ex-checkout__wrap">
        <ol className="sh-ui-ex-checkout__steps">
          {STEPS.map((s, i) => {
            const state =
              i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
            return (
              <li
                key={s.key}
                className="sh-ui-ex-checkout__step"
                data-state={state}
              >
                <span
                  className="sh-ui-ex-checkout__step-dot"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <span className="sh-ui-ex-checkout__step-label">{s.label}</span>
              </li>
            );
          })}
        </ol>
        <div
          className="sh-ui-ex-checkout__bar"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="sh-ui-ex-checkout__bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="sh-ui-ex-checkout__panel">
          {step === "shipping" ? <ShippingStep /> : null}
          {step === "payment" ? <PaymentStep /> : null}
          {step === "review" ? <ReviewStep /> : null}
        </div>

        <div className="sh-ui-ex-checkout__actions">
          <Button
            variant="secondary"
            onClick={() => go(-1)}
            disabled={stepIdx === 0}
          >
            이전
          </Button>
          {stepIdx < STEPS.length - 1 ? (
            <Button onClick={() => go(+1)}>다음</Button>
          ) : (
            <Button onClick={() => setStepIdx(0)}>주문 완료</Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ShippingStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>어디로 보내드릴까요?</h2>
      <div className="sh-ui-ex-checkout__grid">
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-name">받는 사람</Label>
          <Input id="c-name" placeholder="홍길동" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-phone">연락처</Label>
          <Input id="c-phone" placeholder="010-0000-0000" />
        </div>
        <div className="sh-ui-ex-checkout__field sh-ui-ex-checkout__field--wide">
          <Label htmlFor="c-addr">주소</Label>
          <Input id="c-addr" placeholder="도로명 주소" />
        </div>
      </div>
    </section>
  );
}

function PaymentStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>결제 방법</h2>
      <RadioGroup defaultValue="card">
        <div className="sh-ui-ex-checkout__radio">
          <Radio value="card" id="c-pay-card" />
          <Label htmlFor="c-pay-card">신용/체크 카드</Label>
        </div>
        <div className="sh-ui-ex-checkout__radio">
          <Radio value="bank" id="c-pay-bank" />
          <Label htmlFor="c-pay-bank">계좌 이체</Label>
        </div>
        <div className="sh-ui-ex-checkout__radio">
          <Radio value="pay" id="c-pay-easy" />
          <Label htmlFor="c-pay-easy">간편결제</Label>
        </div>
      </RadioGroup>
      <Separator />
      <div className="sh-ui-ex-checkout__grid">
        <div className="sh-ui-ex-checkout__field sh-ui-ex-checkout__field--wide">
          <Label htmlFor="c-card">카드번호</Label>
          <Input
            id="c-card"
            inputMode="numeric"
            placeholder="0000 0000 0000 0000"
          />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-exp">유효기간</Label>
          <Input id="c-exp" placeholder="MM/YY" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-cvc">CVC</Label>
          <Input id="c-cvc" inputMode="numeric" placeholder="123" />
        </div>
        <div className="sh-ui-ex-checkout__field">
          <Label htmlFor="c-inst">할부</Label>
          <Select defaultValue="0">
            <SelectTrigger id="c-inst">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">일시불</SelectItem>
              <SelectItem value="3">3개월</SelectItem>
              <SelectItem value="6">6개월</SelectItem>
              <SelectItem value="12">12개월</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

function ReviewStep() {
  return (
    <section className="sh-ui-ex-checkout__form">
      <h2>주문 확인</h2>
      <dl className="sh-ui-ex-checkout__summary">
        <div>
          <dt>상품</dt>
          <dd>sh-ui Pro 1년 구독</dd>
        </div>
        <div>
          <dt>배송지</dt>
          <dd>서울시 강남구 테헤란로 1 · 홍길동</dd>
        </div>
        <div>
          <dt>결제</dt>
          <dd>신용카드 일시불</dd>
        </div>
        <div className="sh-ui-ex-checkout__total">
          <dt>총 결제 금액</dt>
          <dd>₩228,000</dd>
        </div>
      </dl>
    </section>
  );
}
