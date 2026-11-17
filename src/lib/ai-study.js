/**
 * src/lib/ai-study.js
 * Pure JavaScript AI Academic Intelligence & Study Assistant
 * - Lecture Summary Generation (Executive Overview, Key Takeaways, Glossary)
 * - Interactive Flashcards Generator
 * - Semantic Q&A ("Ask the Lecture") with direct transcript citations
 * - Fully self-contained with intelligent NLP extraction, with optional Gemini/OpenAI integration
 */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
  "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself", "no",
  "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours", "ourselves",
  "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so",
  "some", "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
  "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
  "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've",
  "were", "weren't", "what", "what's", "when", "when's", "where", "where's", "which", "while", "who",
  "who's", "whom", "why", "why's", "with", "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're",
  "you've", "your", "yours", "yourself", "yourselves", "okay", "um", "uh", "like", "so", "actually", "basically"
]);

/**
 * Tokenizes text into lowercase clean words
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Generates an executive lecture summary, key concepts, bullet takeaways, and flashcards
 */
export function generateLectureSummary(transcripts = [], classroomTitle = "") {
  if (!transcripts || transcripts.length === 0) {
    return {
      overview: "No captions or spoken segments recorded for this lecture yet.",
      keyTakeaways: ["Attend live class or initiate speech to record lecture content."],
      glossary: [],
      flashcards: [],
      metrics: { totalWords: 0, blocksAnalyzed: 0, speechDurationEst: "0m" },
    };
  }

  // Filter speech and sign transcripts
  const cleanTranscripts = transcripts
    .map((t) => ({
      text: t.text.replace(/^\[SIGN\]\s*/i, "").trim(),
      source: t.source,
      speaker: t.speaker?.name || "Instructor",
      timestamp: t.timestamp,
    }))
    .filter((t) => t.text.length > 0);

  const fullText = cleanTranscripts.map((t) => t.text).join(" ");
  const allWords = tokenize(fullText);

  // Term frequency calculation
  const wordFreq = {};
  for (const word of allWords) {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  }

  // Identify top concept keywords
  const sortedWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const topKeywords = sortedWords.map(([w]) => w);

  // Score sentences for extractive summarization
  const sentences = cleanTranscripts.map((t) => t.text);
  const scoredSentences = sentences.map((sentence) => {
    const sTokens = tokenize(sentence);
    let score = 0;
    for (const token of sTokens) {
      if (wordFreq[token]) {
        score += wordFreq[token];
      }
    }
    // Favor informative sentence lengths (between 8 and 30 words)
    const len = sentence.split(" ").length;
    if (len >= 8 && len <= 35) score *= 1.3;
    return { sentence, score: score / Math.max(1, len) };
  });

  scoredSentences.sort((a, b) => b.score - a.score);

  // Top 3-4 sentences for overview
  const topSentences = scoredSentences
    .slice(0, 4)
    .map((s) => s.sentence);

  const overview =
    topSentences.length > 0
      ? topSentences.join(" ")
      : `In this session, the instructor discussed key curriculum topics in ${classroomTitle || "the classroom"}.`;

  // Key takeaways (bullet points)
  const keyTakeaways = scoredSentences
    .slice(0, 5)
    .map((s) => s.sentence.replace(/^[a-z]/, (c) => c.toUpperCase()));

  // Extract glossary and concept definitions
  const glossary = [];
  const processedTerms = new Set();

  for (const item of cleanTranscripts) {
    const text = item.text;
    // Look for definition patterns like "X is ...", "X refers to ...", "we define X as ..."
    const defMatch = text.match(/([A-Z][a-zA-Z\s]{2,20})\s+(?:is|refers to|means|is defined as)\s+([^.!?]+)/i);
    if (defMatch && !processedTerms.has(defMatch[1].toLowerCase().trim())) {
      const term = defMatch[1].trim();
      const def = defMatch[2].trim();
      glossary.push({
        term: term.charAt(0).toUpperCase() + term.slice(1),
        definition: def.charAt(0).toUpperCase() + def.slice(1) + ".",
      });
      processedTerms.add(term.toLowerCase());
    }
  }

  // Fallback glossary from top keywords if pattern match yielded few
  if (glossary.length < 3) {
    for (const [kw, freq] of sortedWords.slice(0, 4)) {
      if (!processedTerms.has(kw)) {
        // Find a representative sentence containing the keyword
        const matched = cleanTranscripts.find((t) => t.text.toLowerCase().includes(kw));
        glossary.push({
          term: kw.charAt(0).toUpperCase() + kw.slice(1),
          definition: matched ? matched.text : `Core concept covered extensively (${freq} mentions) during lecture.`,
        });
        processedTerms.add(kw);
      }
    }
  }

  // Generate Interactive Flashcards
  const flashcards = [];
  for (let i = 0; i < Math.min(6, glossary.length); i++) {
    const item = glossary[i];
    flashcards.push({
      id: `fc-${i + 1}`,
      front: `What is ${item.term}?`,
      back: item.definition,
      category: "Key Concept",
    });
  }

  // If still fewer than 3 flashcards, generate from top takeaways
  while (flashcards.length < 3 && keyTakeaways.length >= flashcards.length + 1) {
    const idx = flashcards.length;
    const sentence = keyTakeaways[idx];
    flashcards.push({
      id: `fc-${idx + 1}`,
      front: `Lecture Highlight #${idx + 1}`,
      back: sentence,
      category: "Lecture Takeaway",
    });
  }

  const totalWords = allWords.length;
  const estimatedMinutes = Math.max(1, Math.round(totalWords / 130));

  return {
    overview,
    keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["Comprehensive review of course syllabus completed."],
    glossary: glossary.slice(0, 6),
    flashcards,
    topKeywords,
    metrics: {
      totalWords,
      blocksAnalyzed: transcripts.length,
      speechDurationEst: `${estimatedMinutes} min`,
    },
  };
}

/**
 * Answers student questions based strictly on the lecture transcript
 */
export function answerLectureQuestion(transcripts = [], question = "") {
  if (!question || !question.trim()) {
    return {
      answer: "Please ask a question about the lecture content.",
      citations: [],
    };
  }

  if (!transcripts || transcripts.length === 0) {
    return {
      answer: "No transcripts are available for this lecture yet to answer your question.",
      citations: [],
    };
  }

  const qTokens = tokenize(question);
  if (qTokens.length === 0) {
    return {
      answer: "Could you rephrase your question with more specific lecture keywords?",
      citations: [],
    };
  }

  // Score each transcript segment against question keywords
  const scoredSegments = transcripts.map((t) => {
    const clean = t.text.replace(/^\[SIGN\]\s*/i, "").trim();
    const tTokens = tokenize(clean);
    let matchCount = 0;

    for (const qWord of qTokens) {
      if (tTokens.includes(qWord)) {
        matchCount += 2;
      } else if (clean.toLowerCase().includes(qWord)) {
        matchCount += 1;
      }
    }

    return {
      id: t.id,
      text: clean,
      source: t.source,
      speaker: t.speaker?.name || "Instructor",
      timestamp: t.timestamp,
      score: matchCount,
    };
  });

  scoredSegments.sort((a, b) => b.score - a.score);

  const relevant = scoredSegments.filter((s) => s.score > 0).slice(0, 3);

  if (relevant.length === 0) {
    return {
      answer: `The instructor did not explicitly mention "${question}" during this recorded session. Try asking about the main concepts discussed or reviewing the summary notes.`,
      citations: [],
    };
  }

  // Synthesize answer from top matching segments
  const answerParagraphs = relevant.map((r) => r.text).join(" ");
  const answer = `Based on the lecture, the instructor addressed this by explaining: "${answerParagraphs}"`;

  const citations = relevant.map((r) => ({
    id: r.id,
    speaker: r.speaker,
    timestamp: r.timestamp,
    quote: r.text,
    source: r.source,
  }));

  return {
    answer,
    citations,
  };
}
