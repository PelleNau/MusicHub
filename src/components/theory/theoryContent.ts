export interface LessonQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonStep {
  title: string;
  body: string;
  keyTakeaway: string;
  example?: {
    type: "audio" | "keyboard";
    label: string;
    notes?: number[];
  };
  callout?: {
    type: "tip" | "warning" | "remember";
    text: string;
  };
  quiz?: LessonQuiz;
}

export interface TheoryTopicContent {
  title: string;
  lessons: LessonStep[];
  // Legacy fields kept for fallback
  whatIsIt: string;
  whyItMatters: string;
  quickFacts: string[];
  tips: string[];
  deepDive: { heading: string; body: string }[];
}

export const THEORY_CONTENT: Record<string, TheoryTopicContent> = {
  intervals: {
    title: "Intervals",
    lessons: [
      {
        title: "What Is an Interval?",
        body: "An interval is the distance in pitch between two notes, measured in semitones (half steps). Every melody you hum, every chord you play, and every harmony you hear is built from intervals. They are the fundamental building blocks of all music.",
        keyTakeaway: "Intervals are the atoms of music — everything else is built from them.",
        example: {
          type: "audio",
          label: "Listen: Unison (C) vs Octave (C → C)",
          notes: [0, 0],
        },
      },
      {
        title: "Measuring in Semitones",
        body: "A semitone (half step) is the smallest interval in Western music — one piano key to the next. A whole step is two semitones. From C to D is 2 semitones (major 2nd). From C to E is 4 semitones (major 3rd). From C to G is 7 semitones (perfect 5th). Learn the semitone count for each interval and you can build any chord or scale from scratch.",
        keyTakeaway: "Count semitones from one note to the next — that number defines the interval.",
        example: {
          type: "keyboard",
          label: "C to each note: count the semitones",
          notes: [0, 2, 4, 5, 7, 9, 11],
        },
        callout: {
          type: "tip",
          text: "Train your ear by associating each interval with a famous melody: Perfect 5th → Star Wars theme, Minor 2nd → Jaws.",
        },
        quiz: {
          question: "How many semitones make a perfect 5th?",
          options: ["5", "6", "7", "8"],
          correctIndex: 2,
          explanation: "A perfect 5th is 7 semitones — for example, from C up to G.",
        },
      },
      {
        title: "Consonance vs Dissonance",
        body: "Consonant intervals (3rds, 5ths, 6ths) blend smoothly and feel resolved. Dissonant intervals (2nds, 7ths, tritones) create tension that wants to move somewhere. Music gets its emotional power from alternating between the two. In production, dissonance adds edge — think detuned synth leads or minor 2nd clusters in horror scores.",
        keyTakeaway: "Consonance = stability, dissonance = tension. Great music uses both.",
        example: {
          type: "audio",
          label: "Listen: Perfect 5th (consonant) vs Tritone (dissonant)",
          notes: [0, 7],
        },
        quiz: {
          question: "Which interval is the most dissonant within one octave?",
          options: ["Perfect 4th", "Major 3rd", "Tritone", "Minor 6th"],
          correctIndex: 2,
          explanation: "The tritone (6 semitones) divides the octave exactly in half and is the most dissonant interval.",
        },
      },
      {
        title: "Compound Intervals",
        body: "Intervals larger than an octave are called compound intervals. A 9th is an octave plus a 2nd. An 11th is an octave plus a 4th. A 13th is an octave plus a 6th. These are common in jazz voicings and give chords an extended, colorful quality. When you see 'Cmaj9' in a chord chart, that '9' refers to a compound interval stacked on top.",
        keyTakeaway: "A 9th is just a 2nd up an octave — compound intervals are simple intervals stretched wider.",
        callout: {
          type: "remember",
          text: "9th = 2nd + octave, 11th = 4th + octave, 13th = 6th + octave. The pattern is always +7 semitones.",
        },
      },
      {
        title: "Interval Inversion",
        body: "Any interval can be inverted by moving the lower note up an octave or the upper note down. The rule: the original + its inversion = 12 semitones. A major 3rd (4 semitones) inverts to a minor 6th (8 semitones). This is key for voice leading — choosing which note to put in the bass changes the character without changing the notes.",
        keyTakeaway: "Inversion flips the relationship — a 3rd becomes a 6th, a 2nd becomes a 7th.",
        example: {
          type: "keyboard",
          label: "Major 3rd (C→E) inverts to Minor 6th (E→C)",
          notes: [0, 4],
        },
        quiz: {
          question: "What does a major 3rd (4 semitones) invert to?",
          options: ["Major 6th (9 semitones)", "Minor 6th (8 semitones)", "Perfect 5th (7 semitones)", "Minor 3rd (3 semitones)"],
          correctIndex: 1,
          explanation: "Original + inversion = 12. So 4 + 8 = 12. A major 3rd inverts to a minor 6th (8 semitones).",
        },
      },
      {
        title: "Intervals in Production",
        body: "Power chords in rock are just root + perfect 5th — the simplest and most powerful interval pairing. When two synth oscillators are detuned by a few cents, you're creating a near-unison interval that produces a thick chorus effect. Stacking multiple detuned oscillators is how 'super saw' patches get their width. Every production decision about pitch is an interval decision.",
        keyTakeaway: "Understanding intervals lets you design sounds, write harmonies, and mix with intention.",
        callout: {
          type: "tip",
          text: "Parallel 3rds and 6ths create smooth vocal harmonies. Parallel 4ths and 5ths sound medieval. Parallel 2nds sound tense.",
        },
      },
    ],
    whatIsIt: "An interval is the distance in pitch between two notes, measured in semitones (half steps). Every melody, chord, and harmony is built from intervals.",
    whyItMatters: "Intervals are the atoms of music. Recognizing them by ear lets you transcribe melodies, build chords from scratch, and understand why certain note combinations sound tense or resolved.",
    quickFacts: [
      "There are 12 unique intervals within one octave.",
      "Perfect intervals (unison, 4th, 5th, octave) sound open and stable.",
      "A tritone (6 semitones) is the most dissonant interval.",
      "Intervals can be melodic (sequential) or harmonic (simultaneous).",
      "Inverting an interval: a 3rd becomes a 6th, a 2nd becomes a 7th.",
    ],
    tips: [
      "Associate each interval with a famous melody for ear training.",
      "Power chords are root + perfect 5th.",
      "Detuned oscillators create near-unison intervals for chorus effects.",
    ],
    deepDive: [
      { heading: "Consonance vs. Dissonance", body: "Consonant intervals (3rds, 5ths, 6ths) blend smoothly. Dissonant intervals (2nds, 7ths, tritones) create tension." },
      { heading: "Compound Intervals", body: "Intervals larger than an octave: 9th = octave + 2nd, 11th = octave + 4th." },
      { heading: "Interval Inversion", body: "Original + inversion = 12 semitones. Major 3rd inverts to minor 6th." },
    ],
  },

  scales: {
    title: "Scales",
    lessons: [
      {
        title: "What Is a Scale?",
        body: "A scale is an ordered set of notes spanning an octave, defined by a specific pattern of intervals between each step. Think of a scale as a palette of colors that 'go together' — choosing the right scale for a piece means choosing which notes belong and which don't.",
        keyTakeaway: "A scale is your note palette — it tells you which notes belong together in a key.",
        example: {
          type: "audio",
          label: "Listen: C Major scale ascending",
          notes: [0, 2, 4, 5, 7, 9, 11],
        },
      },
      {
        title: "The Major Scale Formula",
        body: "The major scale follows the interval pattern Whole-Whole-Half-Whole-Whole-Whole-Half (W-W-H-W-W-W-H). A whole step is 2 semitones, a half step is 1. This single formula generates every major scale — just start on any note and apply the pattern. C major uses all white keys because the pattern naturally avoids sharps and flats from C.",
        keyTakeaway: "W-W-H-W-W-W-H — memorize this formula and you can build any major scale.",
        example: {
          type: "keyboard",
          label: "C Major: W-W-H-W-W-W-H",
          notes: [0, 2, 4, 5, 7, 9, 11],
        },
        callout: {
          type: "tip",
          text: "Start with C major (all white keys) to internalize the sound, then transpose to other roots.",
        },
        quiz: {
          question: "What is the interval pattern of the major scale?",
          options: ["W-H-W-W-H-W-W", "W-W-H-W-W-W-H", "W-W-W-H-W-W-H", "H-W-W-W-H-W-W"],
          correctIndex: 1,
          explanation: "The major scale always follows Whole-Whole-Half-Whole-Whole-Whole-Half.",
        },
      },
      {
        title: "Natural Minor and Pentatonics",
        body: "The natural minor scale uses W-H-W-W-H-W-W, producing a darker, more melancholic sound. Pentatonic scales use only 5 notes (removing the two 'tension' notes from major or minor), making them nearly impossible to sound bad with. The minor pentatonic is the foundation of blues, rock, and pop melody.",
        keyTakeaway: "Minor = darker mood. Pentatonic = foolproof melody maker.",
        example: {
          type: "audio",
          label: "Listen: A Minor Pentatonic",
          notes: [9, 0, 2, 5, 7],
        },
        quiz: {
          question: "How many notes does a pentatonic scale have?",
          options: ["4", "5", "6", "7"],
          correctIndex: 1,
          explanation: "Penta = five. Pentatonic scales use 5 notes per octave, making them versatile and forgiving.",
        },
      },
      {
        title: "Scale Degrees and Their Roles",
        body: "Each note in a scale has a function: the 1st (tonic) is home base, the 5th (dominant) creates tension that pulls back to tonic, and the 7th (leading tone) in major scales is only a half step below the tonic, creating a strong upward pull. Understanding these roles helps you write melodies that feel purposeful rather than random.",
        keyTakeaway: "Scale degrees aren't equal — some notes pull, some rest, some float.",
        callout: {
          type: "remember",
          text: "Tonic (1) = home. Dominant (5) = tension. Leading tone (7) = strongest pull back to 1.",
        },
      },
      {
        title: "Beyond Major and Minor",
        body: "Harmonic minor raises the 7th note, creating an exotic augmented 2nd gap. Melodic minor raises both the 6th and 7th ascending. The blues scale adds a ♭5 'blue note' to minor pentatonic. Whole tone and diminished scales divide the octave symmetrically for floating, ambiguous colors. Each variant exists to solve a specific musical problem.",
        keyTakeaway: "Dozens of scales exist — each one is a different emotional palette waiting to be used.",
        example: {
          type: "audio",
          label: "Listen: Harmonic Minor (exotic raised 7th)",
          notes: [0, 2, 3, 5, 7, 8, 11],
        },
      },
      {
        title: "Scales in Production",
        body: "Most DAWs let you lock MIDI input to a scale, eliminating wrong notes. But understanding scales deeply lets you intentionally break rules — chromatic passing tones, borrowed notes from parallel keys, and modal interchange all require knowing which scale you're departing from. The best melodies use notes outside the scale as spice, not by accident.",
        keyTakeaway: "Know the rules so you can break them with intention — that's where creativity lives.",
        callout: {
          type: "tip",
          text: "If a melody sounds 'wrong,' you're likely hitting a note outside the current scale. Use the Scale Finder to check.",
        },
      },
    ],
    whatIsIt: "A scale is an ordered set of notes spanning an octave, defined by a specific pattern of intervals.",
    whyItMatters: "Knowing scales means knowing which notes 'belong together' in a key.",
    quickFacts: [
      "Major scale: W-W-H-W-W-W-H.",
      "Natural minor: W-H-W-W-H-W-W.",
      "Pentatonic scales (5 notes) are universal.",
      "Blues scale adds a ♭5 to minor pentatonic.",
      "Most Western music uses roughly 10-15 scales.",
    ],
    tips: [
      "Start with major and minor pentatonic.",
      "Harmonic minor gives a 'Middle Eastern' flavor.",
      "Use the scale finder to diagnose wrong-sounding melodies.",
    ],
    deepDive: [
      { heading: "Scale Degrees", body: "Tonic = home, dominant = tension, leading tone = pull." },
      { heading: "Beyond Major and Minor", body: "Melodic minor, harmonic minor, and blues scales add color." },
      { heading: "Scales in Production", body: "Lock MIDI to a scale, but learn to break rules intentionally." },
    ],
  },

  modes: {
    title: "Modes",
    lessons: [
      {
        title: "What Are Modes?",
        body: "Modes are scales derived by starting on different degrees of a parent scale. The seven modes of the major scale each share the same notes but have a completely different character depending on which note you treat as 'home.' It's like looking at the same landscape from seven different vantage points.",
        keyTakeaway: "Same notes, different starting point = completely different mood.",
        example: {
          type: "audio",
          label: "Listen: C Ionian (major) vs D Dorian — same notes, different feel",
          notes: [0, 2, 4, 5, 7, 9, 11],
        },
      },
      {
        title: "The Seven Mode Names",
        body: "The seven modes of major, in order: Ionian (I — the major scale itself), Dorian (II — minor with a bright 6th), Phrygian (III — minor with a dark ♭2), Lydian (IV — major with a dreamy #4), Mixolydian (V — major with a bluesy ♭7), Aeolian (VI — the natural minor scale), and Locrian (VII — diminished, very unstable).",
        keyTakeaway: "Seven modes = seven emotional colors from one set of notes: bright to dark.",
        callout: {
          type: "remember",
          text: "Mnemonic: I Don't Particularly Like Modes A Lot → Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian.",
        },
        quiz: {
          question: "Which mode is built on the 2nd degree of the major scale?",
          options: ["Phrygian", "Lydian", "Dorian", "Mixolydian"],
          correctIndex: 2,
          explanation: "Dorian is the mode built on the 2nd degree. It's minor with a characteristically bright natural 6th.",
        },
      },
      {
        title: "The Characteristic Note",
        body: "Each mode has one note that distinguishes it from plain major or minor. Dorian's is the natural 6th (vs minor's ♭6). Lydian's is the #4. Mixolydian's is the ♭7. When writing modal music, emphasize this characteristic note in your melody — without it, the listener's ear defaults to hearing plain major or minor.",
        keyTakeaway: "Find the ONE note that makes each mode unique — emphasize it to make the mode audible.",
        example: {
          type: "keyboard",
          label: "Dorian's characteristic note: the natural 6th",
          notes: [0, 2, 3, 5, 7, 9, 10],
        },
        quiz: {
          question: "What is Lydian's characteristic note?",
          options: ["♭7", "#4", "♭2", "Natural 6th"],
          correctIndex: 1,
          explanation: "Lydian is major with a raised (sharp) 4th — that #4 gives it its dreamy, floating quality.",
        },
      },
      {
        title: "Modal vs Tonal Music",
        body: "Tonal music uses chord progressions (especially V→I) to establish a key. Modal music often uses drones, pedal tones, or one/two-chord vamps to let the mode's color shine. Too many chord changes pull the ear into tonal hearing and the modal flavor disappears. Miles Davis's 'So What' sits on one chord for 16 bars — pure Dorian.",
        keyTakeaway: "To make a mode heard, simplify the harmony — one or two chords, let the melody carry the modal color.",
        callout: {
          type: "tip",
          text: "Try writing a melody over a single sustained chord. The mode will become immediately audible.",
        },
      },
      {
        title: "Modes in Modern Production",
        body: "Lo-fi beats love Dorian (minor with a brighter 6th). Synthwave thrives on Mixolydian (major but edgy). Film composers reach for Lydian for wonder and mystery (John Williams uses it constantly). Phrygian appears in flamenco, metal, and Middle Eastern electronic music. Each mode is a preset emotional palette ready to use.",
        keyTakeaway: "Every genre has its favorite modes — learn which mode fits which vibe.",
        example: {
          type: "audio",
          label: "Listen: F Lydian — dreamy, floating #4",
          notes: [5, 7, 9, 11, 0, 2, 4],
        },
      },
    ],
    whatIsIt: "Modes are scales derived by starting on different degrees of a parent scale.",
    whyItMatters: "Modes give you seven emotional colors from a single set of notes.",
    quickFacts: [
      "7 modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian.",
      "Dorian: minor with raised 6th — jazz, funk, lo-fi.",
      "Lydian: raised 4th — dreamy, film scores.",
      "Mixolydian: flatted 7th — blues, rock.",
      "Locrian: diminished 5th — very unstable.",
    ],
    tips: [
      "Emphasize the mode's root as 'home' to hear the modal character.",
      "Dorian is the go-to for minor grooves needing brightness.",
      "Mixolydian works perfectly over dominant 7th vamps.",
    ],
    deepDive: [
      { heading: "The Characteristic Note", body: "Each mode has one distinguishing note from plain major/minor." },
      { heading: "Modal vs Tonal", body: "Modal music uses drones and vamps; tonal music uses chord progressions." },
      { heading: "Modes in Production", body: "Lo-fi = Dorian, synthwave = Mixolydian, film = Lydian." },
    ],
  },

  "chord-construction": {
    title: "Chord Construction",
    lessons: [
      {
        title: "Building a Triad",
        body: "A chord is built by stacking intervals above a root note. The simplest chord — a triad — uses three notes: root, 3rd, and 5th. A major triad stacks a major 3rd (4 semitones) then a minor 3rd (3 semitones). A minor triad reverses this: minor 3rd first, then major 3rd. The difference between major and minor is just one semitone on the 3rd.",
        keyTakeaway: "Major vs minor comes down to one semitone — that tiny shift changes everything.",
        example: {
          type: "keyboard",
          label: "C Major triad: C-E-G (0, 4, 7)",
          notes: [0, 4, 7],
        },
        quiz: {
          question: "What interval separates a major triad from a minor triad?",
          options: ["The 5th is different", "The 3rd is one semitone lower in minor", "The root changes", "The 5th is one semitone higher in major"],
          correctIndex: 1,
          explanation: "Major has a major 3rd (4 semitones), minor has a minor 3rd (3 semitones). Same root, same 5th — only the 3rd changes by one semitone.",
        },
      },
      {
        title: "Seventh Chords",
        body: "Add a 4th note on top of a triad and you get a seventh chord. Major 7th (maj7) sounds dreamy and lush. Dominant 7th (dom7) sounds bluesy and tense. Minor 7th (min7) sounds smooth and mellow. Diminished 7th (dim7) sounds dark and suspenseful. Each type of 7th chord has a distinct personality.",
        keyTakeaway: "The 7th adds depth — maj7 = dreamy, dom7 = bluesy, min7 = smooth.",
        example: {
          type: "audio",
          label: "Listen: Cmaj7 — lush and dreamy",
          notes: [0, 4, 7, 11],
        },
        callout: {
          type: "tip",
          text: "Start with triads and add the 7th — hear what that one extra note contributes to the color.",
        },
      },
      {
        title: "Sus and Add Chords",
        body: "Suspended (sus) chords replace the 3rd with a 2nd (sus2) or 4th (sus4), removing the major/minor quality entirely. The result is open and ambiguous. Add chords (add9, add11) keep the triad intact and add one extension without the 7th, sounding more modern and spacious than full seventh chords.",
        keyTakeaway: "Remove the 3rd for openness (sus), or add one note for color (add9, add11).",
        example: {
          type: "keyboard",
          label: "Csus4: C-F-G (no 3rd = no major/minor)",
          notes: [0, 5, 7],
        },
        quiz: {
          question: "What does a sus4 chord replace?",
          options: ["The root", "The 5th", "The 3rd (with a 4th)", "The octave"],
          correctIndex: 2,
          explanation: "Suspended chords replace the 3rd — sus4 uses a 4th instead, removing the major/minor quality.",
        },
      },
      {
        title: "Extended and Altered Chords",
        body: "Beyond 7ths, you can stack 9ths (2nd up an octave), 11ths (4th up), and 13ths (6th up). Altered chords modify extensions with sharps or flats. The 7#9 ('Hendrix chord') has both a major 3rd and a sharp 9th, creating an aggressive, bluesy clash. These chords are the vocabulary of jazz and neo-soul.",
        keyTakeaway: "Extensions add color; alterations add tension. Stack as many as the style demands.",
        callout: {
          type: "remember",
          text: "In a mix, you don't need all chord tones. Drop the 5th first (least colorful), then the root (if the bass covers it).",
        },
      },
      {
        title: "Voice Leading and Inversions",
        body: "The same chord sounds completely different depending on which note is in the bass (inversions) and how notes are spaced (voicing). Close voicings within one octave sound dense. Open voicings across octaves sound spacious. Good voice leading means moving each note the shortest distance to the next chord — this is what makes progressions flow.",
        keyTakeaway: "How you arrange the notes matters as much as which notes you choose.",
        example: {
          type: "keyboard",
          label: "C major inversions: root, 1st, 2nd",
          notes: [0, 4, 7],
        },
        callout: {
          type: "tip",
          text: "Try keeping common tones between chords and moving everything else by the smallest interval possible.",
        },
      },
    ],
    whatIsIt: "Chords are built by stacking intervals above a root note.",
    whyItMatters: "Understanding construction lets you build any chord and read chord symbols.",
    quickFacts: [
      "Major triad: root + M3 (4st) + P5 (7st).",
      "Minor triad: root + m3 (3st) + P5 (7st).",
      "Major vs minor = 1 semitone difference.",
      "7th chords: maj7 = dreamy, dom7 = bluesy, min7 = smooth.",
      "Sus chords replace the 3rd with 2nd or 4th.",
    ],
    tips: [
      "Build triads first, then add extensions one at a time.",
      "Drop the 5th in voicings — it's the least colorful.",
      "Add9 and add11 sound more modern than full 7th chords.",
    ],
    deepDive: [
      { heading: "Voice Leading", body: "Move each note the shortest distance to the next chord." },
      { heading: "Extended Chords", body: "9ths, 11ths, 13ths stack compound intervals on top of 7th chords." },
      { heading: "Chords in Synthesis", body: "Stacked intervals affect timbre — detuned oscillators form unison chords." },
    ],
  },

  "harmonic-function": {
    title: "Harmonic Function",
    lessons: [
      {
        title: "The Three Functions",
        body: "Every chord in a key serves one of three functions: Tonic (home/rest), Dominant (tension/pull toward home), or Subdominant (departure/movement away from home). This framework explains why progressions feel the way they do — they're journeys between these three states.",
        keyTakeaway: "All harmony is a cycle: departure → tension → resolution → home.",
        example: {
          type: "audio",
          label: "Listen: I (rest) → IV (departure) → V (tension) → I (home)",
          notes: [0, 4, 7],
        },
      },
      {
        title: "Which Chords Serve Which Function",
        body: "In any major key: I and vi are Tonic (rest). IV and ii are Subdominant (movement). V and vii° are Dominant (tension). The iii chord is ambiguous — it can function as tonic or dominant depending on context. Chords within the same function can often substitute for each other.",
        keyTakeaway: "I/vi = rest, IV/ii = movement, V/vii° = tension. Memorize this grouping.",
        callout: {
          type: "remember",
          text: "Tonic: I, vi • Subdominant: IV, ii • Dominant: V, vii° — chords in the same group feel similar.",
        },
        quiz: {
          question: "Which chord shares the Tonic function with I?",
          options: ["IV", "V", "vi", "ii"],
          correctIndex: 2,
          explanation: "vi (the relative minor) shares Tonic function with I — both provide a sense of rest and resolution.",
        },
      },
      {
        title: "Cadences: Musical Punctuation",
        body: "A cadence is a chord pair that ends a phrase. Authentic (V→I) = a period, final and complete. Plagal (IV→I) = the 'Amen' cadence, gentle closure. Half (→V) = a comma, leaving you hanging. Deceptive (V→vi) = a plot twist. These four types are the punctuation marks of music.",
        keyTakeaway: "Cadences are how music 'breathes' — learn these four and you control phrasing.",
        example: {
          type: "audio",
          label: "Listen: Authentic cadence V → I (tension resolves)",
          notes: [7, 11, 2],
        },
        quiz: {
          question: "What is a deceptive cadence?",
          options: ["IV → I", "V → I", "V → vi", "I → V"],
          correctIndex: 2,
          explanation: "A deceptive cadence is V → vi — the ear expects resolution to I, but gets vi instead. It's the 'plot twist' of music.",
        },
      },
      {
        title: "Secondary Dominants",
        body: "Any diatonic chord can be 'tonicized' by preceding it with its own V chord. In C major, D major (V/V) resolves to G, and E major (V/vi) resolves to Am. These secondary dominants borrow notes from outside the key to create extra color and are the most common source of accidentals in tonal music.",
        keyTakeaway: "Secondary dominants let you borrow tension from other keys — instant harmonic color.",
        callout: {
          type: "tip",
          text: "If a progression feels 'stuck,' try inserting the V chord of your target chord right before it.",
        },
      },
      {
        title: "Functional Substitution",
        body: "Once you know a chord's function, you can replace it with any chord of the same function. Replace IV with ii for a jazzier feel. Replace I with vi for a more emotional start. The tritone substitution (♭II7 for V7) works because both share the same tritone between their 3rd and 7th. Replace V with ♭VII (borrowed from Mixolydian) for a laid-back resolution.",
        keyTakeaway: "Function is what matters — swap freely within the same functional group.",
        callout: {
          type: "tip",
          text: "The deceptive cadence (V→vi) is a powerful tool: it subverts the expected resolution and extends musical phrases.",
        },
      },
    ],
    whatIsIt: "Harmonic function describes the role each chord plays: Tonic, Dominant, or Subdominant.",
    whyItMatters: "Understanding function lets you see past individual chords to the deeper logic of progressions.",
    quickFacts: [
      "Tonic: I, vi (rest/resolution).",
      "Subdominant: IV, ii (movement).",
      "Dominant: V, vii° (tension).",
      "iii is ambiguous — context-dependent.",
      "Strongest motion: V → I.",
    ],
    tips: [
      "Missing dominant function makes progressions feel 'stuck.'",
      "Swap chords within the same function for variety.",
      "Deceptive cadence (V→vi) creates surprise.",
    ],
    deepDive: [
      { heading: "Cadences", body: "V→I = period, IV→I = amen, →V = comma, V→vi = plot twist." },
      { heading: "Secondary Dominants", body: "Any chord can be preceded by its own V for extra tension." },
      { heading: "Functional Substitution", body: "Replace chords freely within the same functional group." },
    ],
  },

  progressions: {
    title: "Chord Progressions",
    lessons: [
      {
        title: "What Is a Progression?",
        body: "A chord progression is a sequence of chords that forms the harmonic backbone of a piece. Progressions create the sense of movement, tension, and resolution that drives music forward. A melody floating over the right progression is what makes a song feel complete.",
        keyTakeaway: "Progressions are the framework — melodies and rhythms hang on them.",
        example: {
          type: "audio",
          label: "Listen: I – V – vi – IV (the pop progression)",
          notes: [0, 4, 7],
        },
      },
      {
        title: "The Essential Progressions",
        body: "I–V–vi–IV is the most common pop progression (hundreds of hits). ii–V–I is the foundational jazz cadence. The 12-bar blues (I–I–I–I–IV–IV–I–I–V–IV–I–V) defined an entire genre. vi–IV–I–V (the 'sensitive' progression) starts on the relative minor for a more emotional feel. Most pop songs use only 3-4 chords from the same key.",
        keyTakeaway: "A handful of progressions power most of popular music — learn these first.",
        callout: {
          type: "tip",
          text: "Start with a proven progression and make it your own through rhythm, voicing, and instrumentation.",
        },
        quiz: {
          question: "What is the foundational jazz cadence?",
          options: ["I – V – vi – IV", "vi – IV – I – V", "ii – V – I", "I – IV – V – I"],
          correctIndex: 2,
          explanation: "ii – V – I is the backbone of jazz harmony. It moves through subdominant → dominant → tonic function.",
        },
      },
      {
        title: "Why Certain Progressions Work",
        body: "The ear craves a balance of tension and release. Strong progressions alternate between stability (tonic function) and instability (dominant/subdominant). I–V–vi–IV works because it moves: home → strong tension → emotional release → gentle tension → home. Each chord sets up an expectation that the next chord fulfills or subverts.",
        keyTakeaway: "Great progressions balance tension and release — not too predictable, not too chaotic.",
      },
      {
        title: "Modal Progressions",
        body: "Not all progressions follow tonal V→I rules. Modal progressions avoid strong cadences to stay in a mode. Dorian vamps (i–IV) and Mixolydian shuttles (I–♭VII) create a floating, non-resolving feel common in R&B, electronic, and film music. The key is to avoid the leading tone pulling to the tonic.",
        keyTakeaway: "Avoid V→I to keep the modal flavor — vamps and shuttles over resolution.",
        callout: {
          type: "remember",
          text: "Modal progressions work best with fewer chords. Two-chord vamps let the mode's character shine.",
        },
        quiz: {
          question: "How do modal progressions differ from tonal ones?",
          options: ["They use more chords", "They always resolve to I", "They avoid V→I resolution", "They only use major chords"],
          correctIndex: 2,
          explanation: "Modal progressions avoid the strong V→I cadence to keep the ear in the mode rather than pulling toward a tonal center.",
        },
      },
      {
        title: "Borrowed Chords and Modal Interchange",
        body: "Modal interchange means borrowing chords from a parallel key — using chords from C minor while in C major. Common borrowings: ♭VII, ♭III, ♭VI, and iv from the parallel minor. The ♭VI–♭VII–I progression (borrowed from Aeolian) is everywhere in rock and film music, creating an epic, anthemic feel.",
        keyTakeaway: "Borrowed chords add emotional depth by mixing parallel major and minor colors.",
        example: {
          type: "audio",
          label: "Listen: ♭VI – ♭VII – I (epic rock cadence)",
          notes: [8, 0, 3],
        },
      },
    ],
    whatIsIt: "A chord progression is a sequence of chords forming the harmonic backbone of a piece.",
    whyItMatters: "Progressions create movement, tension, and resolution that drive music forward.",
    quickFacts: [
      "I–V–vi–IV: most common pop progression.",
      "ii–V–I: foundational jazz cadence.",
      "12-bar blues defined an entire genre.",
      "vi–IV–I–V: the 'sensitive' progression.",
      "Most pop songs use only 3-4 chords.",
    ],
    tips: [
      "Start with a proven progression, then customize.",
      "Change the starting chord to shift emotional center.",
      "Loop 4 chords and experiment with melody over them.",
    ],
    deepDive: [
      { heading: "Why Progressions Work", body: "They alternate between stability and instability." },
      { heading: "Modal Progressions", body: "Avoid V→I to keep the modal flavor." },
      { heading: "Modal Interchange", body: "Borrow chords from the parallel key for emotional depth." },
    ],
  },

  "circle-of-fifths": {
    title: "Circle of Fifths",
    lessons: [
      {
        title: "What Is the Circle of Fifths?",
        body: "The Circle of Fifths is a visual diagram that arranges all 12 keys by ascending perfect fifths (clockwise) and perfect fourths (counter-clockwise). It's the single most useful map of harmonic relationships in Western music — key signatures, chord relationships, and modulation paths are all visible at a glance.",
        keyTakeaway: "The Circle of Fifths is your GPS for navigating keys and harmonic relationships.",
      },
      {
        title: "Key Signatures on the Circle",
        body: "Moving clockwise adds one sharp per step. Counter-clockwise adds one flat. The order of sharps (F♯ C♯ G♯ D♯ A♯ E♯ B♯) follows the circle clockwise from F. The order of flats (B♭ E♭ A♭ D♭ G♭ C♭ F♭) goes counter-clockwise from B. To find the key from sharps, go up a half step from the last sharp. For flats, the second-to-last flat IS the key.",
        keyTakeaway: "Clockwise = sharps. Counter-clockwise = flats. Adjacent keys differ by only one note.",
        callout: {
          type: "tip",
          text: "The 7 notes of any major key form a contiguous arc of 7 segments on the circle.",
        },
        quiz: {
          question: "What happens when you move one step clockwise on the Circle of Fifths?",
          options: ["Add one flat", "Remove one sharp", "Add one sharp", "Change to minor"],
          correctIndex: 2,
          explanation: "Each clockwise step on the circle adds one sharp to the key signature.",
        },
      },
      {
        title: "Relative Major and Minor",
        body: "Every major key has a relative minor that shares all the same notes. They sit at the same position on the circle — major on the outer ring, minor on the inner ring. C major and A minor are relatives. G major and E minor. Knowing this relationship means learning one key signature covers two keys.",
        keyTakeaway: "One key signature = two keys (major + relative minor). The circle shows both.",
        example: {
          type: "keyboard",
          label: "C Major and A Minor: same notes, different home",
          notes: [0, 2, 4, 5, 7, 9, 11],
        },
      },
      {
        title: "Modulation Strategies",
        body: "Pivot chord modulation uses a chord common to both keys as a bridge. The closer two keys are on the circle, the more chords they share. Direct modulation jumps straight to the new key (often up a half or whole step for energy). Chromatic modulation uses stepwise voice leading to slide between keys.",
        keyTakeaway: "Adjacent keys on the circle = smooth modulations. Distant keys = dramatic leaps.",
        callout: {
          type: "remember",
          text: "Opposite keys on the circle (tritone apart) are the most distant harmonically — modulating between them is dramatic and jarring.",
        },
        quiz: {
          question: "Which keys are hardest to modulate between smoothly?",
          options: ["Adjacent keys", "Relative major/minor", "Keys opposite on the circle (tritone apart)", "Keys with no sharps or flats"],
          correctIndex: 2,
          explanation: "Opposite keys on the circle share the fewest common chords, making smooth modulation very difficult.",
        },
      },
      {
        title: "The Circle in Composition",
        body: "Many jazz standards (Autumn Leaves, Fly Me to the Moon) chain ii-V-I progressions around the circle. In pop, you rarely leave the local neighborhood — most songs stay within 1-2 steps. Film music leaps across the circle for disorienting key changes. The circle tells you how 'far' a modulation will feel before you try it.",
        keyTakeaway: "Use the circle to plan your harmonic journey — step gently or leap dramatically.",
      },
    ],
    whatIsIt: "The Circle of Fifths arranges all 12 keys by ascending perfect fifths.",
    whyItMatters: "It reveals key relationships, key signatures, and modulation paths at a glance.",
    quickFacts: [
      "Clockwise = add one sharp.",
      "Counter-clockwise = add one flat.",
      "Adjacent keys differ by one note.",
      "Relative minor sits on the inner ring.",
      "Opposite keys are most distant (tritone apart).",
    ],
    tips: [
      "Move one step for smooth key changes.",
      "Check enharmonic equivalents for complex key signatures.",
      "Chords a 5th apart have the strongest pull.",
    ],
    deepDive: [
      { heading: "Key Signatures Decoded", body: "Sharps follow the circle clockwise from F." },
      { heading: "Modulation Strategies", body: "Pivot chords bridge related keys; direct modulation jumps." },
      { heading: "The Circle in Composition", body: "Jazz chains ii-V-I around the circle; pop stays local." },
    ],
  },

  "chord-finder": {
    title: "Chord Finder",
    lessons: [
      {
        title: "What Does the Chord Finder Do?",
        body: "The Chord Finder identifies what chord you're playing by analyzing the pitch classes you select. It checks all possible roots and inversions against known chord patterns. When you stumble onto a cool-sounding combination but don't know its name, this tool names it for you.",
        keyTakeaway: "Select notes → get the chord name. It's reverse engineering for harmony.",
      },
      {
        title: "How Detection Works",
        body: "The algorithm takes your selected pitch classes, tries each one as a potential root, calculates intervals from that root to every other note, and compares against a library of known chord formulas. It checks all rotations (inversions) because C-E-G, E-G-C, and G-C-E are all C major. Simpler chord types are prioritized.",
        keyTakeaway: "The tool checks every possible root and inversion — you just supply the notes.",
        callout: {
          type: "tip",
          text: "If the tool says 'No chord recognized,' try removing one note — you might have a cluster that doesn't match standard patterns.",
        },
        quiz: {
          question: "What is the minimum number of notes needed to form a chord?",
          options: ["2", "3", "4", "5"],
          correctIndex: 1,
          explanation: "A chord requires at least 3 notes (a triad). Two notes form an interval, not a chord.",
        },
      },
      {
        title: "Inversions and Slash Chords",
        body: "An inversion means a note other than the root is in the bass. C/E means 'C major with E in the bass' (first inversion). Inversions change the chord's character without changing its name. The finder detects these automatically. Knowing inversions helps with bass lines and voice leading.",
        keyTakeaway: "Same chord, different bass note = inversion. It changes the feel but not the chord name.",
        example: {
          type: "keyboard",
          label: "C major inversions: C-E-G, E-G-C, G-C-E",
          notes: [0, 4, 7],
        },
      },
      {
        title: "Using the Finder in Practice",
        body: "Use this tool when transcribing: play along with a recording, find the notes on the keyboard, and let the tool name the chord. It's also useful when experimenting — try random notes, and if something sounds good, identify it so you can use it intentionally next time. Naming a chord lets you communicate it to other musicians and look up similar voicings.",
        keyTakeaway: "Name it to own it — once a chord has a name, you can use it anywhere.",
        callout: {
          type: "tip",
          text: "Two notes alone form an interval, not a chord. You need at least 3 notes for the finder to identify a triad.",
        },
      },
    ],
    whatIsIt: "The Chord Finder identifies chords by analyzing selected pitch classes.",
    whyItMatters: "Naming chords lets you communicate, look up voicings, and understand theory.",
    quickFacts: [
      "Detects triads, sevenths, extensions, and inversions.",
      "An inversion = non-root note in the bass.",
      "Need at least 3 notes for a triad.",
      "Same notes can be named differently depending on context.",
    ],
    tips: [
      "Remove notes if no chord is recognized.",
      "Use when transcribing recordings.",
      "Knowing inversions helps with bass line writing.",
    ],
    deepDive: [
      { heading: "How Detection Works", body: "Tries each note as root, calculates intervals, matches patterns." },
      { heading: "Slash Chords", body: "C/E = C major with E in the bass (first inversion)." },
    ],
  },

  "scale-finder": {
    title: "Scale Finder",
    lessons: [
      {
        title: "What Does the Scale Finder Do?",
        body: "The Scale Finder takes a set of notes and finds every scale that contains all of them. It's the reverse of the Scale panel — instead of choosing a scale to see its notes, you provide notes to discover matching scales. This reveals options you might never have considered.",
        keyTakeaway: "Give it notes, get back every scale that fits — a creative discovery tool.",
      },
      {
        title: "Narrowing Results",
        body: "The fewer notes you enter, the more scales will match. Entering all 7 notes of a major scale will match exactly that key's major and its relative modes. Start broad with 3-4 notes, see the options, then add notes to narrow down. Look for scales with fewer total notes (5-6) — they're often the most practical for improvisation.",
        keyTakeaway: "More input notes = fewer, more precise results. Start broad, then refine.",
        callout: {
          type: "tip",
          text: "Enter the notes of a melody you like, then explore matching scales for fresh melodic ideas over the same harmony.",
        },
      },
      {
        title: "Supersets, Subsets, and Symmetric Scales",
        body: "Every pentatonic scale is a subset of several 7-note scales. C major pentatonic (C D E G A) fits inside C major, G major, and F major — explaining why pentatonic melodies work over many keys. Symmetric scales (whole tone, diminished) divide the octave into equal parts, creating a floating, ambiguous quality used in impressionist music and jazz.",
        keyTakeaway: "Understanding scale relationships reveals why certain melodies feel versatile.",
        example: {
          type: "keyboard",
          label: "C Major Pentatonic — fits inside multiple keys",
          notes: [0, 2, 4, 7, 9],
        },
        quiz: {
          question: "Why do pentatonic melodies work over many different keys?",
          options: ["They use all 12 notes", "They are a subset of multiple 7-note scales", "They avoid the root note", "They only use sharps"],
          correctIndex: 1,
          explanation: "Pentatonic scales (5 notes) fit inside several different 7-note scales, making them compatible with many keys.",
        },
      },
    ],
    whatIsIt: "The Scale Finder takes notes and finds every scale containing all of them.",
    whyItMatters: "Discover what scale a melody belongs to and find alternative scales.",
    quickFacts: [
      "Fewer input notes = more matches.",
      "7 notes of major = exact match for that key.",
      "Pentatonics are subsets of many larger scales.",
      "Some combinations match exotic scales.",
    ],
    tips: [
      "Enter melody notes to discover matching scales.",
      "Add more notes to narrow results.",
      "Look for scales with 5-6 notes for practical improvisation.",
    ],
    deepDive: [
      { heading: "Supersets and Subsets", body: "Pentatonic scales fit inside multiple 7-note scales." },
      { heading: "Symmetric Scales", body: "Whole tone and diminished scales divide the octave equally." },
    ],
  },

  "key-finder": {
    title: "Key Finder",
    lessons: [
      {
        title: "What Does the Key Finder Do?",
        body: "The Key Finder analyzes a set of notes and ranks the most likely keys (major and minor) by how well they match. It checks all 24 keys (12 major + 12 minor) and gives a confidence percentage. 100% means all your notes fit perfectly in that key.",
        keyTakeaway: "Input notes → get ranked key suggestions with confidence scores.",
      },
      {
        title: "Reading the Results",
        body: "Multiple keys can score equally — the more notes you provide, the more definitive the result. Major and minor keys with the same notes (relative keys like C major and A minor) will always tie. To break the tie, listen: which note feels like 'home'? Which chord do phrases end on? That determines the actual key.",
        keyTakeaway: "Tied scores between relatives? Listen for which note feels like home.",
        callout: {
          type: "tip",
          text: "Include at least 4-5 notes for a reliable result. Accidentals (notes outside the key) are normal and don't necessarily mean a different key.",
        },
        quiz: {
          question: "Why do C major and A minor always get the same confidence score?",
          options: ["They have the same root note", "They share all the same notes (relative keys)", "They have the same chord progression", "They use the same clef"],
          correctIndex: 1,
          explanation: "C major and A minor are relative keys — they share all 7 notes. The difference is which note sounds like 'home.'",
        },
      },
      {
        title: "Key vs Mode",
        body: "The Key Finder checks major and minor, but your music might be modal. If you're playing D E F G A B C (all white keys) and D feels like home, you're in D Dorian, not C major or A minor. The Key Finder gives you the starting point — use the Modes panel to refine. Look for the result where the root note matches your tonal center.",
        keyTakeaway: "The Key Finder finds the key — if you need the mode, check which note is 'home.'",
        callout: {
          type: "remember",
          text: "Key Finder → which notes. Mode panel → which note is home. Use both together for the full picture.",
        },
      },
    ],
    whatIsIt: "The Key Finder ranks likely keys by how well your notes match.",
    whyItMatters: "Knowing the key is fundamental for harmonies, transposition, and communication.",
    quickFacts: [
      "100% = all notes fit the key.",
      "More notes = more definitive results.",
      "Relative keys always tie.",
      "Checks 24 keys (12 major + 12 minor).",
    ],
    tips: [
      "Include 4-5 notes for reliable results.",
      "Tied relatives? Listen for which feels like 'home.'",
      "Accidentals don't necessarily mean a different key.",
    ],
    deepDive: [
      { heading: "Relative Major and Minor", body: "Same notes, different tonal center." },
      { heading: "Key vs Mode", body: "Key finder gives the notes; mode analysis gives the center." },
    ],
  },

  "interval-calc": {
    title: "Interval Calculator",
    lessons: [
      {
        title: "What Does the Calculator Do?",
        body: "The Interval Calculator shows the exact interval between any two notes you select, in both ascending and descending directions, along with the interval's quality (perfect, consonant, or dissonant). It's an instant reference for understanding the relationship between any two pitches.",
        keyTakeaway: "Two notes in → interval name, direction, and quality out.",
      },
      {
        title: "Ascending vs Descending",
        body: "The ascending and descending intervals between two notes always add up to 12 semitones (one octave). A perfect 4th ascending (5 semitones) is a perfect 5th descending (7 semitones). This duality is important for bass lines and melody — the direction changes the interval's name and perceived character.",
        keyTakeaway: "Ascending + descending = 12 semitones, always. Direction matters.",
        example: {
          type: "keyboard",
          label: "C to F: P4 ascending, P5 descending",
          notes: [0, 5],
        },
        quiz: {
          question: "If an ascending interval is a perfect 4th (5 semitones), what is the descending interval?",
          options: ["Perfect 4th (5 semitones)", "Perfect 5th (7 semitones)", "Major 3rd (4 semitones)", "Minor 7th (10 semitones)"],
          correctIndex: 1,
          explanation: "Ascending + descending = 12 semitones. So 12 - 5 = 7 semitones = a perfect 5th.",
        },
      },
      {
        title: "Ear Training with the Calculator",
        body: "Professional musicians identify intervals by ear instantly. The most effective method is associating each interval with a song: Perfect 4th = 'Here Comes the Bride,' Major 6th = 'My Bonnie,' Minor 7th = Star Trek theme. Build a personal reference song for each of the 12 intervals and test yourself daily using this calculator.",
        keyTakeaway: "Associate each interval with a melody you know — this builds the ear-brain connection.",
        callout: {
          type: "tip",
          text: "Practice singing intervals before checking with the calculator. Prediction → verification builds stronger recall.",
        },
      },
    ],
    whatIsIt: "Shows the exact interval between two notes with quality and direction.",
    whyItMatters: "Quick interval identification is essential for ear training and transposition.",
    quickFacts: [
      "Ascending + descending = 12 semitones.",
      "P4 ascending = P5 descending.",
      "Quality: perfect, consonant, or dissonant.",
      "Enharmonic intervals sound the same but are named differently.",
    ],
    tips: [
      "Practice singing intervals to build ear-brain connection.",
      "Use when verifying transpositions.",
      "Use descending display for bass line movements.",
    ],
    deepDive: [
      { heading: "Ear Training", body: "Associate each interval with a famous song." },
      { heading: "Intervals in Harmony", body: "Parallel 3rds/6ths = smooth; parallel 2nds = tense." },
    ],
  },

  transpose: {
    title: "Transpose",
    lessons: [
      {
        title: "What Is Transposition?",
        body: "Transposition shifts every note in a set by the same number of semitones, moving the entire musical idea to a new key while preserving all intervals and relationships. It's like sliding a shape on a keyboard — the shape stays the same, only the position changes.",
        keyTakeaway: "Transpose = move everything by the same amount. Intervals stay identical.",
      },
      {
        title: "Common Transpositions",
        body: "Transposing up by 7 semitones moves to the key a perfect 5th above. +12 or -12 moves up/down a full octave (same key). A guitar capo is physical transposition — each fret = +1 semitone. Transposing a chord progression preserves all Roman numeral relationships: I-V-vi-IV in C becomes I-V-vi-IV in D.",
        keyTakeaway: "Roman numerals don't change — only the letter names do.",
        callout: {
          type: "tip",
          text: "To move a song to an easier key, transpose until the chords have fewer sharps/flats.",
        },
        quiz: {
          question: "When you transpose a chord progression, what stays the same?",
          options: ["The letter names (C, G, Am)", "The Roman numeral relationships (I, V, vi)", "The key signature", "The number of sharps/flats"],
          correctIndex: 1,
          explanation: "Transposition preserves all interval relationships. I-V-vi-IV in any key follows the same functional pattern.",
        },
      },
      {
        title: "Transposition vs Modulation",
        body: "Transposition moves everything to a new key at once — it's a studio/arrangement tool. Modulation is a gradual, in-song key change using pivot chords or chromatic voice leading. Both change the key, but modulation is heard as a musical event while transposition is transparent to the listener.",
        keyTakeaway: "Transposition = instant shift. Modulation = gradual journey. Different tools, different purposes.",
        callout: {
          type: "remember",
          text: "The 'truck driver modulation' — modulating up 1-2 semitones near the end of a song — is the classic energy boost trick.",
        },
      },
      {
        title: "Transposing Instruments",
        body: "Some instruments are 'transposing instruments' — their written notes differ from sounding pitches. A B♭ trumpet sounds a whole step lower than written. An E♭ alto sax sounds a major 6th lower. When writing for these instruments, you transpose the part so the player reads the correct fingering. The transpose tool handles these calculations.",
        keyTakeaway: "Not all instruments sound as written — know the transposition for each.",
      },
    ],
    whatIsIt: "Transposition shifts every note by the same semitone count, preserving intervals.",
    whyItMatters: "Adapt music to different keys for singers, instruments, or emotional effects.",
    quickFacts: [
      "+7 semitones = up a perfect 5th.",
      "±12 = same key, different octave.",
      "Guitar capo = physical transposition.",
      "Roman numerals are preserved.",
    ],
    tips: [
      "Transpose to simpler keys for easier chords.",
      "Modulate up 1-2 semitones for energy boost.",
      "Try ±1-3 semitones to fix vocal range issues.",
    ],
    deepDive: [
      { heading: "Transposition vs Modulation", body: "Transposition is instant; modulation is gradual." },
      { heading: "Transposing Instruments", body: "Written notes ≠ sounding pitches for some instruments." },
    ],
  },
};
