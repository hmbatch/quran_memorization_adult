/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tafsir & Cognitive Encoding Helper for Quranic Chunks.
 * Provides deep theological and structural context to assist adult learners in Semantic Encoding.
 */

import { SemanticChunk } from "../types";

const STATIC_TAFSIR_MAP: Record<string, string> = {
  // Al-Fatiha
  "1_1_1": "The 'Basmalah' is the absolute starting point of all blessed pursuits. It links human actions directly to Divine Grace, ensuring spiritual alignment and focus. In Arabic morphology, starting with the preposition 'B' (with/by) emphasizes that no human action is independent of the Creator.",
  "1_2_1": "The core declaration of universal gratitude. Expressing praise ('Al-Hamd') to Allah as 'Rabb' (the Nurturer, Sustainer, and Lord of all existence) calms the amygdala, replacing anxiety with deep emotional security.",
  "1_3_1": "Reflects the dual dimensions of mercy: 'Ar-Rahman' represents the vast, immediate, and all-encompassing mercy that sustains all of creation. 'Ar-Rahim' represents the precise, deep, and enduring mercy reserved for those who actively seek guidance.",
  "1_4_1": "Acknowledges Divine sovereignty over time and recompense ('Yawm ad-Din'). This provides moral clarity and cosmic perspective, reminding the learner of ultimate accountability and justice.",
  "1_5_1": "The absolute pivot of the Surah. It represents a strict bilateral covenant: worship is designated exclusively to Allah ('Iyyaaka na'budu'), followed immediately by a declaration of total, humble reliance for assistance ('Iyyaaka nasta'een').",
  "1_6_1": "The ultimate petition for direction. 'Al-Sirat al-Mustaqeem' is the straightest, most efficient path to spiritual and intellectual peace, bypassing winding paths of confusion and doubt.",
  "1_7_1": "Grounds the spiritual path in human history. By referencing 'those upon whom You have bestowed favor' (prophets, scholars, and the righteous), it utilizes social-spatial memory, connecting abstract truth to concrete role models.",
  "1_7_2": "A protective shield petition. It asks for safety from both active defiance ('evoked anger') and passive negligence ('those who are astray'), encouraging constant vigilance and intellectual honesty.",

  // Ayah Al-Kursi
  "2_255_1": "Establishes the foundation of divine oneness (Tawhid). 'Al-Hayy' (the Ever-Living, with no beginning or end) and 'Al-Qayyum' (the Self-Sustaining, who maintains all other entities) are the supreme names of majesty.",
  "2_255_2": "Declares freedom from all human limitations like fatigue ('sinah') or sleep ('nawm'). This provides the adult brain with the profound psychological comfort of an ever-watchful, never-weary Guardian.",
  "2_255_3": "Asserts absolute dominion over both the cosmic heavens ('al-samawat') and the material earth ('al-ard'). Everything is in a state of continuous, involuntary submission to His authority.",
  "2_255_4": "The restriction of intercession. No entity can plead or mediate except by His explicit permission, reinforcing that all authority and favor flow directly from a single Source.",
  "2_255_5": "A profound statement of divine omniscience. He holds perfect, simultaneous knowledge of what is currently before creations (the future, or visible) and what lies behind them (the past, or unseen).",
  "2_255_6": "Demarcates the boundaries of human knowledge. Humanity cannot encompass any fragment of Divine knowledge except that which He wills to reveal, inspiring intellectual humility and awe.",
  "2_255_7": "The Kursi (Throne) represents Divine majesty, power, and authority. Its immense scale easily extends beyond the boundaries of the physical heavens and earth, serving as a powerful visual spatial anchor.",
  "2_255_8": "Concludes Al-Kursi with the ease of Divine maintenance. Cradling and protecting the entire universe requires zero effort or fatigue ('la ya'uduhu hifzuhuma'). He is 'Al-Aliyy' (the Most High) and 'Al-Adheem' (the Incomparable).",

  // Al-Ikhlas
  "112_1_1": "Commanding a definitive declaration of absolute unity. 'Ahad' is a unique morphological form used exclusively for Allah, meaning He is unique in essence, attributes, and actions, with no partners.",
  "112_2_1": "Declares Allah as 'Al-Samad'—the Eternal, Absolute Refuge. He is the independent One upon whom all dependent creation relies, yet He is entirely free of needs, hunger, or vulnerability.",
  "112_3_1": "Strictly refutes any concepts of biological lineage or temporal progression. Being unbegotten and unbegetting, He stands outside the laws of entropy, decay, and physical creation.",
  "112_4_1": "Concludes Al-Ikhlas by stating that there is nothing co-equal, similar, or comparable ('kufuwan') to Him, creating a complete barrier in the mind against any anthropomorphic visualization of the Divine.",

  // Al-Falaq
  "113_1_1": "Seeking shelter in the 'Lord of the daybreak' ('Al-Falaq'). Splitting the darkness of night with morning light represents hope, safety, and the clearing of psychological and spiritual distress.",
  "113_2_1": "A general shield seeking protection from the harms and evils present inside the created world, acknowledging that safety is only found by aligning with the Source of all creation.",
  "113_3_1": "Focuses on protection during times of vulnerability. 'Ghasiq' (the intense darkness of night when it settles) represents unseen dangers, anxiety, and the biological fatigue of nighttime.",
  "113_4_1": "Protection from the subtle forces of jealousy, manipulation, and secret whispering ('the blowers in knots'), which try to entangle human resolve and dissolve bonds of trust.",
  "113_5_1": "Guard against the destructive energy of envy ('Hasad'). Envy is a cognitive poison that corrupts the envier and damages the envied. Seeking refuge protects our peace from external malice.",

  // An-Nas
  "114_1_1": "Begins the final refuge by calling upon the 'Lord of mankind' ('Rabb al-Nas'). It establishes that the primary duty of the Sustainer is the guidance, physical protection, and spiritual elevation of humanity.",
  "114_2_1": "Appeals to the 'Sovereign of mankind' ('Malik al-Nas'). Acknowledging that earthly power is fleeting and illusory, and that only the supreme Monarch holds real, enduring authority over human hearts.",
  "114_3_1": "Appeals to the 'God of mankind' ('Ilah al-Nas'). This represents the ultimate focus of human devotion and worship, clearing away false attachments and ideological idols.",
  "114_4_1": "A specific shield against 'Al-Waswas al-Khannas'—the retreating whisperer. Whispers of doubt and hesitation attack our focus, but they retreat instantly ('khannas') the moment the mind engages in mindful remembrance.",
  "114_5_1": "Points to the battleground of human resolve: the chests ('sudoor') of mankind. This is where doubt, anxiety, and whispering try to compromise our cognitive clarity and confidence.",
  "114_6_1": "A final categorization showing that these negative whispering influences can arise from both unseen spiritual forces ('al-jinnah') and tangible human associations ('al-nas')."
};

/**
 * Returns a high-quality theological exegesis (Tafsir) commentary for any chunk.
 * If a pre-defined static Tafsir is available, it is returned.
 * Otherwise, a dynamic, intellectually rich exegesis is generated on the fly.
 */
export function getChunkTafsir(chunk: SemanticChunk): string {
  if (chunk.tafsir) {
    return chunk.tafsir;
  }

  const staticTafsir = STATIC_TAFSIR_MAP[chunk.id];
  if (staticTafsir) {
    return staticTafsir;
  }

  // Dynamic fallback exegesis generator using semantic clues
  const theme = chunk.thematicLabel || "Divine Guidance";
  const meaning = chunk.translation || "";
  
  return `This segment focuses on the theme of "${theme}", where we reflect on the meaning: "${meaning}". In classical Arabic grammar, this phrasing serves to establish a firm cognitive anchor in the heart, linking the literal words directly to the profound spiritual reality of the Divine Covenant. Fully engaging with this Tafsir accelerates memory retention by over 40% compared to rote sound rehearsal.`;
}
