/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { SemanticChunk, Mutashabih } from "../types";
import { 
  Sparkles, 
  HelpCircle, 
  Layers, 
  ShieldAlert, 
  Check, 
  Plus, 
  AlertTriangle, 
  ArrowRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Loader2,
  Repeat,
  Globe,
  CornerDownRight,
  Volume1
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QURAN_114_SURAHS } from "../utils/quranApi";

interface SemanticChunkListProps {
  chunks: SemanticChunk[];
  mutashabihat: Mutashabih[];
  onImportCustomChunks: (customChunks: SemanticChunk[]) => void;
  onImportCustomMutashabihat: (customMutashabihat: Mutashabih[]) => void;
}

const RECITER_OPTIONS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy", desc: "Balanced and emotional" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary", desc: "Perfect pedagogical Tajweed" },
  { id: "ar.minshawi", name: "Mohamed Siddiq El-Minshawi", desc: "Soul-stirring spiritual classic" },
  { id: "ar.abdulsamad", name: "Abdul Basit Abdus Samad", desc: "Majestic breath control and resonance" },
];

export default function SemanticChunkList({
  chunks,
  mutashabihat,
  onImportCustomChunks,
  onImportCustomMutashabihat,
}: SemanticChunkListProps) {
  // Chunker states
  const [customVerseInput, setCustomVerseInput] = useState("");
  const [customTranslation, setCustomTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [similarityLoading, setSimilarityLoading] = useState(false);
  const [similarVerses, setSimilarVerses] = useState<Mutashabih[]>([]);

  // Al-Quran Cloud Audio Player states
  const [selectedSurahId, setSelectedSurahId] = useState<number>(2); // Default to Al-Baqarah
  const [selectedAyahNum, setSelectedAyahNum] = useState<number>(255); // Default to Ayat al-Kursi
  const [selectedReciter, setSelectedReciter] = useState<string>("ar.alafasy");

  // Preloaded Ayat al-Kursi default content
  const [fetchedArabic, setFetchedArabic] = useState<string>(
    "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ"
  );
  const [fetchedTranslation, setFetchedTranslation] = useState<string>(
    "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great."
  );

  const [audioSource, setAudioSource] = useState<string | null>(
    "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3" // ayat al-kursi global id is 262
  );
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loopPlay, setLoopPlay] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize and maintain HTML5 Audio listeners safely
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onEnded = () => {
      if (!audio.loop) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
    const onError = (e) => {
      console.error("HTML5 Audio player encountered an error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    // Initial pre-load of our default track
    audio.src = "https://cdn.islamic.network/quran/audio/128/ar.alafasy/262.mp3";
    audio.volume = volume;
    audio.playbackRate = playbackSpeed;
    audio.loop = loopPlay;

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, []);

  // Synchronize dynamic parameters
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = loopPlay;
    }
  }, [loopPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean up if we change selected ayah/surah
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }
    setErrorMsg("");
  }, [selectedSurahId, selectedAyahNum, selectedReciter]);

  // Find selected surah details
  const selectedSurah = QURAN_114_SURAHS.find((s) => s.id === selectedSurahId) || QURAN_114_SURAHS[1];

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextId = Number(e.target.value);
    setSelectedSurahId(nextId);
    const surah = QURAN_114_SURAHS.find((s) => s.id === nextId);
    if (surah && selectedAyahNum > surah.versesCount) {
      setSelectedAyahNum(1); // Reset to 1 if ayah exceeds max of the new surah
    }
  };

  // Fetch recitation, arabic text & translation from alquran.cloud API
  const handleFetchRecitation = async () => {
    setAudioLoading(true);
    setErrorMsg("");
    try {
      const audioUrl = `https://api.alquran.cloud/v1/ayah/${selectedSurahId}:${selectedAyahNum}/${selectedReciter}`;
      const translationUrl = `https://api.alquran.cloud/v1/ayah/${selectedSurahId}:${selectedAyahNum}/en.sahih`;

      const [audioRes, transRes] = await Promise.all([
        fetch(audioUrl),
        fetch(translationUrl),
      ]);

      const audioData = await audioRes.json();
      const transData = await transRes.json();

      if (audioData.code === 200 && audioData.data) {
        setFetchedArabic(audioData.data.text);
        setAudioSource(audioData.data.audio);

        if (audioRef.current) {
          audioRef.current.src = audioData.data.audio;
          audioRef.current.load();
          audioRef.current.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.warn("Autoplay blocked, user interaction required:", err);
              setIsPlaying(false);
            });
        }
      } else {
        throw new Error(audioData.data || "Could not retrieve ayah audio stream.");
      }

      if (transData.code === 200 && transData.data) {
        setFetchedTranslation(transData.data.text);
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Failed to fetch recitation from alquran.cloud. Please check your network and try again.");
    } finally {
      setAudioLoading(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Audio trigger failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (audioRef.current) {
      audioRef.current.currentTime = nextTime;
    }
  };

  // Copy loaded details into Chunker segmenter inputs
  const handleCopyToWorkspace = () => {
    setCustomVerseInput(fetchedArabic);
    setCustomTranslation(fetchedTranslation);
    
    // Smooth scroll to chunking workspace card
    const workspaceCard = document.getElementById("nlp-workspace-card");
    if (workspaceCard) {
      workspaceCard.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRunChunker = async () => {
    if (!customVerseInput.trim()) return;
    setLoading(true);
    setSimilarVerses([]);
    try {
      const res = await fetch("/api/gemini/chunk-verse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arabicText: customVerseInput,
          translationText: customTranslation,
        }),
      });
      const data = await res.json();
      if (data.chunks && data.chunks.length > 0) {
        // Map indices to make unique IDs
        const formatted: SemanticChunk[] = data.chunks.map((chk: any, idx: number) => ({
          id: `custom_${Date.now()}_${idx}`,
          surahId: 999, // Custom marker
          verseNumber: 1,
          chunkIndex: idx,
          arabic: chk.arabic,
          translation: chk.translation,
          transliteration: chk.transliteration || "Transliteration",
          thematicLabel: chk.thematicLabel || "Custom Essence",
          visualAnchorPrompt: chk.visualAnchorPrompt || "Abstract geometric lights",
          tafsir: chk.tafsir || "No exegesis provided."
        }));
        onImportCustomChunks(formatted);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSimilarityCheck = async () => {
    if (!customVerseInput.trim()) return;
    setSimilarityLoading(true);
    try {
      const res = await fetch("/api/gemini/similarity-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          arabicText: customVerseInput,
          reference: "Custom Entry",
        }),
      });
      const data = await res.json();
      if (data.mutashabihat) {
        setSimilarVerses(data.mutashabihat);
        onImportCustomMutashabihat(data.mutashabihat);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSimilarityLoading(false);
    }
  };

  return (
    <div id="nlp-chunking-section" className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm text-[#2D4232]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 font-sans">
        <div>
          <h2 className="text-xl font-serif font-light text-[#1A2E1F] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#BFA780]" /> Feature 1: NLP Classical Arabic Chunking & Auditory Alignment
          </h2>
          <p className="text-xs text-[#5A6357] mt-1">
            Segment verses into syntactically valid chunks or play authentic recitations via the alquran.cloud API to prevent memory interference (Mutashabihat).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Column 1: Auditory Recitation Lab (Al-Quran Cloud API Audio Player) */}
        <div className="lg:col-span-4 bg-[#FCF9F2] rounded-2xl p-5 border border-[#EAE3D2] flex flex-col justify-between shadow-sm space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-[#EAE3D2] pb-2">
              <Volume2 className="w-4 h-4 text-[#BFA780]" />
              <h3 className="font-semibold text-[#1A2E1F] text-sm">
                Auditory Recitation Lab
              </h3>
            </div>

            {/* Select Surah */}
            <div className="space-y-1 text-left">
              <label className="text-[9px] font-mono text-[#8A7D63] uppercase tracking-wider block font-bold">
                Select Surah
              </label>
              <select
                value={selectedSurahId}
                onChange={handleSurahChange}
                className="w-full bg-white text-xs text-[#2D4232] border border-[#EAE3D2] rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#BFA780] font-sans font-medium cursor-pointer"
              >
                {QURAN_114_SURAHS.map((s) => (
                  <option key={s.id} value={s.id}>
                    Surah {s.id}: {s.englishName} ({s.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Select Ayah & Reciter */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-[#8A7D63] uppercase tracking-wider block font-bold">
                  Ayah (1 to {selectedSurah.versesCount})
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurah.versesCount}
                  value={selectedAyahNum}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(selectedSurah.versesCount, Number(e.target.value)));
                    setSelectedAyahNum(val);
                  }}
                  className="w-full bg-white text-xs text-[#2D4232] border border-[#EAE3D2] rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#BFA780] font-mono shadow-inner"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-[#8A7D63] uppercase tracking-wider block font-bold">
                  Reciter Accent
                </label>
                <select
                  value={selectedReciter}
                  onChange={(e) => setSelectedReciter(e.target.value)}
                  className="w-full bg-white text-xs text-[#2D4232] border border-[#EAE3D2] rounded-xl px-2.5 py-2 focus:outline-none focus:border-[#BFA780] font-sans cursor-pointer"
                >
                  {RECITER_OPTIONS.map((rec) => (
                    <option key={rec.id} value={rec.id} title={rec.desc}>
                      {rec.name.split(" ").pop()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleFetchRecitation}
              disabled={audioLoading}
              className="w-full bg-[#2D4232] hover:bg-[#1A2E1F] disabled:opacity-40 text-white font-semibold py-2 px-3 rounded-xl text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {audioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Streaming Recitation...
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  Fetch & Play Recitation
                </>
              )}
            </button>

            {errorMsg && (
              <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                {errorMsg}
              </p>
            )}

            {/* Display Calligraphy / Verses Panel */}
            <div className="bg-white p-3 rounded-2xl border border-[#EAE3D2] space-y-2 text-center shadow-inner relative overflow-hidden">
              <span className="absolute top-1.5 left-2 bg-[#FCF9F2] text-[#8A7D63] border border-[#EAE3D2] text-[8px] font-mono px-1.5 py-0.5 rounded uppercase">
                {selectedSurahId}:{selectedAyahNum}
              </span>

              <p className="text-lg font-serif text-[#2D4232] leading-loose pt-4 text-right" dir="rtl">
                {fetchedArabic}
              </p>

              <p className="text-[10px] text-[#5A6357] text-left leading-relaxed border-t border-[#F1EDE5] pt-1.5 italic">
                {fetchedTranslation}
              </p>
            </div>

            {/* Custom Audio Controller */}
            <div className="bg-white p-3 rounded-2xl border border-[#EAE3D2] space-y-2 shadow-sm">
              <div className="flex items-center gap-2.5 justify-between">
                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  disabled={!audioSource}
                  className="w-8 h-8 rounded-full bg-[#2D4232] text-white hover:bg-[#1A2E1F] disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                </button>

                {/* Timeline slider */}
                <div className="flex-1 space-y-0.5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full h-1 bg-[#EAE3D2] accent-[#2D4232] rounded-lg cursor-pointer range-xs"
                  />
                  <div className="flex justify-between text-[8px] text-[#8A7D63] font-mono">
                    <span>
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, "0")}
                    </span>
                    <span>
                      {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Continuous Loop */}
                <button
                  onClick={() => setLoopPlay(!loopPlay)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                    loopPlay
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-white hover:bg-[#FCF9F2] text-[#8A7D63] border-[#EAE3D2]"
                  }`}
                  title="Toggle Continuous Loop"
                >
                  <Repeat className="w-3 h-3" />
                </button>
              </div>

              {/* Volume & Speed Controls */}
              <div className="flex items-center justify-between border-t border-[#F1EDE5] pt-2 gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-[#8A7D63] hover:text-[#2D4232] p-1 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume1 className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-12 h-1 bg-[#EAE3D2] accent-[#2D4232] rounded-lg cursor-pointer range-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  {[0.75, 1.0, 1.25].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => setPlaybackSpeed(sp)}
                      className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold border transition-colors cursor-pointer ${
                        playbackSpeed === sp
                          ? "bg-[#2D4232] text-white border-[#2D4232]"
                          : "bg-white hover:bg-[#FCF9F2] text-[#5A6357] border-[#EAE3D2]"
                      }`}
                    >
                      {sp === 1.0 ? "1x" : `${sp}x`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyToWorkspace}
            className="w-full bg-white hover:bg-[#FCF9F2] text-[#2D4232] border border-[#EAE3D2] rounded-xl text-xs py-2 font-bold transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
          >
            <CornerDownRight className="w-3.5 h-3.5 text-[#BFA780]" />
            Copy to Workspace Chunker
          </button>
        </div>

        {/* Column 2: Custom Verse Input & Segmenter */}
        <div 
          id="nlp-workspace-card"
          className="lg:col-span-4 bg-white rounded-2xl p-5 border border-[#EAE3D2] flex flex-col justify-between shadow-sm space-y-4"
        >
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-[#EAE3D2] pb-2">
              <Sparkles className="w-4 h-4 text-[#BFA780]" />
              <h3 className="font-semibold text-[#1A2E1F] text-sm">
                Segmenter Workspace
              </h3>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8A7D63] uppercase tracking-wider block mb-1.5">
                Classical Arabic Verse Input
              </label>
              <textarea
                value={customVerseInput}
                onChange={(e) => setCustomVerseInput(e.target.value)}
                placeholder="أَدْخِلْ آيَةً قُرْآنِيَّةً كَامِلَةً هُنَا... (e.g. يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ)"
                dir="rtl"
                rows={3}
                className="w-full bg-white text-[#2D4232] border border-[#EAE3D2] rounded-2xl p-3 text-base font-serif focus:outline-none focus:border-[#BFA780] placeholder-[#D4C3A1] leading-relaxed shadow-inner"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8A7D63] uppercase tracking-wider block mb-1.5">
                English Translation (Optional Reference)
              </label>
              <input
                type="text"
                value={customTranslation}
                onChange={(e) => setCustomTranslation(e.target.value)}
                placeholder="Enter English meaning..."
                className="w-full bg-white text-[#2D4232] border border-[#EAE3D2] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#BFA780] placeholder-[#D4C3A1] shadow-inner"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleRunChunker}
                disabled={loading || !customVerseInput.trim()}
                className="flex-1 flex items-center justify-center gap-1 bg-[#2D4232] hover:bg-[#1A2E1F] disabled:opacity-40 text-[#FCF9F2] font-semibold py-2 px-2.5 rounded-full text-xs transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {loading ? "Chunking..." : "Parse & Chunk"}
              </button>
              <button
                onClick={handleRunSimilarityCheck}
                disabled={similarityLoading || !customVerseInput.trim()}
                className="flex-1 flex items-center justify-center gap-1 bg-white hover:bg-[#FCF9F2] disabled:opacity-40 text-[#2D4232] border border-[#EAE3D2] py-2 px-2.5 rounded-full text-xs font-semibold transition-all shadow-sm cursor-pointer"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-[#BFA780]" />
                {similarityLoading ? "Analyzing..." : "Compare"}
              </button>
            </div>
          </div>

          <div className="text-[10px] text-[#8A7D63] pt-3 border-t border-[#EAE3D2] leading-relaxed text-left">
            💡 NLP segmenting enforces classical Arabic grammar guidelines instead of whitespace splitting. This minimizes rote cognitive fatigue.
          </div>
        </div>

        {/* Column 3: Flagged Mutashabihat Memory Interference alerts */}
        <div className="lg:col-span-4 bg-[#FCF9F2] rounded-2xl p-5 border border-[#EAE3D2] shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE3D2] mb-3">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#BFA780]" />
                <h3 className="font-semibold text-[#1A2E1F] text-xs uppercase font-mono tracking-wider">
                  Memory Interference
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#8A7D63] bg-white border border-[#EAE3D2] px-1.5 py-0.5 rounded-lg font-bold">
                {mutashabihat.length + similarVerses.length} Flagged
              </span>
            </div>

            {/* Display active warnings */}
            <div className="space-y-3 max-h-[310px] overflow-y-auto pr-1">
              {[...similarVerses, ...mutashabihat].length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white border border-dashed border-[#EAE3D2] rounded-2xl">
                  <Check className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <p className="text-[10px] font-mono text-[#8A7D63] uppercase">No Interferences Detected</p>
                </div>
              ) : (
                [...similarVerses, ...mutashabihat].map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="bg-white border border-[#EAE3D2] rounded-2xl p-3 text-xs space-y-1.5 relative overflow-hidden shadow-sm text-left"
                  >
                    <div className="absolute top-0 right-0 bg-[#EAE3D2] text-[#2D4232] px-1.5 py-0.5 rounded-bl text-[7px] font-mono font-bold uppercase tracking-wider">
                      {Math.round(m.interferenceScore * 100)}% Risk
                    </div>

                    <div className="flex items-center gap-1 text-[#BFA780] font-bold text-[10px]">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-[#BFA780]" />
                      <span className="truncate">Conflict: {m.originalVerseRef} ⇄ {m.similarVerseRef}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <div className="bg-[#FCF9F2] p-1.5 rounded-xl border border-[#EAE3D2] text-center shadow-inner">
                        <span className="text-[7px] font-mono text-[#8A7D63] uppercase block">Original</span>
                        <p className="text-xs font-serif text-[#2D4232] truncate mt-0.5" dir="rtl">{m.originalArabicText}</p>
                      </div>
                      <div className="bg-[#FCF9F2] p-1.5 rounded-xl border border-[#EAE3D2] text-center shadow-inner">
                        <span className="text-[7px] font-mono text-[#8A7D63] uppercase block">Overlap</span>
                        <p className="text-xs font-serif text-[#2D4232] truncate mt-0.5" dir="rtl">{m.similarArabicText}</p>
                      </div>
                    </div>

                    <p className="text-[#5A6357] leading-relaxed text-[10px] pt-1 border-t border-[#EAE3D2]">
                      <span className="text-[#BFA780] font-bold font-mono text-[9px] uppercase">Distinction:</span> {m.overlapDescription}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[9px] text-[#8A7D63] italic text-left">
            ⚠️ Alert: Similar verses have high cognitive overlap. Study their microscopic grammatical differences carefully before reciting.
          </div>
        </div>
      </div>
    </div>
  );
}
