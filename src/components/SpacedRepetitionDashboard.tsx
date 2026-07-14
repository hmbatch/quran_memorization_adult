/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SemanticChunk, FSRSMemberState, FSRSRating, UserStats } from "../types";
import { calculateRetrievability } from "../utils/fsrs";
import { Award, Brain, Clock, HelpCircle, Eye, EyeOff, RefreshCw, Layers } from "lucide-react";
import ProgressTrendChart from "./ProgressTrendChart";
import AchievementsBadges from "./AchievementsBadges";

interface SpacedRepetitionDashboardProps {
  chunks: SemanticChunk[];
  allChunks: SemanticChunk[];
  fsrsStates: Record<string, FSRSMemberState>;
  onRateChunk: (chunkId: string, rating: FSRSRating) => void;
  selectedChunkId: string | null;
  onSelectChunk: (chunkId: string) => void;
  maxNewDailyVerses: number;
  stats: UserStats;
  onMockProgressUpdate?: (mockedStats: UserStats, mockedFsrs?: Record<string, FSRSMemberState>) => void;
}

export default function SpacedRepetitionDashboard({
  chunks,
  allChunks,
  fsrsStates,
  onRateChunk,
  selectedChunkId,
  onSelectChunk,
  maxNewDailyVerses,
  stats,
  onMockProgressUpdate,
}: SpacedRepetitionDashboardProps) {
  const [clozeLevel, setClozeLevel] = useState<number>(0); // 0, 1, 2, 3

  const activeChunk = chunks.find((c) => c.id === selectedChunkId) || chunks[0];
  const activeState = activeChunk ? fsrsStates[activeChunk.id] : null;

  // Compute calculated retrievability for active state
  const retrievability = activeState 
    ? calculateRetrievability(activeState.stability, activeState.lastReviewedAt) 
    : 1.0;

  // Progressive Cloze Deletion Implementation
  const getClozeArabicText = (text: string, level: number) => {
    if (level === 0) return text;
    const words = text.split(" ");
    if (words.length <= 1) return level === 3 ? "█" : text;

    if (level === 1) {
      // Mask the last word
      words[words.length - 1] = "█████";
      return words.join(" ");
    }
    if (level === 2) {
      // Mask intermittent words
      return words.map((w, idx) => (idx % 2 === 1 ? "████" : w)).join(" ");
    }
    if (level === 3) {
      // Full blackout
      return words.map(() => "████").join(" ");
    }
    return text;
  };

  // Calculate status counts
  const todayStr = new Date().toISOString().split("T")[0];
  const dueCount = chunks.filter((c) => {
    const s = fsrsStates[c.id];
    return s && s.scheduledDate <= todayStr;
  }).length;

  const newCount = chunks.filter((c) => {
    const s = fsrsStates[c.id];
    return !s || !s.lastReviewedAt;
  }).length;

  return (
    <div id="spaced-repetition-section" className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm text-[#2D4232]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 font-sans">
        <div>
          <h2 className="text-xl font-serif font-light text-[#1A2E1F] flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#BFA780]" /> Feature 3: FSRS Mathematical Scheduling & Cloze Deletion
          </h2>
          <p className="text-xs text-[#5A6357] mt-1">
            Replaces legacy SM-2. Monitors Stability (S), Difficulty (D), and Retrievability (R). Enforces active recall via Progressive Cloze.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#FCF9F2] px-3.5 py-1.5 rounded-xl border border-[#EAE3D2] text-xs text-[#2D4232] shadow-sm">
            <span className="font-mono text-[#BFA780] font-bold mr-1">{dueCount}</span> Due Today
          </div>
          <div className="bg-[#FCF9F2] px-3.5 py-1.5 rounded-xl border border-[#EAE3D2] text-xs text-[#2D4232] shadow-sm">
            <span className="font-mono text-[#2D4232] font-bold mr-1">{maxNewDailyVerses}</span> Max Daily Limit
          </div>
        </div>
      </div>

      {/* Progress Trend Chart Visualizer */}
      <div className="mb-6">
        <ProgressTrendChart fsrsStates={fsrsStates} stats={stats} />
      </div>

      {/* Achievements and Badges Display */}
      <div className="mb-6">
        <AchievementsBadges 
          stats={stats} 
          fsrsStates={fsrsStates} 
          allChunks={allChunks} 
          onMockProgressUpdate={onMockProgressUpdate} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Left Panel: Selected Chunk Spaced Repetition Practice & Rating */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#FCF9F2] rounded-2xl p-5 border border-[#EAE3D2]">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE3D2]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#8A7D63] font-bold uppercase tracking-widest">
                  Active Recitation Practice
                </span>
              </div>
              <span className="text-xs font-mono bg-white text-[#2D4232] px-2.5 py-0.5 rounded-lg border border-[#EAE3D2]">
                Verse {activeChunk?.verseNumber}:{activeChunk?.chunkIndex + 1}
              </span>
            </div>

            {/* Active Cloze Display */}
            {activeChunk ? (
              <div className="space-y-4">
                <div className="bg-white border border-[#EAE3D2] p-6 rounded-2xl text-center relative overflow-hidden shadow-sm">
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#8A7D63] uppercase tracking-wider">
                      Cloze Deletion Level:
                    </span>
                    <span className="text-[10px] font-mono bg-[#EAE3D2] text-[#2D4232] px-1.5 py-0.5 rounded border border-[#D4C3A1] font-bold">
                      Lvl {clozeLevel}
                    </span>
                  </div>

                  <p 
                    className="text-3xl font-serif text-[#2D4232] leading-loose tracking-wider my-4 select-none" 
                    dir="rtl"
                  >
                    {getClozeArabicText(activeChunk.arabic, clozeLevel)}
                  </p>

                  <p className="text-xs text-[#5A6357] italic max-w-md mx-auto mt-2 font-sans">
                    {clozeLevel === 3 ? "[Text fully blacked out. Recite entire chunk from memory]" : activeChunk.translation}
                  </p>
                </div>

                {/* Cloze Level Controls */}
                <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-[#EAE3D2] shadow-sm">
                  <span className="text-xs font-medium text-[#2D4232] flex items-center gap-1.5">
                    {clozeLevel > 0 ? <EyeOff className="w-4 h-4 text-[#BFA780]" /> : <Eye className="w-4 h-4 text-[#2D4232]" />}
                    Progressive Cloze
                  </span>
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setClozeLevel(lvl)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                          clozeLevel === lvl
                            ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                            : "bg-[#EAE3D2] text-[#5A6357] hover:text-[#2D4232]"
                        }`}
                      >
                        L{lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spaced Repetition Mathematical Metric Display */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-[#EAE3D2] text-center shadow-sm">
                    <span className="text-[10px] font-mono text-[#8A7D63] uppercase block tracking-wider">Stability (S)</span>
                    <span className="text-lg font-mono font-bold text-[#2D4232] mt-1 block">
                      {activeState ? `${activeState.stability}d` : "1.0d"}
                    </span>
                    <span className="text-[9px] text-[#8A7D63] block mt-0.5 leading-tight">Interval scaling factor</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-[#EAE3D2] text-center shadow-sm">
                    <span className="text-[10px] font-mono text-[#8A7D63] uppercase block tracking-wider">Difficulty (D)</span>
                    <span className="text-lg font-mono font-bold text-[#BFA780] mt-1 block">
                      {activeState ? activeState.difficulty.toFixed(1) : "5.0"}
                    </span>
                    <span className="text-[9px] text-[#8A7D63] block mt-0.5 leading-tight">1.0 (easy) - 10.0 (hard)</span>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-[#EAE3D2] text-center shadow-sm">
                    <span className="text-[10px] font-mono text-[#8A7D63] uppercase block tracking-wider">Retrievability (R)</span>
                    <span className={`text-lg font-mono font-bold mt-1 block ${retrievability > 0.8 ? 'text-[#2D4232]' : retrievability > 0.6 ? 'text-[#BFA780]' : 'text-red-750'}`}>
                      {(retrievability * 100).toFixed(0)}%
                    </span>
                    <span className="text-[9px] text-[#8A7D63] block mt-0.5 leading-tight">Estimated recall probability</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Rating Controls */}
          {activeChunk && (
            <div className="mt-5 pt-4 border-t border-[#EAE3D2]">
              <span className="text-[10px] font-mono text-[#8A7D63] uppercase block tracking-wider mb-2.5 text-center">
                RATE YOUR RETRIEVAL SUCCESS TO RECALCULATE FSRS STATE:
              </span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => onRateChunk(activeChunk.id, "again")}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-2.5 px-2 rounded-xl text-xs font-semibold font-sans transition-all text-center cursor-pointer shadow-sm"
                >
                  Again (Plunge S)
                </button>
                <button
                  onClick={() => onRateChunk(activeChunk.id, "hard")}
                  className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 py-2.5 px-2 rounded-xl text-xs font-semibold font-sans transition-all text-center cursor-pointer shadow-sm"
                >
                  Hard
                </button>
                <button
                  onClick={() => onRateChunk(activeChunk.id, "good")}
                  className="bg-[#2D4232] hover:bg-[#1A2E1F] text-[#FCF9F2] py-2.5 px-2 rounded-xl text-xs font-semibold font-sans transition-all text-center cursor-pointer shadow-sm"
                >
                  Good
                </button>
                <button
                  onClick={() => onRateChunk(activeChunk.id, "easy")}
                  className="bg-[#BFA780] hover:bg-[#8A7D63] text-white py-2.5 px-2 rounded-xl text-xs font-semibold font-sans transition-all text-center cursor-pointer shadow-sm"
                >
                  Easy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Active Review Queue & Core Parameters List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-[#EAE3D2] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE3D2]">
              <div className="flex items-center gap-1.5 text-[#2D4232]">
                <Layers className="w-4 h-4 text-[#BFA780]" />
                <span className="text-xs font-medium text-[#2D4232]">Spaced Repetition List</span>
              </div>
              <span className="text-[10px] font-mono text-[#8A7D63] uppercase tracking-wider">
                QUEUE STATUS
              </span>
            </div>

            {/* List of all chunks with their parameters */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {chunks.map((chunk, idx) => {
                const state = fsrsStates[chunk.id];
                const isSelected = selectedChunkId === chunk.id;
                const chunkRetrievability = state 
                    ? calculateRetrievability(state.stability, state.lastReviewedAt)
                    : 1.0;
                const isDue = state && state.scheduledDate <= todayStr;
                const isNew = !state || !state.lastReviewedAt;

                return (
                  <div
                    key={chunk.id}
                    onClick={() => onSelectChunk(chunk.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? "bg-[#FCF9F2] border-[#D4C3A1] shadow-sm"
                        : "bg-transparent border-transparent text-[#2D4232]/80 hover:bg-[#FCF9F2]/40 hover:border-[#EAE3D2]"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-[#8A7D63]">
                          #{idx + 1}
                        </span>
                        <p className="text-xs font-serif text-[#2D4232] truncate" dir="rtl">
                          {chunk.arabic}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-mono text-[#8A7D63]">
                          {chunk.verseNumber}:{chunk.chunkIndex + 1}
                        </span>
                        {state && (
                          <span className="text-[9px] font-mono text-[#5A6357]">
                            S: {state.stability}d | D: {state.difficulty.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isDue ? (
                        <span className="text-[8px] uppercase font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-lg">
                          Due
                        </span>
                      ) : isNew ? (
                        <span className="text-[8px] uppercase font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-lg">
                          New
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-[#8A7D63]">
                          {(chunkRetrievability * 100).toFixed(0)}% R
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAE3D2] text-[10px] text-[#8A7D63] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#BFA780]" />
            <span>FSRS automatically schedules reviews based on retrievability decline.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
