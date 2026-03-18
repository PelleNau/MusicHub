import { Settings, Sun, Moon, Waves, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { settings, updateSetting } = useSettings();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-card border-border" style={{ fontSize: '16px', width: '384px', maxWidth: '90vw' }}>
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 font-mono text-foreground">
            <Settings className="h-4 w-4 text-primary" />
            Settings
          </SheetTitle>
          <SheetDescription className="font-mono text-xs text-muted-foreground">
            Customize your workspace
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 mt-2">
          {/* ── Appearance ── */}
          <section className="space-y-3">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Appearance
            </h3>
            <div className="flex gap-2">
              {([
                { value: "dark" as const, icon: Moon, label: "Dark" },
                { value: "light" as const, icon: Sun, label: "Light" },
                { value: "ocean" as const, icon: Waves, label: "Ocean" },
              ]).map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => updateSetting("theme", value)}
                  className={`flex-1 flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 font-mono text-xs transition-colors ${
                    settings.theme === value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </section>

          <Separator className="bg-border/50" />

          {/* ── UI Zoom ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                UI Zoom
              </h3>
              <span className="font-mono text-xs text-foreground tabular-nums">
                {settings.uiZoom}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.uiZoom]}
                onValueChange={([v]) => updateSetting("uiZoom", v)}
                min={75}
                max={150}
                step={5}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
                onClick={() => updateSetting("uiZoom", 100)}
                title="Reset to 100%"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </section>

          <Separator className="bg-border/50" />

          {/* ── Font Size ── */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Font Size
              </h3>
              <span className="font-mono text-xs text-foreground tabular-nums">
                {settings.fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.fontSize]}
                onValueChange={([v]) => updateSetting("fontSize", v)}
                min={12}
                max={20}
                step={1}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground"
                onClick={() => updateSetting("fontSize", 14)}
                title="Reset to 14px"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <p
              className="font-mono text-muted-foreground rounded border border-border bg-background px-3 py-2"
              style={{ fontSize: `${settings.fontSize}px` }}
            >
              Preview text at {settings.fontSize}px
            </p>
          </section>

          <Separator className="bg-border/50" />

          {/* ── Placeholder for future settings ── */}
          <div className="text-center py-4">
            <p className="font-mono text-[10px] text-muted-foreground/50">
              More settings coming soon
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
