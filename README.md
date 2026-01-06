# 🤖 AI Agents in Node.js - Educational Learning Repository

> **A comprehensive educational resource for learning AI agents, LLMs, and agentic systems in Node.js**

This is **NOT** a framework or production library. This is a **hands-on learning repository** designed to teach you how AI agents work from the ground up. It includes implementations, tutorials, conceptual guides, and progressive examples that build your understanding from basic LLM interactions to advanced multi-agent systems.

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=flat-square)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](LICENSE)
[![Educational](https://img.shields.io/badge/Purpose-Learning-orange?style=flat-square)](README.md)
[![ES Modules](https://img.shields.io/badge/ES%20Modules-Native-brightgreen?style=flat-square)](package.json)

---

## 🎓 What Is This Repository?

This is an **educational journey through AI agents**. You'll learn by:

1. **Reading conceptual guides** in [docs/](docs/) that explain core ideas
2. **Examining working code** in [core/](core/) and [helpers/](helpers/)
3. **Running tutorials** in [tutorial/](tutorial/) that demonstrate concepts
4. **Experimenting with examples** and modifying them to learn

**It's meant for:**
- Students learning about LLMs and agents
- Developers exploring how AI systems work
- Anyone curious about building with local models
- Educators creating course materials

**It's NOT meant for:**
- Direct production use (though you can base production code on it)
- Performance-critical applications
- Enterprise deployments (missing production features)

---

## 📚 Table of Contents

- [What You'll Learn](#-what-youll-learn)
- [Quick Start (5 minutes)](#-quick-start-5-minutes)
- [Learning Path](#-learning-path)
- [Repository Structure](#-repository-structure)
- [Core Concepts](#-core-concepts)
- [Completed Implementations](#-completed-implementations)
- [Modern AI Topics](#-modern-ai-topics-in-2026)
- [Future Learning Topics](#-future-learning-topics)
- [Contributing & Extending](#-contributing--extending)

---

## 🎯 What You'll Learn

### Beginner Topics
- ✅ **Local LLM Basics** - How to load and run models locally
- ✅ **Prompting** - Effective prompt engineering techniques
- ✅ **Inference** - Understanding token generation and context windows
- ✅ **API Comparison** - OpenAI vs. Local models

### Intermediate Topics
- ✅ **Function Calling** - Teaching models to use tools
- ✅ **Simple Agents** - Creating agents with tool use
- ✅ **Memory Systems** - Building persistent agent memory
- ✅ **Message Types** - Structured communication between components

### Advanced Topics
- ✅ **ReAct Pattern** - Reasoning + Acting for complex problems
- ✅ **Multi-Step Reasoning** - Chain-of-Thought and planning
- ✅ **Error Handling** - Retry logic and timeout management
- ✅ **Token Management** - Context window optimization

### Professional Topics
- ✅ **Callbacks & Monitoring** - Track execution lifecycle
- ✅ **JSON Parsing** - Robustly extract structured data from LLM output
- ✅ **Prompt Debugging** - Inspect exact prompts sent to models
- ✅ **Batch Processing** - Efficiently process multiple inputs

---

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies

```bash
git clone https://github.com/yourusername/ai-agents-in-node.git
cd ai-agents-in-node
npm install
```

### 2. Download a Model

```bash
# Download Qwen 1.7B (recommended for learning)
npx --no node-llama-cpp pull --dir ./models hf:Qwen/Qwen3-1.7B-GGUF:Q8_0
```

### 3. Run Your First Example

```bash
node tutorial/01_agent_fundamentals/01_intro.js
```

Expected output: Model loads, then responds to your prompt.

### 4. Explore & Modify

```bash
# Open the file and modify the prompt
nano tutorial/01_agent_fundamentals/01_intro.js

# Try running it again with your changes
node tutorial/01_agent_fundamentals/01_intro.js
```

**That's it!** You've just run a local LLM. Now let's learn how it works.

---

## 📖 Learning Path

### Week 1: Foundations
**Goal: Understand LLMs and basic interaction**

| Day | Topic | Read | Run | Key Concept |
|-----|-------|------|-----|-------------|
| 1 | What are LLMs? | [docs/01_intro_concept.md](docs/01_intro_concept.md) | [01_intro.js](tutorial/01_agent_fundamentals/01_intro.js) | Token generation |
| 2 | OpenAI API | [docs/02_openai-intro_concept.md](docs/02_openai-intro_concept.md) | [02_openai-intro.js](tutorial/01_agent_fundamentals/02_openai-intro.js) | API comparison |
| 3 | Translation | [docs/03_translation_concept.md](docs/03_translation_concept.md) | [03_translation.js](tutorial/01_agent_fundamentals/03_translation.js) | Prompt engineering |
| 4 | Chain-of-Thought | [docs/04_think_concept.md](docs/04_think_concept.md) | [04_think.js](tutorial/01_agent_fundamentals/04_think.js) | Reasoning patterns |
| 5 | Batch Processing | [docs/05_batch_concept.md](docs/05_batch_concept.md) | [05_batch.js](tutorial/01_agent_fundamentals/05_batch.js) | Efficiency |
| 6 | Code Generation | [docs/06_coding_concept.md](docs/06_coding_concept.md) | [06_coding.js](tutorial/01_agent_fundamentals/06_coding.js) | Task-specific prompts |
| 7 | Review & Experiment | Try modifying existing examples | Run all examples | **Checkpoint:** Comfortable with LLM basics? ✅ |

### Week 2: Agents & Tools
**Goal: Learn how to make agents that can use tools**

| Day | Topic | Read | Run | Key Concept |
|-----|-------|------|-----|-------------|
| 8 | Function Calling | [docs/07_simple_agent_concept.md](docs/07_simple_agent_concept.md) | [07_simple-agent.js](tutorial/01_agent_fundamentals/07_simple-agent.js) | Tool use |
| 9 | Memory Systems | [docs/08_simple_agent_with_memory_concept.md](docs/08_simple_agent_with_memory_concept.md) | [08_simple-agent-with-memory.js](tutorial/01_agent_fundamentals/08_simple-agent-with-memory.js) | Persistent state |
| 10 | ReAct Pattern | [docs/09_react_agent_concept.md](docs/09_react_agent_concept.md) | [09_react-agent.js](tutorial/01_agent_fundamentals/09_react-agent.js) | Reasoning loop |
| 11 | Advanced Agents | [docs/10_aot_agent_concept.md](docs/10_aot_agent_concept.md) | [10_aot-agent.js](tutorial/01_agent_fundamentals/10_aot-agent.js) | Complex workflows |
| 12 | Error Handling | [Review utils/](utils/) | Create custom handlers | **Checkpoint:** Can build stateful agents? ✅ |

### Week 3: Deep Dive into Architecture
**Goal: Understand the framework's internal design**

- Study [core/runnable.js](core/runnable.js) - Base pattern for all components
- Study [core/message.js](core/message.js) - Message protocol
- Study [helpers/memory-manager.js](helpers/memory-manager.js) - Persistent state
- Study [helpers/prompt-debugger.js](helpers/prompt-debugger.js) - Debugging tools

### Week 4: Modern AI Topics
**Goal: Learn current trends in AI and agents**

- **Parallel Execution** - Using [RunnableParallel](core/runnable-parallel.js)
- **Token Management** - Using [TokenCounter](utils/token-counter.js)
- **Error Handling** - Using [RetryManager](utils/retry.js) and [TimeoutManager](utils/timeout.js)
- **Schema Validation** - Using [SchemaValidator](utils/schema-validator.js)
- **Structured Logging** - Using [Logger](utils/logger.js)

---

## 📂 Repository Structure

```
ai-agents-in-node/
│
├── 📄 README.md (you are here)
├── 📄 DOWNLOAD.md (model download guide)
├── 📄 package.json
│
├── core/                          # Core framework patterns
│   ├── runnable.js               # Base Runnable class + RunnableSequence
│   ├── runnable-parallel.js       # ✅ Parallel execution pattern (COMPLETE)
│   ├── message.js                # Message types (HumanMessage, AIMessage, etc.)
│   ├── context.js                # RunnableConfig configuration
│   └── index.js                  # Public exports
│
├── helpers/                       # Utility helpers
│   ├── memory-manager.js         # ✅ Persistent memory storage (COMPLETE)
│   ├── json-parser.js            # ✅ Robust JSON parsing (COMPLETE)
│   ├── prompt-debugger.js        # ✅ Inspect prompts (COMPLETE)
│   └── agent-memory.json         # Memory storage file
│
├── utils/                         # Core utilities
│   ├── callback-manager.js       # ✅ Event system (COMPLETE)
│   ├── token-counter.js          # ✅ Token management (COMPLETE)
│   ├── logger.js                 # ✅ Structured logging (COMPLETE)
│   ├── retry.js                  # ✅ Retry with backoff (COMPLETE)
│   ├── timeout.js                # ✅ Timeout management (COMPLETE)
│   ├── schema-validator.js       # ✅ JSON schema validation (COMPLETE)
│   └── index.js                  # Public exports
│
├── tutorial/                      # Learning examples
│   └── 01_agent_fundamentals/    # Beginner → Intermediate
│       ├── 01_intro.js                    # Basic LLM loading
│       ├── 02_openai-intro.js             # OpenAI API intro
│       ├── 03_translation.js              # Language translation
│       ├── 04_think.js                    # Chain-of-Thought
│       ├── 05_batch.js                    # Batch processing
│       ├── 06_coding.js                   # Code generation
│       ├── 07_simple-agent.js             # Function calling
│       ├── 08_simple-agent-with-memory.js # Persistent memory
│       ├── 09_react-agent.js              # ReAct pattern
│       └── 10_aot-agent.js                # Advanced agents
│   └── 02_agent_advance/         # Advanced topics (placeholder for future)
│
├── docs/                         # Concept documentation
│   ├── 01_intro_concept.md                  # How LLMs work
│   ├── 02_openai-intro_concept.md           # OpenAI vs local
│   ├── 03_translation_concept.md            # Translation patterns
│   ├── 04_think_concept.md                  # Chain-of-Thought
│   ├── 05_batch_concept.md                  # Batch processing
│   ├── 06_coding_concept.md                 # Code generation
│   ├── 07_simple_agent_concept.md           # Function calling
│   ├── 08_simple_agent_with_memory_concept.md # Memory systems
│   ├── 09_react_agent_concept.md            # ReAct pattern
│   └── 10_aot_agent_concept.md              # Advanced agents
│
├── models/                       # Local model storage (git-ignored)
│   └── *.gguf                    # Quantized GGUF model files
│
├── logs/                         # Debug logs (git-ignored)
│   └── *.txt                     # Prompt inspection logs
│
└── helpers/
    └── agent-memory.json         # Persistent agent memory
```

---

## 🎨 Core Concepts Explained

### 1. Runnable - The Base Pattern

Everything in this framework extends `Runnable`. It's a simple pattern:

```javascript
// All Runnables work like this:
const result = await runnable.invoke(input, config);

// Advanced usage:
await runnable.stream(input);           // Stream results
await runnable.batch([inputs...]);      // Parallel processing
const piped = runnable.pipe(nextStep);  // Chain operations
```

**Why?** This unified interface lets you compose complex workflows from simple pieces.

### 2. Messages - Structured Communication

Messages are how components communicate:

```javascript
// User input
const userMsg = new HumanMessage("What time is it?");

// AI response
const aiMsg = new AIMessage("It's 2:30 PM");

// System instruction
const systemMsg = new SystemMessage("You are a helpful assistant");

// Tool execution result
const toolMsg = new ToolMessage("Tool result", { tool: "calculator" });
```

### 3. Configuration - Control Behavior

`RunnableConfig` controls execution:

```javascript
const config = new RunnableConfig({
  callbacks: [myCallback],        // Monitor execution
  metadata: { userId: 123 },      // Arbitrary data
  tags: ['production'],           // Filtering
  recursionLimit: 25              // Safety
});

await runnable.invoke(input, config);
```

### 4. Memory - Persistent State

Agents remember things:

```javascript
const memory = new MemoryManager('./memory.json');

// Save memory
await memory.addMemory({
  type: 'fact',
  key: 'user_name',
  value: 'Alice'
});

// Load and use
const summary = await memory.getMemorySummary();
```

### 5. Callbacks - Monitor Everything

Hook into execution:

```javascript
const callback = {
  async onStart(runnable, input, config) {
    console.log(`Starting ${runnable.name}`);
  },
  async onEnd(runnable, output, config) {
    console.log(`Finished ${runnable.name}`);
  }
};

await runnable.invoke(input, { callbacks: [callback] });
```

---

## ✅ Completed Implementations

**Status: ALL CORE COMPONENTS COMPLETE ✅**

All utility classes have been fully implemented and tested. Here's what's available:

### Core Classes
- ✅ **Runnable** - Base class with invoke, stream, batch, pipe
- ✅ **RunnableSequence** - Chain runnables sequentially
- ✅ **RunnableParallel** - Execute multiple runnables in parallel
- ✅ **Message Types** - HumanMessage, AIMessage, SystemMessage, ToolMessage
- ✅ **RunnableConfig** - Configuration management with merging

### Helpers
- ✅ **MemoryManager** - Persistent JSON-based memory with schema migration
- ✅ **JsonParser** - Robust LLM output parsing with auto-repair
- ✅ **PromptDebugger** - Inspect exact prompts and token structure

### Utils (All Complete!)
- ✅ **CallbackManager** - Event system for monitoring
- ✅ **TokenCounter** - Token counting and context window management
- ✅ **Logger** - Structured logging with severity levels
- ✅ **RetryManager** - Exponential backoff retry logic
- ✅ **TimeoutManager** - Timeout enforcement for async operations
- ✅ **SchemaValidator** - JSON schema validation with repair

---

## 🌍 Modern AI Topics in 2026

This repository covers current trends in the AI and agent space:

### **Agent Patterns**
- ✅ ReAct (Reasoning + Acting)
- ✅ Chain-of-Thought (CoT)
- ✅ Tree-of-Thought reasoning (in tutorials)
- ✅ Function calling / Tool use
- 🔄 Multi-agent coordination (coming)
- 🔄 Hierarchical reasoning (coming)

### **LLM Optimization**
- ✅ Local model inference
- ✅ Token counting and context optimization
- ✅ Prompt engineering best practices
- ✅ JSON output parsing
- 🔄 Quantization techniques (coming)
- 🔄 LoRA fine-tuning (coming)

### **Production Patterns**
- ✅ Persistent memory systems
- ✅ Error handling and retries
- ✅ Timeout management
- ✅ Structured logging
- 🔄 Distributed agents (coming)
- 🔄 Rate limiting (coming)

### **Emerging Techniques (2026)**
- 🔄 Retrieval-Augmented Generation (RAG)
- 🔄 Vector embeddings and semantic search
- 🔄 Agentic loops and self-improvement
- 🔄 Dynamic prompt optimization
- 🔄 Model selection and routing
- 🔄 Long-context understanding

---

## 🚀 Future Learning Topics

These are topics you should explore **after** mastering this repository:

### Phase 1: Advanced Agents (Months 1-2)
- [ ] **Multi-Agent Systems** - Agents that collaborate and communicate
  - Agent hierarchies
  - Message passing between agents
  - Conflict resolution
  
- [ ] **Tool Ecosystems** - Larger collections of available tools
  - Tool discovery and selection
  - Tool composition
  - Error handling in tool chains
  
- [ ] **State Management** - More sophisticated state persistence
  - Agent state machines
  - Rollback and recovery
  - Distributed state

### Phase 2: Advanced LLM Techniques (Months 3-4)
- [ ] **Retrieval-Augmented Generation (RAG)**
  - Vector embeddings
  - Semantic search with local embeddings
  - Document chunking and retrieval strategies
  
- [ ] **Fine-tuning & Adaptation**
  - LoRA (Low-Rank Adaptation)
  - Prompt tuning techniques
  - Few-shot learning strategies
  
- [ ] **Model Routing**
  - Classify inputs to appropriate model
  - Cost-efficiency optimization
  - Capability-based model selection

### Phase 3: Production Systems (Months 5-6)
- [ ] **Monitoring & Observability**
  - Agent performance tracking
  - Cost monitoring
  - Quality metrics and KPIs
  
- [ ] **API Servers**
  - REST API for agents
  - WebSocket streaming
  - Rate limiting and quotas
  
- [ ] **Scaling**
  - Distributed agents
  - Load balancing
  - Multi-GPU inference

### Phase 4: Cutting-Edge Topics (Months 7+)
- [ ] **Emergent Behaviors**
  - Self-improvement loops
  - Knowledge synthesis
  - Autonomous task creation
  
- [ ] **Hybrid Systems**
  - Symbolic AI + Neural Networks
  - Rule-based + Learning
  - Neuro-symbolic reasoning
  
- [ ] **Interpretability**
  - Understanding agent decisions
  - Attention visualization
  - Explanation generation

---

## 🎓 How to Use This Repository

### For Learning
1. **Read the concept doc** for a topic
2. **Study the tutorial code** that demonstrates it
3. **Run the code** and experiment
4. **Modify and extend** the examples
5. **Move to next topic**

### For Teaching
- Use the concept docs in [docs/](docs/) as course material
- Have students run and modify tutorial code
- Assign projects building on the examples
- Students can submit their extensions as learning artifacts

### For Building
- Study the [core/](core/) patterns for building agents
- Use [helpers/](helpers/) utilities in your own projects
- Extend [tutorial/](tutorial/) examples with new features
- Reference [utils/](utils/) for robust implementations

---

## 🛠️ Code Structure Overview

### How Messages Flow Through the System

```
User Input
    ↓
HumanMessage (core/message.js)
    ↓
Runnable.invoke() (core/runnable.js)
    ↓
RunnableConfig & Callbacks (core/context.js, utils/callback-manager.js)
    ↓
Your Logic (_call implementation)
    ↓
LLM (node-llama-cpp)
    ↓
AIMessage (core/message.js)
    ↓
MemoryManager (helpers/memory-manager.js) - Optional storage
    ↓
JsonParser (helpers/json-parser.js) - Parse output
    ↓
User/Application
```

### How Configuration Flows

```
RunnableConfig (initial)
    ↓
merge() or child()
    ↓
Passed to invoke()
    ↓
Creates CallbackManager
    ↓
Callbacks execute at lifecycle points
    ↓
Available to _call implementation
```

---

## 📝 Example: Building a Simple Agent

Here's how you'd build an agent from scratch:

```javascript
import { Runnable, RunnableConfig, HumanMessage, AIMessage } from './core/index.js';
import { MemoryManager } from './helpers/memory-manager.js';

class MyAgent extends Runnable {
  constructor() {
    super();
    this.memory = new MemoryManager('./my-memory.json');
  }

  async _call(input, config) {
    // Load memories
    const memories = await this.memory.loadMemories();

    // Call LLM with input and memories
    const systemPrompt = this._buildSystemPrompt(memories);
    const response = await this.callLLM(input, systemPrompt);

    // Parse and extract memories
    const updates = this._extractMemories(response);
    for (const update of updates) {
      await this.memory.addMemory(update);
    }

    return response;
  }

  _buildSystemPrompt(memories) {
    return `You are a helpful assistant. ${memories}`;
  }

  async callLLM(input, systemPrompt) {
    // Your LLM integration here
    return "Response from LLM";
  }

  _extractMemories(response) {
    // Your memory extraction logic
    return [];
  }
}

// Use it
const agent = new MyAgent();
const result = await agent.invoke("What's your name?");
```

---

## 🤝 Contributing & Extending

This is an educational repository, and contributions are welcome!

### Ways to Contribute

1. **Add new tutorials** - Create examples of new concepts
2. **Improve explanations** - Better docs and code comments
3. **Build sample agents** - Real-world example implementations
4. **Report errors** - Fix bugs in existing code
5. **Create learning materials** - Videos, diagrams, explanations

### Areas for Extension

- Add vector storage integrations (Pinecone, Supabase)
- Implement RAG examples with embeddings
- Create multi-agent chat examples
- Add support for more models
- Build web UI/dashboard
- Create CLI tools for common tasks

### How to Submit

1. Fork the repository
2. Create a branch (`git checkout -b feature/your-feature`)
3. Make changes with detailed comments
4. Submit a pull request with explanation

---

## 📊 System Architecture

### Execution Flow

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│    (Your Agent/Bot Code)                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Runnable.invoke()                  │
│  ┌───────────────────────────────────┐  │
│  │ 1. Create RunnableConfig          │  │
│  │ 2. Create CallbackManager         │  │
│  │ 3. Call onStart callbacks         │  │
│  │ 4. Execute _call()                │  │
│  │ 5. Call onEnd callbacks           │  │
│  │ 6. Return result                  │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      Your _call() Implementation        │
│  ┌───────────────────────────────────┐  │
│  │ • Load memories                   │  │
│  │ • Build prompts                   │  │
│  │ • Call LLM                        │  │
│  │ • Parse output                    │  │
│  │ • Update state                    │  │
│  └───────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│    LLM Integration Layer                │
│  ┌───────────────────────────────────┐  │
│  │ • node-llama-cpp                  │  │
│  │ • OpenAI API                      │  │
│  │ • Other providers                 │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🔧 System Dependencies

```
node-llama-cpp ─── GGUF Models
    ↓
LlamaChatSession
    ↓
Model inference ─── Token generation
    ↓
Your code uses:
├── Runnable (execute)
├── Message types (communicate)
├── MemoryManager (persist)
├── Callbacks (monitor)
└── Utilities (enhance)
```

---

## 💡 Tips for Learning

### Getting the Most Out of This Repository

1. **Read sequentially** - Topics build on each other
2. **Experiment boldly** - Modify examples, break things, fix them
3. **Read the source** - Comments in code are detailed
4. **Build projects** - Apply concepts to real problems
5. **Share learnings** - Teaching others solidifies understanding

### Debugging Tips

```javascript
// Enable detailed prompt logging
const debugger = new PromptDebugger({
  outputDir: './logs',
  filename: 'debug.txt',
  includeTimestamp: true
});

// Track token usage
const counter = new TokenCounter();
console.log(`Used ${counter.count(prompt)} tokens`);

// Monitor execution
const callback = {
  async onStart(runnable, input) {
    console.log(`Starting: ${runnable.name}`);
  }
};

await runnable.invoke(input, { callbacks: [callback] });
```

---

## 📚 Recommended Learning Resources

While working through this repository, supplement your learning with:

### LLM Fundamentals
- "Attention Is All You Need" paper (Transformers)
- "Language Models are Few-Shot Learners" (GPT-3)
- OpenAI's blog on prompting

### Agents & Reasoning
- "ReAct: Synergizing Reasoning and Acting in Language Models" paper
- "Chain-of-Thought Prompting" research
- "Tree of Thoughts" paper

### Implementation Details
- node-llama-cpp documentation
- GGUF format specifications
- Quantization techniques (Q4, Q5, Q8)

---

## 📄 License

ISC License - See LICENSE file for details.

This is an educational resource. Feel free to use, modify, and build upon it for learning purposes.

---

## 🙋 Getting Help

### If You Get Stuck

1. **Check the relevant doc** - Detailed explanations in [docs/](docs/)
2. **Read the tutorial code** - Working examples with comments
3. **Examine the helpers** - Study how utilities work
4. **Trace through execution** - Use PromptDebugger to see what happens
5. **Modify step by step** - Change one thing at a time

### Common Issues

**"Model not found"**
- Did you download models? See [DOWNLOAD.md](DOWNLOAD.md)
- Is the path correct in the code?

**"JSON parse error"**
- Use JsonParser.parse() with debug: true
- Check what LLM actually returned
- The parser includes repair logic

**"Out of memory"**
- Use a smaller quantization (Q5_K instead of Q8_0)
- Reduce context size
- Use a smaller model (Qwen 1.7B instead of 8B)

---

## 🎯 Learning Objectives Checklist

By the end of this journey, you should be able to:

- [ ] Load and run a local LLM
- [ ] Write effective prompts
- [ ] Build a simple chatbot with memory
- [ ] Create an agent that uses tools
- [ ] Understand the ReAct pattern
- [ ] Debug LLM prompts
- [ ] Parse structured LLM output
- [ ] Handle errors and retries
- [ ] Build multi-step agent workflows
- [ ] Monitor agent execution
- [ ] Extend the framework with custom components

---

## 🎉 Next Steps

1. **Start with [Quick Start](#-quick-start-5-minutes)**
2. **Follow the [Learning Path](#-learning-path)**
3. **Experiment with examples**
4. **Build your own agent**
5. **Explore future topics**
6. **Share what you learned**

**Welcome to the world of AI agents!** 🚀

---

<div align="center">

**This is a learning journey, not a destination.**

Start anywhere, go everywhere.

*Happy learning!*

</div>

---

**Last Updated:** January 2026  
**Repository Version:** 1.0.0 (Educational - All Core Components Complete)  
**Status:** ✅ Ready for Learning
