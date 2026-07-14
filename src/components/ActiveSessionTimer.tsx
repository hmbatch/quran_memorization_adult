/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SemanticChunk, FSRSMemberState } from "../types";
import { calculateRetrievability } from "../utils/fsrs";
import { Play, Pause, RotateCcw, Lock, Unlock, HelpCircle, Flame, CheckCircle, BookOpen, Eye, EyeOff, Volume2, VolumeX, Loader2, Repeat } from "lucide-react";
import { getChunkTafsir } from "../utils/tafsirHelper";
import { QURAN_114_SURAHS } from "../utils/quranApi";

interface ActiveSessionTimerProps {
  chunks: SemanticChunk[];
  fsrsStates: Record<string, FSRSMemberState>;
  onCompleteSession: () => void;
  onSelectChunk: (chunkId: string) => void;
}

const METHOD_3X3_STEPS = [
  { name: "Read Chunk #1", description: "Read the active Arabic text carefully with its translation.", action: "Read with translation 3 times", reps: 3 },
  { name: "Recite Chunk #1 from memory", description: "Hide text or use Cloze Level 3 and recite from memory.", action: "Recite from memory 3 times", reps: 3 },
  { name: "Combine Chunks", description: "Combine the active chunk with preceding chunks and recite.", action: "Combine and recite 3 times", reps: 3 },
];

const METHOD_6446_STEPS = [
  { name: "Deep Read Chunk", description: "Analyze Classical Arabic grammar, transliteration, and meaning.", action: "Deep read 6 times", reps: 6 },
  { name: "Closed Recitation", description: "Fully mask text and recite from memory.", action: "Recite from memory 4 times", reps: 4 },
  { name: "Sequential Combining", description: "Recite active chunk connected directly with its predecessor.", action: "Combine chunks 4 times", reps: 4 },
  { name: "Final Consolidated Review", description: "Do a master run of the full Surah section.", action: "Review entire section 6 times", reps: 6 },
];

export default function ActiveSessionTimer({
  chunks,
  fsrsStates,
  onCompleteSession,
  onSelectChunk,
}: ActiveSessionTimerProps) {
  const [method, setMethod] = useState<"3x3" | "6-4-4-6">("3x3");
  const [stepIndex, setStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [timerRunning, setTimerRunning] = useState(false);
  const [currentRep, setCurrentRep] = useState(1);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Focus and Active recalling states
  const [activeChunkIdx, setActiveChunkIdx] = useState(0);
  const [clozeLevel, setClozeLevel] = useState<0 | 1 | 2>(0);
  const [showTafsir, setShowTafsir] = useState(false);

  // Audio Recitation states
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [reciter, setReciter] = useState<string>("ar.alafasy");
  const [audioState, setAudioState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [loopRecitation, setLoopRecitation] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // If there are no chunks generated yet
  if (chunks.length === 0) {
    return (
      <div className="bg-white border border-[#EAE3D2] rounded-3xl p-8 text-center text-[#8A7D63]">
        <HelpCircle className="w-12 h-12 text-[#D4C3A1] mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-serif font-light text-[#1A2E1F]">No Chunks Generated Yet</h3>
        <p className="text-xs max-w-sm mx-auto mt-2 leading-relaxed">
          The selected Surah doesn't have any active memorization chunks in this session. 
          Use the search and dropdown sidebar to select any of the 114 Surahs, scroll to its verses, and click the "Chunk & Memorize" button next to any verse to generate professional semantic segments instantly!
        </p>
      </div>
    );
  }

  const activeChunk = chunks[activeChunkIdx] || chunks[0];

  const getGlobalVerseNumber = (surahId: number, verseNumberInSurah: number): number => {
    let globalNum = 0;
    for (let i = 0; i < surahId - 1; i++) {
      const s = QURAN_114_SURAHS.find((x) => x.id === i + 1);
      if (s) {
        globalNum += s.versesCount;
      }
    }
    return globalNum + verseNumberInSurah;
  };

  // Synchronize audio properties with state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loopRecitation;
    }
  }, [loopRecitation]);

  // Pause audio when switching chunks or reciter
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setAudioState("idle");
    setCurrentTime(0);
    setDuration(0);
  }, [activeChunkIdx, reciter]);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlay = () => {
    if (!activeChunk) return;

    if (!audioRef.current) {
      setAudioState("loading");
      const globalVerseNum = getGlobalVerseNumber(activeChunk.surahId, activeChunk.verseNumber);
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/${reciter}/${globalVerseNum}.mp3`;
      
      const audio = new Audio(audioUrl);
      audio.playbackRate = playbackSpeed;
      audio.loop = loopRecitation;
      audioRef.current = audio;

      audio.addEventListener("canplaythrough", () => {
        setAudioState("playing");
        audio.play().catch((err) => {
          console.error("Audio playback error:", err);
          setAudioState("paused");
        });
      });

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration || 0);
      });

      audio.addEventListener("ended", () => {
        if (!loopRecitation) {
          setAudioState("idle");
          setCurrentTime(0);
        }
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio error event:", e);
        setAudioState("idle");
        alert("Could not load the recitation from the server. Please try again.");
      });
    } else {
      if (audioState === "playing") {
        audioRef.current.pause();
        setAudioState("paused");
      } else {
        setAudioState("playing");
        audioRef.current.play().catch((err) => {
          console.error("Playback error:", err);
          setAudioState("paused");
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const steps = method === "3x3" ? METHOD_3X3_STEPS : METHOD_6446_STEPS;
  const currentStep = steps[stepIndex];

  // 15-minute countdown clock effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setSessionCompleted(true);
            onCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft, onCompleteSession]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Check if FSRS retrievability drops too low, triggering lock mechanism
  const getLowRetrievabilityChunks = () => {
    return chunks.filter((c) => {
      const state = fsrsStates[c.id];
      if (!state || !state.lastReviewedAt) return false;
      const r = calculateRetrievability(state.stability, state.lastReviewedAt);
      return r < 0.75; // Low retrievability threshold (75%)
    });
  };

  const lowRetrievabilityChunks = getLowRetrievabilityChunks();
  const isLocked = lowRetrievabilityChunks.length > 0;

  const nextStep = () => {
    if (currentRep < currentStep.reps) {
      setCurrentRep((prev) => prev + 1);
    } else if (stepIndex < steps.length - 1) {
      setStepIndex((prev) => prev + 1);
      setCurrentRep(1);
    } else {
      // Completed all steps!
      setSessionCompleted(true);
      onCompleteSession();
    }
  };

  const resetSession = () => {
    setTimeLeft(900);
    setStepIndex(0);
    setCurrentRep(1);
    setTimerRunning(false);
    setSessionCompleted(false);
  };

  return (
    <div id="habit-loop-section" className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm text-[#2D4232]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-light text-[#1A2E1F] flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#BFA780]" /> Feature 5: UX/UI Habit Loop (15-Min Daily Session)
          </h2>
          <p className="text-xs text-[#5A6357] mt-1 font-sans">
            Enforces scientific "3x3" or "6-4-4-6" chunking workflows formatted for busy adult professionals.
          </p>
        </div>
        <div className="flex items-center gap-2 font-sans">
          {isLocked ? (
            <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-red-500" /> NEW CONTENT LOCKED
            </span>
          ) : (
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-emerald-600" /> MEMORIZATION HEALTHY
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Left Side: Countdown Timer & Controls */}
        <div className="lg:col-span-5 bg-[#FCF9F2] rounded-2xl p-6 border border-[#EAE3D2] text-center flex flex-col justify-between min-h-[320px] shadow-inner">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider block mb-1">
              Active Focus Timer
            </span>
            <div className="text-5xl font-mono font-light text-[#1A2E1F] tracking-tight my-4">
              {formatTime(timeLeft)}
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-3 mb-6">
              {!timerRunning ? (
                <button
                  onClick={() => setTimerRunning(true)}
                  disabled={isLocked && timeLeft === 900}
                  className="bg-[#2D4232] hover:bg-[#1A2E1F] disabled:opacity-40 text-[#FCF9F2] px-4 py-2 rounded-full text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Session
                </button>
              ) : (
                <button
                  onClick={() => setTimerRunning(false)}
                  className="bg-[#BFA780] hover:bg-[#8A7D63] text-white px-4 py-2 rounded-full text-xs font-bold font-sans transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}
              <button
                onClick={resetSession}
                className="bg-white hover:bg-[#FCF9F2] text-[#2D4232] px-3 py-2 rounded-full text-xs font-bold font-sans transition-all flex items-center gap-1.5 border border-[#D4C3A1] cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          {/* Locked Explanation Alert if Retrievability drops */}
          {isLocked ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-left text-xs text-red-900 shadow-sm">
              <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Memory Consolidation Block</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Gemini FSRS detected that you have {lowRetrievabilityChunks.length} active chunks under 75% retrievability. New content learning is locked to protect your cognitive load. Please review past chunks and rate them "Good" or "Easy" to unlock.
              </p>
              <div className="mt-2.5 space-y-1">
                {lowRetrievabilityChunks.map((c) => (
                  <div key={c.id} className="text-[10px] text-red-800 font-mono flex justify-between items-center bg-white p-1.5 rounded-lg border border-red-200">
                    <span>Chunk {c.verseNumber}:{c.chunkIndex + 1}</span>
                    <span className="text-red-600 font-bold">R: {(calculateRetrievability(fsrsStates[c.id].stability, fsrsStates[c.id].lastReviewedAt) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl text-left text-xs text-emerald-900 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                <Unlock className="w-4 h-4 text-emerald-600" />
                <span>Habit Integration Loop</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Your spaced repetition states are completely optimal. Make sure to complete the daily 15-minute sequence of mixed readings and reciting.
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Step-by-Step Chunking Method Progress */}
        <div className="lg:col-span-7 bg-[#FCF9F2] rounded-2xl p-6 border border-[#EAE3D2] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#EAE3D2]">
              <div>
                <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider">
                  Active Workflow Method
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <select
                    value={method}
                    onChange={(e) => {
                      setMethod(e.target.value as "3x3" | "6-4-4-6");
                      setStepIndex(0);
                      setCurrentRep(1);
                    }}
                    className="bg-white text-[#2D4232] border border-[#D4C3A1] rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#BFA780]"
                  >
                    <option value="3x3">3x3 Method (Standard)</option>
                    <option value="6-4-4-6">6-4-4-6 Method (Intense)</option>
                  </select>
                </div>
              </div>
              <span className="text-xs font-mono text-[#8A7D63]">
                Step {stepIndex + 1} of {steps.length}
              </span>
            </div>

            {sessionCompleted ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#2D4232] animate-bounce mb-3" />
                <h4 className="text-[#1A2E1F] font-serif font-light text-base">Daily Focus Session Completed!</h4>
                <p className="text-xs text-[#5A6357] max-w-sm mx-auto mt-1 leading-relaxed font-sans">
                  Excellent consistency! Your brain consolidates these pathways during sleep. Continue tomorrow.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Chunk Training Panel (Cognitive Architecture) */}
                {(() => {
                  const activeChunk = chunks[activeChunkIdx] || chunks[0];
                  if (!activeChunk) return null;

                  const maskArabicText = (text: string) => {
                    const words = text.split(" ");
                    return words.map((w, idx) => (idx % 2 === 1 ? "████" : w)).join(" ");
                  };

                  return (
                    <div className="bg-[#FCF9F2] border border-[#EAE3D2] rounded-2xl p-4.5 shadow-sm text-center">
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-3">
                        <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider">
                          Currently Training Chunk {activeChunkIdx + 1} of {chunks.length}
                        </span>
                        <select
                          value={activeChunkIdx}
                          onChange={(e) => {
                            setActiveChunkIdx(Number(e.target.value));
                            setShowTafsir(false);
                          }}
                          className="bg-white text-xs text-[#2D4232] border border-[#EAE3D2] rounded-lg px-2 py-1 focus:outline-none"
                        >
                          {chunks.map((c, i) => (
                            <option key={c.id} value={i}>
                              Chunk {c.verseNumber}:{c.chunkIndex + 1} ({c.thematicLabel})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Classical Arabic display with Cloze Deletion support */}
                      <div className="bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-inner mb-3">
                        <p className="text-2xl font-serif text-[#2D4232] leading-relaxed tracking-wide mb-2" dir="rtl">
                          {clozeLevel === 0
                            ? activeChunk.arabic
                            : clozeLevel === 1
                            ? maskArabicText(activeChunk.arabic)
                            : "████ ████ ████"}
                        </p>
                        
                        {clozeLevel < 2 && (
                          <p className="text-[11px] font-mono text-[#5A6357] italic">
                            "{activeChunk.transliteration}"
                          </p>
                        )}
                        
                        <p className="text-xs text-[#2D4232] mt-2 font-medium leading-relaxed">
                          {activeChunk.translation}
                        </p>
                      </div>

                      {/* Tajweed & Professional Recitation Player */}
                      <div className="bg-[#FCF9F2]/60 border border-[#EAE3D2] rounded-2xl p-3.5 mb-3.5 text-left space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] uppercase font-mono text-[#8A7D63] tracking-widest font-bold flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5 text-[#BFA780]" />
                            Tajweed Recitation
                          </span>
                          <select
                            value={reciter}
                            onChange={(e) => setReciter(e.target.value)}
                            className="bg-white text-[10px] text-[#2D4232] border border-[#EAE3D2] rounded-lg px-2 py-1 focus:outline-none font-semibold cursor-pointer"
                          >
                            <option value="ar.alafasy">Mishary Rashid Alafasy</option>
                            <option value="ar.husary">Mahmoud Khalil Al-Husary</option>
                            <option value="ar.minshawi">Mohamed Siddiq El-Minshawi</option>
                            <option value="ar.abdulsamad">Abdul Basit Abdus Samad</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#EAE3D2]">
                          {/* Play/Pause Button */}
                          <button
                            onClick={handleTogglePlay}
                            disabled={audioState === "loading"}
                            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full bg-[#2D4232] text-white hover:bg-[#1A2E1F] disabled:bg-[#8A7D63]/30 transition-all cursor-pointer shadow-sm"
                          >
                            {audioState === "loading" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : audioState === "playing" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>

                          {/* Dynamic Progress/Timeline controls */}
                          <div className="flex-1 space-y-1">
                            <input
                              type="range"
                              min={0}
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full h-1 bg-[#EAE3D2] accent-[#2D4232] rounded-lg cursor-pointer range-xs"
                            />
                            <div className="flex justify-between items-center text-[9px] text-[#8A7D63] font-mono">
                              <span>
                                {Math.floor(currentTime / 60)}:
                                {String(Math.floor(currentTime % 60)).padStart(2, "0")}
                              </span>
                              <span>
                                {Math.floor(duration / 60)}:
                                {String(Math.floor(duration % 60)).padStart(2, "0")}
                              </span>
                            </div>
                          </div>

                          {/* Loop Button */}
                          <button
                            onClick={() => setLoopRecitation(!loopRecitation)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              loopRecitation
                                ? "bg-emerald-50 text-emerald-850 border-emerald-200"
                                : "bg-white hover:bg-[#FCF9F2] text-[#8A7D63] border-[#EAE3D2]"
                            }`}
                            title="Loop Recitation"
                          >
                            <Repeat className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Interactive Speed Multipliers */}
                        <div className="flex items-center justify-between text-[10px] pt-1">
                          <span className="text-[#8A7D63] font-medium font-sans">Tajweed Speed:</span>
                          <div className="flex items-center gap-1.5">
                            {[0.7, 0.85, 1.0].map((speed) => (
                              <button
                                key={speed}
                                onClick={() => setPlaybackSpeed(speed)}
                                className={`px-2 py-0.5 rounded-md font-mono text-[9px] font-bold transition-all border cursor-pointer ${
                                  playbackSpeed === speed
                                    ? "bg-[#2D4232] text-white border-[#2D4232]"
                                    : "bg-white hover:bg-[#FCF9F2] text-[#5A6357] border-[#EAE3D2]"
                                }`}
                              >
                                {speed === 1.0 ? "Normal" : `${speed}x`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Cloze Level Controls */}
                      <div className="flex flex-wrap justify-center items-center gap-2 mb-3">
                        <span className="text-[10px] font-mono text-[#8A7D63] uppercase">Active Recall Masking:</span>
                        <div className="inline-flex rounded-lg border border-[#EAE3D2] p-0.5 bg-white text-[10px]">
                          <button
                            onClick={() => setClozeLevel(0)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                              clozeLevel === 0 ? "bg-[#2D4232] text-white" : "text-[#5A6357] hover:text-[#2D4232]"
                            }`}
                          >
                            None
                          </button>
                          <button
                            onClick={() => setClozeLevel(1)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                              clozeLevel === 1 ? "bg-[#2D4232] text-white" : "text-[#5A6357] hover:text-[#2D4232]"
                            }`}
                          >
                            Partial
                          </button>
                          <button
                            onClick={() => setClozeLevel(2)}
                            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                              clozeLevel === 2 ? "bg-[#2D4232] text-white" : "text-[#5A6357] hover:text-[#2D4232]"
                            }`}
                          >
                            Full Mask
                          </button>
                        </div>
                      </div>

                      {/* Accordion: Tafsir & Cognitive Encoding */}
                      <div className="bg-white rounded-xl border border-[#EAE3D2] text-left overflow-hidden shadow-sm">
                        <button
                          onClick={() => setShowTafsir(!showTafsir)}
                          className="w-full flex items-center justify-between p-3 text-xs font-semibold text-[#1A2E1F] hover:bg-[#FCF9F2] transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-[#BFA780]" />
                            Tafsir & Meaning Encoding
                          </span>
                          <span className="text-[10px] text-[#BFA780] font-mono font-bold">
                            {showTafsir ? "COLLAPSE" : "EXPAND EXEGESIS"}
                          </span>
                        </button>
                        {showTafsir && (
                          <div className="p-3.5 border-t border-[#EAE3D2] bg-[#FCF9F2]/40 text-[11px] text-[#5A6357] leading-relaxed font-sans">
                            {getChunkTafsir(activeChunk)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Active Step Panel */}
                <div className="bg-white border border-[#D4C3A1] p-4 rounded-2xl relative shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-[#1A2E1F]">
                      {currentStep.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#8A7D63] uppercase">
                      Repetition {currentRep} of {currentStep.reps}
                    </span>
                  </div>
                  <p className="text-xs text-[#5A6357] leading-relaxed mb-3">
                    {currentStep.description}
                  </p>

                  {/* Representative checkdots */}
                  <div className="flex gap-2">
                    {Array.from({ length: currentStep.reps }).map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-2.5 flex-1 rounded-full border transition-all ${
                          idx < currentRep
                            ? "bg-[#2D4232] border-[#2D4232] shadow-[0_0_8px_rgba(45,66,50,0.1)]"
                            : "bg-[#FCF9F2] border-[#EAE3D2]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* List of upcoming steps in visual workflow */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono text-[#8A7D63] uppercase tracking-wider block mb-1">
                    WORKFLOW PIPELINE:
                  </span>
                  {steps.map((st, idx) => {
                    const isPassed = idx < stepIndex;
                    const isActive = idx === stepIndex;

                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-[11px] flex items-center justify-between border ${
                          isActive
                            ? "bg-white border-[#BFA780]/30 text-[#1A2E1F] shadow-sm"
                            : isPassed
                            ? "bg-transparent border-transparent text-[#8A7D63]/50 line-through"
                            : "bg-transparent border-transparent text-[#5A6357]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                            isActive ? "bg-[#2D4232] text-white" : isPassed ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-[#EAE3D2] text-[#8A7D63]"
                          }`}>
                            {idx + 1}
                          </span>
                          <span>{st.name}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">{st.action}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {!sessionCompleted && (
            <div className="mt-5 pt-4 border-t border-[#EAE3D2]">
              <button
                onClick={nextStep}
                disabled={isLocked && timeLeft === 900}
                className="w-full bg-[#2D4232] hover:bg-[#1A2E1F] disabled:opacity-40 text-[#FCF9F2] font-semibold py-2.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
              >
                Complete Current Repetition (Next)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
