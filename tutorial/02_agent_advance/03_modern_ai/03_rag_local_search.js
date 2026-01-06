// Phase 2: Retrieval-Augmented Generation (RAG) - simple local semantic search
// Minimal, dependency-free example using bag-of-words cosine similarity.

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { JsonParser } from "../../../helpers/json-parser.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Tiny in-memory corpus
const corpus = [
  { id: "doc1", text: "Node.js allows running JavaScript on the server with event-driven IO." },
  { id: "doc2", text: "Local LLMs keep data private and reduce latency compared to cloud APIs." },
  { id: "doc3", text: "Runnable pipelines let you compose agents with tools, memory, and retries." },
];

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean);
}

function vectorize(text) {
  const tokens = tokenize(text);
  const freq = new Map();
  tokens.forEach(t => freq.set(t, (freq.get(t) || 0) + 1));
  return freq;
}

function cosineSim(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const keys = new Set([...vecA.keys(), ...vecB.keys()]);
  for (const k of keys) {
    const a = vecA.get(k) || 0;
    const b = vecB.get(k) || 0;
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function search(query, topK = 2) {
  const qVec = vectorize(query);
  const scored = corpus.map(doc => ({ ...doc, score: cosineSim(qVec, vectorize(doc.text)) }));
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

async function main() {
  const query = "How do local LLMs help with privacy?";
  const results = search(query, 2);

  const retrieval = results.map(r => `- (${r.score.toFixed(3)}) ${r.text}`).join("\n");
  const prompt = `Use the retrieved passages to answer.\nQuestion: ${query}\nContext:\n${retrieval}\nAnswer:`;

  console.log("Prompt with retrieved context:\n", prompt);

  // Example: pretend LLM returned JSON, parse robustly
  const fakeLlmOutput = `Here is the answer:\n``json\n{"answer":"Local LLMs keep data on-device so sensitive info never leaves."}\n``\n`;
  const parsed = JsonParser.parse(fakeLlmOutput, { debug: true });
  console.log("Parsed JSON:", parsed);

  const outPath = path.join(__dirname, "rag-output.json");
  await fs.writeFile(outPath, JSON.stringify({ query, results, parsed }, null, 2));
  console.log(`Saved example output to ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
