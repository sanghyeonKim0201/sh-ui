"use client";

import { ComponentSandbox } from "@/components/sandbox-code/component-sandbox";
import type { ExtraComponentSource } from "@/components/sandbox-code/component-sandbox";

const APP_TSX = `import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogCloseX,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

export default function App() {
  return (
    <Dialog>
      <DialogTrigger render={<Button />}>프로젝트 삭제</DialogTrigger>
      <DialogContent>
        <DialogCloseX />
        <DialogTitle>프로젝트를 삭제하시겠습니까?</DialogTitle>
        <DialogDescription>
          이 작업은 되돌릴 수 없습니다. 모든 데이터가 영구 삭제됩니다.
        </DialogDescription>
        <DialogFooter>
          <DialogClose render={<Button variant="secondary" />}>취소</DialogClose>
          <DialogClose render={<Button variant="danger" />}>삭제</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
`;

export function DialogLiveDemo(props: {
  source: string;
  styles: string;
  tokens: string;
  extraComponents: ExtraComponentSource[];
}) {
  return (
    <ComponentSandbox
      componentName="dialog"
      source={props.source}
      styles={props.styles}
      tokens={props.tokens}
      extraComponents={props.extraComponents}
      demoCode={APP_TSX}
      editorHeight={560}
    />
  );
}
