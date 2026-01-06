# Concept: Parallel Processing & Performance Optimization

## Overview

This example demonstrates **concurrent execution** of multiple LLM requests using separate context sequences, a critical technique for building scalable AI agent systems.

## The Performance Problem

### Sequential Processing (Slow)

Traditional approach processes one request at a time:

```
Request 1 ────────→ Response 1 (2s)
                        ↓
                    Request 2 ────────→ Response 2 (2s)
                                            ↓
                                        Total: 4 seconds
```

### Parallel Processing (Fast)

This example processes multiple requests simultaneously:

```
Request 1 ────────→ Response 1 (2s) ──┐
                                       ├→ Total: 2 seconds
Request 2 ────────→ Response 2 (2s) ──┘
     (Both running at the same time)
```

**Performance gain: 2x speedup!**

## Core Concept: Context Sequences

### Single vs. Multiple Sequences

```
┌────────────────────────────────────────────────┐
│              Model (Loaded Once)               │
├────────────────────────────────────────────────┤
│                   Context                      │
│  ┌──────────────┐          ┌──────────────┐   │
│  │  Sequence 1  │          │  Sequence 2  │   │
│  │              │          │              │   │
│  │ Conversation │          │ Conversation │   │
│  │  History A   │          │  History B   │   │
│  └──────────────┘          └──────────────┘   │
└────────────────────────────────────────────────┘
```

**Key insights:**
- Model weights are shared (memory efficient)
- Each sequence has independent history
- Sequences can process in parallel
- Both use the same underlying model

## How Parallel Processing Works

### Promise.all Pattern

JavaScript's `Promise.all()` enables concurrent execution:

```
Sequential:
────────────────────────────────────
await fn1();  // Wait 2s
await fn2();  // Wait 2s more
Total: 4s

Parallel:
────────────────────────────────────
await Promise.all([
    fn1(),    // Start immediately
    fn2()     // Start immediately (don't wait!)
]);
Total: 2s (whichever finishes last)
```

### Execution Timeline

```
Time →  0s      1s      2s      3s      4s
        │       │       │       │       │
Seq 1:  ├───────Processing───────┤
        │                        └─ Response 1
        │
Seq 2:  ├───────Processing───────┤
                                 └─ Response 2
                                 
        Both complete at ~2s instead of 4s!
```

## GPU Batch Processing

### Why Batching Matters

Modern GPUs process multiple operations efficiently:

```
Without Batching (Inefficient)
──────────────────────────────
GPU: [Token 1] ... wait ...
GPU: [Token 2] ... wait ...
GPU: [Token 3] ... wait ...
     └─ GPU underutilized

With Batching (Efficient)
─────────────────────────
GPU: [Tokens 1-1024]  ← Full batch
     └─ GPU fully utilized!
```

**batchSize parameter**: Controls how many tokens process together.

### Trade-offs

```
Small Batch (e.g., 128)     Large Batch (e.g., 2048)
───────────────────────     ────────────────────────
✓ Lower memory              ✓ Better GPU utilization
✓ More flexible             ✓ Faster throughput
✗ Slower throughput         ✗ Higher memory usage
✗ GPU underutilized         ✗ May exceed VRAM
```

**Sweet spot**: Usually 512-1024 for consumer GPUs.

## Architecture Patterns

### Pattern 1: Multi-User Service

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ User A  │  │ User B  │  │ User C  │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  ↓
         ┌────────────────┐
         │  Load Balancer │
         └────────────────┘
                  ↓
     ┌────────────┼────────────┐
     ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Seq 1  │  │  Seq 2  │  │  Seq 3  │
└─────────┘  └─────────┘  └─────────┘
     └────────────┼────────────┘
                  ↓
         ┌────────────────┐
         │  Shared Model  │
         └────────────────┘
```

### Pattern 2: Multi-Agent System

```
         ┌──────────────┐
         │     Task     │
         └──────┬───────┘
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
  ┌────────┐ ┌──────┐ ┌──────────┐
  │Planner │ │Critic│ │ Executor │
  │ Agent  │ │Agent │ │  Agent   │
  └───┬────┘ └──┬───┘ └────┬─────┘
      │         │          │
      └─────────┼──────────┘
                ↓
       (All run in parallel)
```

### Pattern 3: Pipeline Processing

```
Input Queue: [Task1, Task2, Task3, ...]
                    ↓
            ┌───────────────┐
            │  Dispatcher   │
            └───────────────┘
                    ↓
        ┌───────────┼───────────┐
        ↓           ↓           ↓
    Sequence 1  Sequence 2  Sequence 3
        ↓           ↓           ↓
        └───────────┼───────────┘
                    ↓
            Output: [R1, R2, R3]
```

## Resource Management

### Memory Allocation

Each sequence consumes memory:

```
┌──────────────────────────────────┐
│        Total VRAM: 8GB           │
├──────────────────────────────────┤
│  Model Weights:        4.0 GB    │
│  Context Base:         1.0 GB    │
│  Sequence 1 (KV Cache): 0.8 GB   │
│  Sequence 2 (KV Cache): 0.8 GB   │
│  Sequence 3 (KV Cache): 0.8 GB   │
│  Overhead:             0.6 GB    │
├──────────────────────────────────┤
│  Total Used:           8.0 GB    │
│  Remaining:            0.0 GB    │
└──────────────────────────────────┘
        Maximum capacity!
```

**Formula**: 
```
Required VRAM = Model + Context + (NumSequences × KVCache)
```

### Finding Optimal Sequence Count

```
Too Few (1-2)              Optimal (4-8)           Too Many (16+)
─────────────              ─────────────           ──────────────
GPU underutilized          Balanced use            Memory overflow
↓                          ↓                       ↓
Slow throughput            Best performance        Thrashing/crashes
```

**Test your system**:
1. Start with 2 sequences
2. Monitor VRAM usage
3. Increase until performance plateaus
4. Back off if memory issues occur

## Real-World Scenarios

### Scenario 1: Chatbot Service

```
Challenge: 100 users, each waiting 2s per response
Sequential: 100 × 2s = 200s (3.3 minutes!)
Parallel (10 seq): 10 batches × 2s = 20s
                   10x speedup!
```

### Scenario 2: Batch Analysis

```
Task: Analyze 1000 documents
Sequential: 1000 × 3s = 50 minutes
Parallel (8 seq): 125 batches × 3s = 6.25 minutes
                  8x speedup!
```

### Scenario 3: Multi-Agent Collaboration

```
Agents: Planner, Analyzer, Executor (all needed)
Sequential: Wait for each → Slow pipeline
Parallel: All work together → Fast decision-making
```

## Limitations & Considerations

### 1. Context Capacity Sharing

```
Problem: Sequences share total context space
───────────────────────────────────────────
Total context: 4096 tokens
2 sequences: Each gets ~2048 tokens max
4 sequences: Each gets ~1024 tokens max

More sequences = Less history per sequence!
```

### 2. CPU vs GPU Parallelism

```
With GPU:                    CPU Only:
True parallel processing     Interleaved processing
Multiple CUDA streams        Single thread context-switching
                            (Still helps throughput!)
```

### 3. Not Always Faster

```
When parallel helps:         When it doesn't:
• Independent requests       • Dependent requests (must wait)
• I/O-bound operations      • Very short prompts (overhead)
• Multiple users            • Single sequential conversation
```

## Best Practices

### 1. Design for Independence
```
✓ Good: Separate user conversations
✓ Good: Independent analysis tasks
✗ Bad: Sequential reasoning steps (use ReAct instead)
```

### 2. Monitor Resources
```
Track:
• VRAM usage per sequence
• Processing time per request
• Queue depths
• Error rates
```

### 3. Implement Graceful Degradation
```
if (vramExceeded) {
    reduceSequenceCount();
    // or queue requests instead
}
```

### 4. Handle Errors Properly
```javascript
try {
    const results = await Promise.all([...]);
} catch (error) {
    // One failure doesn't crash all sequences
    handlePartialResults();
}
```

## Comparison: Evolution of Performance

```
Stage              Requests/Min    Pattern
─────────────────  ─────────────   ───────────────
1. Basic (intro)        30          Sequential
2. Batch (this)        120          4 sequences
3. Load balanced       240          8 sequences + queue
4. Distributed        1000+         Multiple machines
```

## Key Takeaways

1. **Parallelism is essential** for production AI agent systems
2. **Sequences share model** but maintain independent state
3. **Promise.all** enables concurrent JavaScript execution
4. **Batch size** affects GPU utilization and throughput
5. **Memory is the limit** - more sequences need more VRAM
6. **Not magic** - only helps with independent tasks

## Practical Formula

```
Speedup = min(
    Number_of_Sequences,
    Available_VRAM / Memory_Per_Sequence,
    GPU_Compute_Limit
)
```

Typically: 2-10x speedup for well-designed systems.

This technique is foundational for building scalable agent architectures that can handle real-world workloads efficiently.


# Code Explanation: batch.js

This file demonstrates **parallel execution** of multiple LLM prompts using separate context sequences, enabling concurrent processing for better performance.

## Step-by-Step Code Breakdown

### 1. Import and Setup (Lines 1-10)
```javascript
import {getLlama, LlamaChatSession} from "node-llama-cpp";
import path from "path";
import {fileURLToPath} from "url";

/**
 * Asynchronous execution improves performance in GAIA benchmarks,
 * multi-agent applications, and other high-throughput scenarios.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
```
- Standard imports for LLM interaction
- Comment explains the performance benefit
- **GAIA benchmark**: A standard for testing AI agent performance
- Useful for multi-agent systems that need to handle many requests

### 2. Model Path Configuration (Lines 11-16)
```javascript
const modelPath = path.join(
    __dirname,
    "../",
    "models",
    "DeepSeek-R1-0528-Qwen3-8B-Q6_K.gguf"
)
```
- Uses **DeepSeek-R1**: An 8B parameter model optimized for reasoning
- **Q6_K quantization**: Balance between quality and size
- Model is loaded once and shared between sequences

### 3. Initialize Llama and Load Model (Lines 18-19)
```javascript
const llama = await getLlama();
const model = await llama.loadModel({modelPath});
```
- Standard initialization
- Model is loaded into memory once
- Will be used by multiple sequences simultaneously

### 4. Create Context with Multiple Sequences (Lines 20-23)
```javascript
const context = await model.createContext({
    sequences: 2,
    batchSize: 1024 // The number of tokens that can be processed at once by the GPU.
});
```

**Key parameters:**

- **sequences: 2**: Creates 2 independent conversation sequences
  - Each sequence has its own conversation history
  - Both share the same model and context memory pool
  - Can be processed in parallel

- **batchSize: 1024**: Maximum tokens processed per GPU batch
  - Larger = better GPU utilization
  - Smaller = lower memory usage
  - 1024 is a good balance for most GPUs

### Why Multiple Sequences?

```
Single Sequence (Sequential)     Multiple Sequences (Parallel)
─────────────────────────       ──────────────────────────────
Process Prompt 1 → Response 1    Process Prompt 1 ──┐
Wait...                                              ├→ Both responses
Process Prompt 2 → Response 2    Process Prompt 2 ──┘   in parallel!

Total Time: T1 + T2              Total Time: max(T1, T2)
```

### 5. Get Individual Sequences (Lines 25-26)
```javascript
const sequence1 = context.getSequence();
const sequence2 = context.getSequence();
```
- Retrieves two separate sequence objects from the context
- Each sequence maintains its own state
- They can be used independently for different conversations

### 6. Create Separate Sessions (Lines 28-33)
```javascript
const session1 = new LlamaChatSession({
    contextSequence: sequence1
});
const session2 = new LlamaChatSession({
    contextSequence: sequence2
});
```
- Creates a chat session for each sequence
- Each session has its own conversation history
- Sessions are completely independent
- No system prompts in this example (could be added)

### 7. Define Questions (Lines 35-36)
```javascript
const q1 = "Hi there, how are you?";
const q2 = "How much is 6+6?";
```
- Two completely different questions
- Will be processed simultaneously
- Different types: conversational vs. computational

### 8. Parallel Execution with Promise.all (Lines 38-44)
```javascript
const [
    a1,
    a2
] = await Promise.all([
    session1.prompt(q1),
    session2.prompt(q2)
]);
```

**How this works:**

1. `session1.prompt(q1)` starts asynchronously
2. `session2.prompt(q2)` starts asynchronously (doesn't wait for #1)
3. `Promise.all()` waits for BOTH to complete
4. Returns results in array: [response1, response2]
5. Destructures into `a1` and `a2`

**Key benefit**: Both prompts are processed at the same time, not one after another!

### 9. Display Results (Lines 46-50)
```javascript
console.log("User: " + q1);
console.log("AI: " + a1);

console.log("User: " + q2);
console.log("AI: " + a2);
```
- Outputs both question-answer pairs
- Results appear in order despite parallel processing

## Key Concepts Demonstrated

### 1. Parallel Processing
Instead of:
```javascript
// Sequential (slow)
const a1 = await session1.prompt(q1);  // Wait
const a2 = await session2.prompt(q2);  // Wait again
```

We use:
```javascript
// Parallel (fast)
const [a1, a2] = await Promise.all([
    session1.prompt(q1),
    session2.prompt(q2)
]);
```

### 2. Context Sequences
A context can hold multiple independent sequences:

```
┌─────────────────────────────────────┐
│          Context (Shared)           │
│  ┌───────────────────────────────┐  │
│  │  Model Weights (8B params)    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Sequence 1  │  │ Sequence 2  │  │
│  │ "Hi there"  │  │ "6+6?"      │  │
│  │ History...  │  │ History...  │  │
│  └─────────────┘  └─────────────┘  │
└─────────────────────────────────────┘
```

## Performance Comparison

### Sequential Execution
```
Request 1: 2 seconds
Request 2: 2 seconds
Total: 4 seconds
```

### Parallel Execution (This Example)
```
Request 1: 2 seconds ──┐
Request 2: 2 seconds ──┤ Both running
Total: ~2 seconds      └─ simultaneously
```

**Speedup**: ~2x for 2 sequences, scales with more sequences

## Use Cases

### 1. Multi-User Applications
```javascript
// Handle multiple users simultaneously
const [user1Response, user2Response, user3Response] = await Promise.all([
    session1.prompt(user1Query),
    session2.prompt(user2Query),
    session3.prompt(user3Query)
]);
```

### 2. Multi-Agent Systems
```javascript
// Multiple agents working on different tasks
const [
    plannerResponse,
    analyzerResponse,
    executorResponse
] = await Promise.all([
    plannerSession.prompt("Plan the task"),
    analyzerSession.prompt("Analyze the data"),
    executorSession.prompt("Execute step 1")
]);
```

### 3. Benchmarking
```javascript
// Test multiple prompts for evaluation
const results = await Promise.all(
    testPrompts.map(prompt => session.prompt(prompt))
);
```

### 4. A/B Testing
```javascript
// Test different system prompts
const [responseA, responseB] = await Promise.all([
    sessionWithPromptA.prompt(query),
    sessionWithPromptB.prompt(query)
]);
```

## Resource Considerations

### Memory Usage
Each sequence needs memory for:
- Conversation history
- Intermediate computations
- KV cache (key-value cache for transformer attention)

**Rule of thumb**: More sequences = more memory needed

### GPU Utilization
- **Single sequence**: May underutilize GPU
- **Multiple sequences**: Better GPU utilization
- **Too many sequences**: May exceed VRAM, causing slowdown

### Optimal Number of Sequences
Depends on:
- Available VRAM
- Model size
- Context length
- Batch size

**Typical**: 2-8 sequences for consumer GPUs

## Limitations & Considerations

### 1. Shared Context Limit
All sequences share the same context memory pool:
```
Total context size: 8192 tokens
Sequence 1: 4096 tokens
Sequence 2: 4096 tokens
Maximum distribution!
```

### 2. Not True Parallelism for CPU
On CPU-only systems, sequences are interleaved, not truly parallel. Still provides better overall throughput.

### 3. Model Loading Overhead
The model is loaded once and shared, which is efficient. But initial loading still takes time.

## Why This Matters for AI Agents

### Efficiency in Production
Real-world agent systems need to:
- Handle multiple requests concurrently
- Respond quickly to users
- Make efficient use of hardware

### Multi-Agent Architectures
Complex agent systems often have:
- **Planner agent**: Thinks about strategy
- **Executor agent**: Takes actions
- **Critic agent**: Evaluates results

These can run in parallel using separate sequences.

### Scalability
This pattern is the foundation for:
- Web services with multiple users
- Batch processing of data
- Distributed agent systems

## Best Practices

1. **Match sequences to workload**: Don't create more than you need
2. **Monitor memory usage**: Each sequence consumes VRAM
3. **Use appropriate batch size**: Balance speed vs. memory
4. **Clean up resources**: Always dispose when done
5. **Handle errors**: Wrap Promise.all in try-catch

## Expected Output

Running this script should output something like:
```
User: Hi there, how are you?
AI: Hello! I'm doing well, thank you for asking...

User: How much is 6+6?
AI: 12
```

Both responses appear quickly because they were processed simultaneously!
