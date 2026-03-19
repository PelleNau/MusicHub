import {
  Activity,
  BellDot,
  BookOpen,
  CircleDot,
  Headphones,
  Music2,
  Sparkles,
  Wand2,
} from "lucide-react";

import { ProductShell } from "@/components/app/ProductShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Toggle } from "@/components/ui/toggle";

function ShowcaseBlock({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] shadow-[var(--shadow-sm)]">
      <CardHeader className="pb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Capture Surface
        </div>
        <CardTitle className="font-mono text-sm tracking-tight">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export default function CaptureDesignSystemShowcase() {
  return (
    <ProductShell
      section="Capture"
      title="Design System Showcase"
      description="Component reference surface for Figma capture and visual translation."
    >
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <ShowcaseBlock
            title="Buttons, badges, and top-level actions"
            description="Primary call-to-action patterns and supporting state chips."
          >
            <div className="space-y-5">
              <div className="flex flex-wrap gap-3">
                <Button className="gap-2"><Music2 className="h-4 w-4" />Launch Studio</Button>
                <Button variant="secondary" className="gap-2"><BookOpen className="h-4 w-4" />Continue Lesson</Button>
                <Button variant="outline" className="gap-2"><Sparkles className="h-4 w-4" />Open Lab</Button>
                <Button variant="ghost" className="gap-2"><Wand2 className="h-4 w-4" />View Theory</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Live Lesson</Badge>
                <Badge variant="secondary">Standard Mode</Badge>
                <Badge variant="outline">Ready to Capture</Badge>
                <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15">Connected</Badge>
              </div>
            </div>
          </ShowcaseBlock>

          <ShowcaseBlock
            title="Mode chips and shell states"
            description="Representative shell density states for Guided, Standard, and Focused."
          >
            <div className="grid gap-3">
              {[
                ["Guided", "Lesson-first shell with visible support rail."],
                ["Standard", "Balanced production shell with full access."],
                ["Focused", "Dense canvas-first shell with reduced chrome."],
              ].map(([label, body]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[color:var(--sidebar-border)] bg-[var(--surface-2)] px-4 py-3 shadow-[var(--shadow-xs)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-xs font-semibold">{label}</div>
                    <Badge variant="outline">{label === "Standard" ? "Active" : "Preset"}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </div>
              ))}
            </div>
          </ShowcaseBlock>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ShowcaseBlock
            title="Controls"
            description="Interactive primitives used across transport, lessons, and product shell."
          >
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--sidebar-border)] bg-[var(--surface-2)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs">Track Height</span>
                    <span className="font-mono text-xs text-muted-foreground">72%</span>
                  </div>
                  <Slider defaultValue={[72]} max={100} step={1} />
                </div>
                <div className="rounded-2xl border border-[color:var(--sidebar-border)] bg-[var(--surface-2)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs">Guide Overlay</span>
                    <Switch checked />
                  </div>
                  <div className="flex gap-2">
                    <Toggle pressed>Snap</Toggle>
                    <Toggle>Triplet</Toggle>
                    <Toggle pressed>Loop</Toggle>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["Tempo", "120 BPM"],
                  ["Playhead", "9.3.1"],
                  ["Master", "-6.2 dB"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[color:var(--sidebar-border)] bg-[var(--surface-2)] px-4 py-3"
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
                    <div className="mt-2 font-mono text-lg font-semibold tracking-tight">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </ShowcaseBlock>

          <ShowcaseBlock
            title="Representative product cards"
            description="Home, learning, and Studio-support surfaces using the imported token layer."
          >
            <div className="grid gap-3">
              {[
                {
                  icon: Headphones,
                  eyebrow: "Home",
                  title: "Resume current sketch",
                  body: "Continue the current session in Standard mode with mixer and detail workspace preserved.",
                },
                {
                  icon: BookOpen,
                  eyebrow: "Lesson",
                  title: "Recording Basics",
                  body: "Arm an audio track, verify monitor state, and confirm the transport record path.",
                },
                {
                  icon: Activity,
                  eyebrow: "Studio",
                  title: "Host connected",
                  body: "Shell host is live. Native transport, monitoring, and recording paths are available.",
                },
              ].map(({ icon: Icon, eyebrow, title, body }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-[color:var(--sidebar-border)] bg-[color:color-mix(in_srgb,var(--surface-1)_88%,transparent)] p-5 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</div>
                      <div className="mt-1 text-sm font-semibold tracking-tight text-foreground">{title}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ShowcaseBlock>
        </div>

        <ShowcaseBlock
          title="Status strip"
          description="Compact status atoms used in headers, lessons, and support surfaces."
        >
          <div className="flex flex-wrap gap-3">
            {[
              [CircleDot, "Lesson Active"],
              [BellDot, "Needs Review"],
              [Sparkles, "Generated from Design System"],
            ].map(([Icon, label]) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--sidebar-border)] bg-[var(--surface-2)] px-3 py-2 text-sm"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </ShowcaseBlock>
      </div>
    </ProductShell>
  );
}
