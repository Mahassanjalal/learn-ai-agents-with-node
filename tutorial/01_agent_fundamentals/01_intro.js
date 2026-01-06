import {getLlama, LlamaChatSession} from "node-llama-cpp";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Loading model...");

const llama = await getLlama();
const modelPath = path.join(__dirname, "..", "models", "Qwen_Qwen3-1.7B-GGUF_Qwen3-1.7B-Q8_0.gguf");
const model = await llama.loadModel({modelPath});

console.log("Model loaded. Creating context and session...");
const context = await model.createContext();
const session = new LlamaChatSession({contextSequence: context.getSequence()});

console.log("Sending prompt to model...");

const prompt = `Explain what node-llama-cpp is and how it works`;

const AI = await session.prompt(prompt);
console.log("AI Response:", AI);

session.dispose();
context.dispose();
model.dispose(); 
llama.dispose();