import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsSheet } from "@/components/SettingsSheet";

export function SettingsButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className={className ?? "h-8 w-8 text-muted-foreground"}
        onClick={() => setOpen(true)}
        title="Settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>
      <SettingsSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
