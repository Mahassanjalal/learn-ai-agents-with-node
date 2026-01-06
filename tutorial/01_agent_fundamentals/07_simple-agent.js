import {getLlama, LlamaChatSession, defineChatSessionFunction} from "node-llama-cpp";
import path from "path";
import {fileURLToPath} from "url";
import {PromptDebugger} from "../../helpers/prompt-debugger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Loading model...");

const llama = await getLlama();
const modelPath = path.join(__dirname, "..", "models", "Qwen_Qwen3-1.7B-GGUF_Qwen3-1.7B-Q8_0.gguf");
const model = await llama.loadModel({modelPath});

console.log("Model loaded. Creating context and session...");
const context = await model.createContext();
const systemPrompt = `You are a professional chronologist who standardizes time representations across different systems.
    
Always convert times from 12-hour format (e.g., "1:46:36 PM") to 24-hour format (e.g., "13:46") without seconds 
before returning them.`;
const session = new LlamaChatSession({
    contextSequence: context.getSequence(),
    systemPrompt: systemPrompt,
});

const getCurrentTime = defineChatSessionFunction({
    description: "Get the current time",
    params: {
        type: "object",
        properties: {}
    },
    async handler() {
        return new Date().toLocaleTimeString();
    }
});

const functions = {
    getCurrentTime,
};

console.log("Sending prompt to model...");

const prompt = `What time is it right now?`;

const AI = await session.prompt(prompt, {
    functions,
    maxTokens: 2000,
    onTextChunk: (text) => {
        process.stdout.write(text); // optional: live print
    }
});
console.log("\nFinal answer:\n", AI);

// Debug after the prompt execution
const promptDebugger = new PromptDebugger({
    outputDir: './logs',
    filename: 'qwen_prompts.txt',
    includeTimestamp: true,  // adds timestamp to filename
    appendMode: false        // overwrites file each time
});
await promptDebugger.debugContextState({session, model});

session.dispose();
context.dispose();
model.dispose(); 
llama.dispose();