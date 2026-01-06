// Phase 3: Resilient LLM calls with retry, timeout, token counting, and schema validation
// Uses mocked LLM call to keep this runnable without external dependencies.

import { RetryManager } from "../../../utils/retry.js";
import { TimeoutManager } from "../../../utils/timeout.js";
import { TokenCounter } from "../../../utils/token-counter.js";
import { SchemaValidator } from "../../../utils/schema-validator.js";

// Mock LLM function that randomly fails
async function flakyLlm(prompt) {
  // Simulate latency
  await new Promise(res => setTimeout(res, 200));
  if (Math.random() < 0.4) throw new Error("Transient LLM/network error");
  return `{"summary":"${prompt.slice(0, 20)}..."}`;
}

async function main() {
  const retry = new RetryManager({ maxRetries: 2, initialDelay: 300, backoffMultiplier: 2, maxDelay: 2000 });
  const timeout = new TimeoutManager({ defaultTimeout: 2000 });
  const counter = new TokenCounter({ contextSize: 4096 });
  const validator = new SchemaValidator({ strictMode: true });

  const prompt = "Summarize why local LLMs are good for privacy and latency.";

  // Token budgeting
  const { tokenCount, remainingTokens } = counter.isWithinLimit(prompt, 512);
  console.log(`Prompt tokens ~${tokenCount}, remaining budget ~${remainingTokens}`);

  const schema = {
    type: "object",
    required: ["summary"],
    properties: {
      summary: { type: "string", minLength: 5 }
    }
  };

  const result = await retry.execute(async () => {
    return await timeout.execute(() => flakyLlm(prompt), 1500);
  });

  const parsed = JSON.parse(result);
  const { valid, errors } = validator.validate(parsed, schema);
  if (!valid) {
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  console.log("Validated response:", parsed);
}

main().catch(err => {
  console.error("Failed:", err.message);
  process.exit(1);
});
