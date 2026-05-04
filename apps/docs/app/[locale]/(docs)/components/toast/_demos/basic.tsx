"use client";

import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export function BasicDemo() {
  return (
    <Button onClick={() => toast("변경사항이 저장되었습니다.")}>
      토스트 보기
    </Button>
  );
}

export function VariantsDemo() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <Button variant="secondary" onClick={() => toast("기본 알림입니다.")}>
        Default
      </Button>
      <Button variant="secondary" onClick={() => toast.success("저장되었습니다.")}>
        Success
      </Button>
      <Button variant="secondary" onClick={() => toast.danger("삭제에 실패했습니다.")}>
        Danger
      </Button>
      <Button variant="secondary" onClick={() => toast.warning("저장 용량이 부족합니다.")}>
        Warning
      </Button>
    </div>
  );
}

export function TitleDescDemo() {
  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          title: "파일 업로드 완료",
          description: "report-2024.pdf가 성공적으로 업로드되었습니다.",
          variant: "success",
        })
      }
    >
      제목 + 설명
    </Button>
  );
}

export function ActionDemo() {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        const id = toast({
          title: "메시지 삭제됨",
          description: "휴지통으로 이동했습니다.",
          duration: 6000,
          action: (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast.dismiss(id)}
            >
              되돌리기
            </Button>
          ),
        });
      }}
    >
      액션 버튼 포함
    </Button>
  );
}
