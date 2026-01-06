import {getLlama, LlamaChatSession, HarmonyChatWrapper} from "node-llama-cpp";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Loading model...");

const llama = await getLlama();
const modelPath = path.join(__dirname, "..", "models", "Qwen_Qwen3-1.7B-GGUF_Qwen3-1.7B-Q8_0.gguf");
const model = await llama.loadModel({modelPath});

console.log("Model loaded. Creating context and session...");
const context = await model.createContext();
const session = new LlamaChatSession({
    chatWrapper: new HarmonyChatWrapper(),
    contextSequence: context.getSequence()
});

console.log("Sending prompt to model...");
const q1 = `What is hoisting in JavaScript? Explain with examples.`;
console.log('context.contextSize', context.contextSize)
const a1 = await session.prompt(q1, {
    // Tip: let the lib choose or cap reasonably; using the whole context size can be wasteful
    maxTokens: 2000,
    // Fires as soon as the first characters arrive
    onTextChunk: (text) => {
        process.stdout.write(text); // optional: live print
    }
});

console.log("\n\nFinal answer:\n", a1);

session.dispose();
context.dispose();
model.dispose(); 
llama.dispose();