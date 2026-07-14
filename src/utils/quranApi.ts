/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Quranic Data API & Dynamic Fetching Service.
 * Provides metadata for all 114 Surahs and manages lazy fetching of text & translation.
 */

import { Surah, SemanticChunk } from "../types";

export interface QuranicVerse {
  number: number; // overall verse number
  numberInSurah: number;
  text: string;
  translation: string;
}

export const QURAN_114_SURAHS: Surah[] = [
  { id: 1, name: "الفاتحة", englishName: "Al-Fatiha", versesCount: 7, revelationType: "Meccan", summary: "The Opening, the core of daily prayers, establishing praise, worship, and the path of guidance." },
  { id: 2, name: "البقرة", englishName: "Al-Baqarah", versesCount: 286, revelationType: "Medinan", summary: "The Cow. The longest Surah, addressing guidance, covenant, legal guidelines, and divine sovereignty." },
  { id: 3, name: "آل عمران", englishName: "Ali 'Imran", versesCount: 200, revelationType: "Medinan", summary: "Family of Imran. Focuses on the oneness of God, steadfastness of faith, and lessons from historical events." },
  { id: 4, name: "النساء", englishName: "An-Nisa", versesCount: 176, revelationType: "Medinan", summary: "The Women. Outlines justice, family structures, orphan protection, inheritances, and community rights." },
  { id: 5, name: "المائدة", englishName: "Al-Ma'idah", versesCount: 120, revelationType: "Medinan", summary: "The Table Spread. Addresses contracts, dietary laws, purification, and theological testaments." },
  { id: 6, name: "الأنعام", englishName: "Al-An'am", versesCount: 165, revelationType: "Meccan", summary: "The Cattle. Proclaims Divine Lordship, refutes polytheism, and outlines lessons from nature." },
  { id: 7, name: "الأعراف", englishName: "Al-A'raf", versesCount: 206, revelationType: "Meccan", summary: "The Heights. Explores the spiritual dialogue between righteousness and pride across history." },
  { id: 8, name: "الأنفال", englishName: "Al-Anfal", versesCount: 75, revelationType: "Medinan", summary: "The Spoils of War. Outlines military ethics, patience, trust in God, and absolute unity." },
  { id: 9, name: "التوبة", englishName: "At-Tawbah", versesCount: 129, revelationType: "Medinan", summary: "The Repentance. Discusses treaties, sincerity, community mobilization, and divine forgiveness." },
  { id: 10, name: "يونس", englishName: "Yunus", versesCount: 109, revelationType: "Meccan", summary: "Jonah. Focuses on Divine revelation, belief, cosmic design, and the story of Jonah's people." },
  { id: 11, name: "هود", englishName: "Hud", versesCount: 123, revelationType: "Meccan", summary: "Hud. Strong warnings of historical justice and accounts of previous messengers." },
  { id: 12, name: "يوسف", englishName: "Yusuf", versesCount: 111, revelationType: "Meccan", summary: "Joseph. Narrates the complete, deeply emotional story of Prophet Joseph as a study of patience and victory." },
  { id: 13, name: "الرعد", englishName: "Ar-Ra'd", versesCount: 43, revelationType: "Meccan", summary: "The Thunder. Explores truth versus falsehood, natural signs, and divine decree." },
  { id: 14, name: "إبراهيم", englishName: "Ibrahim", versesCount: 52, revelationType: "Meccan", summary: "Abraham. Focuses on gratitude, the duality of good and evil words, and Prophet Abraham's prayers." },
  { id: 15, name: "الحجر", englishName: "Al-Hijr", versesCount: 99, revelationType: "Meccan", summary: "The Rocky Tract. Assures the preservation of the Quran and details the creation of man." },
  { id: 16, name: "النحل", englishName: "An-Nahl", versesCount: 128, revelationType: "Meccan", summary: "The Bee. Celebrates the innumerable blessings of God, from rain and cattle to the wisdom of bees." },
  { id: 17, name: "الإسراء", englishName: "Al-Isra", versesCount: 111, revelationType: "Meccan", summary: "The Night Journey. Covers the night journey, children's rights, humility, and the majesty of the Quran." },
  { id: 18, name: "الكهف", englishName: "Al-Kahf", versesCount: 110, revelationType: "Meccan", summary: "The Cave. Four critical stories representing trials of faith, wealth, knowledge, and power." },
  { id: 19, name: "مريم", englishName: "Maryam", versesCount: 98, revelationType: "Meccan", summary: "Mary. Highlights the miraculous births of John and Jesus, and the profound piety of Mary." },
  { id: 20, name: "طه", englishName: "Taha", versesCount: 135, revelationType: "Meccan", summary: "Taha. The majestic call of Moses, the burning bush, and comforting words for the Prophet." },
  { id: 21, name: "الأنبياء", englishName: "Al-Anbiya", versesCount: 112, revelationType: "Meccan", summary: "The Prophets. Outlines the unified struggle and human qualities of all divine messengers." },
  { id: 22, name: "الحج", englishName: "Al-Hajj", versesCount: 78, revelationType: "Medinan", summary: "The Pilgrimage. Commands the pilgrimage rituals, details cosmic prostration, and defends the truth." },
  { id: 23, name: "المؤمنون", englishName: "Al-Mu'minun", versesCount: 118, revelationType: "Meccan", summary: "The Believers. Lists the successful traits of believers, fetal development, and Noah's ark." },
  { id: 24, name: "النور", englishName: "An-Nur", versesCount: 64, revelationType: "Medinan", summary: "The Light. Contains the Verse of Light ('Ayat al-Nur'), household etiquette, and social modesty." },
  { id: 25, name: "الفرقان", englishName: "Al-Furqan", versesCount: 77, revelationType: "Meccan", summary: "The Criterion. Distinguishes truth from falsehood and outlines the beautiful qualities of the servants of the Merciful." },
  { id: 26, name: "الشعراء", englishName: "Ash-Shu'ara", versesCount: 227, revelationType: "Meccan", summary: "The Poets. Highlights the linguistic miracle of revelation and accounts of past prophets." },
  { id: 27, name: "النمل", englishName: "An-Naml", versesCount: 93, revelationType: "Meccan", summary: "The Ant. Highlights Solomon's speech with birds and ants, and the Queen of Sheba's submission." },
  { id: 28, name: "القصص", englishName: "Al-Qasas", versesCount: 88, revelationType: "Meccan", summary: "The Stories. Detailed biographical accounts of Prophet Moses' early childhood and escape." },
  { id: 29, name: "العنكبوت", englishName: "Al-Ankabut", versesCount: 69, revelationType: "Meccan", summary: "The Spider. Discusses tests of faith, comparison of weak structures to spider webs, and struggle." },
  { id: 30, name: "الروم", englishName: "Ar-Rum", versesCount: 60, revelationType: "Meccan", summary: "The Romans. Prophesies Roman victory, details patterns of nature, and marital love." },
  { id: 31, name: "لقمان", englishName: "Luqman", versesCount: 34, revelationType: "Meccan", summary: "Luqman. Wise counsels of Luqman to his son regarding humility, prayer, and respect for parents." },
  { id: 32, name: "السجدة", englishName: "As-Sajdah", versesCount: 30, revelationType: "Meccan", summary: "The Prostration. Reflects on creation, resurrection, and the ultimate joy of the believers." },
  { id: 33, name: "الأحزاب", englishName: "Al-Ahzab", versesCount: 73, revelationType: "Medinan", summary: "The Combined Forces. Discusses the Battle of the Trench, marriage ethics, and societal reforms." },
  { id: 34, name: "سبأ", englishName: "Saba", versesCount: 54, revelationType: "Meccan", summary: "Sheba. Contrasts the gratitude of Solomon and David with the pride and subsequent ruin of Sheba." },
  { id: 35, name: "فاطر", englishName: "Fatir", versesCount: 45, revelationType: "Meccan", summary: "The Originator. Proclaims Allah as the Originator of the heavens and earth, using angels as messengers." },
  { id: 36, name: "يس", englishName: "Ya-Sin", versesCount: 83, revelationType: "Meccan", summary: "Ya-Sin. The heart of the Quran, centering on the certainty of revelation, creation, and afterlife." },
  { id: 37, name: "الصافات", englishName: "As-Saffat", versesCount: 182, revelationType: "Meccan", summary: "Those Ranged in Ranks. Focuses on the absolute oneness of God and stories of Abraham and Isaac." },
  { id: 38, name: "ص", englishName: "Sad", versesCount: 88, revelationType: "Meccan", summary: "Sad. Discusses trials of David, Solomon, and Job, showing how patience resolves earthly power." },
  { id: 39, name: "الزمر", englishName: "Az-Zumar", versesCount: 75, revelationType: "Meccan", summary: "The Groups. Contrasts the final states of polytheists and believers entering paradise in groups." },
  { id: 40, name: "غافر", englishName: "Ghafir", versesCount: 85, revelationType: "Meccan", summary: "The Forgiver. Proclaims Allah as the Forgiver of Sin and Acceptor of Repentance." },
  { id: 41, name: "فصلت", englishName: "Fussilat", versesCount: 54, revelationType: "Meccan", summary: "Explained in Detail. Highlights the beauty of inviting others to Allah and nature's horizons." },
  { id: 42, name: "الشورى", englishName: "Ash-Shura", versesCount: 53, revelationType: "Meccan", summary: "The Consultation. Declares consultation as a central pillar of communal life and governance." },
  { id: 43, name: "الزخرف", englishName: "Az-Zukhruf", versesCount: 89, revelationType: "Meccan", summary: "The Ornaments of Gold. Refutes materialism, comparing golden luxuries to the eternal afterlife." },
  { id: 44, name: "الدخان", englishName: "Ad-Dukhan", versesCount: 59, revelationType: "Meccan", summary: "The Smoke. Details the revelation of the Quran on the Blessed Night and subsequent warnings." },
  { id: 45, name: "الجاثية", englishName: "Al-Jathiyah", versesCount: 37, revelationType: "Meccan", summary: "The Crouching. Describes the cosmic signs in creation and ultimate accountability on Judgement Day." },
  { id: 46, name: "الأحقاف", englishName: "Al-Ahqaf", versesCount: 35, revelationType: "Meccan", summary: "The Wind-Curved Sandhills. Emphasizes parental care, filial duty, and warnings to historical nations." },
  { id: 47, name: "محمد", englishName: "Muhammad", versesCount: 38, revelationType: "Medinan", summary: "Muhammad. Discusses spiritual steadfastness, testing of faith, and charity." },
  { id: 48, name: "الفتح", englishName: "Al-Fath", versesCount: 29, revelationType: "Medinan", summary: "The Victory. Celebrates the Treaty of Hudaybiyyah as a manifest spiritual and political victory." },
  { id: 49, name: "الحجرات", englishName: "Al-Hujurat", versesCount: 18, revelationType: "Medinan", summary: "The Chambers. Enforces high social ethics, forbidding backbiting, rumors, and racial pride." },
  { id: 50, name: "ق", englishName: "Qaf", versesCount: 45, revelationType: "Meccan", summary: "Qaf. Delves into death, resurrection, the recording angels, and the majesty of creation." },
  { id: 51, name: "الذاريات", englishName: "Adh-Dhariyat", versesCount: 60, revelationType: "Meccan", summary: "The Winnowing Winds. Assures that divine promises are true, detailing the purpose of creating Jinn and humans." },
  { id: 52, name: "الطور", englishName: "At-Tur", versesCount: 49, revelationType: "Meccan", summary: "The Mount. Pledges by Mount Sinai, sacred books, and seas that divine justice is absolute." },
  { id: 53, name: "النجم", englishName: "An-Najm", versesCount: 62, revelationType: "Meccan", summary: "The Star. Details the Prophet's ascension (Mi'raj), proximity to the Divine, and star motions." },
  { id: 54, name: "القمر", englishName: "Al-Qamar", versesCount: 55, revelationType: "Meccan", summary: "The Moon. Highlights the splitting of the moon, stating repeatedly: 'We made the Quran easy to remember'." },
  { id: 55, name: "الرحمن", englishName: "Ar-Rahman", versesCount: 78, revelationType: "Meccan", summary: "The Beneficent. A poetic masterpiece listing blessings, with the refrain: 'Which of your Lord's favors will you deny?'" },
  { id: 56, name: "الواقعة", englishName: "Al-Waqi'ah", versesCount: 96, revelationType: "Meccan", summary: "The Inevitable. Details the Great Event, dividing humanity into three distinct spiritual tiers." },
  { id: 57, name: "الحديد", englishName: "Al-Hadid", versesCount: 29, revelationType: "Medinan", summary: "The Iron. Explores the spiritual balance of iron, charitable spending, and true humility." },
  { id: 58, name: "المجادلة", englishName: "Al-Mujadila", versesCount: 22, revelationType: "Medinan", summary: "The Pleading Woman. Confirms that Allah hears the petition of a woman, outlining assembly ethics." },
  { id: 59, name: "الحشر", englishName: "Al-Hashr", versesCount: 24, revelationType: "Medinan", summary: "The Exile. Contains the majestic final verses detailing the Most Beautiful Names of Allah." },
  { id: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", versesCount: 13, revelationType: "Medinan", summary: "The Woman to be Examined. Discusses social treaties, community loyalty, and testing of immigrants." },
  { id: 61, name: "الصف", englishName: "As-Saff", versesCount: 14, revelationType: "Medinan", summary: "The Ranks. Calls for consistency between words and deeds, organizing like a solid, cemented structure." },
  { id: 62, name: "الجمعة", englishName: "Al-Jumu'ah", versesCount: 11, revelationType: "Medinan", summary: "The Congregation. Commands leaving business when the call for Friday congregation prayer is made." },
  { id: 63, name: "المنافقون", englishName: "Al-Munafiqun", versesCount: 11, revelationType: "Medinan", summary: "The Hypocrites. Analyzes the psychological dynamics of insincerity and warnings against greed." },
  { id: 64, name: "التغابن", englishName: "At-Taghabun", versesCount: 18, revelationType: "Medinan", summary: "The Mutual Disillusion. Reflects on mutual gain and loss, encouraging charity as a goodly loan." },
  { id: 65, name: "الطلاق", englishName: "At-Talaq", versesCount: 12, revelationType: "Medinan", summary: "The Divorce. Outlines legal fairness in separation, assuring: 'Whoever fears God, He will make a way out'." },
  { id: 66, name: "التحريم", englishName: "At-Tahrim", versesCount: 12, revelationType: "Medinan", summary: "The Prohibition. Promotes family leadership and highlights the exemplary faith of Pharaoh's wife." },
  { id: 67, name: "الملك", englishName: "Al-Mulk", versesCount: 30, revelationType: "Meccan", summary: "The Sovereignty. Explains that life and death were created to test who is best in deed." },
  { id: 68, name: "القلم", englishName: "Al-Qalam", versesCount: 52, revelationType: "Meccan", summary: "The Pen. Asserts the noble character of the Prophet, opening with the mystery of the Pen." },
  { id: 69, name: "الحاقة", englishName: "Al-Haqqah", versesCount: 52, revelationType: "Meccan", summary: "The Inevitable Reality. Warns of historical justice and describes the holding of the divine record." },
  { id: 70, name: "المعارج", englishName: "Al-Ma'arij", versesCount: 44, revelationType: "Meccan", summary: "The Ascending Stairways. Describes cosmic ascents, human impatience, and the beauty of prayer." },
  { id: 71, name: "نوح", englishName: "Nuh", versesCount: 28, revelationType: "Meccan", summary: "Noah. Detailed account of Prophet Noah's tireless, multi-century call and final prayer." },
  { id: 72, name: "الجن", englishName: "Al-Jinn", versesCount: 28, revelationType: "Meccan", summary: "The Jinn. Recounts a group of Jinn listening to the Quran, acknowledging its sublime guidance." },
  { id: 73, name: "المزمل", englishName: "Al-Muzzammil", versesCount: 20, revelationType: "Meccan", summary: "The Enshrouded One. Commands night vigil prayers and beautiful, rhythmic recitation ('Tartila')." },
  { id: 74, name: "المدثر", englishName: "Al-Muddaththir", versesCount: 56, revelationType: "Meccan", summary: "The Cloaked One. Commands the Prophet to stand and warn, establishing initial calling pillars." },
  { id: 75, name: "القيامة", englishName: "Al-Qiyamah", versesCount: 40, revelationType: "Meccan", summary: "The Resurrection. A deeply dramatic portrayal of physical death and subsequent cosmic revival." },
  { id: 76, name: "الإنسان", englishName: "Al-Insan", versesCount: 31, revelationType: "Meccan", summary: "The Human. Traces the creation of man from a drop of fluid, detailing the eternal rewards of patience." },
  { id: 77, name: "المرسلات", englishName: "Al-Mursalat", versesCount: 50, revelationType: "Meccan", summary: "Those Sent Forth. Poetic verses pledging by winds and storms, with the warning: 'Woe to the deniers'." },
  { id: 78, name: "النبأ", englishName: "An-Naba", versesCount: 40, revelationType: "Meccan", summary: "The Great News. Focuses on the cosmic transition, mountains as pegs, and final judgement." },
  { id: 79, name: "النازحات", englishName: "An-Nazi'at", versesCount: 46, revelationType: "Meccan", summary: "Those Who Pull Out. Pledges by angels of transition, Moses in the sacred valley, and final hours." },
  { id: 80, name: "عبس", englishName: "Abasa", versesCount: 42, revelationType: "Meccan", summary: "He Frowned. Prioritizes the sincere seeker over wealthy leaders, outlining nature's harvests." },
  { id: 81, name: "التكوير", englishName: "At-Takwir", versesCount: 29, revelationType: "Meccan", summary: "The Overthrowing. A vivid astronomical description of the end times when stars lose luster." },
  { id: 82, name: "الانفطار", englishName: "Al-Infitar", versesCount: 19, revelationType: "Meccan", summary: "The Cleaving. Describes the cosmic clefting of skies and recording angels listing every action." },
  { id: 83, name: "المطففين", englishName: "Al-Mutaffifin", versesCount: 36, revelationType: "Meccan", summary: "The Defrauders. Strictly warns against business cheating, promising high rewards for the righteous." },
  { id: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", versesCount: 25, revelationType: "Meccan", summary: "The Splitting Open. Reflects on the human journey back to the Lord, struggling step-by-step." },
  { id: 85, name: "البروج", englishName: "Al-Buruj", versesCount: 22, revelationType: "Meccan", summary: "The Mansions of Stars. Condemns the historical persecution of believers, assuring divine preservation." },
  { id: 86, name: "الطارق", englishName: "At-Tariq", versesCount: 17, revelationType: "Meccan", summary: "The Bright Star. Reminds of man's humble physical origin, promising that secret intents will be tested." },
  { id: 87, name: "الأعلى", englishName: "Al-A'la", versesCount: 19, revelationType: "Meccan", summary: "The Most High. Commands praising the Lord, assuring: 'We will make you recite, so you will not forget'." },
  { id: 88, name: "الغاشية", englishName: "Al-Ghashiyah", versesCount: 26, revelationType: "Meccan", summary: "The Overwhelming Event. Contrasts states of exhaustion with joyful satisfaction, directing gaze to camels." },
  { id: 89, name: "الفجر", englishName: "Al-Fajr", versesCount: 30, revelationType: "Meccan", summary: "The Dawn. Pledges by dawn and ten nights, welcoming the tranquil soul: 'Return to your Lord'." },
  { id: 90, name: "البلد", englishName: "Al-Balad", versesCount: 20, revelationType: "Meccan", summary: "The City. Explains that humans are created in constant struggle, praising the path of feeding orphans." },
  { id: 91, name: "الشمس", englishName: "Ash-Shams", versesCount: 15, revelationType: "Meccan", summary: "The Sun. Eleven divine oaths proclaiming: 'He succeeds who purifies his soul, and he fails who corrupts it'." },
  { id: 92, name: "الليل", englishName: "Al-Layl", versesCount: 21, revelationType: "Meccan", summary: "The Night. Contrasts the path of generous belief with the stingy pursuit of self-sufficiency." },
  { id: 93, name: "الضحى", englishName: "Ad-Duha", versesCount: 11, revelationType: "Meccan", summary: "The Morning Hours. Comforting assurance to the Prophet: 'Your Lord has not abandoned you, nor is He displeased'." },
  { id: 94, name: "الشرح", englishName: "Ash-Sharh", versesCount: 8, revelationType: "Meccan", summary: "The Relief. Promises twice that 'with hardship comes ease', commanding immediate action after rest." },
  { id: 95, name: "التين", englishName: "At-Tin", versesCount: 8, revelationType: "Meccan", summary: "The Fig. Pledges by holy lands that man is created in the best of molds, yet can sink low." },
  { id: 96, name: "العلق", englishName: "Al-Alaq", versesCount: 19, revelationType: "Meccan", summary: "The Clinging Clot. The first revelation: 'Read in the name of your Lord', warning against human arrogance." },
  { id: 97, name: "القدر", englishName: "Al-Qadr", versesCount: 5, revelationType: "Meccan", summary: "The Decree. Celebrates the Night of Power ('Laylat al-Qadr'), stating it is better than a thousand months." },
  { id: 98, name: "البينة", englishName: "Al-Bayyinah", versesCount: 8, revelationType: "Medinan", summary: "The Clear Evidence. Describes the coming of the Messenger as a clear proof that unifies sincere hearts." },
  { id: 99, name: "الزلزلة", englishName: "Az-Zalzalah", versesCount: 8, revelationType: "Meccan", summary: "The Earthquake. Portrays the earth expelling its burdens, reporting its records of atomic good and evil." },
  { id: 100, name: "العاديات", englishName: "Al-Adiyat", versesCount: 11, revelationType: "Meccan", summary: "The Charging Steeds. Vivid description of war horses, contrasting animal loyalty with human ingratitude." },
  { id: 101, name: "القارعة", englishName: "Al-Qari'ah", versesCount: 11, revelationType: "Meccan", summary: "The Striking Calamity. Depicts humanity floating like scattered moths and mountains like carded wool." },
  { id: 102, name: "التكاثر", englishName: "At-Takathur", versesCount: 8, revelationType: "Meccan", summary: "The Competition in Increase. Sternly warns that competition for material increase distracts until graves are visited." },
  { id: 103, name: "العصر", englishName: "Al-Asr", versesCount: 3, revelationType: "Meccan", summary: "The Time. Declares that humanity is in loss, except those who advise truth and mutual patience." },
  { id: 104, name: "الهمزة", englishName: "Al-Humazah", versesCount: 9, revelationType: "Meccan", summary: "The Slanderer. Condemns slandering, mocking, and hoarding of wealth as illusions of immortality." },
  { id: 105, name: "الفيل", englishName: "Al-Fil", versesCount: 5, revelationType: "Meccan", summary: "The Elephant. Recalls how the Lord destroyed the army of elephants seeking to demolish the Kaaba." },
  { id: 106, name: "قريش", englishName: "Quraysh", versesCount: 4, revelationType: "Meccan", summary: "Quraysh. Encourages Quraysh to worship the Lord of the House who secured them from hunger and fear." },
  { id: 107, name: "الماعون", englishName: "Al-Ma'un", versesCount: 7, revelationType: "Meccan", summary: "The Small Kindnesses. Warns of hypocrites who pray but neglect orphans and deny simple assistance." },
  { id: 108, name: "الكوثر", englishName: "Al-Kawthar", versesCount: 3, revelationType: "Meccan", summary: "The Abundance. Promises the Prophet the River of Abundance, commanding prayer and sacrifice." },
  { id: 109, name: "الكافرون", englishName: "Al-Kafirun", versesCount: 6, revelationType: "Meccan", summary: "The Disbelievers. Declares a strict, peaceful separation of worship: 'To you is your religion, and to me is mine'." },
  { id: 110, name: "النصر", englishName: "An-Nasr", versesCount: 3, revelationType: "Medinan", summary: "The Divine Support. Commands celebrating praise and seeking forgiveness when victory arrives." },
  { id: 111, name: "المسد", englishName: "Al-Masad", versesCount: 5, revelationType: "Meccan", summary: "The Palm Fiber. Warning of the fate of Abu Lahab and his wife who actively opposed the message." },
  { id: 112, name: "الإخلاص", versesCount: 4, revelationType: "Meccan", summary: "The Sincerity/Purity, defining the absolute oneness and uniqueness of Allah.", englishName: "Al-Ikhlas" },
  { id: 113, name: "الفلق", versesCount: 5, revelationType: "Meccan", summary: "The Daybreak, seeking Divine protection from external evils and jealousy.", englishName: "Al-Falaq" },
  { id: 114, name: "الناس", versesCount: 6, revelationType: "Meccan", summary: "Mankind, seeking refuge in the Lord of humanity from the subtle whispers of evil.", englishName: "An-Nas" }
];

/**
 * Fetches verses of a specific Surah from the public API (both text and translation).
 * Integrates error handling and fallback patterns.
 */
export async function fetchSurahVerses(surahId: number): Promise<QuranicVerse[]> {
  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.sahih`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch verses for Surah ${surahId}`);
    }
    const result = await res.json();
    if (result.code === 200 && result.data && result.data.length >= 2) {
      const arabicVerses = result.data[0].ayahs;
      const englishVerses = result.data[1].ayahs;
      
      return arabicVerses.map((v: any, index: number) => ({
        number: v.number,
        numberInSurah: v.numberInSurah,
        text: v.text,
        translation: englishVerses[index]?.text || ""
      }));
    }
    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("fetchSurahVerses Error:", error);
    throw error;
  }
}
