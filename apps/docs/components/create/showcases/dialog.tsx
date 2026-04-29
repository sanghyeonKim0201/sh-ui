import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import type { ShowcaseDemoProps, ShowcaseManifest } from "./types";

const Demo = ({ containerRef }: ShowcaseDemoProps) => (
  <Dialog>
    <DialogTrigger render={<Button>Dialog 열기</Button>} />
    <DialogContent container={containerRef}>
      <DialogTitle>확인</DialogTitle>
      <DialogDescription>
        이 작업은 취소할 수 없습니다. 계속 진행하시겠어요?
      </DialogDescription>
      <DialogFooter>
        <DialogClose render={<Button variant="secondary">취소</Button>} />
        <DialogClose render={<Button variant="danger">삭제</Button>} />
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const showcase: ShowcaseManifest = {
  id: "dialog",
  label: "Dialog",
  category: "overlay",
  Demo,
};

export default showcase;
