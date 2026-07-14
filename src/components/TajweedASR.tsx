/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { SemanticChunk, TajweedASRFeedback, SifatFeedback, PhonemeFeedback } from "../types";
import { Mic, MicOff, Play, CheckCircle, AlertTriangle, XCircle, Volume2, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "motion/react";

interface TajweedASRProps {
  activeChunk: SemanticChunk | null;
  onNewFeedback: (feedback: TajweedASRFeedback) => void;
}

export default function TajweedASR({ activeChunk, onNewFeedback }: TajweedASRProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState<TajweedASRFeedback | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth animation and amplitude states for the advanced waveform
  const phaseRef = useRef<number>(0);
  const smoothedAmplitudeRef = useRef<number>(0);

  useEffect(() => {
    // Check initial mic access
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => setPermission(true))
      .catch(() => setPermission(false));

    return () => {
      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
  };

  // Real-time canvas waveform visualizer
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      animationFrameRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteTimeDomainData(dataArray);

      // Calculate Root Mean Square (RMS) for signal amplitude
      let totalSquareDiff = 0;
      for (let i = 0; i < bufferLength; i++) {
        const val = (dataArray[i] - 128) / 128; // Normalize to -1..1
        totalSquareDiff += val * val;
      }
      const rms = Math.sqrt(totalSquareDiff / bufferLength);

      // Smooth the amplitude to prevent jittery transitions
      smoothedAmplitudeRef.current = smoothedAmplitudeRef.current * 0.75 + rms * 0.25;
      const amp = Math.max(smoothedAmplitudeRef.current * canvas.height * 1.5, 4); // minimum 4px height to show organic pulse

      // Increment phase for horizontal movement
      phaseRef.current += 0.08;

      ctx.fillStyle = "#FCF9F2"; // Warm cream canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Helper to draw a single smooth wave layer
      const drawLayer = (color: string, strokeWidth: number, frequency: number, opacity: number, phaseShift: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.globalAlpha = opacity;
        ctx.beginPath();

        const points = 60;
        const sliceWidth = canvas.width / points;

        for (let i = 0; i <= points; i++) {
          const x = i * sliceWidth;
          // Apply a Hann window function so the wave fades out beautifully at the edges
          const normalizeX = i / points;
          const windowF = Math.sin(normalizeX * Math.PI); // Fades at 0 and 1

          const yOffset = Math.sin(normalizeX * Math.PI * frequency + phaseRef.current + phaseShift) * amp * windowF;
          const y = canvas.height / 2 + yOffset;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      };

      // Draw three interactive fluid wave layers with distinct frequencies and phases
      // Layer 1: Dark Forest Green (Primary)
      drawLayer("#2D4232", 3, 2, 0.85, 0);

      // Layer 2: Warm Gold Accent (Secondary)
      drawLayer("#BFA780", 2, 3.2, 0.5, Math.PI / 3);

      // Layer 3: Light Emerald Sage (Tertiary)
      drawLayer("#8A7D63", 1.5, 4.5, 0.3, -Math.PI / 4);

      // Reset global alpha
      ctx.globalAlpha = 1.0;

      // Draw elegant central glowing coordinate line
      ctx.strokeStyle = "rgba(45, 66, 50, 0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    if (!activeChunk) return;
    setAudioFeedback(null);
    setAudioUrl(null);
    audioChunksRef.current = [];
    cleanupAudio();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission(true);

      // Setup audio context & analyser for visualizer
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Analyze the recitation
        await analyzeRecitation(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Start drawing
      setTimeout(() => {
        drawWaveform();
      }, 100);

    } catch (err) {
      console.error("Mic access denied:", err);
      setPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      cleanupAudio();
    }
  };

  const analyzeRecitation = async (audioBlob: Blob) => {
    if (!activeChunk) return;
    setLoading(true);
    
    try {
      // In a real system, you would send the audio blob base64. 
      // We'll prepare it, and send a JSON requesting Gemini ASR & Tajweed evaluation.
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];

        const response = await fetch("/api/gemini/analyze-tajweed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetArabic: activeChunk.arabic,
            transliteration: activeChunk.transliteration,
            userAttemptText: activeChunk.arabic, // Mocking correct matching context
            audioData: base64Audio
          }),
        });

        const feedback: TajweedASRFeedback = await response.json();
        setAudioFeedback(feedback);
        onNewFeedback(feedback);
        setLoading(false);
      };
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div id="asr-section" className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm text-[#2D4232]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif font-light text-[#1A2E1F] flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#BFA780]" /> Feature 2: Tajweed-Aware ASR Diagnostic Engine
          </h2>
          <p className="text-xs text-[#5A6357] mt-1 font-sans">
            Wav2Vec2-XLSR / CTC architecture simulation on Vertex AI. Conducts full phoneme & Sifat articulation characteristics analysis.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-sans">
          {permission === null ? (
            <span className="text-[#8A7D63]">Verifying Mic Access...</span>
          ) : permission ? (
            <span className="text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Mic Ready
            </span>
          ) : (
            <span className="text-red-800 bg-red-50 border border-red-100 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-red-500" /> Mic Restricted
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        {/* Recording Panel (Left) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#FCF9F2] rounded-2xl p-5 border border-[#EAE3D2]">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider">
              Acoustic Input
            </span>
            <h3 className="font-semibold text-[#1A2E1F] text-sm mt-0.5 mb-4">
              Real-time Recitation Recording
            </h3>

            {/* Recitation display */}
            {activeChunk ? (
              <div className="bg-white p-4 rounded-xl border border-[#EAE3D2] text-center mb-5 shadow-sm">
                <p className="text-[10px] text-[#8A7D63] font-mono uppercase tracking-wide mb-2">
                  Target Recitation
                </p>
                <p className="text-2xl font-serif text-[#2D4232] font-normal leading-relaxed mb-1" dir="rtl">
                  {activeChunk.arabic}
                </p>
                <p className="text-[11px] font-mono text-[#5A6357]">
                  {activeChunk.transliteration}
                </p>
              </div>
            ) : null}

            {/* Visualizer Frame */}
            <div className="bg-[#FCF9F2] rounded-xl overflow-hidden border border-[#D4C3A1] h-32 flex items-center justify-center relative mb-4 shadow-inner">
              {isRecording ? (
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" width={300} height={128} />
              ) : (
                <div className="text-center text-[#8A7D63] text-xs">
                  <Volume2 className="w-8 h-8 text-[#D4C3A1] mx-auto mb-2" />
                  <p>Click "Recite Chunk" to begin recording.</p>
                </div>
              )}
              {isRecording && (
                <div className="absolute top-2 right-2 bg-red-50 border border-red-200 text-red-700 px-2.5 py-0.5 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                  RECORDING {recordingSeconds}s
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {audioUrl && !isRecording && (
              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#EAE3D2] shadow-sm">
                <button
                  onClick={() => new Audio(audioUrl).play()}
                  className="bg-[#EAE3D2] hover:bg-[#D4C3A1] text-[#2D4232] p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <span className="text-xs text-[#5A6357] font-mono">Review last raw voice input</span>
              </div>
            )}

            {!isRecording ? (
              <button
                onClick={startRecording}
                className="w-full flex items-center justify-center gap-2 bg-[#2D4232] hover:bg-[#1A2E1F] text-[#FCF9F2] font-semibold py-3 px-4 rounded-full transition-all shadow-sm cursor-pointer"
              >
                <Mic className="w-4 h-4" /> Recite Active Chunk
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-full transition-all shadow-sm cursor-pointer animate-pulse"
              >
                <MicOff className="w-4 h-4" /> Stop & Process Diagnostic
              </button>
            )}
          </div>
        </div>

        {/* Diagnostic Results (Right) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-2xl p-5 border border-[#EAE3D2] shadow-sm min-h-[350px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-10 h-10 text-[#2D4232] animate-spin mb-3" />
              <p className="text-sm font-mono text-[#2D4232]">Processing Wav2Vec2-XLSR Sifat Mapping...</p>
              <p className="text-xs text-[#8A7D63] mt-1">Measuring 11 Phonetic Elongation Levels</p>
            </div>
          ) : audioFeedback ? (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D2] mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider">
                      Evaluation Feedback
                    </span>
                    <h3 className="font-semibold text-[#1A2E1F] text-sm mt-0.5">
                      Tajweed ASR Diagnostic Report
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#8A7D63] font-mono">Score:</span>
                    <span className={`text-base font-bold font-mono px-2.5 py-0.5 rounded-xl ${
                      audioFeedback.score >= 90
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {audioFeedback.score}/100
                    </span>
                  </div>
                </div>

                {/* Overall textual diagnostic evaluation */}
                <div className="bg-[#FCF9F2] p-3.5 rounded-xl border border-[#EAE3D2] text-xs mb-4 shadow-sm">
                  <span className="text-[#2D4232] font-medium block mb-1">Acoustic Summary:</span>
                  <p className="text-[#5A6357] leading-relaxed text-[11px]">{audioFeedback.overallEvaluation}</p>
                </div>

                {/* Sifat Evaluation (Qalqala, Madd, etc) */}
                <div className="mb-4">
                  <span className="text-[10px] text-[#8A7D63] uppercase font-mono block mb-2">
                    Sifat Articulation Levels Check:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {audioFeedback.sifatLevel.map((sifat, idx) => (
                      <div key={idx} className="bg-[#FCF9F2] p-2.5 rounded-xl border border-[#EAE3D2] flex items-start gap-2.5 shadow-sm">
                        {sifat.passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : sifat.severity === "error" ? (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#BFA780] shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-[#1A2E1F] block">
                            {sifat.name}
                          </span>
                          <span className="text-[9px] text-[#5A6357] block leading-tight mt-0.5">
                            {sifat.details}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Phoneme Accuracy Level */}
                <div>
                  <span className="text-[10px] text-[#8A7D63] uppercase font-mono block mb-2">
                    Phoneme Level Elongation Checks:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {audioFeedback.phonemeLevel.map((p, idx) => (
                      <span
                        key={idx}
                        title={p.notes}
                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border flex items-center gap-1 cursor-help ${
                          p.correct
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 shadow-sm"
                            : "bg-red-50 text-red-700 border-red-200 shadow-sm"
                        }`}
                      >
                        {p.phoneme} {p.correct ? "✓" : "✗"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-[#8A7D63] mt-4 pt-3 border-t border-[#EAE3D2] italic">
                💡 Interactive tip: Practice phoneme durations (Madd counts) to optimize your articulation score.
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-[#8A7D63]">
              <Sparkles className="w-12 h-12 text-[#D4C3A1] animate-pulse mb-3" />
              <p className="text-xs">ASR Diagnostics idle. Record a recitation to generate Sifat metrics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
