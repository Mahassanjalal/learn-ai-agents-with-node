// Phase 1: ReAct-style math agent with tool calls
// This is a deterministic demonstration (no LLM needed) that mirrors the Thought/Action/Observation loop.

import { defineChatSessionFunction, getLlama, LlamaChatSession } from "node-llama-cpp";
import path from "path";
import { fileURLToPath } from "url";
import { PromptDebugger } from "../../../helpers/prompt-debugger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const llama = await getLlama();
  const modelPath = path.join(__dirname, "../../../models", "Qwen_Qwen3-1.7B-GGUF_Qwen3-1.7B-Q8_0.gguf");
  const model = await llama.loadModel({ modelPath });
  const context = await model.createContext({ contextSize: 4000 });

  const systemPrompt = `You are a strict step-by-step math assistant.
Follow: Thought -> Action -> Observation -> (repeat) -> Answer.
Use tools for every calculation. Stop after Answer.`;

  const add = defineChatSessionFunction({
    description: "Add two numbers",
    params: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } }, required: ["a", "b"] },
    async handler({ a, b }) { return a + b; }
  });
  const multiply = defineChatSessionFunction({
    description: "Multiply two numbers",
    params: { type: "object", properties: { a: { type: "number" }, b: { type: "number" } }, required: ["a", "b"] },
    async handler({ a, b }) { return a * b; }
  });

  const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt,
  });

  const question = "What is (12 + 7) * 3?";
  const response = await session.prompt(question, {
    functions: { add, multiply },
    maxTokens: 512,
    onTextChunk: (t) => process.stdout.write(t)
  });

  console.log("\nFinal:", response);

  // Optional: debug exact prompt
  const debuggerTool = new PromptDebugger({ outputDir: "./logs", filename: "react_math.txt", includeTimestamp: true });
  await debuggerTool.debugContextState({ session, model });

  session.dispose();
  context.dispose();
  model.dispose();
  llama.dispose();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
