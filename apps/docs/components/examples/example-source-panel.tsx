"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogCloseX,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import type { ExampleSource } from "./example-topbar";

export interface ExampleSourcePanelProps {
  sources: ExampleSource[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExampleSourcePanel({
  sources,
  open,
  onOpenChange,
}: ExampleSourcePanelProps) {
  const firstPath = sources[0]?.path ?? "";
  const [active, setActive] = useState<string>(firstPath);

  if (sources.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => onOpenChange(o)}>
      <DialogContent className="sh-ui-source-panel">
        <div className="sh-ui-source-panel__header">
          <DialogTitle className="sh-ui-source-panel__title">
            소스 코드
          </DialogTitle>
          <DialogCloseX />
        </div>
        {sources.length === 1 ? (
          <div className="sh-ui-source-panel__body">{sources[0]!.node}</div>
        ) : (
          <Tabs
            value={active}
            onValueChange={(v) => setActive(String(v))}
            className="sh-ui-source-panel__body"
          >
            <TabsList>
              <TabsIndicator />
              {sources.map((s) => (
                <TabsTrigger key={s.path} value={s.path}>
                  {s.path.split("/").slice(-1)[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {sources.map((s) => (
              <TabsContent key={s.path} value={s.path}>
                {s.node}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
