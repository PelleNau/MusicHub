import { NOTE_NAMES, SCALES } from "@/lib/musicTheory";

export type ChallengeType = "play-notes" | "identify" | "build";

export interface Challenge {
  prompt: string;
  type: ChallengeType;
  /** For play-notes: the expected pitch classes (0-11) */
  expectedNotes?: number[];
  /** For identify: multiple choice options */
  options?: string[];
  /** For identify: correct answer string */
  answer?: string;
  /** Hint shown after failed attempt */
  hint?: string;
}

function scaleNotes(root: number, scaleName: string): number[] {
  const intervals = SCALES[scaleName] ?? SCALES["Major"];
  return intervals.map((i) => (i + root) % 12);
}

export const CHALLENGE_DATA: Record<string, Challenge[]> = {
  intervals: [
    {
      prompt: "Click two notes that form a Perfect 5th (start on C)",
      type: "play-notes",
      expectedNotes: [0, 7],
      hint: "A Perfect 5th is 7 semitones. C → G.",
    },
    {
      prompt: "Click two notes that form a Tritone",
      type: "play-notes",
      expectedNotes: [0, 6],
      hint: "A Tritone is 6 semitones. Try C and F♯.",
    },
    {
      prompt: "What interval is 4 semitones?",
      type: "identify",
      options: ["Minor 3rd", "Major 3rd", "Perfect 4th", "Major 2nd"],
      answer: "Major 3rd",
      hint: "Count: 1=m2, 2=M2, 3=m3, 4=M3.",
    },
    {
      prompt: "Click two notes that form a Minor 3rd (start on E)",
      type: "play-notes",
      expectedNotes: [4, 7],
      hint: "A Minor 3rd is 3 semitones above E → G.",
    },
  ],

  scales: [
    {
      prompt: `Play all notes of the C Major scale`,
      type: "play-notes",
      expectedNotes: scaleNotes(0, "Major"),
      hint: "C Major has no sharps or flats: C D E F G A B.",
    },
    {
      prompt: "Play all notes of the A Natural Minor scale",
      type: "play-notes",
      expectedNotes: scaleNotes(9, "Minor"),
      hint: "A Minor: A B C D E F G — same as C Major but starting on A.",
    },
    {
      prompt: "Play the D Major Pentatonic scale",
      type: "play-notes",
      expectedNotes: scaleNotes(2, "Major Pentatonic"),
      hint: "Major Pentatonic removes the 4th and 7th: D E F♯ A B.",
    },
    {
      prompt: "Which note is NOT in G Major?",
      type: "identify",
      options: ["F♯", "C", "A♭", "D"],
      answer: "A♭",
      hint: "G Major has one sharp (F♯). A♭ is not in the key.",
    },
  ],

  modes: [
    {
      prompt: "Play D Dorian (all 7 notes)",
      type: "play-notes",
      expectedNotes: [2, 4, 5, 7, 9, 11, 0], // D E F G A B C
      hint: "Dorian is the 2nd mode of C Major: D E F G A B C.",
    },
    {
      prompt: "Which mode starts on the 5th degree of Major?",
      type: "identify",
      options: ["Dorian", "Lydian", "Mixolydian", "Aeolian"],
      answer: "Mixolydian",
      hint: "The modes in order: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian.",
    },
    {
      prompt: "Play A Phrygian (all 7 notes)",
      type: "play-notes",
      expectedNotes: [9, 10, 0, 2, 4, 5, 7], // A Bb C D E F G
      hint: "Phrygian is the 3rd mode. A Phrygian = F Major starting on A.",
    },
  ],

  "chord-construction": [
    {
      prompt: "Build a C minor triad: select Root=C, then Minor 3rd + Perfect 5th",
      type: "build",
      expectedNotes: [0, 3, 7],
      hint: "Minor triad = root + minor 3rd (3 semitones) + perfect 5th (7 semitones).",
    },
    {
      prompt: "Build an F Major 7th chord",
      type: "build",
      expectedNotes: [5, 9, 0, 4], // F A C E
      hint: "Maj7 = root + major 3rd + perfect 5th + major 7th.",
    },
    {
      prompt: "Build a G dominant 7th chord",
      type: "build",
      expectedNotes: [7, 11, 2, 5], // G B D F
      hint: "Dom7 = root + major 3rd + perfect 5th + minor 7th.",
    },
  ],

  "harmonic-function": [
    {
      prompt: "In C Major, which chord is the V (dominant)?",
      type: "identify",
      options: ["C", "F", "G", "Am"],
      answer: "G",
      hint: "The 5th degree of C Major is G.",
    },
    {
      prompt: "Which degree is the 'subdominant' in any major key?",
      type: "identify",
      options: ["II", "III", "IV", "V"],
      answer: "IV",
      hint: "The subdominant is always the IV chord.",
    },
    {
      prompt: "In G Major, which chords are minor?",
      type: "identify",
      options: ["I, IV, V", "ii, iii, vi", "iii, V, vii°", "I, ii, IV"],
      answer: "ii, iii, vi",
      hint: "In any major key the minor chords are on degrees ii, iii, and vi.",
    },
  ],

  progressions: [
    {
      prompt: "Which progression is 'I – V – vi – IV'?",
      type: "identify",
      options: ["I – IV – V – I", "I – V – vi – IV", "ii – V – I", "vi – IV – I – V"],
      answer: "I – V – vi – IV",
      hint: "This is one of the most popular pop progressions.",
    },
    {
      prompt: "What is the jazz standard turnaround?",
      type: "identify",
      options: ["I – IV – V – I", "I – V – vi – IV", "ii – V – I", "vi – IV – I – V"],
      answer: "ii – V – I",
      hint: "The ii–V–I is the most common jazz progression.",
    },
    {
      prompt: "In C Major, what are the chords in I – V – vi – IV?",
      type: "identify",
      options: ["C G Am F", "C F G Am", "Am F C G", "F C G Am"],
      answer: "C G Am F",
      hint: "I=C, V=G, vi=Am, IV=F.",
    },
  ],

  "circle-of-fifths": [
    {
      prompt: "Which key has 3 sharps?",
      type: "identify",
      options: ["D Major", "A Major", "E Major", "G Major"],
      answer: "A Major",
      hint: "Each step clockwise on the circle adds one sharp: G=1, D=2, A=3.",
    },
    {
      prompt: "What is the dominant (V) of D Major?",
      type: "identify",
      options: ["G", "A", "E", "C"],
      answer: "A",
      hint: "The dominant is one step clockwise on the circle of fifths.",
    },
    {
      prompt: "What is the relative minor of F Major?",
      type: "identify",
      options: ["Am", "Dm", "Em", "Cm"],
      answer: "Dm",
      hint: "The relative minor is 3 semitones below the tonic: F → D.",
    },
    {
      prompt: "How many flats does B♭ Major have?",
      type: "identify",
      options: ["1", "2", "3", "4"],
      answer: "2",
      hint: "B♭ and E♭ are the two flats.",
    },
  ],

  "chord-finder": [
    {
      prompt: "Click C, E, and G on the keyboard. What chord is it?",
      type: "play-notes",
      expectedNotes: [0, 4, 7],
      hint: "C + E + G = C Major triad.",
    },
    {
      prompt: "Build an Am chord (A, C, E)",
      type: "play-notes",
      expectedNotes: [9, 0, 4],
      hint: "A minor = A + C + E.",
    },
    {
      prompt: "Click D, F♯, A to identify the chord",
      type: "play-notes",
      expectedNotes: [2, 6, 9],
      hint: "D + F♯ + A = D Major.",
    },
  ],

  "scale-finder": [
    {
      prompt: "Enter C, D, E, F♯, G, A, B — which scale contains all these?",
      type: "play-notes",
      expectedNotes: [0, 2, 4, 6, 7, 9, 11],
      hint: "This is C Lydian (Major with raised 4th).",
    },
    {
      prompt: "Enter A, B, C, D, E, F, G to find matching scales",
      type: "play-notes",
      expectedNotes: [9, 11, 0, 2, 4, 5, 7],
      hint: "These are the notes of A Natural Minor (also C Major).",
    },
  ],

  "key-finder": [
    {
      prompt: "Enter D, F♯, A, G, B — what key are you likely in?",
      type: "play-notes",
      expectedNotes: [2, 6, 9, 7, 11],
      hint: "These notes strongly suggest D Major or G Major.",
    },
    {
      prompt: "Enter E, G♯, B, C♯, F♯ — find the key",
      type: "play-notes",
      expectedNotes: [4, 8, 11, 1, 6],
      hint: "These notes point to E Major (4 sharps).",
    },
  ],

  "interval-calc": [
    {
      prompt: "Click B♭ and F — what interval is it?",
      type: "play-notes",
      expectedNotes: [10, 5],
      hint: "B♭ to F ascending = Perfect 5th (7 semitones).",
    },
    {
      prompt: "Click E and C — what's the ascending interval?",
      type: "play-notes",
      expectedNotes: [4, 0],
      hint: "E to C ascending = Minor 6th (8 semitones).",
    },
    {
      prompt: "What interval is 7 semitones?",
      type: "identify",
      options: ["Perfect 4th", "Perfect 5th", "Major 6th", "Tritone"],
      answer: "Perfect 5th",
      hint: "7 semitones = Perfect 5th.",
    },
  ],

  transpose: [
    {
      prompt: "Select C, E, G then transpose +5 semitones. What notes do you get?",
      type: "identify",
      options: ["D, F♯, A", "E, G♯, B", "F, A, C", "E♭, G, B♭"],
      answer: "F, A, C",
      hint: "C+5=F, E+5=A, G+5=C.",
    },
    {
      prompt: "Transpose A, C, E down by 2 semitones. What chord is the result?",
      type: "identify",
      options: ["Gm", "G", "F♯m", "A♭"],
      answer: "Gm",
      hint: "A-2=G, C-2=B♭, E-2=D → G minor.",
    },
  ],
};
