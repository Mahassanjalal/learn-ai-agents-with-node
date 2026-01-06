// Phase 2: Dynamic Prompt Optimization
// Learn from past LLM outputs and automatically improve prompts.

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { TokenCounter } from "../../../utils/token-counter.js";
import { Logger } from "../../../utils/logger.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Prompt optimizer tracks performance and suggests improvements
 */
class PromptOptimizer extends Runnable {
  constructor() {
    super();
    this.logger = new Logger({ level: "info", prefix: "[PromptOptimizer]" });
    this.tokenCounter = new TokenCounter({ contextSize: 4096 });

    // Track prompt performance
    this.promptHistory = [];
    this.performance = {};
  }

  /**
   * Log a prompt and its outcome
   */
  logPromptPerformance(prompt, outcome) {
    const tokenCount = this.tokenCounter.count(prompt);
    const entry = {
      prompt,
      outcome,
      tokens: tokenCount,
      quality: this._scoreQuality(outcome),
      timestamp: Date.now()
    };

    this.promptHistory.push(entry);
    this.logger.info(`Logged prompt (${tokenCount} tokens, quality: ${entry.quality}/10)`);
  }

  /**
   * Score response quality (simple heuristic)
   */
  _scoreQuality(response) {
    if (!response) return 0;
    // Length > 20 chars, no errors, contains key words
    let score = 5;
    if (response.length > 50) score += 2;
    if (!response.includes("error")) score += 2;
    if (response.includes("data") || response.includes("result")) score += 1;
    return Math.min(10, score);
  }

  /**
   * Suggest improvements based on history
   */
  async _call(_input, _config) {
    if (this.promptHistory.length === 0) {
      return "No prompt history yet.";
    }

    const topPerforming = this.promptHistory.sort((a, b) => b.quality - a.quality).slice(0, 3);
    const avgQuality = topPerforming.reduce((sum, p) => sum + p.quality, 0) / topPerforming.length;
    const avgTokens = topPerforming.reduce((sum, p) => sum + p.tokens, 0) / topPerforming.length;

    const suggestions = [];
    suggestions.push(`Average quality: ${avgQuality.toFixed(1)}/10`);
    suggestions.push(`Average tokens: ${Math.round(avgTokens)}`);

    if (avgTokens > 300) {
      suggestions.push("💡 Try shorter prompts - high token count may reduce quality.");
    }
    if (avgQuality < 6) {
      suggestions.push("💡 Add specific examples or constraints to improve responses.");
    }

    return suggestions.join("\n");
  }

  /**
   * Save optimization report
   */
  async saveReport(filepath) {
    const report = {
      totalPrompts: this.promptHistory.length,
      avgQuality: this.promptHistory.reduce((sum, p) => sum + p.quality, 0) / this.promptHistory.length,
      avgTokens: Math.round(this.promptHistory.reduce((sum, p) => sum + p.tokens, 0) / this.promptHistory.length),
      topPerforming: this.promptHistory.sort((a, b) => b.quality - a.quality).slice(0, 5)
    };

    await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    this.logger.info(`Saved optimization report to ${filepath}`);
  }
}

/**
 * Example: different prompt styles and their effectiveness
 */
async function evaluatePromptStyles() {
  const optimizer = new PromptOptimizer();

  // Different prompt styles
  const styles = [
    {
      name: "Simple",
      prompt: "Explain machine learning."
    },
    {
      name: "Detailed",
      prompt: "Explain machine learning in 2-3 sentences focusing on the key idea that algorithms improve with data."
    },
    {
      name: "Few-shot",
      prompt: `Explain concepts clearly. Example: "AI is programs that learn patterns."
Now explain: machine learning.`
    },
    {
      name: "Structured",
      prompt: `Explain machine learning using this structure:
- Core concept
- Key mechanism
- Real-world example`
    }
  ];

  console.log("\n=== Evaluating Prompt Styles ===\n");

  for (const style of styles) {
    // Simulate LLM response
    const simulatedResponse = `${style.name} style response: Machine learning is the process where algorithms improve performance through experience with data.`;

    optimizer.logPromptPerformance(style.prompt, simulatedResponse);
    console.log(`✓ ${style.name}: ${optimizer.promptHistory[optimizer.promptHistory.length - 1].quality}/10`);
  }

  // Get suggestions
  const suggestions = await optimizer.invoke("", new RunnableConfig({}));
  console.log("\n=== Optimization Suggestions ===\n");
  console.log(suggestions);

  // Save report
  const reportPath = path.join(__dirname, "prompt-optimization-report.json");
  await optimizer.saveReport(reportPath);
}

/**
 * Example: iterative prompt refinement
 */
async function iterativeRefinement() {
  const optimizer = new PromptOptimizer();

  console.log("\n=== Iterative Prompt Refinement ===\n");

  // Iteration 1
  let prompt = "What is good code?";
  let response = "Code that works and is readable.";
  optimizer.logPromptPerformance(prompt, response);
  console.log(`Iteration 1: Quality ${optimizer.promptHistory[0].quality}/10`);

  // Iteration 2: add structure
  prompt = "Describe good code by these properties: readability, performance, maintainability.";
  response = "Readability: clear variable names. Performance: efficient algorithms. Maintainability: modular structure.";
  optimizer.logPromptPerformance(prompt, response);
  console.log(`Iteration 2: Quality ${optimizer.promptHistory[1].quality}/10`);

  // Iteration 3: add example
  prompt = `What is good code? Give examples:
- Good: const userName = getUserName()
- Bad: const x = gUN()`;
  response = "Good code uses descriptive names. Bad code uses abbreviations. The difference is clarity and maintainability.";
  optimizer.logPromptPerformance(prompt, response);
  console.log(`Iteration 3: Quality ${optimizer.promptHistory[2].quality}/10`);

  // Show progress
  console.log("\nQuality improvement:", 
    optimizer.promptHistory[2].quality - optimizer.promptHistory[0].quality,
    "points"
  );
}

async function main() {
  await evaluatePromptStyles();
  await iterativeRefinement();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
