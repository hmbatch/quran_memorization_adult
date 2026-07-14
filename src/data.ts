/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Surah, SemanticChunk, Mutashabih } from "./types";

export const SURAH_LIST: Surah[] = [
  {
    id: 1,
    name: "الفاتحة",
    englishName: "Al-Fatiha",
    versesCount: 7,
    revelationType: "Meccan",
    summary: "The Opening, the core of daily prayers, establishing praise, worship, and the path of guidance."
  },
  {
    id: 2,
    name: "آية الكرسي",
    englishName: "Ayah Al-Kursi",
    versesCount: 1, // 2:255
    revelationType: "Medinan",
    summary: "The Throne Verse (2:255). A monumental statement of Divine Sovereignty, Power, and Knowledge."
  },
  {
    id: 112,
    name: "الإخلاص",
    englishName: "Al-Ikhlas",
    versesCount: 4,
    revelationType: "Meccan",
    summary: "The Sincerity/Purity, defining the absolute oneness and uniqueness of Allah."
  },
  {
    id: 113,
    name: "الفلق",
    englishName: "Al-Falaq",
    versesCount: 5,
    revelationType: "Meccan",
    summary: "The Daybreak, seeking Divine protection from external evils and jealousy."
  },
  {
    id: 114,
    name: "الناس",
    englishName: "An-Nas",
    versesCount: 6,
    revelationType: "Meccan",
    summary: "Mankind, seeking refuge in the Lord of humanity from the subtle whispers of evil."
  }
];

export const MUTASHABIHAT: Mutashabih[] = [
  {
    id: "m1",
    originalVerseRef: "2:255 (Al-Kursi)",
    similarVerseRef: "3:2 (Ali 'Imran)",
    originalArabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ...",
    similarArabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    overlapDescription: "Both verses start with 'Allahu la ilaha illa huwal-hayyul-qayyum'. Al-Kursi continues with sleep limits, whereas Ali 'Imran leads into the Revelation confirming previous scriptures.",
    interferenceScore: 0.85
  },
  {
    id: "m2",
    originalVerseRef: "2:136 (Al-Baqarah)",
    similarVerseRef: "3:84 (Ali 'Imran)",
    originalArabicText: "قُولُوا آمَنَّا بِاللَّهِ وَمَا أُنزِلَ إِلَيْنَا...",
    similarArabicText: "قُلْ آمَنَّا بِاللَّهِ وَمَا أُنزِلَ عَلَيْنَا...",
    overlapDescription: "Prepositional interference: Al-Baqarah uses 'Qūlū' (Say, plural) and 'Ilaynā' (to us), whereas Ali 'Imran uses 'Qul' (Say, singular) and '‘Alaynā' (upon us).",
    interferenceScore: 0.95
  },
  {
    id: "m3",
    originalVerseRef: "114:1-3 (An-Nas)",
    similarVerseRef: "112:1-2 (Al-Ikhlas)",
    originalArabicText: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَٰهِ النَّاسِ",
    similarArabicText: "قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ",
    overlapDescription: "Thematic overlap of seeking absolute divinity of Allah. Watch out for grammatical shifts from attributes of lordship to absolute oneness.",
    interferenceScore: 0.45
  }
];

export const SEMANTIC_CHUNKS: SemanticChunk[] = [
  // --- Surah Al-Fatiha (Surah 1) ---
  {
    id: "1_1_1",
    surahId: 1,
    verseNumber: 1,
    chunkIndex: 0,
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    transliteration: "Bismillaahir-Rahmaanir-Raheem",
    thematicLabel: "Divine Initiation & Grace",
    visualAnchorPrompt: "A majestic golden gateway radiating celestial light into a serene, starry expanse."
  },
  {
    id: "1_2_1",
    surahId: 1,
    verseNumber: 2,
    chunkIndex: 0,
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    translation: "[All] praise is [due] to Allah, Lord of the worlds -",
    transliteration: "Alhamdu lillaahi Rabbil-'aalameen",
    thematicLabel: "Universal Gratitude",
    visualAnchorPrompt: "A lush, emerald-green valley beneath cascading waterfalls, where all nature thrives in harmony."
  },
  {
    id: "1_3_1",
    surahId: 1,
    verseNumber: 3,
    chunkIndex: 0,
    arabic: "الرَّحْمَٰنِ الرَّحِيمِ",
    translation: "The Entirely Merciful, the Especially Merciful,",
    transliteration: "Ar-Rahmaanir-Raheem",
    thematicLabel: "Dual Mercies",
    visualAnchorPrompt: "Two luminous, warm rings of light interlocking and descending like a protective canopy."
  },
  {
    id: "1_4_1",
    surahId: 1,
    verseNumber: 4,
    chunkIndex: 0,
    arabic: "مَالِكِ يَوْمِ الدِّينِ",
    translation: "Sovereign of the Day of Recompense.",
    transliteration: "Maaliki Yawmid-Deen",
    thematicLabel: "Cosmic Justice",
    visualAnchorPrompt: "An elegant, towering balance scale crafted from pure sapphire, set against a dawn-lit sky."
  },
  {
    id: "1_5_1",
    surahId: 1,
    verseNumber: 5,
    chunkIndex: 0,
    arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    translation: "It is You we worship and You we ask for help.",
    transliteration: "Iyyaaka na'budu wa iyyaaka nasta'een",
    thematicLabel: "The Covenant",
    visualAnchorPrompt: "A strong, ancient column of white marble standing firm, connecting the earth directly to a golden cloud."
  },
  {
    id: "1_6_1",
    surahId: 1,
    verseNumber: 6,
    chunkIndex: 0,
    arabic: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path -",
    transliteration: "Ihdinas-Siraatal-Mustaqeem",
    thematicLabel: "The Ascent",
    visualAnchorPrompt: "A straight, brightly glowing golden path cutting safely through a dark, foggy mountain range."
  },
  {
    id: "1_7_1",
    surahId: 1,
    verseNumber: 7,
    chunkIndex: 0,
    arabic: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ",
    translation: "The path of those upon whom You have bestowed favor,",
    transliteration: "Siraatal-ladheena an'amta 'alayhim",
    thematicLabel: "Blessed Predecessors",
    visualAnchorPrompt: "A path lined with ancient, flourishing olive trees heavy with ripe, silver-glistening fruit."
  },
  {
    id: "1_7_2",
    surahId: 1,
    verseNumber: 7,
    chunkIndex: 1,
    arabic: "غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation: "not of those who have evoked [Your] anger or of those who are astray.",
    transliteration: "Ghayril-maghdoobi 'alayhim wa lad-daalleen",
    thematicLabel: "Shield from Deviation",
    visualAnchorPrompt: "A sturdy shield of polished gold deflecting stormy waves and branching dark labyrinths."
  },

  // --- Ayah Al-Kursi (Surah 2:255) ---
  {
    id: "2_255_1",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 0,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of all existence.",
    transliteration: "Allahu laa ilaaha illaa Huwal-Hayyul-Qayyeem",
    thematicLabel: "Eternal Existence",
    visualAnchorPrompt: "A sun-like geometric orb of geometric light, pulsing with infinite energy in a deep navy space."
  },
  {
    id: "2_255_2",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 1,
    arabic: "لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    translation: "Neither drowsiness overtakes Him nor sleep.",
    transliteration: "Laa ta'khudhuhu sinatun wa laa nawm",
    thematicLabel: "Vigilant Guard",
    visualAnchorPrompt: "A brilliant, open celestial eye formed of silver constellations, never dimming or turning."
  },
  {
    id: "2_255_3",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 2,
    arabic: "لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ",
    translation: "To Him belongs whatever is in the heavens and whatever is on the earth.",
    transliteration: "Lahu maa fis-samaawaati wa maa fil-ard",
    thematicLabel: "Absolute Domain",
    visualAnchorPrompt: "A glowing dome covering both towering mountain peaks and spiraling cosmic rings."
  },
  {
    id: "2_255_4",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 3,
    arabic: "مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ",
    translation: "Who is it that can intercede with Him except by His permission?",
    transliteration: "Man dhal-ladhee yashfa'u 'indahuu illaa bi-idhnih",
    thematicLabel: "The Intercession Limit",
    visualAnchorPrompt: "A court of tall arches where a single glowing scepter stands waiting for a divine command."
  },
  {
    id: "2_255_5",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 4,
    arabic: "يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ",
    translation: "He knows what is [presently] before them and what will be after them,",
    transliteration: "Ya'lamu maa bayna aydeehim wa maa khalfahum",
    thematicLabel: "Omniscience",
    visualAnchorPrompt: "An infinite river of sapphire light flowing from the distant past through the present into the future."
  },
  {
    id: "2_255_6",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 5,
    arabic: "وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ",
    translation: "and they encompass not a thing of His knowledge except for what He wills.",
    transliteration: "Wa laa yuheetoona bi-shay'im-min 'ilmihee illaa bimaa shaa'",
    thematicLabel: "Willed Revelation",
    visualAnchorPrompt: "A single, shining drop falling from a vast ocean of light onto a pristine, open manuscript."
  },
  {
    id: "2_255_7",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 6,
    arabic: "وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ",
    translation: "His Throne extends over the heavens and the earth,",
    transliteration: "Wasi'a Kursiyyuhus-samaawaati wal-ard",
    thematicLabel: "The Throne",
    visualAnchorPrompt: "A monumental, crystal throne of pure light spanning across stars and continents."
  },
  {
    id: "2_255_8",
    surahId: 2,
    verseNumber: 255,
    chunkIndex: 7,
    arabic: "وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation: "and their preservation tires Him not. And He is the Most High, the Most Great.",
    transliteration: "Wa laa ya'ooduhu hifzuhumaa wa Huwal-'Aliyyul-'Adheem",
    thematicLabel: "Effortless Guardianship",
    visualAnchorPrompt: "Two glowing wings of azure light cradling a miniature, peaceful spinning planet earth."
  },

  // --- Surah Al-Ikhlas (Surah 112) ---
  {
    id: "112_1_1",
    surahId: 112,
    verseNumber: 1,
    chunkIndex: 0,
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say, 'He is Allah, [who is] One,",
    transliteration: "Qul Huwal-Laahu Ahad",
    thematicLabel: "Absolute Singularity",
    visualAnchorPrompt: "A single, towering pillar of pure white gold standing in absolute majesty in a calm desert."
  },
  {
    id: "112_2_1",
    surahId: 112,
    verseNumber: 2,
    chunkIndex: 0,
    arabic: "اللَّهُ الصَّمَدُ",
    translation: "Allah, the Eternal Refuge.",
    transliteration: "Allaahus-Samad",
    thematicLabel: "The Eternal Rock",
    visualAnchorPrompt: "An unbreakable mountain of diamond light, toward which millions of glowing particles converge for shelter."
  },
  {
    id: "112_3_1",
    surahId: 112,
    verseNumber: 3,
    chunkIndex: 0,
    arabic: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    translation: "He neither begets nor is born,",
    transliteration: "Lam yalid wa lam yoolad",
    thematicLabel: "Uncreated Majesty",
    visualAnchorPrompt: "An infinite, seamless circle of golden light with no beginning and no end."
  },
  {
    id: "112_4_1",
    surahId: 112,
    verseNumber: 4,
    chunkIndex: 0,
    arabic: "وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ",
    translation: "And there is none co-equal or comparable to Him.'",
    transliteration: "Wa lam yakul-lahu kufuwan ahad",
    thematicLabel: "Incomparable One",
    visualAnchorPrompt: "A radiant star burning in unique splendor, with no other star anywhere in its horizon."
  },

  // --- Surah Al-Falaq (Surah 113) ---
  {
    id: "113_1_1",
    surahId: 113,
    verseNumber: 1,
    chunkIndex: 0,
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
    translation: "Say, 'I seek refuge in the Lord of the daybreak",
    transliteration: "Qul a'oodhu bi-Rabbil-falaq",
    thematicLabel: "Sunrise Refuge",
    visualAnchorPrompt: "A brilliant horizon piercing through pitch black night with deep crimson and gold dawn."
  },
  {
    id: "113_2_1",
    surahId: 113,
    verseNumber: 2,
    chunkIndex: 0,
    arabic: "مِنْ شَرِّ مَا خَلَقَ",
    translation: "From the evil of what He created",
    transliteration: "Min sharri maa khalaq",
    thematicLabel: "Shielding Creation",
    visualAnchorPrompt: "A thick, glass crystalline dome shielding a pristine, green garden from stormy winds."
  },
  {
    id: "113_3_1",
    surahId: 113,
    verseNumber: 3,
    chunkIndex: 0,
    arabic: "وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    translation: "And from the evil of darkness when it settles",
    transliteration: "Wa min sharri ghaasiqin idhaa waqab",
    thematicLabel: "Night Protection",
    visualAnchorPrompt: "A golden lantern casting a warm, protective circle of light in a deep, mysterious forest."
  },
  {
    id: "113_4_1",
    surahId: 113,
    verseNumber: 4,
    chunkIndex: 0,
    arabic: "وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
    translation: "And from the evil of the blowers in knots",
    transliteration: "Wa min sharrin-naffaathaati fil-'uqad",
    thematicLabel: "Breaking Knots",
    visualAnchorPrompt: "A sharp, silver sword slicing through dark, tangled threads, untying them instantly."
  },
  {
    id: "113_5_1",
    surahId: 113,
    verseNumber: 5,
    chunkIndex: 0,
    arabic: "وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    translation: "And from the evil of an envier when he envies.'",
    transliteration: "Wa min sharri haasidin idhaa hasad",
    thematicLabel: "Deflecting Envy",
    visualAnchorPrompt: "A mirror made of water that peacefully absorbs and dissolves a sharp, dark gaze."
  },

  // --- Surah An-Nas (Surah 114) ---
  {
    id: "114_1_1",
    surahId: 114,
    verseNumber: 1,
    chunkIndex: 0,
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    translation: "Say, 'I seek refuge in the Lord of mankind,",
    transliteration: "Qul a'oodhu bi-Rabbin-naas",
    thematicLabel: "Sovereign Sanctuary",
    visualAnchorPrompt: "A vast protective city wall made of towering white marble arches welcoming all humanity."
  },
  {
    id: "114_2_1",
    surahId: 114,
    verseNumber: 2,
    chunkIndex: 0,
    arabic: "مَلِكِ النَّاسِ",
    translation: "The Sovereign of mankind,",
    transliteration: "Malikin-naas",
    thematicLabel: "Universal Crown",
    visualAnchorPrompt: "A golden crown floating in a throne room, casting warm light on countless pillars."
  },
  {
    id: "114_3_1",
    surahId: 114,
    verseNumber: 3,
    chunkIndex: 0,
    arabic: "إِلَٰهِ النَّاسِ",
    translation: "The God of mankind,",
    transliteration: "Ilaahin-naas",
    thematicLabel: "Absolute Object of Worship",
    visualAnchorPrompt: "An immense fountain of light overflowing into serene rivers, with stars above."
  },
  {
    id: "114_4_1",
    surahId: 114,
    verseNumber: 4,
    chunkIndex: 0,
    arabic: "مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
    translation: "From the evil of the retreating whisperer -",
    transliteration: "Min sharril-waswaasil-khannaas",
    thematicLabel: "The Whisperer's Retreat",
    visualAnchorPrompt: "A shadow evaporating rapidly as the sun rises, dissolving into thin air."
  },
  {
    id: "114_5_1",
    surahId: 114,
    verseNumber: 5,
    chunkIndex: 0,
    arabic: "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
    translation: "Who whispers [evil] into the breasts of mankind -",
    transliteration: "Alladhee yuwaswisu fee sudoorin-naas",
    thematicLabel: "Chest Sanctuary",
    visualAnchorPrompt: "A cage of gold protective ribs housing a glowing, peaceful light inside."
  },
  {
    id: "114_6_1",
    surahId: 114,
    verseNumber: 6,
    chunkIndex: 0,
    arabic: "مِنَ الْجِنَّةِ وَالنَّاسِ",
    translation: "From among the jinn and mankind.'",
    transliteration: "Minal-jinnati wan-naas",
    thematicLabel: "Complete Freedom",
    visualAnchorPrompt: "Two soaring birds—one silver, one golden—escaping a cage into a limitless sky."
  }
];
