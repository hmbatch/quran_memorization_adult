/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Gemini endpoints will operate in fallback simulation mode.");
}

// ============================================================================
// API ROUTES FIRST
// ============================================================================

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", geminiConfigured: !!ai });
});

// 2. Classical Arabic Semantic Chunking Engine (Feature 1)
app.post("/api/gemini/chunk-verse", async (req, res) => {
  const { arabicText, translationText } = req.body;
  if (!arabicText) {
    return res.status(400).json({ error: "Arabic text is required" });
  }

  if (!ai) {
    // Fallback simulation if Gemini is not configured
    const simulatedChunks = arabicText.split(" ").reduce((acc: string[][], word: string, idx: number) => {
      const chunkIdx = Math.floor(idx / 4);
      if (!acc[chunkIdx]) acc[chunkIdx] = [];
      acc[chunkIdx].push(word);
      return acc;
    }, []).map((words: string[], idx: number) => ({
      id: `custom_verse_${idx}`,
      arabic: words.join(" "),
      translation: `Part ${idx + 1} translation simulation of: ${translationText || "the verse"}`,
      transliteration: `Part ${idx + 1} transliteration`,
      thematicLabel: `Sovereignty Dimension ${idx + 1}`,
      visualAnchorPrompt: `Geometric arabesque pattern reflecting theme ${idx + 1}`,
      tafsir: `Profound cognitive encoding layer describing the theological exegesis for chunk ${idx + 1}: how this segment conveys divine majesty and guides the soul.`
    }));
    return res.json({ chunks: simulatedChunks, isSimulated: true });
  }

  try {
    const prompt = `
      You are a Classical Arabic linguistic expert and Quranic memorization consultant.
      We need to segment the following Classical Arabic verse into syntactically valid 3-to-5 word chunks.
      Do not split by arbitrary whitespace. Ensure each chunk is a meaningful, grammatical unit (e.g., noun-attribute, verb-subject, complete prepositional phrase).

      Verse: "${arabicText}"
      English Translation Reference: "${translationText || ""}"

      For each chunk, provide:
      1. The exact Arabic text segment
      2. Its specific English translation
      3. A readable English transliteration
      4. A specific thematic label/title (2-4 words) that describes the cognitive essence of this chunk for memorization
      5. A dynamic, culturally respectful visual anchor prompt (e.g., descriptive prompts of geometric light, ancient landmarks, calligraphy or abstract symbols, avoiding literal drawings of sacred persons or deities) to exploit spatial memory.
      6. A concise, profound Tafsir/exegesis explanation (1-2 sentences) of the chunk's theological and spiritual meaning to enable deep cognitive encoding for the adult learner.

      Return the response in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chunks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  arabic: { type: Type.STRING },
                  translation: { type: Type.STRING },
                  transliteration: { type: Type.STRING },
                  thematicLabel: { type: Type.STRING },
                  visualAnchorPrompt: { type: Type.STRING },
                  tafsir: { type: Type.STRING }
                },
                required: ["arabic", "translation", "transliteration", "thematicLabel", "visualAnchorPrompt", "tafsir"]
              }
            }
          },
          required: ["chunks"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json({ chunks: parsedData.chunks, isSimulated: false });
  } catch (error: any) {
    console.error("Gemini Chunking Error:", error);
    res.status(500).json({ error: "Failed to parse verse", details: error.message });
  }
});

// 3. Mutashabihat & Memory Interference Flagging (Feature 1)
app.post("/api/gemini/similarity-check", async (req, res) => {
  const { arabicText, reference } = req.body;
  if (!arabicText) {
    return res.status(400).json({ error: "Arabic text is required" });
  }

  if (!ai) {
    // Return standard warning simulation
    return res.json({
      mutashabihat: [
        {
          id: "sim_m1",
          originalVerseRef: reference || "User Verse",
          similarVerseRef: "Surah Ali 'Imran (3:2)",
          originalArabicText: arabicText,
          similarArabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
          overlapDescription: "Direct linguistic beginning match. Memorizers often confuse the transition parameters. Ensure high attentiveness here.",
          interferenceScore: 0.8
        }
      ],
      isSimulated: true
    });
  }

  try {
    const prompt = `
      You are an expert in Mutashabihat (phonetically or semantically similar verses) of the Quran.
      Analyze this verse: "${arabicText}" (Reference: ${reference || "Unknown"}).
      
      Identify if there are any similar verses (Mutashabihat) in the Quran that might cause memory interference for an adult learner.
      Explain the overlap clearly (e.g., difference in prepositions, word orders, or endings) and estimate an interference score between 0.0 (low) and 1.0 (extremely high, high risk of confusing them).

      Provide the analysis in JSON format with a list of 'mutashabihat'.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mutashabihat: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  originalVerseRef: { type: Type.STRING },
                  similarVerseRef: { type: Type.STRING },
                  originalArabicText: { type: Type.STRING },
                  similarArabicText: { type: Type.STRING },
                  overlapDescription: { type: Type.STRING },
                  interferenceScore: { type: Type.NUMBER }
                },
                required: ["id", "originalVerseRef", "similarVerseRef", "originalArabicText", "similarArabicText", "overlapDescription", "interferenceScore"]
              }
            }
          },
          required: ["mutashabihat"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json({ mutashabihat: parsedData.mutashabihat, isSimulated: false });
  } catch (error: any) {
    console.error("Gemini Mutashabihat Error:", error);
    res.status(500).json({ error: "Failed to perform similarity check", details: error.message });
  }
});

// 4. Tajweed-Aware ASR Diagnostic Engine (Feature 2)
app.post("/api/gemini/analyze-tajweed", async (req, res) => {
  const { targetArabic, transliteration, userAttemptText } = req.body;
  if (!targetArabic) {
    return res.status(400).json({ error: "Target Arabic text is required" });
  }

  if (!ai) {
    // Realistic simulation with some random feedback
    const randomPassed = Math.random() > 0.3;
    const randomScore = Math.floor(Math.random() * 20) + 80; // 80 to 100
    return res.json({
      score: randomScore,
      overallEvaluation: "Excellent breath control and clear articulation. Pay closer attention to vowel durations.",
      phonemeLevel: [
        { phoneme: "B", correct: true, notes: "Clear pronunciation" },
        { phoneme: "Sm", correct: true, notes: "Sibilance is correct" },
        { phoneme: "Allah", correct: true, notes: "Heavy/light distinction of L is proper" },
        { phoneme: "R-R", correct: randomPassed, notes: randomPassed ? "Perfect rolling of Ra" : "Ra is overly trilled. Soften the tongue contact." }
      ],
      sifatLevel: [
        { name: "Qalqala", passed: true, details: "Clean bouncing sound on the letters of 'Qutb Jadin' when saakin.", severity: "success" },
        { name: "Ikhfaa", passed: Math.random() > 0.2, details: "Nasal sound was timed well but could be held for a full 2 harakat.", severity: "warning" },
        { name: "Ghunnah", passed: true, details: "Perfect nasalization in Mim and Noon Mushaddad.", severity: "success" },
        { name: "Madd", passed: false, details: "Overtightened elongation on the compulsory Madd. Needs 4-5 counts.", severity: "error" }
      ],
      transcription: userAttemptText || targetArabic,
      isSimulated: true
    });
  }

  try {
    const prompt = `
      You are an elite, AI-driven acoustic speech analyzer specializing in Quranic Tajweed.
      We are analyzing an adult professional's audio recitation.
      Target classical Arabic chunk: "${targetArabic}" (${transliteration || ""})
      The user claimed they recited it as: "${userAttemptText || targetArabic}"

      Assess this attempt and generate an 11-level phonetic diagnostic report.
      Evaluate both:
      1. Phoneme level (individual consonants and vowels, correct letters)
      2. Sifat level (articulation attributes like Qalqala - bouncing, Ikhfaa - nasalization/hiding, Ghunnah - nasal sound, Madd - elongation).

      Create realistic feedback. If they made no major errors, praise them but find a subtle point of Sifat articulation to polish, as is standard for advanced adult learners.
      Give an overall score (0-100).
      Return the output strictly in JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            overallEvaluation: { type: Type.STRING },
            phonemeLevel: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phoneme: { type: Type.STRING },
                  correct: { type: Type.BOOLEAN },
                  notes: { type: Type.STRING }
                },
                required: ["phoneme", "correct", "notes"]
              }
            },
            sifatLevel: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  passed: { type: Type.BOOLEAN },
                  details: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["success", "warning", "error"] }
                },
                required: ["name", "passed", "details", "severity"]
              }
            },
            transcription: { type: Type.STRING }
          },
          required: ["score", "overallEvaluation", "phonemeLevel", "sifatLevel", "transcription"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsedData, isSimulated: false });
  } catch (error: any) {
    console.error("Gemini Tajweed Error:", error);
    res.status(500).json({ error: "Failed to analyze tajweed", details: error.message });
  }
});

// 5. Digital Memory Palace Anchor Generator (Feature 4)
app.post("/api/gemini/generate-anchor", async (req, res) => {
  const { chunkText, thematicLabel, visualAnchorPrompt } = req.body;
  if (!chunkText) {
    return res.status(400).json({ error: "Chunk text is required" });
  }

  if (!ai) {
    return res.json({
      themeDescription: `A gorgeous architectural representation of ${thematicLabel || "divine sovereignty"} with classic geometric styling.`,
      palaceSectionName: "The Court of Divine Solitude",
      aestheticTags: ["Gold", "Marble", "Symmetric"],
      isSimulated: true
    });
  }

  try {
    const prompt = `
      You are a visual design artist specializing in Islamic sacred art and classical motifs.
      A Quran student is memorizing the semantic chunk: "${chunkText}"
      Thematic essence: "${thematicLabel || ""}"
      Initial prompt concept: "${visualAnchorPrompt || ""}"

      Describe a detailed, culturally respectful, premium visual representation of this chunk to serve as a spatial memory anchor inside a Digital Memory Palace.
      Avoid physical human or animal depictions. Focus on architectural marvels (e.g., marble columns, vaulted arches, golden light, pools of reflection, starry skies) and intricate, perfect geometric arabesques.
      Name a section of the palace where this chunk belongs (e.g., "The Chamber of Eternal Vigilance", "The Hall of Balanced Scales").
      Provide 3-4 aesthetic tags (such as dominant colors, textures).

      Return the analysis in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeDescription: { type: Type.STRING },
            palaceSectionName: { type: Type.STRING },
            aestheticTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["themeDescription", "palaceSectionName", "aestheticTags"]
        }
      }
    });

    const parsedData = JSON.parse(response.text?.trim() || "{}");
    res.json({ ...parsedData, isSimulated: false });
  } catch (error: any) {
    console.error("Gemini Palace Anchor Error:", error);
    res.status(500).json({ error: "Failed to generate visual anchor descriptions", details: error.message });
  }
});


// ============================================================================
// VITE OR STATIC FILE SERVING ENDPOINTS (LAST)
// ============================================================================

const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
