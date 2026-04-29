import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ShowcaseManifest } from "./types";

const Demo = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
    <Button onClick={() => toast({ title: "저장됨", description: "변경 사항이 반영됐습니다." })}>
      Toast 띄우기
    </Button>
    <Button
      variant="danger"
      onClick={() =>
        toast({ title: "오류", description: "요청이 실패했습니다.", variant: "danger" })
      }
    >
      에러 Toast
    </Button>
  </div>
);

const showcase: ShowcaseManifest = {
  id: "toast",
  label: "Toast",
  category: "overlay",
  Demo,
};

export default showcase;
