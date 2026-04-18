"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogCloseX,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function BasicDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>프로젝트 삭제</DialogTrigger>
      <DialogContent>
        <DialogCloseX />
        <DialogTitle>프로젝트를 삭제하시겠습니까?</DialogTitle>
        <DialogDescription>
          이 작업은 되돌릴 수 없습니다. 프로젝트의 모든 데이터, 설정, 배포 기록이 영구적으로 삭제됩니다.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>취소</DialogClose>
          <DialogClose render={<Button variant="danger" />}>삭제</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FormDialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="secondary" />}>피드백 보내기</DialogTrigger>
      <DialogContent>
        <DialogCloseX />
        <DialogTitle>피드백</DialogTitle>
        <DialogDescription>
          개선 사항이나 버그를 알려주세요. 빠르게 반영하겠습니다.
        </DialogDescription>
        <textarea
          placeholder="의견을 입력하세요..."
          rows={4}
          style={{
            width: "100%",
            padding: "0.5rem 0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            fontSize: "0.875rem",
            fontFamily: "inherit",
            resize: "vertical",
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        />
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>취소</DialogClose>
          <Button>보내기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
