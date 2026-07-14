/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { FSRSMemberState, UserStats, SemanticChunk } from "../types";
import { calculateRetrievability } from "../utils/fsrs";
import { 
  Award, 
  Flame, 
  CheckCircle, 
  Brain, 
  Mic, 
  Trophy, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Clock,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QURAN_114_SURAHS } from "../utils/quranApi";

interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  category: "streak" | "completion" | "retention" | "asr" | "hours";
  targetText: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  accentColor: string;
}

const BADGES: BadgeDefinition[] = [
  {
    id: "streak_7",
    title: "The Steadfast Hafiz",
    description: "Maintain a daily learning streak of 7 days or more.",
    longDescription: "Consistency is the lifeblood of long-term memory consolidation. By practicing 7 days in a row, you establish the baseline neuroplastic pathway for memorization.",
    category: "streak",
    targetText: "7 Day Streak",
    icon: Flame,
    colorClass: "text-[#E67E22]",
    bgClass: "bg-[#FDF2E9]",
    borderClass: "border-[#F5CBA7]",
    accentColor: "#E67E22",
  },
  {
    id: "surah_complete_fatiha",
    title: "Al-Fatiha Anchor",
    description: "Complete all 8 semantic chunks of Surah Al-Fatiha.",
    longDescription: "The Opening has been fully encoded in your spaced-repetition scheduler. Every verse and thematic chunk is now structurally mapped for durable long-term storage.",
    category: "completion",
    targetText: "All 8 Chunks of Surah 1",
    icon: BookOpen,
    colorClass: "text-[#27AE60]",
    bgClass: "bg-[#EBF5FB]",
    borderClass: "border-[#AED6F1]",
    accentColor: "#27AE60",
  },
  {
    id: "flawless_recall",
    title: "Unshakable Memory",
    description: "Achieve 100% estimated retrievability on a complex chunk.",
    longDescription: "Achieved when an active FSRS card with a difficulty score of 5.0 or higher is rated 'Good' or 'Easy' and reaches 100% estimated probability of retrieval.",
    category: "retention",
    targetText: "100% R (D ≥ 5.0)",
    icon: Brain,
    colorClass: "text-[#8E44AD]",
    bgClass: "bg-[#F5EEF8]",
    borderClass: "border-[#D7BDE2]",
    accentColor: "#8E44AD",
  },
  {
    id: "tajweed_master",
    title: "Golden Reciter",
    description: "Earn a high score of 95% or higher on a Tajweed ASR recitation.",
    longDescription: "Earned by achieving near-perfect acoustic alignment with correct phoneme articulation (Makharaj) and Sifat (such as Qalqala, Ghunnah, or Madd) in the Diagnostic Lab.",
    category: "asr",
    targetText: "95%+ ASR Score",
    icon: Mic,
    colorClass: "text-[#D4AC0D]",
    bgClass: "bg-[#FEF9E7]",
    borderClass: "border-[#F9E79F]",
    accentColor: "#D4AC0D",
  },
  {
    id: "dedicated_hours",
    title: "Devoted Diligence",
    description: "Accumulate 60 minutes or more of active, focused practice.",
    longDescription: "You have dedicated over an hour of high-density cognitive effort in active recall, progressive cloze filtering, and audio recitation loops.",
    category: "hours",
    targetText: "60+ Mins Total",
    icon: Clock,
    colorClass: "text-[#1F618D]",
    bgClass: "bg-[#EAF2F8]",
    borderClass: "border-[#A9CCE3]",
    accentColor: "#1F618D",
  },
  {
    id: "surah_complete_any",
    title: "Sovereign Scholar",
    description: "Complete all chunks of any other Surah in your collection.",
    longDescription: "You have mastered a secondary Surah entirely. By chunking, mapping to your memory palace, and scheduling under FSRS, you are building a vast mental registry.",
    category: "completion",
    targetText: "Master Any Other Surah",
    icon: Trophy,
    colorClass: "text-[#D35400]",
    bgClass: "bg-[#FBEEE6]",
    borderClass: "border-[#F5CBA7]",
    accentColor: "#D35400",
  },
];

interface AchievementsBadgesProps {
  stats: UserStats;
  fsrsStates: Record<string, FSRSMemberState>;
  allChunks: SemanticChunk[];
  onMockProgressUpdate?: (mockedStats: UserStats, mockedFsrs?: Record<string, FSRSMemberState>) => void;
}

export default function AchievementsBadges({
  stats,
  fsrsStates,
  allChunks,
  onMockProgressUpdate,
}: AchievementsBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Helper to calculate surah completion progress
  const getSurahCompletionProgress = (surahId: number) => {
    const surahChunks = allChunks.filter((c) => c.surahId === surahId);
    if (surahChunks.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    const completedCount = surahChunks.filter((c) => stats.completedChunks.includes(c.id)).length;
    return {
      total: surahChunks.length,
      completed: completedCount,
      percentage: Math.round((completedCount / surahChunks.length) * 100),
    };
  };

  // Helper to check if a surah other than Al-Fatiha is 100% completed
  const checkAnyOtherSurahCompleted = () => {
    // Group all chunks by surahId (excluding Surah 1)
    const surahsInChunks = Array.from(new Set(allChunks.map((c) => c.surahId))).filter((id) => id !== 1);
    
    for (const surahId of surahsInChunks) {
      const { percentage } = getSurahCompletionProgress(surahId);
      if (percentage === 100) return true;
    }
    return false;
  };

  // Check which badge is unlocked and get its current progress ratio
  const evaluateBadgeStatus = (badgeId: string): { unlocked: boolean; progress: number; currentVal: string } => {
    switch (badgeId) {
      case "streak_7": {
        const progress = Math.min(1, stats.dailyStreak / 7);
        return {
          unlocked: stats.dailyStreak >= 7,
          progress,
          currentVal: `${stats.dailyStreak}/7 days`,
        };
      }
      case "surah_complete_fatiha": {
        const info = getSurahCompletionProgress(1); // Al-Fatiha Surah ID is 1
        return {
          unlocked: info.total > 0 && info.completed === info.total,
          progress: info.total > 0 ? info.completed / info.total : 0,
          currentVal: `${info.completed}/${info.total} chunks`,
        };
      }
      case "flawless_recall": {
        // Find if there is a chunk state with difficulty >= 5.0 and 100% retrievability
        let found = false;
        let maxR = 0;
        Object.values(fsrsStates).forEach((s) => {
          if (s.lastReviewedAt) {
            const r = calculateRetrievability(s.stability, s.lastReviewedAt);
            if (s.difficulty >= 5.0 && r >= 0.999) {
              found = true;
            }
            if (s.difficulty >= 5.0 && r > maxR) {
              maxR = r;
            }
          }
        });
        return {
          unlocked: found,
          progress: found ? 1 : Math.min(1, maxR),
          currentVal: found ? "100% R (Unlocked)" : `${Math.round(maxR * 100)}% Max R`,
        };
      }
      case "tajweed_master": {
        // We will read a custom ASR high score from localStorage
        const asrHighScoreStr = localStorage.getItem("tajweed_asr_highscore");
        const highScore = asrHighScoreStr ? Number(asrHighScoreStr) : 88; // Default seeded baseline for mock
        const progress = Math.min(1, highScore / 95);
        return {
          unlocked: highScore >= 95,
          progress,
          currentVal: `${highScore}% Score`,
        };
      }
      case "dedicated_hours": {
        const progress = Math.min(1, stats.totalMinutesSpent / 60);
        return {
          unlocked: stats.totalMinutesSpent >= 60,
          progress,
          currentVal: `${stats.totalMinutesSpent}/60 mins`,
        };
      }
      case "surah_complete_any": {
        const completed = checkAnyOtherSurahCompleted();
        // Calculate max percentage of any non-Fatiha surah
        const surahsInChunks = Array.from(new Set(allChunks.map((c) => c.surahId))).filter((id) => id !== 1);
        let maxPct = 0;
        surahsInChunks.forEach((id) => {
          const info = getSurahCompletionProgress(id);
          if (info.percentage > maxPct) {
            maxPct = info.percentage;
          }
        });
        return {
          unlocked: completed,
          progress: completed ? 1 : maxPct / 100,
          currentVal: completed ? "Mastered" : `${maxPct}% Done`,
        };
      }
      default:
        return { unlocked: false, progress: 0, currentVal: "0/0" };
    }
  };

  // Helper to simulate/mock a completed milestone so the user can see it in action
  const triggerMockUnlock = (type: "streak" | "fatiha" | "memory" | "asr" | "hours") => {
    if (!onMockProgressUpdate) return;

    if (type === "streak") {
      const newStats: UserStats = {
        ...stats,
        dailyStreak: 7,
      };
      onMockProgressUpdate(newStats);
      triggerSuccessNotification("The Steadfast Hafiz Badge Unlocked!");
    } else if (type === "fatiha") {
      // Mark all Al-Fatiha chunks as completed
      const fatihaChunks = allChunks.filter((c) => c.surahId === 1).map((c) => c.id);
      const newStats: UserStats = {
        ...stats,
        completedChunks: Array.from(new Set([...stats.completedChunks, ...fatihaChunks])),
      };
      onMockProgressUpdate(newStats);
      triggerSuccessNotification("Al-Fatiha Anchor Badge Unlocked!");
    } else if (type === "hours") {
      const newStats: UserStats = {
        ...stats,
        totalMinutesSpent: 65,
      };
      onMockProgressUpdate(newStats);
      triggerSuccessNotification("Devoted Diligence Badge Unlocked!");
    } else if (type === "asr") {
      localStorage.setItem("tajweed_asr_highscore", "97");
      // Just trigger a state refresh
      const newStats: UserStats = { ...stats };
      onMockProgressUpdate(newStats);
      triggerSuccessNotification("Golden Reciter Badge Unlocked!");
    } else if (type === "memory") {
      // Create or update a FSRS State with difficulty 6.0 and stability that gives 100% retrievability (last reviewed now)
      const mockFsrs = { ...fsrsStates };
      const fatihaChunks = allChunks.filter((c) => c.surahId === 1);
      if (fatihaChunks.length > 0) {
        const targetId = fatihaChunks[0].id;
        mockFsrs[targetId] = {
          chunkId: targetId,
          difficulty: 6.5,
          stability: 4.5,
          retrievability: 1.0,
          lastReviewedAt: new Date().toISOString(),
          scheduledDate: new Date().toISOString().split("T")[0],
          reviewHistory: [],
        };
      }
      onMockProgressUpdate(stats, mockFsrs);
      triggerSuccessNotification("Unshakable Memory Badge Unlocked!");
    }
  };

  const triggerSuccessNotification = (message: string) => {
    setShowNotification(message);
    setTimeout(() => {
      setShowNotification(null);
    }, 4500);
  };

  // Count total unlocked badges
  const unlockedCount = BADGES.reduce((acc, badge) => {
    const { unlocked } = evaluateBadgeStatus(badge.id);
    return acc + (unlocked ? 1 : 0);
  }, 0);

  return (
    <div className="bg-white border border-[#EAE3D2] rounded-3xl p-5 shadow-sm space-y-5">
      {/* Toast Notification for Unlocks */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#2D4232] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-[#D4C3A1] flex items-center gap-3 max-w-sm"
          >
            <div className="bg-[#BFA780] p-1.5 rounded-full text-[#1A2E1F]">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-bold font-sans">Achievement Milestone!</p>
              <p className="text-[11px] text-[#FCF9F2]/90 mt-0.5 font-medium">{showNotification}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#F1EDE5] pb-4">
        <div>
          <span className="text-[9px] uppercase font-mono text-[#8A7D63] tracking-widest font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#BFA780]" /> NEUROCOGNITIVE ACHIEVEMENT SYSTEMS
          </span>
          <h3 className="text-base font-serif font-light text-[#1A2E1F] mt-1">
            Hafiz Milestone & Digital Badges Registry
          </h3>
        </div>

        {/* Total Badge Unlocks Summary */}
        <div className="flex items-center gap-2 bg-[#FCF9F2] px-3.5 py-1.5 rounded-2xl border border-[#EAE3D2]">
          <Trophy className="w-4 h-4 text-[#BFA780]" />
          <span className="text-[10px] font-mono text-[#8A7D63]">
            UNLOCKED: <strong className="text-[#2D4232] font-extrabold">{unlockedCount} / {BADGES.length}</strong>
          </span>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BADGES.map((badge) => {
          const { unlocked, progress, currentVal } = evaluateBadgeStatus(badge.id);
          const BadgeIcon = badge.icon;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedBadge(badge)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[155px] ${
                unlocked 
                  ? "bg-white border-[#EAE3D2] shadow-sm hover:shadow-md" 
                  : "bg-gray-50/50 border-gray-200/80 grayscale opacity-75 hover:opacity-100 transition-opacity"
              }`}
            >
              {/* Unlock Indicator Banner */}
              {unlocked && (
                <div className="absolute top-0 right-0 bg-[#2D4232] text-[#FCF9F2] text-[8px] font-mono font-bold px-2 py-0.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <CheckCircle className="w-2.5 h-2.5 text-[#BFA780]" /> Earned
                </div>
              )}

              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  {/* Badge Icon Shield */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm ${
                    unlocked ? `${badge.bgClass} ${badge.borderClass}` : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}>
                    <BadgeIcon className={`w-5 h-5 ${unlocked ? badge.colorClass : "text-gray-400"}`} />
                  </div>

                  <div>
                    <h4 className="text-xs font-serif font-semibold text-[#1A2E1F]">{badge.title}</h4>
                    <span className="text-[9px] font-mono text-[#8A7D63] uppercase tracking-wider font-bold">
                      {badge.targetText}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-[#5A6357] leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Progress Bar & Status */}
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between items-center text-[9px] text-[#8A7D63] font-mono">
                  <span>Progress</span>
                  <span className="font-bold">{currentVal}</span>
                </div>
                <div className="w-full h-1.5 bg-[#EAE3D2]/50 rounded-full overflow-hidden border border-[#EAE3D2]/20">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${progress * 100}%`,
                      backgroundColor: unlocked ? badge.accentColor : "#A6ACAF"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Demonstration & Seeding Hub */}
      {onMockProgressUpdate && (
        <div className="bg-[#FCF9F2]/60 border border-[#EAE3D2] p-4 rounded-2xl space-y-2.5 text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#BFA780]" />
            <h4 className="text-xs font-semibold text-[#2D4232] font-sans">Badge Achievement Sandbox</h4>
          </div>
          <p className="text-[10px] text-[#8A7D63] leading-relaxed">
            Since database streaks and recitations take days to accumulate in real-time, use this secure sandbox to instantly simulate milestones and view active badge unlocking animations.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => triggerMockUnlock("streak")}
              className="bg-white hover:bg-[#EAE3D2]/40 text-[#2D4232] border border-[#EAE3D2] text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Simulate 7-Day Streak
            </button>
            <button
              onClick={() => triggerMockUnlock("fatiha")}
              className="bg-white hover:bg-[#EAE3D2]/40 text-[#2D4232] border border-[#EAE3D2] text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Simulate Surah Al-Fatiha Completed
            </button>
            <button
              onClick={() => triggerMockUnlock("memory")}
              className="bg-white hover:bg-[#EAE3D2]/40 text-[#2D4232] border border-[#EAE3D2] text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Simulate 100% Memory Recall
            </button>
            <button
              onClick={() => triggerMockUnlock("asr")}
              className="bg-white hover:bg-[#EAE3D2]/40 text-[#2D4232] border border-[#EAE3D2] text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Simulate 95%+ Tajweed ASR Recitation
            </button>
            <button
              onClick={() => triggerMockUnlock("hours")}
              className="bg-white hover:bg-[#EAE3D2]/40 text-[#2D4232] border border-[#EAE3D2] text-[9px] font-bold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Simulate 1-Hour Focused Learning
            </button>
          </div>
        </div>
      )}

      {/* Expanded Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-[#EAE3D2] max-w-md w-full p-6 shadow-2xl relative space-y-4"
          >
            <button 
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-lg p-1.5 cursor-pointer"
            >
              ✕
            </button>

            {/* Shield and Title header */}
            <div className="flex flex-col items-center text-center space-y-3 pt-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm ${selectedBadge.bgClass} ${selectedBadge.borderClass}`}>
                {React.createElement(selectedBadge.icon, { className: `w-8 h-8 ${selectedBadge.colorClass}` })}
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#8A7D63] uppercase tracking-widest font-bold">
                  {selectedBadge.targetText}
                </span>
                <h3 className="text-xl font-serif font-light text-[#1A2E1F] mt-1">{selectedBadge.title}</h3>
              </div>
            </div>

            {/* Long narrative explanation */}
            <div className="bg-[#FCF9F2] p-4.5 rounded-2xl border border-[#EAE3D2] text-left text-xs space-y-2">
              <p className="font-semibold text-[#2D4232] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#BFA780]" />
                Milestone Cognitive Context
              </p>
              <p className="text-[#5A6357] leading-relaxed">
                {selectedBadge.longDescription}
              </p>
            </div>

            {/* Action buttons */}
            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full bg-[#2D4232] text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-[#1A2E1F] transition-all cursor-pointer"
              >
                Return to Badges Registry
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
