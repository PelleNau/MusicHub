import { BarChart3, Heart, Home, Plus, User } from "lucide-react";

import {
  NeuButton,
  NeuFader,
  NeuGauge,
  NeuIconButton,
  NeuInput,
  NeuKnob,
  NeuMetricCard,
  NeuMeter,
  NeuMixerStrip,
  NeuPhoneFrame,
  NeuProgressBar,
  NeuRadioDot,
  NeuSegmentedControl,
  NeuSelect,
  NeuSlider,
  NeuSpinner,
  NeuStatBars,
  NeuSurface,
  NeuTextarea,
  NeuToggle,
} from "@/components/design-system/NeumorphicPrimitives";

function LightBoard() {
  return (
    <section className="neu-light neu-root rounded-[40px] p-10">
      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="font-mono text-[12px] uppercase tracking-[0.32em] text-[var(--neu-accent)]">Light System</div>
          <div className="grid gap-6 md:grid-cols-2">
            <NeuSurface className="space-y-6 p-6">
              <div className="space-y-1">
                <div className="font-mono text-base text-[var(--neu-text)]">Peak Demand</div>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full neu-panel-soft">
                  <span className="font-mono text-xl text-[var(--neu-text)]">88</span>
                </div>
              </div>
              <NeuStatBars values={[18, 35, 44, 88, 52, 61, 49]} activeIndex={3} />
            </NeuSurface>
            <NeuGauge value={18} className="min-h-[280px]" />
          </div>
          <NeuSurface className="grid gap-5 p-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="font-mono text-sm tracking-[0.14em] text-[var(--neu-text-dim)]">Controls</div>
              <NeuSegmentedControl options={["Account", "Client"]} value="Client" />
              <NeuSlider value={42} />
              <NeuSlider value={68} />
              <div className="flex gap-4">
                <NeuToggle checked={false} />
                <NeuToggle checked />
              </div>
            </div>
            <div className="space-y-4">
              <NeuInput placeholder="Your name" />
              <NeuInput value="John Rupple" />
              <NeuSelect value="Color" />
              <div className="flex gap-3">
                <NeuButton className="flex-1">SIGN UP</NeuButton>
                <NeuIconButton><Heart className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
              </div>
            </div>
          </NeuSurface>
        </div>

        <NeuPhoneFrame>
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full neu-panel">
              <div className="flex h-10 w-10 items-center justify-center rounded-full neu-panel-inset">
                <div className="h-5 w-5 rounded-full neu-accent-bg" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-5xl tracking-[0.08em] text-[var(--neu-text)]">NEO</div>
              <div className="font-mono text-base text-[var(--neu-text-dim)]">Be the master of your castle</div>
            </div>
            <NeuButton className="w-full">SIGN UP</NeuButton>
            <div className="font-mono text-base text-[var(--neu-text-dim)]">LOG IN</div>
            <div className="grid grid-cols-4 gap-4 pt-4">
              <NeuIconButton><User className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
              <NeuIconButton><Home className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
              <NeuIconButton><Plus className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
              <NeuIconButton><BarChart3 className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
            </div>
          </div>
        </NeuPhoneFrame>
      </div>
    </section>
  );
}

function DarkBoard() {
  return (
    <section className="neu-dark neu-root rounded-[40px] p-10">
      <div className="space-y-6">
        <div className="font-mono text-[12px] uppercase tracking-[0.32em] text-[var(--neu-accent)]">Dark System</div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
          <NeuSurface className="p-6">
            <div className="space-y-5">
              <div className="font-mono text-sm tracking-[0.14em] text-[var(--neu-text)]">Controls</div>
              <NeuSegmentedControl options={["Account", "Client"]} value="Client" />
              <NeuSlider value={34} />
              <NeuSlider value={78} />
              <div className="flex gap-4">
                <NeuToggle checked={false} />
                <NeuToggle checked />
              </div>
            </div>
          </NeuSurface>
          <NeuSurface className="p-6">
            <div className="space-y-5">
              <NeuInput placeholder="Your message" />
              <NeuTextarea
                value={"Hi Paul,\nI'm excited to contact you\nregarding the upcoming\nindustrial circuit."}
                rows={5}
              />
              <div className="grid grid-cols-3 gap-4">
                <NeuIconButton><Heart className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
                <NeuIconButton><Plus className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
                <NeuIconButton><BarChart3 className="h-5 w-5 text-[var(--neu-text)]" /></NeuIconButton>
              </div>
            </div>
          </NeuSurface>
          <NeuSurface className="p-6">
            <div className="space-y-5">
              <div className="font-mono text-sm tracking-[0.14em] text-[var(--neu-text)]">Actions</div>
              <div className="grid grid-cols-3 gap-4">
                <NeuSpinner size="sm" />
                <NeuSpinner size="sm" />
                <NeuRadioDot active />
              </div>
              <NeuButton className="w-full">SIGN UP</NeuButton>
              <NeuButton className="w-full" pressed>SIGN UP</NeuButton>
            </div>
          </NeuSurface>
        </div>
      </div>
    </section>
  );
}

function FormsBoard() {
  return (
    <section className="neu-light neu-root rounded-[40px] p-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="font-mono text-[12px] uppercase tracking-[0.32em] text-[var(--neu-accent)]">Forms</div>
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-[var(--neu-text)]">Inputs, Selection, and Messaging</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <NeuSurface className="space-y-5 p-8">
            <div className="grid gap-5 md:grid-cols-2">
              <NeuInput placeholder="Your name" />
              <NeuInput value="John Rupple" />
              <NeuSelect value="Color" />
              <NeuSelect label="Palette" value="Orange Accent" />
            </div>
            <NeuTextarea placeholder="Your message" rows={5} />
            <div className="grid gap-5 md:grid-cols-2">
              <NeuProgressBar label="Efficiency" value={60} />
              <div className="space-y-4">
                <NeuSegmentedControl options={["Account", "Client"]} value="Account" />
                <div className="flex items-center gap-4">
                  <NeuRadioDot />
                  <NeuRadioDot active />
                  <NeuRadioDot />
                </div>
              </div>
            </div>
          </NeuSurface>

          <NeuPhoneFrame className="w-[320px]">
            <div className="space-y-5">
              <NeuInput placeholder="Your name" />
              <NeuInput placeholder="Your email" />
              <NeuButton className="w-full">SIGN UP</NeuButton>
              <NeuTextarea
                value={"Hi Paul,\nI'm excited to contact you\nregarding the upcoming\nindustrial circuit."}
                rows={4}
              />
            </div>
          </NeuPhoneFrame>
        </div>
      </div>
    </section>
  );
}

function MixerBoard() {
  return (
    <section className="neu-light neu-root rounded-[40px] p-10">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="font-mono text-[12px] uppercase tracking-[0.32em] text-[var(--neu-accent)]">Mixer Study</div>
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-[var(--neu-text)]">Neumorphic Mixer Section</h2>
          <p className="max-w-3xl font-mono text-sm text-[var(--neu-text-dim)]">
            This is an isolated experiment for knobs, faders, meters, and strip surfaces. It is not wired into the Studio mixer.
          </p>
        </div>

        <NeuSurface className="space-y-6 p-8">
          <div className="grid gap-5 xl:grid-cols-[280px_1fr]">
            <div className="space-y-6">
              <NeuSurface className="p-6">
                <div className="space-y-4">
                  <div className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">Master Controls</div>
                  <div className="grid grid-cols-2 gap-5">
                    <NeuKnob value={62} label="Drive" />
                    <NeuKnob value={48} label="Width" />
                  </div>
                  <NeuSlider value={54} />
                  <NeuSlider value={71} />
                  <div className="flex items-center justify-between rounded-[24px] px-5 py-4 neu-panel-inset">
                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">Glue Bus</span>
                    <NeuToggle checked />
                  </div>
                </div>
              </NeuSurface>

              <div className="grid grid-cols-3 gap-4">
                <div className="neu-card flex flex-col items-center gap-3 p-4">
                  <NeuMeter value={72} className="h-40" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">L</div>
                </div>
                <div className="neu-card flex flex-col items-center gap-3 p-4">
                  <NeuMeter value={58} className="h-40" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">R</div>
                </div>
                <div className="neu-card flex flex-col items-center gap-3 p-4">
                  <NeuFader value={64} className="scale-[0.82]" />
                  <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--neu-text-dim)]">Bus</div>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] p-5 neu-panel-inset">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <NeuMixerStrip title="Vocal" source="Audio" fader={72} meter={64} pan={52} tone={61} active />
                <NeuMixerStrip title="Piano" source="MIDI" fader={58} meter={52} pan={48} tone={44} />
                <NeuMixerStrip title="Drums" source="Audio" fader={79} meter={74} pan={50} tone={67} />
                <NeuMixerStrip title="Master" source="Bus" fader={66} meter={61} pan={50} tone={58} />
              </div>
            </div>
          </div>
        </NeuSurface>
      </div>
    </section>
  );
}

export default function NeumorphicLibraryPreview() {
  return (
    <div className="min-h-screen bg-[#11151c] px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-2 text-white">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Preview</div>
          <h1 className="font-mono text-xl font-semibold tracking-tight">Neumorphic Library</h1>
          <p className="max-w-3xl font-mono text-sm text-white/60">
            First-pass CSS token layer and runtime primitives derived from the neumorphic references. This is isolated from product surfaces.
          </p>
        </header>

        <LightBoard />
        <DarkBoard />
        <FormsBoard />
        <MixerBoard />
      </div>
    </div>
  );
}
