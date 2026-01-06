import {getLlama, LlamaChatSession} from "node-llama-cpp";
import {fileURLToPath} from "url";
import path from "path";


/**
 * Asynchronous execution improves performance in GAIA benchmarks,
 * multi-agent applications, and other high-throughput scenarios.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Loading model...");
const llama = await getLlama({logLevel: 'error'});
const modelPath = path.join(__dirname, "..", "models", "Qwen_Qwen3-1.7B-GGUF_Qwen3-1.7B-Q8_0.gguf");
const model = await llama.loadModel({modelPath});
    
console.log("Model loaded. Creating context and session...");
const context = await model.createContext({
    sequences: 2,
    batchSize: 1024
});
const sequence1 = context.getSequence();
const sequence2 = context.getSequence();


const session1 = new LlamaChatSession({
    contextSequence: sequence1
});
const session2 = new LlamaChatSession({
    contextSequence: sequence2
});

const q1 = "Hi there, how are you?";
const q2 = "How much is 6+6?";


console.log('Batching started...')
const [a1,a2] = await Promise.all([session1.prompt(q1),session2.prompt(q2)]);

console.log("User: " + q1);
console.log("AI: " + a1);

console.log("User: " + q2);
console.log("AI: " + a2);

session1.dispose();
session2.dispose();
context.dispose();
model.dispose();
llama.dispose();