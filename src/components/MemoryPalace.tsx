/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { SemanticChunk } from "../types";
import { Sparkles, Compass, ShieldAlert, Layers, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";

interface MemoryPalaceProps {
  chunks: SemanticChunk[];
  activeChunkId: string | null;
  onSelectChunk: (chunkId: string) => void;
}

interface CustomAnchor {
  themeDescription: string;
  palaceSectionName: string;
  aestheticTags: string[];
}

export default function MemoryPalace({ chunks, activeChunkId, onSelectChunk }: MemoryPalaceProps) {
  const [selectedNode, setSelectedNode] = useState<SemanticChunk | null>(null);
  const [customAnchor, setCustomAnchor] = useState<CustomAnchor | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeChunkId) {
      const match = chunks.find((c) => c.id === activeChunkId);
      if (match) setSelectedNode(match);
    } else if (chunks.length > 0 && !selectedNode) {
      setSelectedNode(chunks[0]);
    }
  }, [activeChunkId, chunks]);

  useEffect(() => {
    setCustomAnchor(null);
  }, [selectedNode]);

  const generateAIEssence = async () => {
    if (!selectedNode) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/generate-anchor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chunkText: selectedNode.arabic,
          thematicLabel: selectedNode.thematicLabel,
          visualAnchorPrompt: selectedNode.visualAnchorPrompt,
        }),
      });
      const data = await res.json();
      setCustomAnchor({
        themeDescription: data.themeDescription,
        palaceSectionName: data.palaceSectionName,
        aestheticTags: data.aestheticTags || ["Gold", "Symmetry"],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to draw a stylized, beautiful dynamic geometric mandala based on the seed
  const getGeometricSVG = (id: string) => {
    const seed = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const petals = (seed % 6) + 6; // 6 to 11 petals
    const scale = (seed % 4) + 1;
    const paths = [];
    
    for (let i = 0; i < petals; i++) {
      const angle = (i * 360) / petals;
      paths.push(
        <path
          key={i}
          d="M 100 100 Q 120 40 100 10 Q 80 40 100 100"
          fill="url(#goldGradient)"
          opacity="0.3"
          transform={`rotate(${angle} 100 100)`}
        />
      );
    }
    
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-lg mx-auto">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BFA780" />
            <stop offset="50%" stopColor="#EAE3D2" />
            <stop offset="100%" stopColor="#8A7D63" />
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#BFA780" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FCF9F2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="85" fill="url(#glowGradient)" />
        <circle cx="100" cy="100" r="70" stroke="#BFA780" strokeWidth="1" strokeDasharray="3,3" fill="none" opacity="0.6" />
        <circle cx="100" cy="100" r="50" stroke="#2D4232" strokeWidth="1" fill="none" opacity="0.4" />
        {paths}
        <polygon
          points="100,65 110,85 130,90 115,105 120,125 100,115 80,125 85,105 70,90 90,85"
          fill="url(#goldGradient)"
          stroke="#8A7D63"
          strokeWidth="1"
          transform={`scale(${scale * 0.1 + 0.8}) translate(${100 - (100 * (scale * 0.1 + 0.8))}, ${100 - (100 * (scale * 0.1 + 0.8))})`}
        />
        <circle cx="100" cy="100" r="8" fill="#2D4232" stroke="#BFA780" strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div id="memory-palace-section" className="bg-white border border-[#EAE3D2] rounded-3xl p-6 shadow-sm text-[#2D4232]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 font-sans">
        <div>
          <h2 className="text-xl font-serif font-light text-[#1A2E1F] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#BFA780]" /> Feature 4: The Digital Memory Palace
          </h2>
          <p className="text-xs text-[#5A6357] mt-1">
            Spatial anchoring & thematic maps of Surahs. Navigate semantic chunks sequentially to leverage human spatial memory.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FCF9F2] px-3.5 py-1.5 rounded-xl border border-[#EAE3D2] text-xs shadow-sm">
          <Layers className="w-4 h-4 text-[#BFA780]" />
          <span className="text-[#2D4232] font-medium">{chunks.length} Anchor Rooms</span>
        </div>
      </div>

      {/* Grid: Left: The interactive spatial map path. Right: Active anchor details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Spatial Grid Map (Left) */}
        <div className="lg:col-span-7 bg-[#FCF9F2] rounded-2xl p-5 border border-[#EAE3D2] flex flex-col justify-between h-[450px] relative overflow-y-auto shadow-sm">
          <div className="text-[#8A7D63] text-[10px] font-mono uppercase tracking-wider mb-2">
            THEMATIC SPACIAL MATRIX (TAP NODES TO CHOOSE ROOM)
          </div>

          <div className="flex-1 flex flex-col justify-center py-4 relative">
            {/* Draw winding path vector */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
              <path
                d={`M 50 40 Q 150 20 280 80 T 100 240 T 320 380`}
                fill="none"
                stroke="#BFA780"
                strokeWidth="3"
                strokeDasharray="6,6"
                className="animate-[dash_10s_linear_infinite]"
              />
            </svg>

            {/* Render the nodes linearly or staggered */}
            <div className="relative flex flex-wrap justify-around items-center gap-6 z-10 p-2">
              {chunks.map((chunk, index) => {
                const isActive = selectedNode?.id === chunk.id;
                const isUnderStudy = activeChunkId === chunk.id;

                return (
                  <button
                    key={chunk.id}
                    onClick={() => {
                      setSelectedNode(chunk);
                      onSelectChunk(chunk.id);
                    }}
                    className={`relative w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform cursor-pointer border ${
                      isActive
                        ? "bg-white border-[#BFA780] text-[#1A2E1F] scale-110 shadow-sm"
                        : isUnderStudy
                        ? "bg-[#FCF9F2] border-[#2D4232] text-[#2D4232] scale-105"
                        : "bg-white/60 border-[#EAE3D2] text-[#5A6357] hover:border-[#BFA780] hover:text-[#2D4232]"
                    }`}
                  >
                    <span className="text-xs font-mono text-[10px] opacity-60">CH</span>
                    <span className="text-lg font-bold font-serif mt-0.5">{index + 1}</span>
                    <span className="absolute -bottom-1 -right-1 bg-white px-1 py-0.5 rounded-lg border border-[#EAE3D2] text-[8px] font-mono text-[#8A7D63]">
                      {chunk.verseNumber}:{chunk.chunkIndex + 1}
                    </span>
                    {isUnderStudy && (
                      <span className="absolute -top-1 -left-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[#8A7D63] text-[10px] text-center italic mt-2 border-t border-[#EAE3D2] pt-2">
            ℹ️ Navigation activates the spatial memory pathway. Try to picture each room visually as you recite.
          </div>
        </div>

        {/* Spatial Anchor Details (Right) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-2xl p-5 border border-[#EAE3D2] shadow-sm">
          {selectedNode ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#EAE3D2]">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8A7D63] tracking-wider">
                      Active Chamber Anchor
                    </span>
                    <h3 className="font-semibold text-[#1A2E1F] text-sm mt-0.5">
                      {selectedNode.thematicLabel}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono bg-[#FCF9F2] text-[#2D4232] border border-[#EAE3D2] px-2.5 py-0.5 rounded-xl">
                    Ref {selectedNode.verseNumber}:{selectedNode.chunkIndex + 1}
                  </span>
                </div>

                {/* Classical Arabic Visualization */}
                <div className="bg-[#FCF9F2] p-4 rounded-2xl text-center border border-[#EAE3D2] mb-4 shadow-inner">
                  <p className="text-2xl font-serif text-[#2D4232] font-normal leading-relaxed tracking-wide mb-2" dir="rtl">
                    {selectedNode.arabic}
                  </p>
                  <p className="text-[11px] font-mono text-[#5A6357] italic">
                    "{selectedNode.transliteration}"
                  </p>
                </div>

                {/* Geometric Visual Vector representation */}
                <div className="mb-4 text-center relative py-2">
                  {getGeometricSVG(selectedNode.id)}
                  <p className="text-[10px] font-mono text-[#BFA780] mt-1 uppercase tracking-wide">
                    Culturally Respectful Visual Anchor
                  </p>
                </div>

                {/* Visual Anchor Prompt & AI extension */}
                <div className="bg-[#FCF9F2] p-3.5 rounded-2xl border border-[#EAE3D2] text-xs shadow-sm">
                  <div className="flex items-center gap-2 text-[#2D4232] font-medium mb-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#BFA780]" />
                    <span>Memory Palace Anchor Guide</span>
                  </div>
                  <p className="text-[#5A6357] leading-relaxed text-[11px]">
                    {customAnchor ? customAnchor.themeDescription : selectedNode.visualAnchorPrompt}
                  </p>
                  
                  {customAnchor && (
                    <div className="mt-2.5 pt-2.5 border-t border-[#EAE3D2] flex flex-wrap gap-1.5 items-center">
                      <span className="text-[9px] uppercase font-mono text-[#BFA780] font-bold">Chamber Section:</span>
                      <span className="text-[10px] text-[#2D4232] bg-white px-2 py-0.5 rounded-lg border border-[#EAE3D2]">
                        {customAnchor.palaceSectionName}
                      </span>
                      {customAnchor.aestheticTags.map((tag) => (
                        <span key={tag} className="text-[9px] font-mono bg-[#EAE3D2] text-[#2D4232] px-1.5 py-0.5 rounded-lg">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#EAE3D2]">
                <button
                  onClick={generateAIEssence}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#2D4232] hover:bg-[#1A2E1F] text-[#FCF9F2] font-semibold py-3 px-4 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {loading ? "Generating Sacred Spatial Architecture..." : "Enhance Palace Room via Gemini AI"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#8A7D63] py-12">
              <Compass className="w-12 h-12 text-[#D4C3A1] animate-pulse mb-3" />
              <p className="text-xs">Select a spatial coordinate node to begin anchoring.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
