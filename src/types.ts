/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  versesCount: number;
  revelationType: "Meccan" | "Medinan";
  summary: string;
}

export interface SemanticChunk {
  id: string; // e.g. "surahId_verseNum_chunkIdx"
  surahId: number;
  verseNumber: number;
  chunkIndex: number;
  arabic: string;
  translation: string;
  transliteration: string;
  thematicLabel: string; // Thematic mapping for Memory Palace
  visualAnchorPrompt: string; // Dynamic prompt for generative visual anchor
  tafsir?: string; // Exegesis/tafsir explanation for cognitive encoding
}

export interface Mutashabih {
  id: string;
  originalVerseRef: string; // e.g. "2:255"
  similarVerseRef: string; // e.g. "3:2"
  originalArabicText: string;
  similarArabicText: string;
  overlapDescription: string;
  interferenceScore: number; // 0.0 to 1.0
}

export type FSRSRating = "again" | "hard" | "good" | "easy";

export interface FSRSReviewHistory {
  timestamp: string;
  rating: FSRSRating;
  stabilityBefore: number;
  stabilityAfter: number;
  difficultyBefore: number;
  difficultyAfter: number;
}

export interface FSRSMemberState {
  chunkId: string;
  difficulty: number; // D: 1.0 to 10.0
  stability: number; // S: in days
  retrievability: number; // R: 0.0 to 1.0 (recalced dynamically)
  lastReviewedAt: string | null; // ISO Timestamp
  scheduledDate: string; // ISO date string (YYYY-MM-DD)
  reviewHistory: FSRSReviewHistory[];
}

export interface SifatFeedback {
  name: "Qalqala" | "Ikhfaa" | "Ghunnah" | "Madd" | "None";
  passed: boolean;
  details: string;
  severity: "success" | "warning" | "error";
}

export interface PhonemeFeedback {
  phoneme: string;
  correct: boolean;
  notes: string;
}

export interface TajweedASRFeedback {
  score: number; // 0 to 100
  overallEvaluation: string;
  phonemeLevel: PhonemeFeedback[];
  sifatLevel: SifatFeedback[];
  transcription: string;
}

export interface UserStats {
  dailyStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  totalMinutesSpent: number;
  completedChunks: string[]; // List of chunkIds
  sessionLimitReached: boolean;
}

export interface LearningSession {
  isActive: boolean;
  timeLeft: number; // in seconds (default 900, i.e., 15 mins)
  selectedChunkIds: string[];
  currentChunkId: string | null;
  method: "3x3" | "6-4-4-6";
  currentStepIndex: number; // 0 to 8 for 3x3, 0 to 19 for 6-4-4-6
  completedAt: string | null; // ISO timestamp
}
