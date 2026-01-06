// Phase 1: Parallel orchestration with RunnableParallel
// Demonstrates running multiple analysis steps concurrently

import { Runnable, RunnableParallel } from "../../../core/index.js";
import { RunnableConfig } from "../../../core/context.js";
import { Logger } from "../../../utils/logger.js";

// Simple runnable that appends a label
class LabelRunnable extends Runnable {
  constructor(label, delayMs = 0) {
    super();
    this.label = label;
    this.delayMs = delayMs;
  }

  async _call(input, _config) {
    if (this.delayMs) await new Promise(res => setTimeout(res, this.delayMs));
    return `${this.label}: ${input}`;
  }
}

async function main() {
  const logger = new Logger({ level: "info", prefix: "[Parallel]" });
  const config = new RunnableConfig({
    metadata: { lesson: "parallel-orchestration" },
    tags: ["modern-ai", "parallel"],
  });

  // Create independent runnables
  const summary = new LabelRunnable("summary", 400);
  const keywords = new LabelRunnable("keywords", 200);
  const sentiment = new LabelRunnable("sentiment", 300);

  // Combine using RunnableParallel
  const parallel = new RunnableParallel({ summary, keywords, sentiment });

  logger.info("Running parallel analysis...");
  const results = await parallel.invoke("Local LLMs enable privacy-first AI.", config);

  logger.info("Results", results);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
