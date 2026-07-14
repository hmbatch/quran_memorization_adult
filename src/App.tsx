/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Surah, SemanticChunk, Mutashabih, FSRSMemberState, FSRSRating, UserStats } from "./types";
import { SEMANTIC_CHUNKS, MUTASHABIHAT } from "./data";
import { initializeFSRSState, updateFSRSState } from "./utils/fsrs";
import { QURAN_114_SURAHS, fetchSurahVerses, QuranicVerse } from "./utils/quranApi";

import MemoryPalace from "./components/MemoryPalace";
import SpacedRepetitionDashboard from "./components/SpacedRepetitionDashboard";
import TajweedASR from "./components/TajweedASR";
import ActiveSessionTimer from "./components/ActiveSessionTimer";
import SemanticChunkList from "./components/SemanticChunkList";
import FSRSNotificationManager, { FSRSOffScheduleBanner } from "./components/FSRSNotificationManager";

import {
  Compass,
  Brain,
  Mic,
  Flame,
  Layers,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Sliders,
  Play,
  RefreshCw,
  Search
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  const [selectedSurah, setSelectedSurah] = useState<Surah>(QURAN_114_SURAHS[0]);
  const [activeTab, setActiveTab] = useState<"session" | "palace" | "fsrs" | "asr" | "nlp">("session");
  const [activeChunkId, setActiveChunkId] = useState<string | null>(null);

  // Cloud Quran API Dynamic loading states
  const [loadedVerses, setLoadedVerses] = useState<QuranicVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [chunkingVerseNumber, setChunkingVerseNumber] = useState<number | null>(null);
  const [surahSearch, setSurahSearch] = useState("");

  // Custom imported / chunked verses and mutashabihat
  const [customChunks, setCustomChunks] = useState<SemanticChunk[]>([]);
  const [customMutashabihat, setCustomMutashabihat] = useState<Mutashabih[]>([]);

  // Fetch verses from api.alquran.cloud on selectedSurah change
  useEffect(() => {
    let active = true;
    const loadVerses = async () => {
      if (selectedSurah.id === 999) return; // Skip custom parse surah
      setLoadingVerses(true);
      setLoadedVerses([]);
      try {
        const verses = await fetchSurahVerses(selectedSurah.id);
        if (active) {
          setLoadedVerses(verses);
        }
      } catch (err) {
        console.error("Error loading verses from cloud:", err);
      } finally {
        if (active) {
          setLoadingVerses(false);
        }
      }
    };
    loadVerses();
    return () => {
      active = false;
    };
  }, [selectedSurah]);

  const handleChunkVerse = async (verse: QuranicVerse) => {
    setChunkingVerseNumber(verse.numberInSurah);
    try {
      const res = await fetch("/api/gemini/chunk-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arabicText: verse.text,
          translationText: verse.translation,
        }),
      });
      const data = await res.json();
      if (data.chunks && data.chunks.length > 0) {
        const formatted: SemanticChunk[] = data.chunks.map((chk: any, idx: number) => ({
          id: `${selectedSurah.id}_${verse.numberInSurah}_${idx}`,
          surahId: selectedSurah.id,
          verseNumber: verse.numberInSurah,
          chunkIndex: idx,
          arabic: chk.arabic,
          translation: chk.translation,
          transliteration: chk.transliteration || "Transliteration",
          thematicLabel: chk.thematicLabel || "Divine Majesty",
          visualAnchorPrompt: chk.visualAnchorPrompt || "Abstract geometric lines.",
          tafsir: chk.tafsir || "No exegesis provided."
        }));

        setCustomChunks((prev) => {
          const filtered = prev.filter((pc) => !formatted.some((nc) => nc.id === pc.id));
          return [...filtered, ...formatted];
        });

        const newFsrs = { ...fsrsStates };
        formatted.forEach((c) => {
          if (!newFsrs[c.id]) {
            newFsrs[c.id] = initializeFSRSState(c.id);
          }
        });
        saveFsrsStates(newFsrs);

        if (formatted.length > 0) {
          setActiveChunkId(formatted[0].id);
        }
      }
    } catch (err) {
      console.error("Dynamic chunking error:", err);
    } finally {
      setChunkingVerseNumber(null);
    }
  };

  // Local Spaced Repetition and stats persistence
  const [fsrsStates, setFsrsStates] = useState<Record<string, FSRSMemberState>>({});
  const [stats, setStats] = useState<UserStats>({
    dailyStreak: 3, // Starter mock streak for adult busy profile
    lastActiveDate: new Date().toISOString().split("T")[0],
    totalMinutesSpent: 45,
    completedChunks: [],
    sessionLimitReached: false,
  });

  // Combine standard and custom chunks
  const allChunks = [...SEMANTIC_CHUNKS, ...customChunks];
  const allMutashabihat = [...MUTASHABIHAT, ...customMutashabihat];

  // Filter chunks for active Surah
  const activeSurahChunks = allChunks.filter((c) => c.surahId === selectedSurah.id);

  // Initialize active chunk id when Surah changes
  useEffect(() => {
    if (activeSurahChunks.length > 0) {
      setActiveChunkId(activeSurahChunks[0].id);
    } else {
      setActiveChunkId(null);
    }
  }, [selectedSurah]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedStates = localStorage.getItem("fsrs_states");
    const savedStats = localStorage.getItem("memorizer_stats");

    // Initialize all standard chunks to default FSRS states if empty
    const initialFsrs: Record<string, FSRSMemberState> = {};
    allChunks.forEach((c) => {
      initialFsrs[c.id] = initializeFSRSState(c.id);
    });

    if (savedStates) {
      try {
        const parsed = JSON.parse(savedStates);
        // Merge saved states with initial ones to handle newly added or custom chunks
        setFsrsStates({ ...initialFsrs, ...parsed });
      } catch (e) {
        setFsrsStates(initialFsrs);
      }
    } else {
      setFsrsStates(initialFsrs);
    }

    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        // use default stats
      }
    }
  }, []);

  // Save states helper
  const saveFsrsStates = (newStates: Record<string, FSRSMemberState>) => {
    setFsrsStates(newStates);
    localStorage.setItem("fsrs_states", JSON.stringify(newStates));
  };

  const saveStats = (newStats: UserStats) => {
    setStats(newStats);
    localStorage.setItem("memorizer_stats", JSON.stringify(newStats));
  };

  const handleMockProgressUpdate = (mockedStats: UserStats, mockedFsrs?: Record<string, FSRSMemberState>) => {
    saveStats(mockedStats);
    if (mockedFsrs) {
      saveFsrsStates(mockedFsrs);
    }
  };

  // Feature Requirement 3: FSRS Mathematical Scheduling rating trigger
  const handleRateChunk = (chunkId: string, rating: FSRSRating) => {
    const currentState = fsrsStates[chunkId] || initializeFSRSState(chunkId);
    const updatedState = updateFSRSState(currentState, rating);

    const newStates = {
      ...fsrsStates,
      [chunkId]: updatedState,
    };
    saveFsrsStates(newStates);

    // Update statistics if passed successfully
    if (rating === "good" || rating === "easy") {
      const updatedCompleted = stats.completedChunks.includes(chunkId)
        ? stats.completedChunks
        : [...stats.completedChunks, chunkId];

      saveStats({
        ...stats,
        completedChunks: updatedCompleted,
      });
    }
  };

  // Custom inputs importing (Feature 1 Chunker endpoint integration)
  const handleImportCustomChunks = (newChunks: SemanticChunk[]) => {
    setCustomChunks((prev) => {
      const filtered = prev.filter((pc) => !newChunks.some((nc) => nc.id === pc.id));
      const updated = [...filtered, ...newChunks];
      
      // Auto register custom FSRS states
      const newFsrs = { ...fsrsStates };
      newChunks.forEach((c) => {
        if (!newFsrs[c.id]) {
          newFsrs[c.id] = initializeFSRSState(c.id);
        }
      });
      saveFsrsStates(newFsrs);
      return updated;
    });

    // Auto switch to custom imported surah (id 999)
    setSelectedSurah({
      id: 999,
      name: "الآية المخصصة",
      englishName: "Custom Parse",
      versesCount: 1,
      revelationType: "Meccan",
      summary: "Custom analyzed classical Arabic verse, parsed using dependency-constituency rules."
    });
    setActiveTab("nlp");
  };

  const handleImportCustomMutashabihat = (newMutashabihat: Mutashabih[]) => {
    setCustomMutashabihat((prev) => {
      const filtered = prev.filter((pm) => !newMutashabihat.some((nm) => nm.id === pm.id));
      return [...filtered, ...newMutashabihat];
    });
  };

  const handleCompleteDailySession = () => {
    // Add 15 minutes to statistics
    saveStats({
      ...stats,
      totalMinutesSpent: stats.totalMinutesSpent + 15,
      lastActiveDate: new Date().toISOString().split("T")[0],
    });
  };

  // Calculate master progress metrics
  const totalCompletedCount = stats.completedChunks.length;
  const averageRetrievability = Object.keys(fsrsStates).length > 0
    ? (Object.values(fsrsStates) as FSRSMemberState[]).reduce((sum: number, s: FSRSMemberState) => sum + (s.retrievability || 1.0), 0) / Object.keys(fsrsStates).length
    : 1.0;

  return (
    <div className="min-h-screen bg-[#FCF9F2] font-sans antialiased text-[#2D4232] flex flex-col relative overflow-hidden">
      
      {/* Decorative Star/Islamic motif */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none text-[#2D4232]">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0L61.2 38.8H100L68.8 61.2L80 100L50 77.6L20 100L31.2 61.2L0 38.8H38.8L50 0Z" />
        </svg>
      </div>

      {/* Top Premium Golden Islamic Border Banner */}
      <div className="h-1 bg-[#BFA780]"></div>

      <FSRSOffScheduleBanner
        chunks={allChunks}
        fsrsStates={fsrsStates}
        onStartReview={() => {
          setActiveTab("fsrs");
          setTimeout(() => {
            document.getElementById("spaced-repetition-section")?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        }}
      />

      {/* Main Luxury Header Navigation */}
      <header className="border-b border-[#D4C3A1] bg-[#FCF9F2]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2D4232] flex items-center justify-center shadow-sm border border-[#D4C3A1]">
              <BookOpen className="w-5.5 h-5.5 text-[#FCF9F2] fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-light tracking-tight text-[#1A2E1F]">
                  HAFIZ <span className="text-[#BFA780] italic text-sm ml-1">The Memorizer</span>
                </h1>
                <span className="text-[9px] font-mono bg-[#EAE3D2] text-[#2D4232] px-1.5 py-0.5 rounded border border-[#D4C3A1] font-bold uppercase">
                  Adult Cognitive
                </span>
              </div>
              <p className="text-[10px] text-[#8A7D63] uppercase tracking-wider mt-0.5">
                Spaced Repetition & Acoustic Tajweed Diagnostic Panel
              </p>
            </div>
          </div>

          {/* Quick Stats Header Cards */}
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-xs font-mono">
            <div className="bg-[#EAE3D2]/50 border border-[#D4C3A1] rounded-2xl py-1.5 px-3.5 flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#BFA780] animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] text-[#8A7D63] block uppercase leading-none">Daily Streak</span>
                <span className="text-xs font-bold text-[#2D4232]">{stats.dailyStreak} Days</span>
              </div>
            </div>

            <div className="bg-[#EAE3D2]/50 border border-[#D4C3A1] rounded-2xl py-1.5 px-3.5 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2D4232]" />
              <div className="text-left">
                <span className="text-[9px] text-[#8A7D63] block uppercase leading-none">Practice Time</span>
                <span className="text-xs font-bold text-[#2D4232]">{stats.totalMinutesSpent} Mins</span>
              </div>
            </div>

            <div className="bg-[#EAE3D2]/50 border border-[#D4C3A1] rounded-2xl py-1.5 px-3.5 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#2D4232]" />
              <div className="text-left">
                <span className="text-[9px] text-[#8A7D63] block uppercase leading-none">Global Mastery</span>
                <span className="text-xs font-bold text-[#2D4232]">{(averageRetrievability * 100).toFixed(0)}% R</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Panel Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Hand: Surah Selection / Dashboard Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white border border-[#EAE3D2] rounded-3xl p-5 shadow-sm">
            <span className="text-[10px] uppercase font-sans font-semibold text-[#BFA780] tracking-widest block mb-2.5">
              Select Surah Block
            </span>
            
            {/* Search Box for 114 Surahs */}
            <div className="relative mb-3.5">
              <input
                type="text"
                value={surahSearch}
                onChange={(e) => setSurahSearch(e.target.value)}
                placeholder="Search 114 chapters..."
                className="w-full bg-[#FCF9F2] text-[#2D4232] border border-[#EAE3D2] rounded-2xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#BFA780] placeholder-[#D4C3A1] shadow-inner font-sans"
              />
              <Search className="w-3.5 h-3.5 text-[#BFA780] absolute left-3.5 top-3" />
            </div>

            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {(() => {
                const filtered = QURAN_114_SURAHS.filter(
                  (s) =>
                    s.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
                    s.name.includes(surahSearch)
                );
                
                if (filtered.length === 0) {
                  return (
                    <p className="text-center text-xs text-[#8A7D63] py-4">No Surahs found.</p>
                  );
                }

                return filtered.map((surah) => {
                  const isSelected = selectedSurah.id === surah.id;
                  const surahChunksCount = allChunks.filter((c) => c.surahId === surah.id).length;

                  return (
                    <button
                      key={surah.id}
                      onClick={() => setSelectedSurah(surah)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-[#EAE3D2] border-[#D4C3A1] shadow-sm text-[#1A2E1F]"
                          : "bg-transparent border-transparent text-[#2D4232]/70 hover:bg-[#EAE3D2]/30 hover:text-[#1A2E1F]"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-sans">{surah.id}. {surah.englishName}</span>
                        </div>
                        <p className="text-[9px] text-[#5A6357] truncate mt-1">
                          {surahChunksCount} active chunks • {surah.versesCount} verses
                        </p>
                      </div>
                      <span className="text-sm font-serif font-medium text-[#2D4232]">
                        {surah.name}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* Surah Summary / Cognitive Card */}
          <div className="bg-[#EAE3D2] border border-[#D4C3A1] rounded-3xl p-5 text-xs text-[#2D4232]">
            <div className="flex items-center gap-2 text-[#2D4232] font-bold mb-2">
              <Info className="w-4 h-4 text-[#BFA780]" />
              <span>Surah Context Guide</span>
            </div>
            <p className="text-[#5A6357] leading-relaxed text-[11px] font-sans">
              {selectedSurah.summary}
            </p>
            <div className="mt-3.5 pt-3 border-t border-[#D4C3A1] text-[10px] text-[#8A7D63] flex items-center justify-between">
              <span>Revelation Paradigm:</span>
              <span className="font-mono text-[#FCF9F2] bg-[#2D4232] border border-[#2D4232] px-1.5 py-0.5 rounded text-[10px]">
                {selectedSurah.revelationType}
              </span>
            </div>
          </div>
        </div>

        {/* Right Hand: Multi-Tab Functional Modules (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Module Tabs Swapper */}
          <div className="flex flex-wrap gap-2 bg-[#EAE3D2]/40 p-1.5 rounded-2xl border border-[#D4C3A1] shadow-sm">
            <button
              onClick={() => setActiveTab("session")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                activeTab === "session"
                  ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                  : "text-[#5A6357] hover:text-[#2D4232] hover:bg-white/50"
              }`}
            >
              <Clock className="w-4 h-4" /> 15-Min Habit Loop
            </button>
            <button
              onClick={() => setActiveTab("asr")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                activeTab === "asr"
                  ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                  : "text-[#5A6357] hover:text-[#2D4232] hover:bg-white/50"
              }`}
            >
              <Mic className="w-4 h-4" /> ASR Diagnostic Lab
            </button>
            <button
              onClick={() => setActiveTab("fsrs")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                activeTab === "fsrs"
                  ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                  : "text-[#5A6357] hover:text-[#2D4232] hover:bg-white/50"
              }`}
            >
              <Brain className="w-4 h-4" /> FSRS Scheduling
            </button>
            <button
              onClick={() => setActiveTab("palace")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                activeTab === "palace"
                  ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                  : "text-[#5A6357] hover:text-[#2D4232] hover:bg-white/50"
              }`}
            >
              <Compass className="w-4 h-4" /> Memory Palace
            </button>
            <button
              onClick={() => setActiveTab("nlp")}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer ${
                activeTab === "nlp"
                  ? "bg-[#2D4232] text-[#FCF9F2] font-bold shadow-sm"
                  : "text-[#5A6357] hover:text-[#2D4232] hover:bg-white/50"
              }`}
            >
              <Sliders className="w-4 h-4" /> NLP Custom
            </button>
          </div>

          {/* Render Active Tab Component */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "session" && (
              <ActiveSessionTimer
                chunks={activeSurahChunks}
                fsrsStates={fsrsStates}
                onCompleteSession={handleCompleteDailySession}
                onSelectChunk={(cid) => {
                  setActiveChunkId(cid);
                  setActiveTab("fsrs");
                }}
              />
            )}

            {activeTab === "asr" && (
              <TajweedASR
                activeChunk={activeSurahChunks.find((c) => c.id === activeChunkId) || activeSurahChunks[0] || null}
                onNewFeedback={(feedback) => {
                  // If accuracy is high, reinforce FSRS stability
                  if (feedback.score >= 85 && activeChunkId) {
                    handleRateChunk(activeChunkId, "good");
                  }
                }}
              />
            )}

            {activeTab === "fsrs" && (
              <div className="space-y-6">
                <FSRSNotificationManager
                  chunks={allChunks}
                  fsrsStates={fsrsStates}
                  onStartReview={() => {
                    document.getElementById("spaced-repetition-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
                <SpacedRepetitionDashboard
                  chunks={activeSurahChunks}
                  allChunks={allChunks}
                  fsrsStates={fsrsStates}
                  onRateChunk={handleRateChunk}
                  selectedChunkId={activeChunkId}
                  onSelectChunk={setActiveChunkId}
                  maxNewDailyVerses={3}
                  stats={stats}
                  onMockProgressUpdate={handleMockProgressUpdate}
                />
              </div>
            )}

            {activeTab === "palace" && (
              <MemoryPalace
                chunks={activeSurahChunks}
                activeChunkId={activeChunkId}
                onSelectChunk={setActiveChunkId}
              />
            )}

            {activeTab === "nlp" && (
              <div className="space-y-6">
                <SemanticChunkList
                  chunks={activeSurahChunks}
                  mutashabihat={allMutashabihat.filter(
                    (m) =>
                      m.originalVerseRef.includes(selectedSurah.englishName) ||
                      m.similarVerseRef.includes(selectedSurah.englishName)
                  )}
                  onImportCustomChunks={handleImportCustomChunks}
                  onImportCustomMutashabihat={handleImportCustomMutashabihat}
                />

                {/* Verse Directory & Dynamic NLP Segmenter */}
                <div className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-[#BFA780]" />
                    <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider block">
                      Verse Directory & Dynamic NLP Segmenter
                    </span>
                  </div>
                  <h2 className="text-lg font-serif font-light text-[#1A2E1F] mb-4">
                    Explore & Chunk {selectedSurah.englishName} Verses
                  </h2>

                  {loadingVerses ? (
                    <div className="text-center py-12 bg-[#FCF9F2]/50 border border-dashed border-[#EAE3D2] rounded-2xl">
                      <RefreshCw className="w-8 h-8 text-[#BFA780] animate-spin mx-auto mb-2" />
                      <p className="text-xs text-[#8A7D63]">Streaming authentic Arabic texts from cloud registry...</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {loadedVerses.map((verse) => {
                        const hasChunks = allChunks.some(
                          (c) => c.surahId === selectedSurah.id && c.verseNumber === verse.numberInSurah
                        );
                        const isChunking = chunkingVerseNumber === verse.numberInSurah;

                        return (
                          <div
                            key={verse.numberInSurah}
                            className="bg-[#FCF9F2] border border-[#EAE3D2] rounded-2xl p-4.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#BFA780] transition-colors shadow-sm"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-[#2D4232] text-[#FCF9F2] text-[10px] font-mono px-2 py-0.5 rounded-lg">
                                  Verse {selectedSurah.id}:{verse.numberInSurah}
                                </span>
                                {hasChunks && (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200">
                                    ACTIVE IN PALACE
                                  </span>
                                )}
                              </div>
                              <p className="text-2xl font-serif text-[#2D4232] text-right leading-relaxed" dir="rtl">
                                {verse.text}
                              </p>
                              <p className="text-xs text-[#5A6357] leading-relaxed">
                                {verse.translation}
                              </p>
                            </div>

                            <div className="w-full md:w-auto shrink-0 self-end md:self-center">
                              {hasChunks ? (
                                <button
                                  disabled
                                  className="w-full md:w-auto bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold py-2 px-3.5 rounded-full flex items-center justify-center gap-1.5"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  Active Queue
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleChunkVerse(verse)}
                                  disabled={!!chunkingVerseNumber}
                                  className="w-full md:w-auto bg-[#2D4232] hover:bg-[#1A2E1F] disabled:opacity-40 text-[#FCF9F2] font-semibold py-2 px-4 rounded-full text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  {isChunking ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      Segmenting...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5" />
                                      Chunk & Memorize
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-[#D4C3A1] bg-[#EAE3D2]/20 text-center py-6 text-xs text-[#8A7D63] mt-12 font-sans relative z-10">
        <p>© 2026 Quran Memorization App • Full-Stack Adult Neurocognitive Implementation</p>
        <p className="mt-1 font-mono text-[10px] text-[#8A7D63]/70">
          FSRS Spaced Repetition Core Engine • Wav2Vec2-XLSR Sifat Mapping Analyzer
        </p>
      </footer>
    </div>
  );
}
