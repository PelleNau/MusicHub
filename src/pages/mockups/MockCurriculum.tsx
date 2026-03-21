import { useState, useMemo, useRef, useEffect } from "react";
import {
  Volume2, Clock, Music, Piano, Layers, Sparkles,
  Navigation, PenTool, AudioWaveform, Sliders, Mic, FileMusic,
  Drum, Guitar, Lightbulb, BarChart3, Wand2, Disc3,
  Waves, Scissors, RotateCcw, Palette, Box, Move3d,
  Gauge, SlidersHorizontal, Activity, Droplets, GitMerge, Download,
  Globe, Search, Users, Bot, Zap, Trophy, Check, Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ── Icon sets per course ── */
const COURSE_ICONS = [
  [Volume2, Clock, Music, Piano, Layers, Sparkles],
  [Navigation, PenTool, AudioWaveform, Sliders, Mic, FileMusic],
  [Drum, Guitar, Lightbulb, BarChart3, Wand2, Disc3],
  [Waves, Scissors, RotateCcw, Palette, Box, Move3d],
  [Gauge, SlidersHorizontal, Activity, Droplets, GitMerge, Download],
  [Globe, Search, Users, Bot, Zap, Trophy],
];

/* ── Data ── */
interface LessonData {
  title: string;
  headline: string;
  body: string;
}

interface ModuleData {
  id: number;
  title: string;
  duration: string;
  goal: string;
  hook: string;
  lessons: LessonData[];
  span: "normal" | "wide";
}

interface CourseData {
  title: string;
  tagline: string;
  description: string;
  narrative: string;
  glyph: string;
  span: "normal" | "wide";
  modules: ModuleData[];
}

const COURSES: CourseData[] = [
  {
    title: "Foundations of Sound",
    tagline: "First Sounds",
    description: "Pitch, rhythm, melody, chords — the building blocks you'll use in everything that follows.",
    narrative: "You'll learn what sound actually is — frequency, amplitude, waveforms — then put that knowledge to work. Build rhythms on the grid, shape simple melodies, stack notes into chords, and arrange them into short musical sketches. By the end you'll have created your first piece from scratch using the Studio.",
    glyph: "〰",
    span: "normal",
    modules: [
      { id: 1, title: "What Sound Is", duration: "30–45 min", goal: "Understand pitch, loudness, timbre, and waveforms through hands-on exploration.", hook: "Frequency, amplitude, waveforms — hands-on.", lessons: [
        { title: "Pitch and frequency", headline: "How vibration speed shapes what you hear", body: "Every sound starts with something vibrating. The faster the vibration, the higher the pitch you perceive. You'll explore the full audible frequency range — from deep 20 Hz rumbles to piercing 20 kHz tones — and train your ear to notice differences as small as a semitone. By the end, concepts like 'A4 = 440 Hz' will feel intuitive rather than abstract." },
        { title: "Loudness and amplitude", headline: "The physics behind volume and perceived loudness", body: "Amplitude is the size of a vibration — bigger vibrations push more air and reach your ears with more force. But loudness isn't linear: doubling the amplitude doesn't double the perceived volume. You'll learn about decibels, why our ears compress extreme volumes, and how producers use this knowledge when balancing a mix. This lesson builds the foundation for every mixing decision you'll make later." },
        { title: "Timbre and tone colour", headline: "Why a piano and a guitar sound nothing alike", body: "Two instruments can play the same note at the same volume and still sound completely different. The secret is timbre — the complex cocktail of overtones, attack transients, and resonance that gives every sound its unique character. You'll compare real instrument recordings, describe timbres using words like 'bright', 'warm', and 'nasal', and start building a vocabulary that lets you communicate sonic ideas clearly." },
        { title: "Waveforms", headline: "See the shapes that create different tonal characters", body: "When you draw sound as a picture, you get a waveform. Sine waves are pure and flute-like, square waves are buzzy and hollow, triangle waves are mellow and soft, and sawtooth waves are bright and brassy. You'll toggle between all four, watch them animate in real time, and hear how the shape directly controls the tone colour. Understanding waveforms unlocks the first door to synthesis and sound design." },
        { title: "Sound in Studio", headline: "Apply frequency and amplitude inside the workspace", body: "Time to leave theory behind and use the Studio. You'll trigger sounds, adjust pitch with a knob, control volume with a fader, and see live waveforms responding to your changes. This is where the abstract concepts click — you'll literally see frequency change the waveform's spacing and amplitude change its height. Every future lesson builds on this hands-on fluency." },
        { title: "Mini Sound Scene", headline: "Create your first 8-second composition", body: "Your first creative project: pick three contrasting sounds, shape each one with pitch and volume controls, and arrange them into an 8-second scene. The constraint is intentional — limitations spark creativity. You'll make real musical decisions about contrast, balance, and timing. When you hit play and hear your scene, you'll know you've made something from nothing. That feeling is what the rest of this journey is about." },
      ], span: "normal" },
      { id: 2, title: "Rhythm and Time", duration: "35–50 min", goal: "Feel pulse, repetition, spacing, and loop-based musical time inside Studio.", hook: "Tempo, bars, grid placement, loops.", lessons: [
        { title: "Beat and pulse", headline: "Feel the steady heartbeat underneath all music", body: "Before there are notes or chords, there's the pulse — a steady, repeating beat that gives music its sense of forward motion. You'll tap along with different grooves, learn to feel the downbeat instinctively, and understand why the pulse is the first thing a listener locks onto. This kinesthetic understanding is the foundation of all rhythmic work." },
        { title: "Tempo", headline: "How BPM transforms feel from chill to frantic", body: "Tempo is measured in beats per minute (BPM), and it's the single biggest factor in how a piece of music feels. At 70 BPM you're in slow R&B territory; at 140 BPM you're deep in drum & bass. You'll experiment with a range of tempos, hear the same pattern at different speeds, and learn the typical BPM ranges for common genres." },
        { title: "Bars and counting", headline: "Group beats into bars and always know where you are", body: "Bars are containers that group beats together — most Western music uses groups of 4. You'll practice counting '1-2-3-4' over different tracks, understand time signatures like 4/4 and 3/4, and learn why bar boundaries are where musical events happen. Knowing where bar 1 is will make editing, arranging, and performing dramatically easier." },
        { title: "Grid and step placement", headline: "Place drum hits on the grid and hear rhythm take shape", body: "The step sequencer grid turns rhythm into a visual puzzle. Each row is a drum sound, each column is a time slot. You'll place kick, snare, and hi-hat hits on the grid and hear your pattern play back instantly. Moving a hit by one step changes the entire feel. This is how most electronic music is programmed, and it's surprisingly addictive." },
        { title: "Repetition and looping", headline: "Why loops are the foundation of modern music", body: "A 4-bar loop is the seed of a full track. You'll create a short pattern, loop it, and experience how repetition transforms a collection of sounds into a groove. You'll also learn when repetition becomes hypnotic versus when it becomes boring — the sweet spot is where great producers live." },
        { title: "Silence and spacing", headline: "The gaps between notes matter as much as the notes", body: "Great rhythm isn't just about where you place sounds — it's about where you don't. You'll remove hits from a busy pattern and hear how space opens up, creates anticipation, and lets each remaining sound breathe. Learning to use silence is one of the most powerful skills in music, and you'll start developing it here." },
        { title: "Groove starter", headline: "Build your first 4-bar drum loop from scratch", body: "Everything comes together: you'll program a complete 4-bar drum loop using kick, snare, and hi-hats. You'll make decisions about timing, spacing, velocity, and feel. The result is a loop that grooves — something you could build a track on top of. Save it; you'll use it again in later modules." },
      ], span: "wide" },
      { id: 3, title: "Melody and Pitch Space", duration: "40–55 min", goal: "Move from raw pitch perception into intentional melodic shaping.", hook: "Steps, leaps, motifs, hooks.", lessons: [
        { title: "High and low in sequence", headline: "How pitch direction creates melodic movement", body: "When you play notes one after another, the direction matters. Rising pitches feel hopeful and energetic; falling pitches feel resolving and calm. You'll listen to classic melodies and trace their contour — the shape of their ups and downs. This bird's-eye view of melody is how composers think before choosing specific notes." },
        { title: "Steps and leaps", headline: "Small intervals vs dramatic jumps and how each feels", body: "A step moves to the next note in a scale — smooth and gentle. A leap jumps over several notes — dramatic and attention-grabbing. You'll hear examples of each, practice identifying them by ear, and learn that the best melodies mix both. Too many steps and it's boring; too many leaps and it's jarring. Balance is the key." },
        { title: "Repetition and variation", headline: "The secret formula behind every catchy melody", body: "Play a short phrase, then play it again with one thing changed — different ending, different rhythm, shifted up. This repeat-then-vary technique is behind virtually every melody you've ever hummed. You'll practice it hands-on, creating variations of a simple motif and hearing how each change gives the melody a new dimension while keeping it recognizable." },
        { title: "Tension and release", headline: "The push and pull that makes melody emotionally powerful", body: "Some notes feel unstable — they want to move somewhere. Others feel like home — the place where movement resolves. This tension-and-release dynamic is what gives melody its emotional power. You'll experiment with 'hanging' on tense notes and resolving to stable ones, feeling how timing the resolution changes the emotional impact." },
        { title: "Short motifs", headline: "Create memorable 3–4 note patterns that become musical DNA", body: "The most iconic melodies often start with just 3 or 4 notes. Think of Beethoven's Fifth: da-da-da-DUM. You'll create short motifs, play them back, evaluate their memorability, and iterate. These tiny ideas become the DNA of longer melodies — once you have a strong motif, building a full melody is just development and repetition." },
        { title: "Melodies over rhythm", headline: "Layer pitch ideas on top of a beat for momentum", body: "A melody floating in silence feels different from one riding on a beat. You'll take your motifs and layer them over the drum loop you built in Module 2. Hearing melody and rhythm together reveals how they interact — the rhythm gives the melody momentum, and the melody gives the rhythm purpose." },
        { title: "Hook starter", headline: "Write a short, singable melody that sticks in the ear", body: "Your challenge: write a 2-bar hook — a melody so catchy you'll remember it after closing the browser. You'll use everything from this module: direction, steps and leaps, repetition, tension, and motif thinking. A great hook is simple, surprising, and satisfying. Yours might not be perfect yet, but you'll know exactly what makes it work or not." },
      ], span: "normal" },
      { id: 4, title: "Chords and Harmony", duration: "45–60 min", goal: "Introduce harmony as stacked pitch relationships and emotional context.", hook: "Triads, progressions, major vs minor.", lessons: [
        { title: "Notes together become chords", headline: "Stack pitches and hear something new emerge", body: "Play one note and you hear a tone. Play two or three together and something magical happens — a chord. The individual notes blend into a composite sound with its own character. You'll experiment with stacking different combinations and notice how some sound stable and pleasant while others sound tense or dissonant. This is the birth of harmony." },
        { title: "Major and minor feeling", headline: "Bright and open vs dark and introspective", body: "The difference between major and minor is one of the most powerful tools in music. Major chords sound bright, confident, and open. Minor chords sound darker, more emotional, and introspective. You'll toggle between them, hear the same melody harmonized in major then minor, and develop the ear to instantly identify which is which. This emotional palette will color every piece of music you create." },
        { title: "Building triads visually", headline: "See how three notes spaced in thirds form the harmonic backbone", body: "A triad is three notes stacked in intervals of thirds — the most fundamental chord structure in Western music. You'll build them visually on the piano roll, see the patterns they form, and hear how root position, first inversion, and second inversion change the voicing without changing the chord's identity. This visual understanding makes chord building fast and intuitive." },
        { title: "Chord movement", headline: "Feel how progressions create emotional journeys", body: "One chord on its own is a color. A sequence of chords is a story. You'll move between chords and feel how each transition creates a sense of journey — some moves feel like stepping forward, others like coming home, others like a surprise detour. This is the essence of harmonic progression, and it's how songwriters create emotional arcs." },
        { title: "Progressions", headline: "Learn the sequences behind thousands of hit songs", body: "Certain chord sequences appear in song after song: I–V–vi–IV, ii–V–I, I–vi–IV–V. You'll play through the most common progressions, hear famous examples that use them, and understand why they work so well. These progressions aren't clichés — they're reliable emotional engines that you can customize and make your own." },
        { title: "Melody over chords", headline: "Hear how harmony gives the same notes new meaning", body: "A melody note that's part of the chord underneath sounds stable. The same note over a different chord sounds tense or surprising. You'll layer a simple melody over different chord progressions and hear how the harmonic context transforms the melody's emotional meaning. This interaction between melody and harmony is where music gets really expressive." },
        { title: "Emotional harmony starter", headline: "Build a 4-chord loop that evokes a specific mood", body: "Choose a mood — happy, melancholy, triumphant, dreamy — and build a 4-chord progression that captures it. You'll apply your knowledge of major/minor, common progressions, and chord movement to create something emotionally intentional. Play your loop and see if a friend can guess the mood without being told. That's the test of good harmonic writing." },
      ], span: "normal" },
      { id: 5, title: "Song Building Basics", duration: "45–60 min", goal: "Turn separate ideas into section-based musical structure.", hook: "Sections, contrast, arrangement.", lessons: [
        { title: "Repetition becomes structure", headline: "How repeating and varying ideas creates sections", body: "A section is born when an idea repeats long enough to establish itself, then changes enough to signal something new. You'll take a simple loop and extend it into an 8-bar section, then create a contrasting 8-bar section. The moment you switch between them, you'll feel structure emerge — the listener's brain goes 'ah, something changed' and re-engages." },
        { title: "Sections", headline: "Verses, choruses, bridges — each serves a role", body: "Every section in a song has a job. Verses set the scene and move the story forward. Choruses deliver the emotional payload and contain the hook. Bridges offer contrast and prevent predictability. Intros welcome the listener; outros let them go. You'll study real song structures, label the sections, and understand the logic behind why they're ordered the way they are." },
        { title: "Contrast", headline: "The best songs create contrast between sections", body: "A chorus hits harder when the verse was sparse. A breakdown feels dramatic when the build was dense. Contrast is the engine of interest. You'll experiment with contrasting energy, density, rhythm, and instrumentation between sections. The goal is to make each section feel like a deliberate choice rather than a random collection of ideas." },
        { title: "Layer entry and exit", headline: "Control when instruments enter and leave to shape the journey", body: "Adding a new instrument is like opening a door — it changes the room. Removing one is like dimming a light. You'll practice muting and unmuting tracks at section boundaries and hear how each addition or subtraction shifts the energy. Professional arrangers plan these entrances and exits carefully, and you'll start thinking the same way." },
        { title: "Simple arrangement moves", headline: "Copy, mute, and filter tricks to turn a loop into a full arrangement", body: "You don't need complex techniques to arrange. Copy a section, mute the drums for a breakdown, add a filter sweep for a transition, double the bass for a drop. These simple moves create the illusion of a fully arranged track from a single loop. You'll learn a toolkit of quick arrangement tricks that you'll use in every project." },
        { title: "Sketching a beginning and middle", headline: "Build a two-section sketch with clear flow", body: "Put it all together: create a track sketch with a clear intro that establishes the mood and a body section that adds energy. You'll make deliberate decisions about which elements enter when, how the sections contrast, and what makes the transition feel natural. This is your first complete arrangement — short, but structurally sound." },
      ], span: "wide" },
      { id: 6, title: "Creative Confidence Starter", duration: "45–70 min", goal: "Consolidate Course 1 into a fully guided beginner project.", hook: "Guided project — your first full sketch.", lessons: [
        { title: "Choose a starter direction", headline: "Every great project starts with a simple creative decision", body: "Before you place a single note, you'll make a creative choice: a mood, a genre hint, or an energy level. This decision becomes your compass — when you're unsure what comes next, you'll refer back to it. You'll learn that constraints don't limit creativity; they focus it. Professional producers always start with intent." },
        { title: "Build the rhythm base", headline: "Lay down drums and bass rhythm as your foundation", body: "Start with the heartbeat: a drum pattern that matches your chosen direction, plus a bass rhythm that locks to the kick. You'll apply what you learned about groove, spacing, and low-end roles. This foundation needs to feel solid on its own before you add anything else — if the drums and bass aren't working, nothing on top will save it." },
        { title: "Add harmonic body", headline: "Layer chords and pads to fill the emotional space", body: "With the rhythm locked, add the harmonic layer: chords or pads that give your track emotional weight and warmth. You'll choose between major and minor, pick a voicing that complements the bass, and adjust the volume so it supports without overwhelming. This is where your track starts to feel like music rather than just a beat." },
        { title: "Add hook and movement", headline: "Write a lead melody that gives your track identity", body: "Every track needs a focal point — something the listener remembers. You'll write a short lead melody or hook using the motif techniques from Module 3. It should sit on top of your rhythm and chords, adding personality and memorability. If someone hears your track for 10 seconds, this is what they'll remember." },
        { title: "Arrange the sketch", headline: "Organize ideas into sections with a beginning, middle, and end", body: "Take your loop and turn it into a structured sketch. Add an intro that draws the listener in, build toward a peak, and create an ending that resolves. Use mutes, layer entries, and simple transitions to shape the journey. When you play it from start to finish, it should feel like a complete musical thought — your first finished piece." },
      ], span: "normal" },
    ],
  },
  {
    title: "Studio Fluency",
    tagline: "Your Instrument",
    description: "Navigation, editing, recording, presets — learn to work fast and stay in flow.",
    narrative: "This course covers everything you need to operate the Studio confidently: transport controls, browser, track management, MIDI and audio editing, instrument chains, presets, and basic recording. You'll build muscle memory for the actions you'll repeat thousands of times, so the interface disappears and you can focus on music.",
    glyph: "⎚",
    span: "wide",
    modules: [
      { id: 7, title: "Navigation and Workflow", duration: "30–45 min", goal: "Make the Studio feel legible, navigable, and non-threatening.", hook: "Transport, browser, panels, undo.", lessons: [
        { title: "Studio overview", headline: "A bird's-eye tour of where everything lives", body: "The Studio can look overwhelming at first, but it's organized logically. You'll walk through the four main areas — Transport, Browser, Track Area, and Detail Panel — and understand why each is positioned where it is. By the end of this lesson, nothing in the interface will be a mystery. You'll know where to look for any tool or control you need." },
        { title: "Transport fluency", headline: "Play, stop, record, and loop until they're muscle memory", body: "The transport controls are the most-used buttons in the Studio. You'll practice play, stop, record, and loop-toggle until you can operate them without looking. You'll also learn keyboard shortcuts that save you from reaching for the mouse every time. This fluency might seem trivial, but it's the difference between flow and frustration." },
        { title: "Browser fluency", headline: "Navigate the sound library to find anything quickly", body: "The Browser is your library of sounds, presets, and samples. You'll learn to navigate its categories, use search and tags, preview sounds without loading them, and drag items onto tracks. A producer who can find the right sound in 10 seconds has a massive advantage over one who spends 10 minutes browsing." },
        { title: "Track focus and selection", headline: "Click, select, and focus tracks efficiently", body: "Working with tracks is constant in the Studio — selecting, focusing, reordering, and managing them. You'll practice clicking to select, using keyboard navigation to move between tracks, and focusing a track to see its details. These micro-interactions happen hundreds of times per session, so efficiency here compounds into massive time savings." },
        { title: "Panels and detail views", headline: "Open and close editors without losing your place", body: "The Studio has panels that slide open for detailed editing — instrument parameters, clip properties, automation. You'll learn to open and close them fluidly, resize them, and use keyboard shortcuts to toggle them. The goal is to always have the right information visible without cluttering your workspace." },
        { title: "Undo, redo, and safety", headline: "Never fear experimentation — every action is reversible", body: "The most powerful feature in any creative tool is undo. You'll practice undoing and redoing actions, learn how the history stack works, and internalize the confidence that comes from knowing nothing is permanent. This psychological safety net is what allows you to experiment boldly, which is how the best music gets made." },
      ], span: "wide" },
      { id: 8, title: "MIDI Editing Fundamentals", duration: "40–55 min", goal: "Teach note entry, movement, quantization, length, and velocity.", hook: "Note entry, velocity, quantize.", lessons: [
        { title: "Creating a MIDI clip", headline: "Start from empty and create your first editable clip", body: "A MIDI clip is a container for musical events — notes, velocities, and durations. You'll create one from scratch on an empty track and see it appear on the timeline. Unlike audio, MIDI is infinitely editable — every note can be moved, changed, or deleted. This flexibility is why MIDI is the primary creative medium in modern production." },
        { title: "Adding notes", headline: "Click to place notes on the piano roll grid", body: "The piano roll is where MIDI magic happens. Each horizontal row is a pitch, each vertical column is a time position. Click to place a note, and it plays that pitch at that time. You'll populate a clip with notes, hearing your pattern build up from nothing. The visual feedback makes composition feel like painting — you see and hear the music simultaneously." },
        { title: "Moving notes", headline: "Drag notes to new pitches or positions to refine ideas", body: "Placed a note in the wrong spot? Just drag it. You'll practice moving notes to new pitches (higher or lower), new time positions (earlier or later), and both at once. This drag-to-edit workflow is incredibly fluid — you can reshape a melody in seconds. You'll also learn selection techniques for moving multiple notes at once." },
        { title: "Changing note length", headline: "Stretch and shrink notes for staccato stabs or long sustains", body: "Note length dramatically changes character. A short, clipped note feels percussive and punchy. A long, sustained note feels smooth and flowing. You'll drag the edges of notes to lengthen or shorten them, experimenting with how duration affects the musical feel. Combined with pitch and timing, length gives you complete control over expression." },
        { title: "Velocity", headline: "Control how hard each note hits for dynamic expression", body: "In MIDI, velocity represents how hard a note is played — from barely audible to full force. You'll adjust velocity values and hear how subtle changes bring a mechanical pattern to life. Accenting certain beats, softening others, and creating crescendos are all velocity techniques. This is where programming starts to sound like a human performance." },
        { title: "Quantize and cleanup", headline: "Snap notes to perfect timing or keep them loose for feel", body: "Quantization snaps notes to the nearest grid position — perfect timing, every time. But perfect isn't always musical. You'll learn to quantize fully for mechanical precision, partially for 'tight but human' feel, and selectively for specific notes. You'll also clean up overlapping or stuck notes. Quantize is a tool, not a rule — use it intentionally." },
        { title: "Edit a pattern musically", headline: "Transform a rough idea into a polished musical pattern", body: "Everything comes together: take a rough MIDI sketch and refine it using all the tools you've learned. Move notes for better pitch choices, adjust lengths for better phrasing, tweak velocities for dynamics, and quantize for timing. The difference between 'before' and 'after' will show you how powerful careful editing is." },
      ], span: "normal" },
      { id: 9, title: "Audio Editing Fundamentals", duration: "40–55 min", goal: "Teach users how to place, trim, move, and shape audio clips confidently.", hook: "Trim, warp, loop, gain.", lessons: [
        { title: "Audio clips in the timeline", headline: "Understand how recorded sound sits on tracks", body: "Audio clips are recordings — actual captured sound waves displayed as waveforms on the timeline. Unlike MIDI, you can't change individual notes, but you can cut, move, loop, and process them. You'll load audio clips, see their waveforms, and understand the fundamental difference between working with audio versus MIDI." },
        { title: "Trim and move", headline: "Cut the edges and reposition clips precisely", body: "Trimming is the most basic audio edit — drag the start or end of a clip to remove unwanted material. Moving repositions the clip in time. You'll practice both, learning to clean up recordings by removing silence, breaths, or noise at the edges, and aligning clips to musical positions. Precision here saves hours of frustration later." },
        { title: "Loop and repeat", headline: "Turn a short phrase into a repeating rhythmic foundation", body: "A 2-bar drum loop can drive an entire track. You'll select a clip region, enable looping, and hear it repeat seamlessly. You'll also learn to identify good loop points — where the audio wraps around without clicks or gaps. Looping is one of the most-used techniques in production, from drums to pads to vocal chops." },
        { title: "Gain and clip balance", headline: "Adjust individual volumes before touching the mixer", body: "Before you reach for the mixer faders, you can adjust the gain of individual clips. This is called clip gain, and it's your first tool for balancing levels. You'll adjust clip gains so that all your clips are at roughly similar volumes, creating a clean starting point for mixing. Think of it as tidying up before you decorate." },
        { title: "Warp or timing correction intro", headline: "Make audio fit your tempo without changing pitch", body: "What if your audio recording doesn't match your project tempo? Warping stretches or compresses audio in time without changing its pitch. You'll get a first look at warp markers, hear the difference between warped and unwarped audio, and understand when warping is essential versus when it's better to re-record. This is an introduction — advanced warping comes later." },
        { title: "Clean clip arrangement", headline: "Organize multiple clips into a tidy, well-structured layout", body: "A messy timeline is hard to work with. You'll practice organizing multiple audio clips — aligning them to bar boundaries, eliminating gaps and overlaps, color-coding for visual clarity, and naming clips descriptively. A clean arrangement isn't just aesthetically pleasing; it's functionally essential for efficient editing and mixing." },
      ], span: "normal" },
      { id: 10, title: "Instruments, Presets, and Chains", duration: "40–55 min", goal: "Make instruments, presets, and chains understandable in product language.", hook: "Instruments, chains, featured params.", lessons: [
        { title: "Instrument tracks", headline: "How MIDI data becomes audible sound", body: "An instrument track combines a MIDI clip (the notes) with a virtual instrument (the sound generator). The MIDI tells the instrument what to play; the instrument decides how it sounds. You'll create an instrument track, load a synthesizer, and hear MIDI notes come to life. This instrument-on-a-track model is the heart of digital music production." },
        { title: "Presets vs raw plugins", headline: "When to start from a preset vs building from scratch", body: "Presets are pre-designed sounds created by professionals — they're starting points, not cheating. Raw plugins give you full control but require more knowledge. You'll learn when each approach makes sense: presets for speed and inspiration, raw plugins for custom sound design. Most professionals use both, often starting with a preset and tweaking it." },
        { title: "Chains and roles", headline: "See how instruments and effects connect in sequence", body: "A device chain is a series of processors connected in order: instrument → EQ → compressor → reverb, for example. The order matters — EQ before compression sounds different from compression before EQ. You'll build a simple chain, reorder devices, and hear how the signal flow affects the final sound. Chains are how you sculpt raw sounds into finished tones." },
        { title: "Featured parameters", headline: "Find the knobs that make the biggest difference", body: "Every instrument has dozens of parameters, but a handful matter most. Filter cutoff, resonance, attack, release, and mix/dry-wet are the controls that make 80% of the sonic difference. You'll identify these featured parameters across different instruments and learn to reach for them first. This shortcut dramatically speeds up sound design." },
        { title: "Audition and compare", headline: "A/B between presets and settings to choose wisely", body: "Choosing sounds is a decision-making process. You'll learn to audition presets quickly — preview, compare, decide — without falling into the trap of browsing for hours. You'll also learn A/B comparison: toggle between two settings and choose the one that serves the track. Speed and decisiveness in sound selection is a superpower." },
        { title: "Choose sound by intent", headline: "Start with a description and find the matching preset", body: "Instead of browsing randomly, start with intent: 'I need a warm pad', 'I need a punchy bass', 'I need a bright lead'. You'll practice searching by description, filtering by tags, and evaluating whether a preset matches your vision. This intent-first approach transforms sound selection from aimless browsing into purposeful decision-making." },
      ], span: "wide" },
      { id: 11, title: "Recording Basics", duration: "35–50 min", goal: "Introduce safe, frustration-free recording of MIDI and audio ideas.", hook: "Arm, count-in, loop record, retakes.", lessons: [
        { title: "Arm and monitor", headline: "Set up for recording and hear yourself live", body: "Before you record, you arm a track — telling the Studio 'this is the one that's listening.' You'll enable monitoring to hear your input in real time, adjust input levels to avoid clipping, and verify everything is connected. This setup ritual takes 30 seconds once you know it, and prevents the most common recording frustrations." },
        { title: "Count-in and loop recording", headline: "Start on time and capture multiple takes effortlessly", body: "A count-in gives you '1-2-3-4' before recording starts, so you're not scrambling to play on beat 1. Loop recording lets you play a section over and over, capturing each pass as a separate take. You'll practice both and feel how they remove the pressure of 'getting it right the first time.' Every take is saved; you'll pick the best one later." },
        { title: "Record MIDI", headline: "Capture your keyboard or pad performance as editable data", body: "Playing a MIDI controller and recording the result gives you the best of both worlds: the expressiveness of a live performance with the editability of MIDI. You'll record a simple keyboard part, see the notes appear on the piano roll, and know that you can fix any mistakes after the fact. MIDI recording is forgiving and powerful." },
        { title: "Record audio", headline: "Capture vocals, guitar, or any live sound", body: "Audio recording captures the actual sound waves from a microphone or instrument input. You'll record a short audio clip, see the waveform appear, and learn about input levels, monitoring latency, and file formats. Unlike MIDI, audio is a snapshot — what you capture is what you get — so getting the input signal right matters." },
        { title: "Retake and keep the best idea", headline: "Every attempt is safely stored — pick the winner later", body: "Multiple takes are standard practice, not a sign of failure. You'll record several passes of the same part, compare them, and select the best one. You'll also learn to comp — combine the best moments from different takes into one perfect performance. This non-destructive workflow means you can always go back and change your mind." },
        { title: "Record without fear", headline: "Nothing is ever lost — build confidence through safety", body: "The biggest barrier to recording is fear: fear of making mistakes, fear of losing a good take, fear of messing up the project. You'll learn that every action is undoable, every take is preserved, and every recording is non-destructive. With this safety net firmly in mind, you'll record with confidence and creative abandon." },
      ], span: "normal" },
      { id: 12, title: "Build a Full Sketch", duration: "50–75 min", goal: "Consolidate Studio fluency into a self-made project sketch.", hook: "Start a session, build a sketch, arrange it.", lessons: [
        { title: "Start from scratch or template", headline: "Choose your starting point — both paths lead forward", body: "Some producers prefer a blank canvas; others like a template with tracks and routing pre-configured. You'll try both approaches and discover which suits your workflow. Templates save time; blank sessions give maximum freedom. There's no wrong choice — the right one is the one that gets you making music fastest." },
        { title: "Build rhythm and harmony", headline: "Apply all your editing skills to create the foundation", body: "Using everything from Modules 8–10, you'll build a drum pattern in MIDI, add a bass line, and layer chords. This is where Studio fluency pays off — you'll navigate, edit, and audition with confidence. The focus is on speed and flow, not perfection. A solid foundation built quickly is better than a perfect one built slowly." },
        { title: "Add lead or vocal idea", headline: "Record or draw a focal point for your sketch", body: "Every sketch needs something that says 'this is what this track is about.' You'll either record a live performance or draw a melody in the piano roll. This element sits on top of everything else and gives the listener something to follow. It doesn't need to be final — it just needs to exist." },
        { title: "Structure the sketch", headline: "Arrange your ideas into at least two distinct sections", body: "A sketch becomes a track when it has structure. You'll arrange your elements into sections — at minimum, an A section and a B section with clear contrast. Add transitions, mute/unmute layers at boundaries, and create a sense of journey. The result should be a 1–2 minute sketch that feels like a complete musical idea." },
        { title: "Self-evaluate", headline: "Listen back critically and identify what works and what doesn't", body: "The final step is honest self-evaluation. You'll listen to your sketch from start to finish, noting what works and what doesn't. Does the groove feel good? Is the mix balanced? Does the structure hold attention? This critical listening skill is how you improve — every project teaches you something for the next one." },
      ], span: "normal" },
    ],
  },
  {
    title: "Sound Design & Synthesis",
    tagline: "Shape Any Sound",
    description: "Synthesis, sampling, effects — sculpt exactly the sounds you hear in your head.",
    narrative: "Now that you can navigate the Studio and write music, it's time to control what things sound like. This course takes you deep into subtractive synthesis, FM, wavetable, sampling, and effects processing. You'll learn to design sounds from raw oscillators and process them with EQ, compression, reverb, delay, and creative effects. By the end, you'll never need to settle for a preset that's 'close enough.'",
    glyph: "◉",
    span: "normal",
    modules: [
      { id: 13, title: "Subtractive Synthesis", duration: "40–55 min", goal: "Understand oscillators, filters, envelopes, and LFOs through hands-on patching.", hook: "Oscillators, filters, ADSR, LFOs.", lessons: [
        { title: "Oscillator basics", headline: "Start with raw tones — sine, saw, square, triangle", body: "Every synthesizer starts with oscillators — electronic tone generators that produce raw waveforms. You'll hear each waveform type, understand its harmonic content, and learn why sawtooth waves are the workhorse of synthesis. Mixing oscillators is like mixing paint colors — combinations create new timbres that don't exist in nature." },
        { title: "Filter shaping", headline: "Sculpt brightness and darkness with low-pass, high-pass, and band-pass", body: "Filters remove frequencies, transforming a bright sawtooth into a mellow pad or a thin whistle into a warm bass. You'll sweep the filter cutoff in real time, feel how resonance adds character, and understand why the filter is often called the most important control in synthesis." },
        { title: "Envelopes (ADSR)", headline: "Control how sounds evolve from attack to release", body: "An ADSR envelope shapes how a parameter changes over time: Attack (how fast it starts), Decay (how quickly it drops), Sustain (the held level), Release (how long it fades). You'll apply envelopes to volume and filter, transforming a static tone into a pluck, a pad, a brass stab, or a slow swell." },
        { title: "LFO modulation", headline: "Add movement with low-frequency oscillators", body: "An LFO is a slow oscillator that modulates other parameters — wobbling the filter, vibrating the pitch, or pulsing the volume. You'll route an LFO to different targets and hear how it adds life and movement to static sounds. Dubstep wobbles, vibrato, tremolo, and auto-pan are all LFO tricks." },
        { title: "Layering oscillators", headline: "Stack and detune for thickness and width", body: "One oscillator sounds thin. Two detuned oscillators sound fat. Add a sub oscillator for weight and a noise oscillator for texture, and suddenly you have a massive sound. You'll experiment with layering strategies and learn why detuning by just a few cents creates that classic 'supersaw' width." },
        { title: "Patch from description", headline: "Hear a sound in your head and build it from scratch", body: "The ultimate synthesis skill: someone says 'warm analog pad with slow attack' and you know exactly what to do. You'll practice translating verbal descriptions into synth patches — choosing oscillators, setting filters, shaping envelopes, and adding modulation. This is where synthesis becomes a creative language." },
      ], span: "normal" },
      { id: 14, title: "FM and Wavetable Synthesis", duration: "35–50 min", goal: "Expand timbral range beyond subtractive with FM and wavetable engines.", hook: "FM ratios, wavetable morphing, metallic tones.", lessons: [
        { title: "FM basics", headline: "How frequency modulation creates complex harmonics", body: "FM synthesis uses one oscillator to modulate the frequency of another, creating harmonics that subtractive synthesis can't touch. You'll learn about carriers and modulators, hear how changing the ratio creates bells, metallic sounds, and electric pianos, and understand why FM is beloved for its crystalline, complex tones." },
        { title: "FM ratios and timbre", headline: "Integer ratios for harmonic sounds, non-integer for metallic", body: "The ratio between carrier and modulator frequencies determines the harmonic content. Integer ratios (1:1, 1:2, 1:3) produce harmonic, musical tones. Non-integer ratios produce inharmonic, metallic, bell-like sounds. You'll experiment with ratios and hear the spectrum from pure to chaotic." },
        { title: "Wavetable concepts", headline: "Morph between waveform snapshots for evolving textures", body: "A wavetable is a collection of waveform snapshots arranged in sequence. Sweeping through the table morphs smoothly between different timbres — from sine to saw to noise to vocal formant. You'll load different wavetables and explore the timbral landscapes they contain." },
        { title: "Wavetable modulation", headline: "Use envelopes and LFOs to animate wavetable position", body: "Static wavetable position gives you a fixed timbre. Modulating the position with an envelope or LFO creates evolving, animated textures. You'll create sounds that transform from soft to aggressive over a single note hold — something impossible with basic subtractive synthesis." },
        { title: "Combining engines", headline: "Layer FM and wavetable with subtractive for hybrid sounds", body: "Modern synthesizers often combine multiple synthesis engines. You'll layer an FM metallic attack with a wavetable sustain and filter them subtractively. The result is sounds with complexity and character that no single engine could produce alone. This hybrid approach is how cutting-edge sound design works." },
      ], span: "normal" },
      { id: 15, title: "Sampling and Chopping", duration: "35–50 min", goal: "Turn any recorded audio into a playable, shapeable instrument.", hook: "Load, chop, layer, pitch samples.", lessons: [
        { title: "Loading samples", headline: "Turn any audio file into a playable sound", body: "A sampler takes an audio recording and maps it to your keyboard — press a key, hear the sample. You'll load different samples (drums, vocals, textures), trigger them via MIDI, and understand the difference between one-shot samples and sustaining loops. Sampling turns the entire world of recorded sound into your instrument." },
        { title: "Chopping and slicing", headline: "Cut a loop into individual hits for rearrangement", body: "Take a drum loop and slice it into individual hits — kick, snare, hat. Now rearrange them into a completely new pattern. This 'chop and flip' technique is fundamental to hip-hop, electronic music, and sound design. You'll practice slicing, mapping slices to pads, and creating new rhythms from old recordings." },
        { title: "Pitch and time manipulation", headline: "Shift pitch and stretch time independently", body: "With samples, you can independently control pitch and time. Slow a vocal down without changing its pitch, or pitch-shift a guitar without changing its speed. You'll experiment with extreme settings for creative effects and subtle settings for musical correction." },
        { title: "Layering samples", headline: "Stack multiple samples for composite impact sounds", body: "One kick sample might lack low end. Another might lack attack. Layer them together and you get a kick with both. You'll practice layering drum hits, textures, and melodic samples, learning to manage phase relationships and frequency overlap." },
        { title: "Sample as instrument", headline: "Build a playable multi-sample instrument from recordings", body: "The final step: map multiple samples across the keyboard, set velocity layers, add round-robin variation, and apply synthesis parameters (filter, envelope, LFO). The result is a custom instrument that sounds realistic and responds expressively to your playing. This is how sample libraries are made." },
      ], span: "normal" },
      { id: 16, title: "Effects Processing", duration: "40–55 min", goal: "Understand EQ, compression, reverb, delay, and creative effects as sound-shaping tools.", hook: "EQ, compression, reverb, delay, creative FX.", lessons: [
        { title: "EQ fundamentals", headline: "Boost and cut frequencies to clarify any sound", body: "EQ is the most-used effect in music production. It lets you boost frequencies you want more of and cut frequencies you want less of. You'll learn to identify and fix frequency problems (muddy low-mids, harsh highs), carve space for each instrument, and use EQ creatively to transform timbres." },
        { title: "Compression basics", headline: "Control dynamics for punch, sustain, and consistency", body: "A compressor reduces the volume difference between loud and quiet parts. Used gently, it adds consistency and polish. Used aggressively, it adds punch and sustain. You'll learn threshold, ratio, attack, and release — the four controls that turn an unruly signal into a controlled, professional sound." },
        { title: "Reverb and space", headline: "Place sounds in virtual rooms, halls, and infinite spaces", body: "Reverb simulates the reflections of sound in a space. A small room sounds intimate; a cathedral sounds epic; an infinite plate sounds otherworldly. You'll experiment with different reverb types and learn to use pre-delay, decay time, and wet/dry mix to place sounds in exactly the right space." },
        { title: "Delay and echo", headline: "Create rhythmic repeats and spatial depth", body: "Delay repeats a sound after a set time interval. Synced to tempo, it creates rhythmic echoes that enhance grooves. With feedback, echoes build into dense, psychedelic textures. You'll set up tempo-synced delays, ping-pong delays, and learn to use delay as both a rhythmic and spatial tool." },
        { title: "Creative effects", headline: "Distortion, chorus, phaser, flanger — add character and movement", body: "Beyond the corrective tools, creative effects add character and excitement. Distortion adds grit and harmonics. Chorus creates width and shimmer. Phasers and flangers add sweeping movement. You'll experiment with each, learning when to use them subtly for polish and when to crank them for dramatic effect." },
        { title: "Building an effect chain", headline: "Order matters — design a chain that shapes sound intentionally", body: "The order of effects in a chain dramatically changes the result. EQ before compression sounds different from compression before EQ. Reverb before distortion sounds very different from distortion before reverb. You'll experiment with effect ordering, develop rules of thumb, and build chains that achieve specific sonic goals." },
      ], span: "wide" },
      { id: 17, title: "Sound Design Mini-Project", duration: "40–60 min", goal: "Design a set of custom sounds from scratch for a specific musical context.", hook: "Design a complete sound palette from scratch.", lessons: [
        { title: "Define the palette", headline: "Choose a mood and genre — your sounds must serve the music", body: "Before designing any sounds, define what you need: a warm bass, a bright lead, atmospheric pads, punchy drums. Your palette should serve a specific musical vision. You'll write a brief describing each sound you need and why, creating a roadmap for your design session." },
        { title: "Design the bass", headline: "Craft a low-end foundation using synthesis and processing", body: "The bass anchors everything. You'll design a bass sound from an oscillator — choosing the right waveform, tuning, filter settings, and envelope. Then process it with saturation for harmonics, EQ for clarity, and compression for consistency. The result should sit perfectly in the low end of your palette." },
        { title: "Design the lead", headline: "Create a distinctive, memorable lead sound", body: "The lead carries the melody and needs to stand out. You'll design one using synthesis or sampling, shape it with effects, and ensure it cuts through a busy mix. The challenge is making it distinctive without making it harsh — presence without pain." },
        { title: "Design atmosphere", headline: "Build pads and textures that fill the background with emotion", body: "Atmosphere sounds fill the space between the foreground elements. You'll design pads using slow attacks, long releases, and modulated filters. Layer textures from noise, granular processing, or reversed samples. These sounds don't grab attention — they create the emotional environment." },
        { title: "Assemble and test", headline: "Play all your designed sounds together and evaluate the palette", body: "Load all your designed sounds into a session and play them together. Do they complement each other? Is there frequency overlap? Does the palette feel cohesive? You'll make final adjustments, bounce your sounds, and have a complete custom sound palette — proof that you can design any sound you need." },
      ], span: "normal" },
      { id: 18, title: "Sound Design Capstone", duration: "45–65 min", goal: "Create a showcase piece demonstrating advanced sound design techniques.", hook: "Full sound design showcase.", lessons: [
        { title: "Concept and brief", headline: "Define a creative direction for your sound design showcase", body: "Start with a vision: a soundscape, a genre piece, or an experimental composition where the sound design IS the music. Write a brief that describes the sonic world you want to create, the techniques you plan to use, and what makes it uniquely yours." },
        { title: "Design hero sounds", headline: "Create 3–4 signature sounds that define the piece", body: "Every great piece has signature sounds — the ones that make listeners ask 'how did they make that?' You'll design 3–4 hero sounds using advanced techniques: FM synthesis, wavetable morphing, creative sampling, extreme processing, or combinations thereof." },
        { title: "Build the piece", headline: "Compose and arrange using only your designed sounds", body: "Using your hero sounds and supporting palette, compose a short piece. The focus is on showcasing the sounds — give each one space to shine. This isn't about complex composition; it's about sound design excellence in a musical context." },
        { title: "Process and polish", headline: "Apply effects and mixing to finalize your showcase", body: "Process your piece with effects that enhance the sound design. Add space with reverb, movement with modulation, impact with compression. Mix it so every designed sound is presented at its best. This is your sound design portfolio piece." },
        { title: "Reflect and document", headline: "Document your techniques so you can recreate and build on them", body: "Take notes on every technique you used. Screenshot your synth patches, document your effect chains, and describe your creative decisions. This documentation turns a one-time achievement into repeatable knowledge. Your future self will thank you." },
      ], span: "normal" },
    ],
  },
  {
    title: "Arrangement & Production",
    tagline: "Full Pictures",
    description: "Arrangement techniques, layering, transitions, automation, and genre fluency.",
    narrative: "Knowing how to make sounds and write chords is only half the story. This course teaches you how to arrange those ideas into complete, professional tracks. You'll learn section design, transition techniques, automation, layering strategies, genre conventions, and the art of keeping a listener engaged from start to finish.",
    glyph: "▧",
    span: "wide",
    modules: [
      { id: 19, title: "Arrangement Fundamentals", duration: "40–55 min", goal: "Teach section design, transitions, and energy management.", hook: "Sections, energy curves, transitions.", lessons: [
        { title: "Energy curves", headline: "Map the emotional journey of a track from start to finish", body: "Every great track has an energy curve — a visual representation of intensity over time. You'll analyze tracks across genres, map their energy curves, and identify patterns. Most follow a predictable shape: build, peak, release, build again. Understanding this shape lets you design arrangements that take listeners on intentional emotional journeys." },
        { title: "Intro design", headline: "First impressions matter — hook the listener in 8 seconds", body: "The intro sets expectations. Too boring and listeners skip. Too busy and they're overwhelmed. You'll study different intro strategies: the instant hook, the slow build, the atmospheric establish, and the drop-in. Each serves a different purpose and genre. You'll design intros that immediately communicate what kind of track this is." },
        { title: "Verse-chorus dynamics", headline: "The push-pull engine of popular music", body: "The verse-chorus relationship is the most powerful structural tool in popular music. Verses build anticipation; choruses deliver satisfaction. You'll study how density, instrumentation, melody, and energy differ between verses and choruses, and practice creating clear contrast between them." },
        { title: "Breakdowns and builds", headline: "Create tension and release through strategic subtraction and addition", body: "A breakdown strips away elements, creating space and anticipation. A build adds them back gradually, increasing energy toward a climax. You'll learn to use filter sweeps, risers, drum fills, and arrangement edits to create effective breakdowns and builds that make the listener's pulse quicken." },
        { title: "Transitions", headline: "The glue between sections — fills, sweeps, impacts, and silence", body: "Smooth transitions make a track feel like one continuous piece rather than sections stitched together. You'll learn transition techniques: drum fills, cymbal crashes, reverse hits, filter sweeps, white noise risers, and strategic silence. Each has a different character, and you'll learn when to use which." },
        { title: "Outro and ending", headline: "Leave the listener satisfied or wanting more", body: "The ending is the last impression. You'll learn different outro strategies: the fade, the hard stop, the callback to the intro, the unexpected twist. Each creates a different emotional response. A good ending makes the listener hit replay." },
      ], span: "normal" },
      { id: 20, title: "Layering and Depth", duration: "40–55 min", goal: "Teach frequency layering, stereo placement, and depth management.", hook: "Frequency stacking, stereo width, depth.", lessons: [
        { title: "Frequency layering", headline: "Assign each element its own frequency range for a clean mix", body: "Every element in your track needs its own frequency space. Bass lives in the lows, keys in the mids, hi-hats in the highs. When two elements compete for the same range, the mix gets muddy. You'll learn to assign frequency ranges, use EQ to carve space, and layer sounds that complement rather than conflict." },
        { title: "Stereo placement", headline: "Pan and widen elements to create a 3D soundstage", body: "Stereo placement turns a flat mix into a wide, immersive experience. You'll learn to pan instruments across the stereo field, use stereo widening effects for pads and effects, and keep critical elements (kick, bass, lead vocal) centered. The result is a mix that feels like you're standing in the middle of the music." },
        { title: "Depth with reverb and delay", headline: "Use time-based effects to create front-to-back dimension", body: "Reverb and delay don't just add space — they create depth. Dry sounds feel close; wet sounds feel far away. You'll use different amounts of reverb and delay to place elements at different distances from the listener, creating a three-dimensional mix that has foreground, midground, and background." },
        { title: "Textural layers", headline: "Add subtle details that reward repeated listening", body: "The best productions have layers that reveal themselves over time. Subtle textures, background noises, field recordings, and barely-audible details add richness without cluttering the mix. You'll learn to add these 'ear candy' elements — they won't be noticed on first listen, but they'll make the track feel more alive." },
        { title: "Density management", headline: "Know when to add and when to take away", body: "More layers don't always mean better music. There's a sweet spot where enough elements create richness without muddiness. You'll practice adding layers until the mix feels full, then removing them until each remaining element has space. Finding this balance is one of the most important production skills." },
      ], span: "normal" },
      { id: 21, title: "Automation", duration: "35–50 min", goal: "Teach parameter automation as an arrangement and mixing tool.", hook: "Volume rides, filter sweeps, parameter animation.", lessons: [
        { title: "What automation does", headline: "Make any parameter change over time automatically", body: "Automation lets you program parameter changes — volume, pan, filter cutoff, effect sends — that play back automatically. Instead of static settings, your mix becomes alive with movement. A filter that opens during the chorus, a reverb that swells during transitions, a volume that ducks during verses — all automation." },
        { title: "Volume automation", headline: "The most powerful mix tool most beginners ignore", body: "Before you reach for a compressor, try volume automation. Drawing subtle volume changes — boosting a quiet phrase, ducking a loud section, creating a smooth fade — gives you precise, musical control over dynamics. You'll practice drawing automation curves and hear how much more polished a mix sounds with careful volume rides." },
        { title: "Filter automation", headline: "Sweep frequencies for builds, transitions, and movement", body: "A slow filter sweep can transform a static loop into a building, breathing arrangement. You'll automate low-pass filter cutoff for classic builds, high-pass for breakdowns, and band-pass for telephone/radio effects. Filter automation is one of the most-used techniques in electronic music." },
        { title: "Effect automation", headline: "Bring effects in and out at exactly the right moments", body: "Reverb that's perfect for the chorus might drown the verse. Delay that enhances the breakdown might clutter the drop. You'll automate effect sends and parameters so effects appear only when needed, transforming automation from a mixing tool into an arrangement tool." },
        { title: "Creative automation", headline: "Surprise the listener with unexpected parameter changes", body: "Beyond functional automation, creative automation creates surprises: a sudden pitch drop, a filter slam, a stereo width collapse. These unexpected moments create memorable production signatures. You'll experiment with dramatic automation moves that break conventions and grab attention." },
      ], span: "normal" },
      { id: 22, title: "Genre Awareness", duration: "35–50 min", goal: "Teach genre conventions so students can work within and across styles.", hook: "Genre templates, conventions, fusion.", lessons: [
        { title: "Genre as template", headline: "Every genre has conventions — learn them to break them intentionally", body: "Genres aren't rules — they're shared expectations. Understanding genre conventions (BPM ranges, common instruments, arrangement patterns, mixing norms) lets you work within a genre convincingly or break conventions intentionally. You'll study the templates of 4-5 major genres and identify what makes each recognizable." },
        { title: "Drum patterns by genre", headline: "The rhythm DNA that defines each style", body: "The drum pattern is often the first thing that identifies a genre. Four-on-the-floor for house, breakbeats for drum & bass, trap hi-hats for hip-hop, live kits for rock. You'll program the signature drum patterns of multiple genres and understand the rhythmic DNA that defines each style." },
        { title: "Arrangement by genre", headline: "How structure and length vary across styles", body: "A pop song has a verse-chorus-bridge structure in 3.5 minutes. An EDM track has an intro-build-drop-breakdown-drop in 5-6 minutes. A hip-hop beat might loop for 3 minutes with minimal structure. You'll analyze genre-specific arrangement conventions and understand why each genre structures its time differently." },
        { title: "Sound palette by genre", headline: "The instruments, timbres, and textures that define each style", body: "Genre identity is partly about which sounds are used. 808 basses for trap, supersaw leads for trance, Rhodes pianos for neo-soul, distorted guitars for rock. You'll curate genre-specific sound palettes and learn to identify the timbral signatures that place a track in its genre." },
        { title: "Genre fusion", headline: "Combine elements from different genres for something fresh", body: "The most exciting music often lives between genres. You'll take elements from two different genres — the drums from one, the harmony from another, the sound palette from a third — and combine them intentionally. Genre fusion isn't random; it requires understanding conventions deeply enough to mix them purposefully." },
      ], span: "wide" },
      { id: 23, title: "Arrangement Project", duration: "45–65 min", goal: "Apply arrangement skills to create a fully structured production.", hook: "Full arrangement from loop to finished track.", lessons: [
        { title: "Loop to arrangement", headline: "Transform a simple loop into a full-length track structure", body: "Start with a single loop — your best idea. You'll extend it into a full arrangement by duplicating, varying, adding, and removing elements according to an energy curve you've designed. The loop is the seed; the arrangement is the flower." },
        { title: "Section development", headline: "Create distinct verse, chorus, and bridge sections", body: "Each section needs its own identity within the overall track. You'll develop your loop into distinct sections with different densities, instruments, and emotional weights. The challenge is maintaining cohesion while creating contrast." },
        { title: "Automation passes", headline: "Add volume rides, filter sweeps, and effect automation", body: "With the arrangement set, add automation to bring it to life. Volume rides for dynamics, filter sweeps for transitions, effect sends for space, and creative automation for surprises. Each pass adds a layer of polish and intentionality." },
        { title: "Transitions polish", headline: "Smooth every section boundary with fills, impacts, and sweeps", body: "Go through every section transition and add appropriate transitional elements: drum fills, cymbal crashes, reverse impacts, risers, or moments of silence. Smooth transitions are what separate amateur arrangements from professional ones." },
        { title: "Final evaluation", headline: "Listen through completely and assess the arrangement", body: "Play the track from start to finish without stopping. Does the energy curve work? Do the transitions flow? Is there enough contrast between sections? Does the ending satisfy? Make final adjustments and render your completed arrangement." },
      ], span: "normal" },
      { id: 24, title: "Production Capstone", duration: "60–90 min", goal: "Create a complete, fully arranged production demonstrating all skills.", hook: "Complete production from concept to final.", lessons: [
        { title: "Creative brief", headline: "Define your most ambitious production yet", body: "Write a detailed brief: genre, mood, energy curve, target audience, reference tracks, and what you want to prove with this piece. This capstone represents everything you've learned about arrangement and production — make it count." },
        { title: "Full production build", headline: "Produce the complete track with confidence and speed", body: "Build your most ambitious production. Drums, bass, harmony, melody, sound design, effects, automation — everything working together. Work efficiently: use templates, make fast decisions, and keep moving forward. The skills should feel natural by now." },
        { title: "Arrangement refinement", headline: "Polish the structure until every section earns its place", body: "Review your arrangement critically. Does every section serve a purpose? Are there parts that drag or feel redundant? Tighten, trim, and refine until the track holds attention from first beat to last. Every second should justify its existence." },
        { title: "Pre-mix preparation", headline: "Organize, label, and prepare for mixing", body: "Before mixing, organize: name every track, color-code by group, route buses, clean up unused clips, and check gain staging. A well-organized session makes mixing faster and more enjoyable. This housekeeping step separates efficient producers from chaotic ones." },
        { title: "Final render and reflection", headline: "Render your production and assess the journey", body: "Render the final mix, listen on multiple systems, and write a production reflection. What worked? What was difficult? What would you do differently? This self-awareness drives growth. Your production capstone is complete." },
      ], span: "normal" },
    ],
  },
  {
    title: "Mixing & Mastering",
    tagline: "Polish & Shine",
    description: "Balance, EQ, dynamics, space, bus processing, and mastering for release.",
    narrative: "Your tracks have great ideas — now make them sound professional. This course covers the complete mixing and mastering workflow: gain staging, EQ surgery, dynamic processing, spatial effects, bus processing, and mastering for release. You'll develop critical listening skills and learn the signal processing techniques that turn rough mixes into polished, competitive releases.",
    glyph: "◬",
    span: "normal",
    modules: [
      { id: 25, title: "Mixing Foundations", duration: "40–55 min", goal: "Teach level balancing, gain staging, and basic EQ/compression.", hook: "Balance, EQ, compression basics.", lessons: [
        { title: "Gain staging", headline: "Set proper levels before mixing begins", body: "Gain staging ensures every element in your mix has an appropriate level before you start processing. Too hot and you get clipping; too quiet and you lose resolution. You'll set up a consistent gain structure from input to output, creating headroom for processing and preventing the cascading level problems that ruin amateur mixes." },
        { title: "Static balance", headline: "Set faders to create a rough mix using only volume", body: "Before reaching for any plugin, create the best mix you can using only volume faders. This 'static balance' forces you to make important decisions about which elements are most important. The fader positions you set here will be roughly correct throughout the mixing process — everything else is refinement." },
        { title: "EQ for clarity", headline: "Remove problem frequencies and enhance useful ones", body: "Surgical EQ fixes problems: resonant ringing, muddy buildup, harsh frequencies. Musical EQ enhances character: adding warmth, brightness, or presence. You'll learn to identify problems by ear, use spectrum analyzers for confirmation, and apply EQ cuts and boosts that transform murky mixes into clear ones." },
        { title: "Compression for control", headline: "Tame dynamics and add punch to individual tracks", body: "Compression on individual tracks serves different purposes: controlling a dynamic vocal, adding punch to drums, adding sustain to guitars, or leveling a bass. You'll compress several different sources, learning how attack and release settings change the character — fast attack for control, slow attack for punch." },
        { title: "Pan for width", headline: "Spread elements across the stereo field", body: "Panning is free real estate. Moving elements left and right opens up space in the center for the most important parts. You'll pan a multi-track mix using the LCR (Left-Center-Right) approach and then refine with intermediate positions. A well-panned mix feels wide and spacious without any additional processing." },
        { title: "Reference checking", headline: "Compare your mix to professional references regularly", body: "Reference tracks keep you honest. You'll load a professional mix in a similar genre and A/B it against yours, checking balance, frequency content, dynamics, and width. The gaps you identify become your roadmap for improvement. Regular reference checking prevents you from drifting into a mix that only sounds good in your room." },
      ], span: "normal" },
      { id: 26, title: "Advanced Mixing", duration: "45–60 min", goal: "Teach bus processing, parallel techniques, and spatial mixing.", hook: "Buses, parallel processing, spatial mixing.", lessons: [
        { title: "Bus routing", headline: "Group related tracks for efficient processing", body: "Instead of processing every track individually, route related tracks to buses: a drum bus, a vocal bus, a synth bus. Processing the bus affects everything routed to it, creating cohesion and saving CPU. You'll set up a bus routing structure and hear how bus processing 'glues' groups of elements together." },
        { title: "Bus compression", headline: "Glue groups together with gentle bus compression", body: "A compressor on a drum bus gently squeezes all the drums together, making them feel like they were recorded in the same room. You'll apply bus compression to drum, vocal, and instrument buses, learning the gentle settings (low ratio, medium attack/release) that create cohesion without squashing dynamics." },
        { title: "Parallel processing", headline: "Blend processed and unprocessed signals for the best of both", body: "Parallel compression adds punch without losing dynamics. Parallel saturation adds warmth without losing clarity. You'll set up parallel processing chains — sending a copy of the signal through heavy processing and blending it with the clean original. This technique is used on virtually every professional mix." },
        { title: "Spatial mixing", headline: "Use reverb and delay to create depth in the mix", body: "A professional mix has three dimensions: width (panning), height (frequency), and depth (space). You'll use reverb and delay strategically to place elements at different depths — dry and intimate, slightly ambient, or distant and spacious. Consistent spatial design makes a mix feel like a coherent environment." },
        { title: "Vocal mixing", headline: "Make vocals clear, present, and emotionally connected", body: "Vocals are the most scrutinized element in a mix. You'll learn the vocal mixing chain: pitch correction (if needed), EQ for presence, compression for dynamics, de-essing for sibilance, and reverb/delay for space. The goal is a vocal that sits 'in front' of the mix without sounding disconnected from it." },
        { title: "Mix automation", headline: "Automate levels and effects for a dynamic, living mix", body: "A static mix is a boring mix. You'll add mix automation: volume rides for dynamic balance, effect sends that change between sections, EQ moves that respond to arrangement changes. Automation turns a competent mix into an exciting one that keeps the listener engaged." },
      ], span: "wide" },
      { id: 27, title: "Mix Troubleshooting", duration: "30–45 min", goal: "Diagnose and fix common mixing problems.", hook: "Muddy, harsh, thin, flat — fix them all.", lessons: [
        { title: "Muddy mixes", headline: "Identify and clear low-mid buildup", body: "Muddiness is the most common mixing problem. It happens when too many elements have energy in the 200-500 Hz range. You'll learn to identify muddiness by ear, use spectrum analysis to confirm, and apply targeted EQ cuts to clean up the low-mids without losing warmth." },
        { title: "Harsh mixes", headline: "Tame painful high frequencies without dulling the mix", body: "Harshness lives in the 2-5 kHz range and causes listener fatigue. You'll learn to identify harsh resonances, apply narrow EQ cuts or dynamic EQ to tame them, and use de-essing on non-vocal sources. The goal is a mix that's bright and clear without being painful." },
        { title: "Thin mixes", headline: "Add weight and warmth to skeletal-sounding mixes", body: "A thin mix lacks body and warmth. You'll diagnose thinness (usually caused by too much high-pass filtering or too few low-mid elements) and fix it with targeted EQ boosts, saturation for harmonic content, and arrangement additions that fill the frequency spectrum." },
        { title: "Flat dynamics", headline: "Restore life to over-compressed or static mixes", body: "Over-compression kills dynamics, making a mix feel flat and lifeless. You'll learn to recognize over-compression, back off compressor settings, use volume automation instead, and restore the dynamic range that makes music feel alive and exciting." },
        { title: "Mono compatibility", headline: "Ensure your mix translates when summed to mono", body: "Many playback systems are effectively mono: phone speakers, Bluetooth speakers, club systems. You'll check your mix in mono, identify phase cancellation issues, and fix stereo-width problems that cause elements to disappear. A mix that works in mono will sound even better in stereo." },
      ], span: "normal" },
      { id: 28, title: "Mastering Basics", duration: "35–50 min", goal: "Teach mastering concepts and a simple mastering chain.", hook: "EQ, compression, limiting, loudness targets.", lessons: [
        { title: "What mastering is", headline: "The final polish that prepares a mix for the world", body: "Mastering is the last step before release. It's about final EQ adjustments, dynamics processing, stereo enhancement, and loudness optimization. You'll learn what mastering can and can't fix, and why it's a separate discipline from mixing. A good master makes a good mix sound great; it can't save a bad mix." },
        { title: "Mastering EQ", headline: "Broad, gentle strokes to shape the overall tonal balance", body: "Mastering EQ uses broad, gentle curves — not surgical cuts. You'll apply subtle tonal shaping to the full mix: a slight low-end boost for warmth, a gentle high-shelf for air, a tiny mid cut for clarity. These small moves (0.5-2 dB) have a surprisingly large impact on the overall character." },
        { title: "Mastering compression", headline: "Glue the entire mix together with transparent dynamics processing", body: "A mastering compressor gently squeezes the entire mix, making it feel more cohesive and polished. You'll use very low ratios (1.5:1 to 2:1), medium attack and release, and aim for 1-3 dB of gain reduction. The result should be almost invisible — if you can hear the compression, it's too much." },
        { title: "Limiting and loudness", headline: "Hit streaming targets without destroying dynamics", body: "The limiter is the last processor in the mastering chain. It catches peaks and raises the overall loudness to competitive levels. You'll learn about LUFS targets for different platforms (Spotify, Apple Music, YouTube), use a loudness meter, and set your limiter to hit targets without audible distortion." },
        { title: "Final checks", headline: "Spectrum analysis, mono check, A/B comparison, and render", body: "Before rendering the master, run final checks: spectrum analysis to verify tonal balance, mono compatibility check, A/B against references, and a full listen-through for any artifacts. Then render in the correct format (WAV, 16-bit/44.1kHz for CD, 24-bit/48kHz for streaming). Your master is complete." },
      ], span: "normal" },
      { id: 29, title: "Mix & Master Project", duration: "50–75 min", goal: "Mix and master a complete track from rough to release-ready.", hook: "Full mix and master workflow.", lessons: [
        { title: "Receive and evaluate", headline: "Load a rough mix and create a game plan", body: "You'll load a multi-track session (your own or provided) and evaluate it: what's working, what needs fixing, and what's the target sound. Write a mixing game plan: priority issues, reference tracks, and the order of operations. Good planning prevents aimless tweaking." },
        { title: "Rough mix pass", headline: "Set static balance, pan positions, and basic processing", body: "Do a first pass: set levels, pan positions, basic EQ, and compression on individual tracks. Don't obsess over details — get the overall shape right first. This rough mix should sound decent on its own; everything after is refinement." },
        { title: "Detail mixing", headline: "Refine EQ, dynamics, and effects for each element", body: "Now refine: surgical EQ for problem frequencies, compression settings tailored to each source, effect sends for space, and bus processing for cohesion. Work through the mix element by element, comparing against your references after each change." },
        { title: "Mix automation", headline: "Add movement and dynamics with automation passes", body: "With the static mix polished, add automation: volume rides for vocal dynamics, effect send changes between sections, filter movements for transitions, and creative automation for impact. Do multiple passes, each focusing on a different aspect." },
        { title: "Master and deliver", headline: "Apply the mastering chain and render the final file", body: "Bounce the mix, load it into a mastering session, and apply your mastering chain: EQ, compression, stereo enhancement, and limiting. Hit your loudness target, run final checks, and render. You now have a release-ready track that you mixed and mastered yourself." },
      ], span: "wide" },
      { id: 30, title: "Mixing & Mastering Capstone", duration: "60–90 min", goal: "Demonstrate complete mixing and mastering competence.", hook: "Full mix and master from scratch.", lessons: [
        { title: "Session evaluation", headline: "Load a complex multi-track session and assess the challenge", body: "Your capstone is a complex, multi-track session with intentional problems: frequency conflicts, dynamic inconsistencies, poor gain staging, and arrangement issues that affect the mix. Evaluate everything and create a comprehensive mixing plan." },
        { title: "Complete mix", headline: "Mix the session to professional standards", body: "Apply everything you've learned: gain staging, static balance, individual processing, bus processing, parallel techniques, spatial design, and automation. Work efficiently, reference regularly, and don't get stuck on any single element. The complete mix should be competitive with professional references." },
        { title: "Master for release", headline: "Master the mix for streaming platforms", body: "Master your mix to streaming platform specifications. Hit LUFS targets, maintain dynamic range, ensure mono compatibility, and verify the tonal balance against references. The master should sound polished, competitive, and ready for public release." },
        { title: "Multi-format delivery", headline: "Render stems, instrumentals, and format variants", body: "Professional delivery often requires multiple formats: full mix, instrumental, acapella, stems by group, and masters at different loudness targets. You'll render all required deliverables from your session, organized and named professionally." },
        { title: "Portfolio piece", headline: "Document the before/after and add to your portfolio", body: "Create a before/after comparison of the rough and finished versions. Document your mixing decisions, signal flow, and key techniques. This becomes a portfolio piece that demonstrates your mixing and mastering competence to potential clients or collaborators." },
      ], span: "normal" },
    ],
  },
  {
    title: "Artist Development",
    tagline: "Your Voice",
    description: "Workflow optimization, creative identity, collaboration, release strategy, and career skills.",
    narrative: "The final course isn't about techniques — it's about becoming an artist. You'll develop your unique creative identity, optimize your workflow for speed and consistency, learn to collaborate effectively, understand release strategies and music business basics, and build sustainable creative habits. This course transforms a skilled producer into a complete artist.",
    glyph: "✦",
    span: "normal",
    modules: [
      { id: 31, title: "Creative Identity", duration: "35–50 min", goal: "Help students discover and develop their unique artistic voice.", hook: "Find your sound, your brand, your story.", lessons: [
        { title: "Influences and taste", headline: "Map your musical DNA — the artists and sounds that shaped you", body: "Your creative identity starts with your influences. You'll map your musical DNA: the artists you love, the sounds that excite you, the emotions you want to create. Understanding your taste isn't navel-gazing — it's the first step toward knowing what makes your music uniquely yours." },
        { title: "Signature elements", headline: "Identify the recurring choices that define your sound", body: "Every artist has signature elements — recurring sounds, techniques, or aesthetic choices that make their work recognizable. You'll analyze your own productions and identify patterns: do you always reach for certain sounds? Do your melodies have a characteristic shape? These patterns are the seeds of your signature sound." },
        { title: "Artistic statement", headline: "Write a clear description of what you create and why", body: "Can you describe your music in two sentences? Your artistic statement communicates what you make, who it's for, and what makes it different. You'll draft, refine, and test your statement — it'll guide creative decisions and help others understand your vision." },
        { title: "Visual identity basics", headline: "Colors, imagery, and aesthetic that match your sound", body: "Music is experienced visually too: artwork, photos, video, social media. You'll develop a basic visual identity that aligns with your sonic aesthetic — consistent colors, imagery style, and graphic elements that create recognition across platforms." },
        { title: "Evolving vs consistent", headline: "When to experiment and when to double down on your sound", body: "Artists face a tension: evolve and risk alienating fans, or stay consistent and risk becoming stale. You'll study artists who've navigated this successfully, develop a strategy for your own evolution, and learn that the best approach is usually 'consistent core, evolving surface.'" },
      ], span: "normal" },
      { id: 32, title: "Workflow Optimization", duration: "35–50 min", goal: "Build efficient, repeatable production workflows.", hook: "Templates, shortcuts, decision frameworks.", lessons: [
        { title: "Audit your workflow", headline: "Track where your time actually goes during production", body: "Most producers waste time on things that don't matter. You'll audit your last few sessions: how much time was spent on setup, browsing sounds, editing, mixing, and the actual creative work? The results will surprise you — and reveal exactly where to optimize." },
        { title: "Template mastery", headline: "Build starter templates that eliminate repetitive setup", body: "A great template eliminates 10-15 minutes of setup from every session. You'll build templates with pre-routed buses, default instruments loaded, reference track ready, and session markers placed. Open the template and you're making music immediately." },
        { title: "Keyboard shortcuts", headline: "Customize shortcuts for your most frequent actions", body: "Every mouse movement costs time and breaks flow. You'll identify your most frequent actions, assign keyboard shortcuts, and practice until they're automatic. The goal is to operate the Studio without thinking about the interface — your brain stays in creative mode." },
        { title: "Decision frameworks", headline: "Replace endless browsing with systematic selection", body: "Decision fatigue kills creativity. You'll build frameworks for common decisions: sound selection (describe, search, audition three, pick one), arrangement (follow the energy curve), and mixing (reference, adjust, move on). Frameworks replace aimless deliberation with efficient action." },
        { title: "Session management", headline: "Save, backup, version, and organize projects systematically", body: "Lost projects, unnamed sessions, and cluttered folders waste time and cause stress. You'll implement a session management system: consistent naming, version saves at milestones, backup routines, and folder organization. Never lose work again." },
      ], span: "normal" },
      { id: 33, title: "Collaboration", duration: "35–50 min", goal: "Teach effective collaboration skills for remote and in-person music making.", hook: "Stems, feedback, remote collaboration.", lessons: [
        { title: "Preparing stems", headline: "Export your project in a way others can work with", body: "Collaboration requires sharing — and stems are the currency. You'll learn to export clean stems: individual tracks or groups, properly labeled, at consistent levels, with and without effects. Good stems make collaboration smooth; bad stems create frustration and wasted time." },
        { title: "Giving feedback", headline: "How to critique music constructively and specifically", body: "Saying 'I like it' or 'it needs work' isn't helpful. You'll learn to give specific, actionable feedback: identifying what works and why, what could improve and how, and framing suggestions as possibilities rather than mandates. Good feedback is a skill that makes you a better collaborator and a better musician." },
        { title: "Receiving feedback", headline: "How to process criticism without ego", body: "Receiving feedback on your music is emotionally challenging — it's personal work. You'll learn to separate your ego from your art, evaluate feedback objectively, and decide which suggestions to implement. Not all feedback is correct, but all feedback contains information." },
        { title: "Remote collaboration tools", headline: "Share projects, communicate changes, and stay in sync", body: "Remote collaboration is the norm in modern music. You'll learn to use project sharing, version control, and communication tools to collaborate effectively across distances. Clear communication about changes, intentions, and deadlines prevents the confusion that kills remote projects." },
        { title: "Co-production etiquette", headline: "Navigate creative differences and ownership gracefully", body: "Who owns the song? Who gets credit? What happens when you disagree creatively? You'll learn the social skills of co-production: establishing roles, discussing ownership upfront, navigating creative differences, and maintaining relationships that lead to ongoing collaboration." },
      ], span: "wide" },
      { id: 34, title: "Release Strategy", duration: "35–50 min", goal: "Teach music release planning, distribution, and promotion basics.", hook: "Distribution, promotion, release planning.", lessons: [
        { title: "Release planning", headline: "Map out your release timeline from final master to launch day", body: "A release isn't just uploading a file — it's a planned campaign. You'll create a release timeline: final master (4 weeks out), distribution submission (3 weeks), promotional assets (2 weeks), pre-release promotion (1 week), and launch day activities. Planning turns a release from an afterthought into an event." },
        { title: "Distribution platforms", headline: "Get your music on Spotify, Apple Music, and everywhere else", body: "Digital distribution services deliver your music to streaming platforms and stores. You'll learn about major distributors, compare features and costs, and understand the submission process. By the end, you'll know exactly how to get your finished track in front of listeners worldwide." },
        { title: "Promotional assets", headline: "Create artwork, social content, and promotional materials", body: "Your music needs visual support: cover artwork, social media assets, short video clips, and written descriptions. You'll create a complete promotional package that presents your release professionally and gives you content to share across platforms." },
        { title: "Building an audience", headline: "Grow listeners through consistent releases and engagement", body: "Audiences don't appear overnight — they're built through consistent output and genuine engagement. You'll learn sustainable audience-building strategies: regular release schedules, platform-specific content, community participation, and the patience required to grow organically." },
        { title: "Analytics and learning", headline: "Read streaming data and audience insights to improve", body: "Streaming platforms provide data: who's listening, where, when, and how they found you. You'll learn to read analytics dashboards, identify trends, and use data to inform creative and promotional decisions. Data doesn't replace intuition — it supplements it." },
      ], span: "normal" },
      { id: 35, title: "Finishing Faster", duration: "40–55 min", goal: "Build habits and techniques for completing tracks efficiently.", hook: "Templates, time-boxing, shipping mindset.", lessons: [
        { title: "Decision fatigue", headline: "When too many choices slow you down — and how to break through", body: "Every decision costs mental energy. After making hundreds of small choices — which kick, which note, which reverb — your brain gets tired and starts avoiding decisions entirely. You'll learn to recognize decision fatigue, reduce unnecessary choices (templates, constraints, presets), and preserve your decision-making energy for the choices that actually matter." },
        { title: "Commitment points", headline: "Lock in decisions and stop second-guessing", body: "At some point, the drums need to be 'done.' The mix needs to be 'good enough.' The arrangement needs to be 'final.' You'll learn to identify commitment points — moments where you consciously decide 'this is settled, I'm moving on.' Without these, projects orbit endlessly. With them, projects finish. The ability to commit is a trainable skill." },
        { title: "Template systems", headline: "Pre-loaded routing, instruments, and effects for instant start", body: "Starting from scratch every time is a momentum killer. You'll build starter templates with pre-routed buses, your favorite instruments loaded, default effects chains in place, and section markers ready. Opening a template means you're making music in 30 seconds instead of spending 15 minutes on setup. Templates are the unsexy secret of prolific producers." },
        { title: "Time-boxing", headline: "Set time limits — 30 min for drums, 20 for bass — and commit", body: "Parkinson's Law: work expands to fill the time available. Without a time limit, you'll spend 3 hours on a drum pattern. With a 30-minute limit, you'll make faster decisions and end up with a result that's 90% as good in a fraction of the time. You'll practice time-boxing each production stage and experience how constraints accelerate creative output." },
        { title: "Quick mix strategies", headline: "Get 90% of the way in 20% of the time", body: "A 'quick mix' gets the balance, basic EQ, and rough compression done in 15-20 minutes. It won't win awards, but it'll sound good enough to evaluate the arrangement, share for feedback, or move on to the next track. You'll practice speed-mixing techniques and learn that perfectionism in mixing is often the enemy of finishing." },
        { title: "Shipping mindset", headline: "Done is better than perfect — the best producers finish and move on", body: "The biggest difference between amateurs and professionals isn't talent — it's finishing. Professionals ship imperfect work, learn from it, and improve on the next one. You'll adopt the shipping mindset: set a deadline, meet it, release the track, and start the next one. Your 10th finished track will be better than your first 'perfect' work-in-progress." },
      ], span: "normal" },
      { id: 36, title: "Capstone Project", duration: "60–90 min", goal: "Create a finished, release-ready track that represents your artistic voice.", hook: "Full production — plan to release.", lessons: [
        { title: "Project brief", headline: "Write a creative brief for your final, release-ready track", body: "Every serious project starts with a brief. You'll define your capstone track: genre, mood, tempo, key, target audience, and what makes it uniquely yours. You'll also set a quality bar — what 'finished' means for this specific track. The brief becomes your compass through the entire production process, keeping you aligned with your original vision." },
        { title: "Full production", headline: "Produce the complete track from drums to final texture", body: "This is everything you've learned, applied at once. Build drums with groove and dynamics, write a bass line that locks with the kick, add harmonic layers, write a hook, design sounds, layer textures, and create transitions. You'll work through the entire production process with confidence and speed, applying skills that have become second nature." },
        { title: "Mix and master", headline: "Apply Course 5 techniques for a polished, release-quality sound", body: "Take your produced track and mix it: balance levels, apply EQ for frequency separation, compress for dynamics, add reverb for depth, bus-process for cohesion, and prepare the master bus. Then check loudness targets, verify mono compatibility, and render. This is the full mixing workflow, applied to your own music, for a real release." },
        { title: "Metadata and export", headline: "Add title, artist name, artwork, and export for distribution", body: "A release-ready track needs more than just audio. You'll add metadata — track title, artist name, BPM, key, genre tags — and export in the correct formats for your target platforms. If you have artwork, you'll attach it. The result is a complete, professional package ready for streaming, sharing, or distribution." },
        { title: "Reflection and next steps", headline: "Listen back, reflect on your journey, and set future goals", body: "The final lesson isn't about production — it's about perspective. You'll listen to your capstone track, then listen to the Mini Sound Scene you made in Module 1. The distance between them represents everything you've learned. You'll reflect on your strengths, identify areas for growth, and set goals for your next phase of development. The course ends, but the journey continues." },
      ], span: "normal" },
    ],
  },
];

/* ── Per-course accent colors ── */
const COURSE_ACCENTS = [
  { bg: "bg-blue-500/15", border: "border-t-blue-500/40", text: "text-blue-400", ring: "ring-blue-400", fill: "fill-blue-500", stroke: "stroke-blue-500/40", hex: "#3b82f6" },
  { bg: "bg-violet-500/15", border: "border-t-violet-500/40", text: "text-violet-400", ring: "ring-violet-400", fill: "fill-violet-500", stroke: "stroke-violet-500/40", hex: "#8b5cf6" },
  { bg: "bg-orange-500/15", border: "border-t-orange-500/40", text: "text-orange-400", ring: "ring-orange-400", fill: "fill-orange-500", stroke: "stroke-orange-500/40", hex: "#f97316" },
  { bg: "bg-pink-500/15", border: "border-t-pink-500/40", text: "text-pink-400", ring: "ring-pink-400", fill: "fill-pink-500", stroke: "stroke-pink-500/40", hex: "#ec4899" },
  { bg: "bg-emerald-500/15", border: "border-t-emerald-500/40", text: "text-emerald-400", ring: "ring-emerald-400", fill: "fill-emerald-500", stroke: "stroke-emerald-500/40", hex: "#10b981" },
  { bg: "bg-yellow-500/15", border: "border-t-yellow-500/40", text: "text-yellow-400", ring: "ring-yellow-400", fill: "fill-yellow-500", stroke: "stroke-yellow-500/40", hex: "#eab308" },
];

/* ── Flatten lessons with state info ── */
type LessonState = "completed" | "active" | "available" | "locked";

interface FlatLesson {
  courseIdx: number;
  moduleIdx: number;
  moduleTitle: string;
  lessonIdx: number;
  lesson: LessonData;
  state: LessonState;
  globalIdx: number;
}

function flattenLessons(): FlatLesson[] {
  const flat: FlatLesson[] = [];
  let globalIdx = 0;

  COURSES.forEach((course, ci) => {
    course.modules.forEach((mod, mi) => {
      mod.lessons.forEach((lesson, li) => {
        let state: LessonState;
        if (ci === 0 && mi < 2) {
          state = "completed";
        } else if (ci === 0 && mi === 2 && li === 0) {
          state = "active";
        } else if (ci === 0) {
          state = "available";
        } else {
          state = "locked";
        }
        flat.push({ courseIdx: ci, moduleIdx: mi, moduleTitle: mod.title, lessonIdx: li, lesson, state, globalIdx });
        globalIdx++;
      });
    });
  });

  return flat;
}

/* ── Constants ── */
const COLS = 3;
const NODE_SIZE = 48;
const COL_GAP = 100;
const ROW_HEIGHT = 80;
const GRID_WIDTH = (COLS - 1) * COL_GAP + NODE_SIZE;

/* ── CourseBanner ── */
function CourseBanner({ course, index }: { course: CourseData; index: number }) {
  const accent = COURSE_ACCENTS[index];
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const flat = flattenLessons();
  const courseLessons = flat.filter(l => l.courseIdx === index);
  const completed = courseLessons.filter(l => l.state === "completed").length;
  const pct = Math.round((completed / totalLessons) * 100);

  return (
    <div className={`w-full rounded-2xl border border-t-2 ${accent.border} border-white/[0.08] backdrop-blur-xl bg-white/[0.04] p-5 mb-2`}>
      <div className="flex items-center gap-4">
        <span className="text-3xl">{course.glyph}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-[9px] font-mono border-white/[0.12] text-muted-foreground">
              Course {index + 1}
            </Badge>
            <span className={`text-xs font-mono ${accent.text}`}>{totalLessons} lessons</span>
          </div>
          <h2 className="text-lg font-mono font-bold text-foreground">{course.title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{course.tagline} — {course.description}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Progress value={pct} className="h-1.5 flex-1" />
        <span className="text-[10px] font-mono text-muted-foreground">{pct}%</span>
      </div>
    </div>
  );
}

/* ── LessonNode ── */
function LessonNode({ flat, isSelected, onSelect }: { flat: FlatLesson; isSelected: boolean; onSelect: () => void }) {
  const accent = COURSE_ACCENTS[flat.courseIdx];

  const stateClasses: Record<LessonState, string> = {
    completed: `bg-white/[0.12] border-2 border-white/20 ${accent.text}`,
    active: `border-2 ${accent.text} animate-pulse-ring`,
    available: `border-2 border-white/[0.15] text-foreground/60 hover:border-white/30`,
    locked: `border-2 border-white/[0.06] text-muted-foreground/30`,
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={flat.state !== "locked" ? onSelect : undefined}
            className={`
              w-12 h-12 rounded-full flex items-center justify-center shrink-0
              transition-all duration-300
              ${stateClasses[flat.state]}
              ${flat.state !== "locked" ? "cursor-pointer hover:scale-110" : "cursor-default"}
              ${isSelected ? `ring-2 ${accent.ring} ring-offset-2 ring-offset-background scale-110` : ""}
            `}
            style={flat.state === "active" ? { boxShadow: `0 0 20px ${accent.hex}40` } : undefined}
          >
            {flat.state === "completed" && <Check className="w-5 h-5" />}
            {flat.state === "active" && <span className="w-3 h-3 rounded-full bg-current" />}
            {flat.state === "available" && <span className="text-xs font-mono font-bold">{flat.lessonIdx + 1}</span>}
            {flat.state === "locked" && <Lock className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[240px]">
          <p className="font-mono font-bold text-xs">{flat.lesson.title}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{flat.lesson.headline}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ── Expanded lesson card ── */
function ExpandedLessonCard({ flat, onClose }: { flat: FlatLesson; onClose: () => void }) {
  const accent = COURSE_ACCENTS[flat.courseIdx];

  return (
    <div
      className={`w-full rounded-xl border border-l-[3px] backdrop-blur-xl bg-white/[0.06] p-4 animate-slide-up cursor-pointer`}
      style={{ borderLeftColor: accent.hex }}
      onClick={onClose}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-mono font-bold ${accent.bg} ${accent.text}`}>
          {flat.lessonIdx + 1}
        </div>
        <div>
          <h4 className="text-sm font-mono font-bold text-foreground">{flat.lesson.title}</h4>
          <p className="text-xs text-foreground/60 mt-0.5">{flat.lesson.headline}</p>
        </div>
      </div>
      <p className="text-sm text-foreground/70 leading-relaxed">{flat.lesson.body}</p>
    </div>
  );
}

/* ── SVG path connectors ── */
function SnakeConnectors({ lessons, nodePositions }: { lessons: FlatLesson[]; nodePositions: { x: number; y: number }[] }) {
  if (nodePositions.length < 2) return null;

  const paths: string[] = [];
  const halfNode = NODE_SIZE / 2;

  for (let i = 0; i < nodePositions.length - 1; i++) {
    // Don't draw connector across course boundaries
    if (lessons[i].courseIdx !== lessons[i + 1].courseIdx) continue;

    const a = { x: nodePositions[i].x + halfNode, y: nodePositions[i].y + halfNode };
    const b = { x: nodePositions[i + 1].x + halfNode, y: nodePositions[i + 1].y + halfNode };

    if (Math.abs(a.y - b.y) < 2) {
      // Same row — straight line
      paths.push(`M${a.x},${a.y} L${b.x},${b.y}`);
    } else {
      // Row transition — U-turn curve
      const midY = (a.y + b.y) / 2;
      paths.push(`M${a.x},${a.y} C${a.x},${midY} ${b.x},${midY} ${b.x},${b.y}`);
    }
  }

  const maxY = Math.max(...nodePositions.map(p => p.y)) + ROW_HEIGHT;

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={GRID_WIDTH}
      height={maxY}
      style={{ overflow: "visible" }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="hsl(var(--muted-foreground) / 0.15)" strokeWidth={2} strokeLinecap="round" />
      ))}
    </svg>
  );
}

/* ── Main page ── */
export default function MockCurriculum() {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const allLessons = useMemo(() => flattenLessons(), []);

  // Group lessons by course
  const courseGroups = useMemo(() => {
    const groups: { courseIdx: number; lessons: FlatLesson[] }[] = [];
    let currentCourse = -1;
    allLessons.forEach((l) => {
      if (l.courseIdx !== currentCourse) {
        groups.push({ courseIdx: l.courseIdx, lessons: [] });
        currentCourse = l.courseIdx;
      }
      groups[groups.length - 1].lessons.push(l);
    });
    return groups;
  }, [allLessons]);

  return (
    <div className="overflow-auto h-full min-h-screen pb-24">
      <div className="max-w-md mx-auto px-5 py-8 space-y-6">
        {/* Header */}
        <div className="animate-fade-in text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-mono font-black tracking-tight">Your Path</h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            6 courses · 36 modules · {allLessons.length} lessons
          </p>
        </div>

        {/* Snake path per course */}
        {courseGroups.map(({ courseIdx, lessons }) => (
          <CourseSnakeSection
            key={courseIdx}
            courseIdx={courseIdx}
            lessons={lessons}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Per-course snake section ── */
function CourseSnakeSection({
  courseIdx,
  lessons,
  selectedIdx,
  onSelect,
}: {
  courseIdx: number;
  lessons: FlatLesson[];
  selectedIdx: number | null;
  onSelect: (idx: number | null) => void;
}) {
  const course = COURSES[courseIdx];

  // Compute rows of 3 with zigzag
  const rows: FlatLesson[][] = [];
  for (let i = 0; i < lessons.length; i += COLS) {
    const row = lessons.slice(i, i + COLS);
    const rowIdx = Math.floor(i / COLS);
    if (rowIdx % 2 === 1) row.reverse();
    rows.push(row);
  }

  // Compute node positions for SVG connectors
  const nodePositions = useMemo(() => {
    const positions: { x: number; y: number }[] = [];
    let lessonLinearIdx = 0;

    for (let ri = 0; ri < rows.length; ri++) {
      const row = rows[ri];
      for (let ci = 0; ci < row.length; ci++) {
        const isReversed = ri % 2 === 1;
        // In grid, items are placed in order; the visual reversal is via flex-row-reverse
        // For SVG we need actual visual positions
        const colIdx = isReversed ? (COLS - 1 - ci) : ci;
        // Wait — the row was already reversed in the data. So ci=0 is visually leftmost.
        // Actually no: we reversed the array, then render left-to-right. So ci=0 IS the first visually.
        // For reversed rows: the array was reversed, so ci=0 corresponds to the rightmost column originally.
        // But visually, ci=0 renders at col 0 (left). Hmm, let me think again.
        // We slice(i, i+COLS) then reverse(). So for reversed rows, the first item in the array
        // is the last item from the original slice. We render them left-to-right in flex.
        // Actually we use flex-row-reverse on odd rows... wait no, we reversed the array instead.
        // Let me just use the array order = visual left-to-right order.
        const x = ci * COL_GAP;
        const y = ri * ROW_HEIGHT;
        positions.push({ x, y });
        lessonLinearIdx++;
      }
    }
    return positions;
  }, [rows]);

  // Track module boundaries for inline labels
  const moduleBreaks = useMemo(() => {
    const breaks: { afterRowIdx: number; title: string }[] = [];
    let lessonCount = 0;
    for (let ri = 0; ri < rows.length; ri++) {
      for (let ci = 0; ci < rows[ri].length; ci++) {
        const l = rows[ri][ci];
        // Check if next lesson in original order starts a new module
        if (ci === rows[ri].length - 1 && ri < rows.length - 1) {
          const nextRow = rows[ri + 1];
          if (nextRow.length > 0 && nextRow[0].moduleIdx !== l.moduleIdx) {
            breaks.push({ afterRowIdx: ri, title: nextRow[0].moduleTitle });
          }
        }
      }
      lessonCount += rows[ri].length;
    }
    return breaks;
  }, [rows]);

  // Find which row the selected lesson is in (if in this course)
  const selectedRowIdx = useMemo(() => {
    if (selectedIdx == null) return -1;
    for (let ri = 0; ri < rows.length; ri++) {
      for (const l of rows[ri]) {
        if (l.globalIdx === selectedIdx) return ri;
      }
    }
    return -1;
  }, [selectedIdx, rows]);

  const selectedLesson = selectedIdx != null ? lessons.find(l => l.globalIdx === selectedIdx) : null;

  return (
    <div>
      <CourseBanner course={course} index={courseIdx} />

      <div className="relative flex justify-center">
        {/* SVG connectors */}
        <div className="relative" style={{ width: GRID_WIDTH }}>
          <SnakeConnectors lessons={(() => {
            // Flatten rows back to visual order for connector drawing
            const ordered: FlatLesson[] = [];
            rows.forEach(r => ordered.push(...r));
            return ordered;
          })()} nodePositions={nodePositions} />

          {/* Node rows */}
          {rows.map((row, ri) => {
            const moduleBreak = moduleBreaks.find(b => b.afterRowIdx === ri);

            return (
              <div key={ri}>
                <div
                  className="flex items-center"
                  style={{ height: ROW_HEIGHT }}
                >
                  {row.map((flat, ci) => (
                    <div
                      key={flat.globalIdx}
                      className="flex items-center justify-center"
                      style={{ width: ci < COLS - 1 ? COL_GAP : NODE_SIZE }}
                    >
                      <LessonNode
                        flat={flat}
                        isSelected={selectedIdx === flat.globalIdx}
                        onSelect={() => onSelect(selectedIdx === flat.globalIdx ? null : flat.globalIdx)}
                      />
                    </div>
                  ))}
                </div>

                {/* Expanded card below the row */}
                {selectedRowIdx === ri && selectedLesson && (
                  <div className="my-2">
                    <ExpandedLessonCard flat={selectedLesson} onClose={() => onSelect(null)} />
                  </div>
                )}

                {/* Module boundary label */}
                {moduleBreak && (
                  <div className="flex items-center gap-2 my-2 px-1">
                    <div className="h-px flex-1 bg-white/[0.08]" />
                    <span className="text-[10px] font-mono text-muted-foreground/50 whitespace-nowrap">{moduleBreak.title}</span>
                    <div className="h-px flex-1 bg-white/[0.08]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
