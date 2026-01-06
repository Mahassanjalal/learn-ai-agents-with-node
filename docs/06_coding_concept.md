# Concept: Streaming & Response Control

## Overview

This example demonstrates **streaming responses** and **token limits**, two essential techniques for building responsive AI agents with controlled output.

## The Streaming Problem

### Traditional (Non-Streaming) Approach

```
User sends prompt
       ↓
   [Wait 10 seconds...]
       ↓
Complete response appears all at once
```

**Problems:**
- Poor user experience (long wait)
- No progress indication
- Can't interrupt bad responses
- Feels unresponsive

### Streaming Approach (This Example)

```
User sends prompt
       ↓
"Hoisting" (0.1s) → User sees first word!
       ↓
"is a" (0.2s) → More text appears
       ↓
"JavaScript" (0.3s) → Continuous feedback
       ↓
[Continues token by token...]
```

**Benefits:**
- Immediate feedback
- Progress visible
- Can interrupt early
- Feels interactive

## How Streaming Works

### Token-by-Token Generation

LLMs generate one token at a time internally. Streaming exposes this:

```
Internal LLM Process:
┌─────────────────────────────────────┐
│  Token 1: "Hoisting"                │
│  Token 2: "is"                      │
│  Token 3: "a"                       │
│  Token 4: "JavaScript"              │
│  Token 5: "mechanism"               │
│  ...                                │
└─────────────────────────────────────┘

Without Streaming:        With Streaming:
Wait for all tokens       Emit each token immediately
└─→ Buffer → Return      └─→ Callback → Display
```

### The onTextChunk Callback

```
┌────────────────────────────────────┐
│        Model Generation            │
└────────────┬───────────────────────┘
             │
    ┌────────┴─────────┐
    │  Each new token  │
    └────────┬─────────┘
             ↓
    ┌────────────────────┐
    │ onTextChunk(text)  │  ← Your callback
    └────────┬───────────┘
             ↓
    Your code processes it:
    • Display to user
    • Send over network
    • Log to file
    • Analyze content
```

## Token Limits: maxTokens

### Why Limit Output?

Without limits, models might generate:
```
User: "Explain hoisting"
Model: [Generates 10,000 words including:
        - Complete JavaScript history
        - Every edge case
        - Unrelated examples
        - Never stops...]
```

With limits:
```
User: "Explain hoisting"
Model: [Generates ~1500 words
        - Core concept
        - Key examples
        - Stops at 2000 tokens]
```

### Token Budgeting

```
Context Window: 4096 tokens
├─ System Prompt: 200 tokens
├─ User Message: 100 tokens
├─ Response (maxTokens): 2000 tokens
└─ Remaining for history: 1796 tokens

Total used: 2300 tokens
Available: 1796 tokens for future conversation
```

### Cost vs Quality

```
Token Limit        Output Quality      Use Case
───────────       ───────────────     ─────────────────
100               Brief, may be cut   Quick answers
500               Concise but complete Short explanations
2000 (example)    Detailed            Full explanations
No limit          Risk of rambling    When length unknown
```

## Real-Time Applications

### Pattern 1: Interactive CLI

```
User: "Explain closures"
       ↓
Terminal: "A closure is a function..."
         (Appears word by word, like typing)
       ↓
User sees progress, knows it's working
```

### Pattern 2: Web Application

```
Browser                    Server
   │                         │
   ├─── Send prompt ────────→│
   │                         │
   │←── Chunk 1: "Closures"──┤
   │    (Display immediately) │
   │                         │
   │←── Chunk 2: "are"───────┤
   │    (Append to display)  │
   │                         │
   │←── Chunk 3: "functions"─┤
   │    (Keep appending...)  │
```

Implementation:
- Server-Sent Events (SSE)
- WebSockets
- HTTP streaming

### Pattern 3: Multi-Consumer

```
         onTextChunk(text)
                │
        ┌───────┼───────┐
        ↓       ↓       ↓
    Console  WebSocket  Log File
    Display  → Client   → Storage
```

## Performance Characteristics

### Latency vs Throughput

```
Time to First Token (TTFT):
├─ Small model (1.7B): ~100ms
├─ Medium model (8B): ~200ms
└─ Large model (20B): ~500ms

Tokens Per Second:
├─ Small model: 50-80 tok/s
├─ Medium model: 20-35 tok/s
└─ Large model: 10-15 tok/s

User Experience:
TTFT < 500ms → Feels instant
Tok/s > 20 → Reads naturally
```

### Resource Trade-offs

```
Model Size      Memory    Speed     Quality
──────────     ────────   ─────     ───────
1.7B           ~2GB       Fast      Good
8B             ~6GB       Medium    Better
20B            ~12GB      Slower    Best
```

## Advanced Concepts

### Buffering Strategies

**No Buffer (Immediate)**
```
Every token → callback → display
└─ Smoothest UX but more overhead
```

**Line Buffer**
```
Accumulate until newline → flush
└─ Better for paragraph-based output
```

**Time Buffer**
```
Accumulate for 50ms → flush batch
└─ Reduces callback frequency
```

### Early Stopping

```
Generation in progress:
"The answer is clearly... wait, actually..."
                         ↑
                  onTextChunk detects issue
                         ↓
                   Stop generation
                         ↓
              "Let me reconsider"
```

Useful for:
- Detecting off-topic responses
- Safety filters
- Relevance checking

### Progressive Enhancement

```
Partial Response Analysis:
┌─────────────────────────────────┐
│ "To implement this feature..."  │
│                                 │
│ ← Already useful information   │
│                                 │
│ "...you'll need: 1) Node.js"    │
│                                 │
│ ← Can start acting on this     │
│                                 │
│ "2) Express framework"          │
└─────────────────────────────────┘

Agent can begin working before response completes!
```

## Context Size Awareness

### Why It Matters

```
┌────────────────────────────────┐
│    Context Window (4096)       │
├────────────────────────────────┤
│ System Prompt       200 tokens │
│ Conversation History 1000      │
│ Current Prompt      100        │
│ Response Space      2796       │
└────────────────────────────────┘

If maxTokens > 2796:
└─→ Error or truncation!
```

### Dynamic Adjustment

```
Available = contextSize - (prompt + history)

if (maxTokens > available) {
    maxTokens = available;
    // or clear old history
}
```

## Streaming in Agent Architectures

### Simple Agent

```
User → LLM (streaming) → Display
       └─ onTextChunk shows progress
```

### Multi-Step Agent

```
Step 1: Plan (stream) → Show thinking
Step 2: Act (stream) → Show action
Step 3: Result (stream) → Show outcome
       └─ User sees agent's process
```

### Collaborative Agents

```
Agent A (streaming) ──┐
                      ├─→ Coordinator → User
Agent B (streaming) ──┘
       └─ Both stream simultaneously
```

## Best Practices

### 1. Always Set maxTokens

```
✓ Good:
session.prompt(query, { maxTokens: 2000 })

✗ Risky:
session.prompt(query)
└─ May use entire context!
```

### 2. Handle Partial Updates

```
let fullResponse = '';
onTextChunk: (chunk) => {
    fullResponse += chunk;
    display(chunk);        // Show immediately
    logComplete = false;   // Mark incomplete
}
// After completion:
saveToDatabase(fullResponse);
```

### 3. Provide Feedback

```
onTextChunk: (chunk) => {
    if (firstChunk) {
        showLoadingDone();
        firstChunk = false;
    }
    appendToDisplay(chunk);
}
```

### 4. Monitor Performance

```
const startTime = Date.now();
let tokenCount = 0;

onTextChunk: (chunk) => {
    tokenCount += estimateTokens(chunk);
    const elapsed = (Date.now() - startTime) / 1000;
    const tokensPerSecond = tokenCount / elapsed;
    updateMetrics(tokensPerSecond);
}
```

## Key Takeaways

1. **Streaming improves UX**: Users see progress immediately
2. **maxTokens controls cost**: Prevents runaway generation
3. **Token-by-token generation**: LLMs produce one token at a time
4. **onTextChunk callback**: Your hook into the generation process
5. **Context awareness matters**: Monitor available space
6. **Essential for production**: Real-time systems need streaming

## Comparison

```
Feature           intro.js    coding.js (this)
────────────────  ─────────   ─────────────────
Streaming         ✗           ✓
Token limit       ✗           ✓ (2000)
Real-time output  ✗           ✓
Progress visible  ✗           ✓
User control      ✗           ✓
```

This pattern is foundational for building responsive, user-friendly AI agent interfaces.



# Code Explanation: coding.js

This file demonstrates **streaming responses** with token limits and real-time output, showing how to get immediate feedback from the LLM as it generates text.

## Step-by-Step Code Breakdown

### 1. Import and Setup (Lines 1-8)
```javascript
import {
    getLlama,
    HarmonyChatWrapper,
    LlamaChatSession,
} from "node-llama-cpp";
import {fileURLToPath} from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
```
- Standard setup for LLM interaction
- **HarmonyChatWrapper**: A chat format wrapper for models that use the Harmony format (more on this below)

### 2. Understanding the Harmony Chat Format

#### What is Harmony?
Harmony is a structured message format used for multi-role chat interactions designed by OpenAI for their gpt-oss models. It's not just a prompt format - it's a complete rethinking of how models should structure their outputs, especially for complex reasoning and tool use.

#### Harmony Format Structure

The format uses special tokens and syntax to define roles such as `system`, `developer`, `user`, `assistant`, and `tool`, as well as output "channels" (`analysis`, `commentary`, `final`) that let the model reason internally, call tools, and produce clean user-facing responses.

**Basic message structure:**
```
<|start|>ROLE<|message|>CONTENT<|end|>
<|start|>assistant<|channel|>CHANNEL<|message|>CONTENT<|end|>
```

**The five roles in hierarchy order** (system > developer > user > assistant > tool):

1. **system**: Global identity, guardrails, and model configuration
2. **developer**: Product policy and style instructions (what you typically think of as "system prompt")
3. **user**: User messages and queries
4. **assistant**: Model responses
5. **tool**: Tool execution results

**The three output channels:**

1. **analysis**: Private chain-of-thought reasoning not shown to users
2. **commentary**: Tool calling preambles and process updates
3. **final**: Clean user-facing responses

**Example of Harmony in action:**
```
<|start|>system<|message|>You are a helpful assistant.<|end|>
<|start|>developer<|message|>Always be concise.<|end|>
<|start|>user<|message|>What time is it?<|end|>
<|start|>assistant<|channel|>commentary<|message|>{"tool_use": {"name": "get_current_time", "arguments": {}}}<|end|>
<|start|>tool<|message|>{"time": "2025-10-25T13:47:00Z"}<|end|>
<|start|>assistant<|channel|>final<|message|>The current time is 1:47 PM UTC.<|end|>
```

#### Why Use Harmony?

Harmony separates how the model thinks, what actions it takes, and what finally goes to the user, resulting in cleaner tool use, safer defaults for UI, and better observability. For our translation example:

- The `final` channel ensures we only get the translation, not explanations
- The structured format helps the model follow instructions more reliably
- The role hierarchy prevents instruction conflicts

**Important Note**: Models need to be specifically trained or fine-tuned to produce Harmony output correctly. You can't just apply this format to any model. Apertus and other models not explicitly trained on Harmony may be confused by this structure, but the HarmonyChatWrapper in node-llama-cpp handles the necessary formatting automatically.


### 3. Load Model (Lines 10-18)
```javascript
const llama = await getLlama();
const model = await llama.loadModel({
    modelPath: path.join(
        __dirname,
        "../",
        "models",
        "hf_giladgd_gpt-oss-20b.MXFP4.gguf"
    )
});
```
- Uses **gpt-oss-20b**: A 20 billion parameter model
- **MXFP4**: Mixed precision 4-bit quantization for smaller size
- Larger model = better code explanations

### 4. Create Context and Session (Lines 19-22)
```javascript
const context = await model.createContext();
const session = new LlamaChatSession({
    chatWrapper: new HarmonyChatWrapper(),
    contextSequence: context.getSequence(),
});
```
Basic session setup with no system prompt.

### 5. Define the Question (Line 24)
```javascript
const q1 = `What is hoisting in JavaScript? Explain with examples.`;
```
A technical programming question that requires detailed explanation.

### 6. Display Context Size (Line 26)
```javascript
console.log('context.contextSize', context.contextSize)
```
- Shows the maximum context window size
- Helps understand memory limitations
- Useful for debugging

### 7. Streaming Prompt Execution (Lines 28-36)
```javascript
const a1 = await session.prompt(q1, {
    // Tip: let the lib choose or cap reasonably; using the whole context size can be wasteful
    maxTokens: 2000,

    // Fires as soon as the first characters arrive
    onTextChunk: (text) => {
        process.stdout.write(text); // optional: live print
    },
});
```

**Key parameters:**

**maxTokens: 2000**
- Limits response length to 2000 tokens (~1500 words)
- Prevents runaway generation
- Saves time and compute
- Without limit: model uses entire context

**onTextChunk callback**
- Fires **as each token is generated**
- Receives text as it's produced
- `process.stdout.write()`: Prints without newlines
- Creates real-time "typing" effect

### How Streaming Works

```
Without streaming:
User → [Wait 10 seconds...] → Complete response appears

With streaming:
User → [Token 1] → [Token 2] → [Token 3] → ... → Complete
       "What"      "is"        "hoisting"
       (Immediate feedback!)
```

### 8. Display Final Answer (Line 38)
```javascript
console.log("\n\nFinal answer:\n", a1);
```
- Prints the complete response again
- Useful for logging or verification
- Shows full text after streaming

### 9. Cleanup (Lines 41-44)
```javascript
session.dispose()
context.dispose()
model.dispose()
llama.dispose()
```
Standard resource cleanup.

## Key Concepts Demonstrated

### 1. Streaming Responses

**Why streaming matters:**
- **Better UX**: Users see progress immediately
- **Early termination**: Can stop if response is off-track
- **Perceived speed**: Feels faster than waiting
- **Debugging**: See generation in real-time

**Comparison:**
```
Non-streaming:           Streaming:
═══════════════         ═══════════════
Request sent            Request sent
[10s wait...]           "What" (0.1s)
Complete response       "is" (0.2s)
                        "hoisting" (0.3s)
                        ... continues
                        (Same total time, better experience!)
```

### 2. Token Limits

**maxTokens controls generation length:**

```
No limit:               With limit (2000):
─────────             ─────────────────
May generate forever   Stops at 2000 tokens
Uses entire context    Saves computation
Unpredictable cost     Predictable cost
```

**Token approximation:**
- 1 token ≈ 0.75 words (English)
- 2000 tokens ≈ 1500 words
- 4-5 paragraphs of detailed explanation

### 3. Real-Time Feedback Pattern

The `onTextChunk` callback enables:
```javascript
onTextChunk: (text) => {
    // Do anything with each chunk:
    process.stdout.write(text);      // Console output
    // socket.emit('chunk', text);   // WebSocket to client
    // buffer += text;               // Accumulate for processing
    // analyzePartial(text);         // Real-time analysis
}
```

### 4. Context Size Awareness

```javascript
console.log('context.contextSize', context.contextSize)
```

Shows model's memory capacity:
- Small models: 2048-4096 tokens
- Medium models: 8192-16384 tokens  
- Large models: 32768+ tokens

**Why it matters:**
```
Context Size: 4096 tokens
Prompt: 100 tokens
Max response: 2000 tokens
History: Up to 1996 tokens
```

## Use Cases

### 1. Code Explanations (This Example)
```javascript
prompt: "Explain hoisting in JavaScript"
→ Streams detailed explanation with examples
```

### 2. Long-Form Content Generation
```javascript
prompt: "Write a blog post about AI agents"
maxTokens: 3000
→ Streams article as it's written
```

### 3. Interactive Tutoring
```javascript
// User sees explanation being built
prompt: "Teach me about closures"
onTextChunk: (text) => displayToUser(text)
```

### 4. Web Applications
```javascript
// Server-Sent Events or WebSocket
onTextChunk: (text) => {
    websocket.send(text);  // Send to browser
}
```

## Performance Considerations

### Token Generation Speed

Depends on:
- **Model size**: Larger = slower per token
- **Hardware**: GPU > CPU
- **Quantization**: Lower bits = faster
- **Context length**: Longer context = slower

**Typical speeds:**
```
Model Size    GPU (RTX 4090)    CPU (M2 Max)
──────────    ──────────────    ────────────
1.7B          50-80 tok/s       15-25 tok/s
8B            20-35 tok/s       5-10 tok/s
20B           10-15 tok/s       2-4 tok/s
```

### When to Use maxTokens

```
✓ Use maxTokens when:
  • Response length is predictable
  • You want to save computation
  • Testing/debugging
  • API rate limiting

✗ Don't limit when:
  • Need complete answer
  • Length varies greatly
  • Using stop sequences instead
```

## Advanced Streaming Patterns

### Pattern 1: Progressive Enhancement
```javascript
let buffer = '';
onTextChunk: (text) => {
    buffer += text;
    if (buffer.includes('\n\n')) {
        // Complete paragraph ready
        processParagraph(buffer);
        buffer = '';
    }
}
```

### Pattern 2: Early Stopping
```javascript
let isRelevant = true;
onTextChunk: (text) => {
    if (text.includes('irrelevant_keyword')) {
        isRelevant = false;
        // Stop generation (would need additional API)
    }
}
```

### Pattern 3: Multi-Consumer
```javascript
onTextChunk: (text) => {
    console.log(text);           // Console
    logFile.write(text);         // File
    websocket.send(text);        // Client
    analyzer.process(text);      // Analysis
}
```

## Expected Output

When run, you'll see:
1. Context size logged (e.g., "context.contextSize 32768")
2. Streaming response appearing token-by-token
3. Complete final answer printed again

Example output flow:
```
context.contextSize 32768
Hoisting is a JavaScript mechanism where variables and function 
declarations are moved to the top of their scope before code 
execution. For example:

console.log(x); // undefined (not an error!)
var x = 5;

This works because...
[continues streaming...]

Final answer:
[Complete response printed again]
```

## Why This Matters for AI Agents

### User Experience
- Real-time agents feel more responsive
- Users can interrupt if going wrong direction
- Better for conversational interfaces

### Resource Management
- Token limits prevent runaway generation
- Predictable costs and timing
- Can cancel expensive operations early

### Integration Patterns
- Web UIs show "typing" effect
- CLIs display progressive output
- APIs stream to clients efficiently

This pattern is essential for production agent systems where user experience and resource control matter.
