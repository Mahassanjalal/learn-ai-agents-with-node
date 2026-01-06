# Concepts: Understanding OpenAI APIs

This guide explains the fundamental concepts behind working with OpenAI's language models, which form the foundation for building AI agents.

## What is the OpenAI API?

The OpenAI API provides programmatic access to powerful language models like GPT-4o and GPT-3.5-turbo. Instead of running models locally, you send requests to OpenAI's servers and receive responses.

**Key characteristics:**
- **Cloud-based:** Models run on OpenAI's infrastructure
- **Pay-per-use:** Charged by token consumption
- **Production-ready:** Enterprise-grade reliability and performance
- **Latest models:** Immediate access to newest model releases

**Comparison with Local LLMs (like node-llama-cpp):**

| Aspect | OpenAI API | Local LLMs |
|--------|------------|------------|
| **Setup** | API key only | Download models, need GPU/RAM |
| **Cost** | Pay per token | Free after initial setup |
| **Performance** | Consistent, high-quality | Depends on your hardware |
| **Privacy** | Data sent to OpenAI | Completely local/private |
| **Scalability** | Unlimited (with payment) | Limited by your hardware |

---

## The Chat Completions API

### Request-Response Cycle

```
You (Client)                    OpenAI (Server)
     |                                |
     |  POST /v1/chat/completions    |
     |  {                             |
     |    model: "gpt-4o",            |
     |    messages: [...]             |
     |  }                             |
     |------------------------------->|
     |                                |
     |        [Processing...]         |
     |        [Model inference]       |
     |        [Generate response]     |
     |                                |
     |  Response                      |
     |  {                             |
     |    choices: [{                 |
     |      message: {                |
     |        content: "..."          |
     |      }                         |
     |    }]                          |
     |  }                             |
     |<-------------------------------|
     |                                |
```

**Key point:** Each request is independent. The API doesn't store conversation history.

---

## Message Roles: The Conversation Structure

Every message has a `role` that determines its purpose:

### 1. System Messages

```javascript
{ role: 'system', content: 'You are a helpful Python tutor.' }
```

**Purpose:** Define the AI's behavior, personality, and capabilities

**Think of it as:**
- The AI's "job description"
- Invisible to the end user
- Sets constraints and guidelines

**Examples:**
```javascript
// Specialist agent
"You are an expert SQL database administrator."

// Tone and style
"You are a friendly customer support agent. Be warm and empathetic."

// Output format control
"You are a JSON API. Always respond with valid JSON, never plain text."

// Behavioral constraints
"You are a code reviewer. Be constructive and focus on best practices."
```

**Best practices:**
- Keep it concise but specific
- Place at the beginning of the messages array
- Update it to change agent behavior
- Use for ethical guidelines and output formatting

### 2. User Messages

```javascript
{ role: 'user', content: 'How do I use async/await?' }
```

**Purpose:** Represent the human's input or questions

**Think of it as:**
- What you're asking the AI
- The prompt or query
- The instruction to follow

### 3. Assistant Messages

```javascript
{ role: 'assistant', content: 'Async/await is a way to handle promises...' }
```

**Purpose:** Represent the AI's previous responses

**Think of it as:**
- The AI's conversation history
- Context for follow-up questions
- What the AI has already said

### Conversation Flow Example

```javascript
[
  { role: 'system', content: 'You are a math tutor.' },
  
  // First exchange
  { role: 'user', content: 'What is 15 * 24?' },
  { role: 'assistant', content: '15 * 24 = 360' },
  
  // Follow-up (knows context)
  { role: 'user', content: 'What about dividing that by 3?' },
  { role: 'assistant', content: '360 ÷ 3 = 120' },
]
```

**Why this matters:** The role structure enables:
1. **Context awareness:** AI understands conversation history
2. **Behavior control:** System prompts shape responses
3. **Multi-turn conversations:** Natural back-and-forth dialogue

---

## Statelessness: A Critical Concept

**Most important principle:** OpenAI's API is stateless.

### What does stateless mean?

Each API call is independent. The model doesn't remember previous requests.

```
Request 1: "My name is Alice"
Response 1: "Hello Alice!"

Request 2: "What's my name?"
Response 2: "I don't know your name."  ← No memory!
```

### How to maintain context

**You must send the full conversation history:**

```javascript
const messages = [];

// First turn
messages.push({ role: 'user', content: 'My name is Alice' });
const response1 = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages  // ["My name is Alice"]
});
messages.push(response1.choices[0].message);

// Second turn - include full history
messages.push({ role: 'user', content: "What's my name?" });
const response2 = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages  // Full conversation!
});
```

### Implications

**Benefits:**
- ✅ Simple architecture (no server-side state)
- ✅ Easy to scale (any server can handle any request)
- ✅ Full control over context (you decide what to include)

**Challenges:**
- ❌ You manage conversation history
- ❌ Token costs increase with conversation length
- ❌ Must implement your own memory/persistence
- ❌ Context window limits eventually hit

**Real-world solutions:**
```javascript
// Trim old messages when too long
if (messages.length > 20) {
    messages = [messages[0], ...messages.slice(-10)];  // Keep system + last 10
}

// Summarize old context
if (totalTokens > 10000) {
    const summary = await summarizeConversation(messages);
    messages = [systemMessage, summary, ...recentMessages];
}
```

---

## Temperature: Controlling Randomness

Temperature controls how "creative" or "random" the model's output is.

### How it works technically

When generating each token, the model assigns probabilities to possible next tokens:

```
Input: "The sky is"
Possible next tokens:
  - "blue"     → 70% probability
  - "clear"    → 15% probability  
  - "dark"     → 10% probability
  - "purple"   → 5% probability
```

**Temperature modifies these probabilities:**

**Temperature = 0.0 (Deterministic)**
```
Always pick the highest probability token
"The sky is blue"  ← Same output every time
```

**Temperature = 0.7 (Balanced)**
```
Sample probabilistically with slight randomness
"The sky is blue" or "The sky is clear"
```

**Temperature = 1.5 (Creative)**
```
Flatten probabilities, allow unlikely choices
"The sky is purple" or "The sky is dancing"  ← More surprising!
```

### Practical Guidelines

**Temperature 0.0 - 0.3: Focused Tasks**
- Code generation
- Data extraction
- Factual Q&A
- Classification
- Translation

Example:
```javascript
// Extract JSON from text - needs consistency
temperature: 0.1
```

**Temperature 0.5 - 0.9: Balanced Tasks**
- General conversation
- Customer support
- Content summarization
- Educational content

Example:
```javascript
// Friendly chatbot
temperature: 0.7
```

**Temperature 1.0 - 2.0: Creative Tasks**
- Story writing
- Brainstorming
- Poetry/creative content
- Generating variations

Example:
```javascript
// Generate 10 different marketing taglines
temperature: 1.3
```

---

## Streaming: Real-time Responses

### Non-Streaming (Default)

```
User: "Tell me a story"
[Wait...]
[Wait...]
[Wait...]
Response: "Once upon a time, there was a..." (all at once)
```

**Pros:**
- Simple to implement
- Easy to handle errors
- Get complete response before processing

**Cons:**
- Appears slow for long responses
- No feedback during generation
- Poor user experience for chat

### Streaming

```
User: "Tell me a story"
"Once"
"Once upon"
"Once upon a"
"Once upon a time"
"Once upon a time there"
...
```

**Pros:**
- Immediate feedback
- Appears faster
- Better user experience
- Can process tokens as they arrive

**Cons:**
- More complex code
- Harder error handling
- Can't see full response before displaying

### When to Use Each

**Use Non-Streaming:**
- Batch processing scripts
- When you need to analyze the full response
- Simple command-line tools
- API endpoints that return complete results

**Use Streaming:**
- Chat interfaces
- Interactive applications
- Long-form content generation
- Any user-facing application where UX matters

---

## Tokens: The Currency of LLMs

### What are tokens?

Tokens are the fundamental units that language models process. They're not exactly words, but pieces of text.

**Tokenization examples:**
```
"Hello world"        → ["Hello", " world"]           = 2 tokens
"coding"             → ["coding"]                    = 1 token
"uncoded"            → ["un", "coded"]               = 2 tokens
```

### Why tokens matter

**1. Cost**
You pay per token (input + output):
```
Request: 100 tokens
Response: 150 tokens
Total billed: 250 tokens
```

**2. Context Limits**
Each model has a maximum token limit:
```
gpt-4o:        128,000 tokens  (≈96,000 words)
gpt-3.5-turbo: 16,384 tokens   (≈12,000 words)
```

**3. Performance**
More tokens = longer processing time and higher cost

### Managing Token Usage

**Monitor usage:**
```javascript
console.log(response.usage.total_tokens);
// Track cumulative usage for budgeting
```

**Limit response length:**
```javascript
max_tokens: 150  // Cap the response
```

**Trim conversation history:**
```javascript
// Keep only recent messages
if (messages.length > 20) {
    messages = messages.slice(-20);
}
```

**Estimate before sending:**
```javascript
import { encode } from 'gpt-tokenizer';

const text = "Your message here";
const tokens = encode(text).length;
console.log(`Estimated tokens: ${tokens}`);
```

---

## Model Selection: Choosing the Right Tool

### GPT-4o: The Powerhouse

**Best for:**
- Complex reasoning tasks
- Code generation and debugging
- Technical content
- Tasks requiring high accuracy
- Working with structured data

**Characteristics:**
- Most capable model
- Higher cost
- Slower than GPT-3.5
- Best for quality-critical applications

**Example use cases:**
- Legal document analysis
- Complex code refactoring
- Research and analysis
- Educational tutoring

### GPT-4o-mini: The Balanced Choice

**Best for:**
- General-purpose applications
- Good balance of cost and performance
- Most everyday tasks

**Characteristics:**
- Good performance
- Moderate cost
- Fast response times
- Sweet spot for many applications

**Example use cases:**
- Customer support chatbots
- Content summarization
- General Q&A
- Moderate complexity tasks

### GPT-3.5-turbo: The Speed Demon

**Best for:**
- High-volume, simple tasks
- Speed-critical applications
- Budget-conscious projects
- Classification and extraction

**Characteristics:**
- Very fast
- Lowest cost
- Good for simple tasks
- Less capable reasoning

**Example use cases:**
- Sentiment analysis
- Text classification
- Simple formatting
- High-throughput processing

### Decision Framework

```
Is task critical and complex?
├─ YES → GPT-4o
└─ NO
   └─ Is speed important and task simple?
      ├─ YES → GPT-3.5-turbo
      └─ NO → GPT-4o-mini
```

---

## Error Handling and Resilience

### Common Error Scenarios

**1. Authentication Errors (401)**
```javascript
// Invalid API key
Error: Incorrect API key provided
```

**2. Rate Limiting (429)**
```javascript
// Too many requests
Error: Rate limit exceeded
```

**3. Token Limits (400)**
```javascript
// Context too long
Error: This model's maximum context length is 16385 tokens
```

**4. Service Errors (500)**
```javascript
// OpenAI service issue
Error: The server had an error processing your request
```

### Best Practices

**1. Always use try-catch:**
```javascript
try {
    const response = await client.chat.completions.create({...});
} catch (error) {
    if (error.status === 429) {
        // Implement backoff and retry
    } else if (error.status === 500) {
        // Retry with exponential backoff
    } else {
        // Log and handle appropriately
    }
}
```

**2. Implement retry logic:**
```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await sleep(Math.pow(2, i) * 1000);  // Exponential backoff
        }
    }
}
```

**3. Monitor token usage:**
```javascript
let totalTokens = 0;
totalTokens += response.usage.total_tokens;

if (totalTokens > MONTHLY_BUDGET_TOKENS) {
    throw new Error('Monthly token budget exceeded');
}
```

---

## Architectural Patterns

### Pattern 1: Simple Request-Response

**Use case:** One-off queries, simple automation

```javascript
const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: query }]
});
```

**Pros:** Simple, easy to understand
**Cons:** No context, no memory

### Pattern 2: Stateful Conversation

**Use case:** Chat applications, tutoring, customer support

```javascript
class Conversation {
    constructor() {
        this.messages = [
            { role: 'system', content: 'Your behavior' }
        ];
    }
    
    async ask(userMessage) {
        this.messages.push({ role: 'user', content: userMessage });
        
        const response = await client.chat.completions.create({
            model: 'gpt-4o',
            messages: this.messages
        });
        
        this.messages.push(response.choices[0].message);
        return response.choices[0].message.content;
    }
}
```

**Pros:** Maintains context, natural conversation
**Cons:** Token costs grow, needs management

### Pattern 3: Specialized Agents

**Use case:** Domain-specific applications

```javascript
class PythonTutor {
    async help(question) {
        return await client.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { 
                    role: 'system', 
                    content: 'You are an expert Python tutor. Explain concepts clearly with code examples.' 
                },
                { role: 'user', content: question }
            ],
            temperature: 0.3  // Focused responses
        });
    }
}
```

**Pros:** Consistent behavior, optimized for domain
**Cons:** Less flexible

---

## Hybrid Approach: Combining Proprietary and Open Source Models

In real-world projects, the best solution often isn't choosing between OpenAI and local LLMs - it's using **both strategically**.

### Why Use a Hybrid Approach?

**Cost optimization:** Use expensive models only when necessary
**Privacy compliance:** Keep sensitive data local while leveraging cloud for general tasks
**Performance balance:** Fast local models for simple tasks, powerful cloud models for complex ones
**Reliability:** Fallback options when one service is down
**Flexibility:** Match the right tool to each specific task

### Common Hybrid Architectures

#### Pattern 1: Tiered Processing

```
Simple tasks → Local LLM (fast, free, private)
    ↓ If complex
Complex tasks → OpenAI API (powerful, accurate)
```

**Example workflow:**
```javascript
async function processQuery(query) {
    const complexity = await assessComplexity(query);
    
    if (complexity < 0.5) {
        // Use local model for simple queries
        return await localLLM.generate(query);
    } else {
        // Use OpenAI for complex reasoning
        return await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: query }]
        });
    }
}
```

**Use cases:**
- Customer support: Local model for FAQs, GPT-4 for complex issues
- Code generation: Local for simple scripts, GPT-4 for architecture
- Content moderation: Local for obvious cases, cloud for edge cases

#### Pattern 2: Privacy-Based Routing

```
Public data → OpenAI (best quality)
Sensitive data → Local LLM (private, secure)
```

**Example:**
```javascript
async function handleRequest(data, containsSensitiveInfo) {
    if (containsSensitiveInfo) {
        // Process locally - data never leaves your infrastructure
        return await localLLM.generate(data, { 
            systemPrompt: "You are a HIPAA-compliant assistant" 
        });
    } else {
        // Use cloud for better quality
        return await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: data }]
        });
    }
}
```

**Use cases:**
- Healthcare: Patient data → Local, General medical info → OpenAI
- Finance: Transaction details → Local, Market analysis → OpenAI
- Legal: Client communications → Local, Legal research → OpenAI

#### Pattern 3: Specialized Agent Ecosystem

```
Agent 1 (Local): Fast classifier
    ↓ Routes to
Agent 2 (OpenAI): Deep analyzer
    ↓ Routes to
Agent 3 (Local): Action executor
```

**Example:**
```javascript
class MultiModelAgent {
    async process(input) {
        // Step 1: Local model classifies intent (fast, cheap)
        const intent = await localLLM.classify(input);
        
        // Step 2: Route to appropriate handler
        if (intent.requiresReasoning) {
            // Complex reasoning with GPT-4
            const analysis = await openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [{ role: 'user', content: input }]
            });
            return analysis.choices[0].message.content;
        } else {
            // Simple response with local model
            return await localLLM.generate(input);
        }
    }
}
```

**Use cases:**
- Multi-stage pipelines with different complexity levels
- Agent systems where each agent has specialized capabilities
- Workflows requiring both speed and intelligence

#### Pattern 4: Development vs Production

```
Development → OpenAI (fast iteration, best results)
    ↓ Optimize
Production → Local LLM (cost-effective, private)
```

**Workflow:**
```javascript
const MODEL_PROVIDER = process.env.NODE_ENV === 'production' 
    ? 'local' 
    : 'openai';

async function generateResponse(prompt) {
    if (MODEL_PROVIDER === 'local') {
        return await localLLM.generate(prompt);
    } else {
        return await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }]
        });
    }
}
```

**Strategy:**
1. Develop with GPT-4 to get best results quickly
2. Fine-tune prompts and test thoroughly
3. Switch to local model for production
4. Fall back to OpenAI for edge cases

#### Pattern 5: Ensemble Approach

```
Query → [Local Model, OpenAI, Another API]
           ↓          ↓            ↓
        Response  Response     Response
           ↓          ↓            ↓
        Aggregator / Validator
                  ↓
            Best Response
```

**Example:**
```javascript
async function ensembleGenerate(prompt) {
    // Get responses from multiple sources
    const [local, openai, backup] = await Promise.allSettled([
        localLLM.generate(prompt),
        openaiClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }]
        }),
        backupAPI.generate(prompt)
    ]);
    
    // Use validator to pick best or combine
    return validator.selectBest([local, openai, backup]);
}
```

**Use cases:**
- Critical applications requiring high confidence
- Fact-checking and verification
- Reducing hallucinations through consensus

### Cost-Benefit Analysis

#### Scenario: Customer Support Chatbot (10,000 queries/day)

**Option A: OpenAI Only**
```
10,000 queries × 500 tokens avg = 5M tokens/day
Cost: ~$25-50/day = ~$750-1500/month
Pros: Highest quality, zero infrastructure
Cons: Expensive at scale, privacy concerns
```

**Option B: Local LLM Only**
```
Infrastructure: $100-500/month (server/GPU)
Cost: $100-500/month
Pros: Predictable costs, private, unlimited usage
Cons: Setup complexity, maintenance, lower quality
```

**Option C: Hybrid (80% local, 20% OpenAI)**
```
8,000 simple queries → Local LLM (free after setup)
2,000 complex queries → OpenAI (~$5-10/day)
Infrastructure: $100-500/month
API costs: $150-300/month
Total: $250-800/month
Pros: Cost-effective, high quality when needed, flexible
Cons: More complex architecture
```

**Winner for most projects: Hybrid approach** ✓

### Decision Framework

```
START: New query arrives
    ↓
Is data sensitive/regulated?
├─ YES → Use local model (privacy first)
└─ NO → Continue
    ↓
Is task simple/repetitive?
├─ YES → Use local model (cost-effective)
└─ NO → Continue
    ↓
Is high accuracy critical?
├─ YES → Use OpenAI (quality first)
└─ NO → Continue
    ↓
Is it high volume?
├─ YES → Use local model (cost at scale)
└─ NO → Use OpenAI (simplicity)
```

### The Future: Intelligent Model Selection

Advanced systems will automatically choose models based on real-time factors:

```javascript
class IntelligentModelSelector {
    async selectModel(query, context) {
        const factors = {
            complexity: await this.analyzeComplexity(query),
            latency: context.userTolerance,
            budget: context.remainingBudget,
            accuracy: context.requiredConfidence,
            privacy: context.dataClassification
        };
        
        // ML model predicts best provider
        const selection = await this.mlSelector.predict(factors);
        
        return {
            provider: selection.provider,  // 'local' | 'openai-mini' | 'openai-4'
            confidence: selection.confidence,
            reasoning: selection.reasoning
        };
    }
}
```

### Key Takeaway

**You don't have to choose.** Modern AI applications benefit from using the right model for each task:
- **OpenAI / Claude / Host own big open source models:** Complex reasoning, critical accuracy, rapid development
- **Local for scale:** Privacy, cost control, high volume, offline operation
- **Both for success:** Cost-effective, flexible, reliable production systems

The best architecture leverages the strengths of each approach while mitigating their weaknesses.

---

## Preparing for Agents

The concepts covered here are **foundational** for building AI agents:

### You now understand:

- **How to communicate with LLMs** (API basics)
- **How to shape behavior** (system prompts)
- **How to maintain context** (message history)
- **How to control output** (temperature, tokens)
- **How to handle responses** (streaming, errors)

### What's next for agents:

- **Function calling / Tool use** - Let the AI take actions
- **Memory systems** - Persistent state across sessions
- **ReAct patterns** - Iterative reasoning and observation

**Bottom line:** You can't build good agents without mastering these fundamentals. Every agent pattern builds on this foundation.

---

## Key Insights

1. **Statelessness is power and burden:** You control context, but you must manage it
2. **System prompts are your secret weapon:** Same model → different behaviors
3. **Temperature changes everything:** Match it to your task type
4. **Tokens are the real currency:** Monitor and optimize usage
5. **Model choice matters:** Don't use a sledgehammer for a nail
6. **Streaming improves UX:** Use it for user-facing applications
7. **Error handling is not optional:** The network will fail, plan for it

---

## Further Reading

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [Best Practices for Prompt Engineering](https://platform.openai.com/docs/guides/prompt-engineering)
- [Token Counting](https://platform.openai.com/tokenizer)



# Code Explanation: OpenAI Intro

This guide walks through each example in `openai-intro.js`, explaining how to work with OpenAI's API from the ground up.

## Requirements

Before running this example, you’ll need an OpenAI account, an API key, and a valid billing method.

### Get API Key

https://platform.openai.com/api-keys

### Add Billing Method

https://platform.openai.com/settings/organization/billing/overview

### Configure environment variables

```bash
   cp .env.example .env
```
Then edit `.env` and add your actual API key.

## Setup and Initialization

```javascript
import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
```

**What's happening:**
- `import OpenAI from 'openai'` - Import the official OpenAI SDK for Node.js
- `import 'dotenv/config'` - Load environment variables from `.env` file
- `new OpenAI({...})` - Create a client instance that handles API authentication and requests
- `process.env.OPENAI_API_KEY` - Your API key from platform.openai.com (never hardcode this!)

**Why it matters:** The client object is your interface to OpenAI's models. All API calls go through this client.

---

## Example 1: Basic Chat Completion

```javascript
const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
        { role: 'user', content: 'What is node-llama-cpp?' }
    ],
});

console.log(response.choices[0].message.content);
```

**What's happening:**
- `chat.completions.create()` - The primary method for sending messages to ChatGPT models
- `model: 'gpt-4o'` - Specifies which model to use (gpt-4o is the latest, most capable model)
- `messages` array - Contains the conversation history
- `role: 'user'` - Indicates this message comes from the user (you)
- `response.choices[0]` - The API returns an array of possible responses; we take the first one
- `message.content` - The actual text response from the AI

**Response structure:**
```javascript
{
  id: 'chatcmpl-...',
  object: 'chat.completion',
  created: 1234567890,
  model: 'gpt-4o',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: 'node-llama-cpp is a...'
      },
      finish_reason: 'stop'
    }
  ],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 50,
    total_tokens: 60
  }
}
```

---

## Example 2: System Prompts

```javascript
const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
        { role: 'system', content: 'You are a coding assistant that talks like a pirate.' },
        { role: 'user', content: 'Explain what async/await does in JavaScript.' }
    ],
});
```

**What's happening:**
- `role: 'system'` - Special message type that sets the AI's behavior and personality
- System messages are processed first and influence all subsequent responses
- The model will maintain this behavior throughout the conversation

**Why it matters:** System prompts are how you specialize AI behavior. They're the foundation of creating focused agents with specific roles (translator, coder, analyst, etc.).

**Key insight:** Same model + different system prompts = completely different agents!

---

## Example 3: Temperature Control

```javascript
// Focused response
const focusedResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
});

// Creative response
const creativeResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 1.5,
});
```

**What's happening:**
- `temperature` - Controls randomness in the output (range: 0.0 to 2.0)
- **Low temperature (0.0 - 0.3):**
    - More focused and deterministic
    - Same input → similar output
    - Best for: factual answers, code generation, data extraction
- **Medium temperature (0.7 - 1.0):**
    - Balanced creativity and coherence
    - Default for most use cases
- **High temperature (1.2 - 2.0):**
    - More creative and varied
    - Same input → very different outputs
    - Best for: creative writing, brainstorming, story generation

**Real-world usage:**
- Code completion: temperature 0.2
- Customer support: temperature 0.5
- Creative content: temperature 1.2

---

## Example 4: Conversation Context

```javascript
const messages = [
    { role: 'system', content: 'You are a helpful coding tutor.' },
    { role: 'user', content: 'What is a Promise in JavaScript?' },
];

const response1 = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
});

// Add AI response to history
messages.push(response1.choices[0].message);

// Add follow-up question
messages.push({ role: 'user', content: 'Can you show me a simple example?' });

// Second request with full context
const response2 = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: messages,
});
```

**What's happening:**
- OpenAI models are **stateless** - they don't remember previous conversations
- We maintain context by sending the entire conversation history with each request
- Each request is independent; you must include all relevant messages

**Message order in the array:**
1. System prompt (optional, but recommended first)
2. Previous user message
3. Previous assistant response
4. Current user message

**Why it matters:** This is how chatbots remember context. The full conversation is sent every time.

**Performance consideration:**
- More messages = more tokens = higher cost
- Longer conversations eventually hit token limits
- Real applications need conversation trimming or summarization strategies

---

## Example 5: Streaming Responses

```javascript
const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
        { role: 'user', content: 'Write a haiku about programming.' }
    ],
    stream: true,  // Enable streaming
});

for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
}
```

**What's happening:**
- `stream: true` - Instead of waiting for the complete response, receive it token-by-token
- `for await...of` - Iterate over the stream as chunks arrive
- `delta.content` - Each chunk contains a small piece of text (often just a word or partial word)
- `process.stdout.write()` - Write without newline to display text progressively

**Streaming vs. Non-streaming:**

**Non-streaming (default):**
```
[Request sent]
[Wait 5 seconds...]
[Full response arrives]
```

**Streaming:**
```
[Request sent]
Once [chunk arrives: "Once"]
upon [chunk arrives: " upon"]
a [chunk arrives: " a"]
time [chunk arrives: " time"]
...
```

**Why it matters:**
- Better user experience (immediate feedback)
- Appears faster even though total time is similar
- Essential for real-time chat interfaces
- Allows early processing/display of partial results

**When to use streaming:**
- Interactive chat applications
- Long-form content generation
- When user experience matters more than simplicity

**When to NOT use streaming:**
- Simple scripts or automation
- When you need the complete response before processing
- Batch processing

---

## Example 6: Token Usage

```javascript
const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
        { role: 'user', content: 'Explain recursion in 3 sentences.' }
    ],
    max_tokens: 100,
});

console.log("Token usage:");
console.log("- Prompt tokens: " + response.usage.prompt_tokens);
console.log("- Completion tokens: " + response.usage.completion_tokens);
console.log("- Total tokens: " + response.usage.total_tokens);
```

**What's happening:**
- `max_tokens` - Limits the length of the AI's response
- `response.usage` - Contains token consumption details
- **Prompt tokens:** Your input (messages you sent)
- **Completion tokens:** AI's output (the response)
- **Total tokens:** Sum of both (what you're billed for)

**Understanding tokens:**
- Tokens ≠ words
- 1 token ≈ 0.75 words (in English)
- "hello" = 1 token
- "chatbot" = 2 tokens ("chat" + "bot")
- Punctuation and spaces count as tokens

**Why it matters:**
1. **Cost control:** You pay per token
2. **Context limits:** Models have maximum token limits (e.g., gpt-4o: 128,000 tokens)
3. **Response control:** Use `max_tokens` to prevent overly long responses

**Practical limits:**
```javascript
// Prevent runaway responses
max_tokens: 150,  // ~100 words

// Brief responses
max_tokens: 50,   // ~35 words

// Longer content
max_tokens: 1000, // ~750 words
```

**Cost estimation (approximate):**
- GPT-4o: $5 per 1M input tokens, $15 per 1M output tokens
- GPT-3.5-turbo: $0.50 per 1M input tokens, $1.50 per 1M output tokens

---

## Example 7: Model Comparison

```javascript
// GPT-4o - Most capable
const gpt4Response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
});

// GPT-3.5-turbo - Faster and cheaper
const gpt35Response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
});
```

**Available models:**

| Model | Best For | Speed | Cost | Context Window |
|-------|----------|-------|------|----------------|
| `gpt-4o` | Complex tasks, reasoning, accuracy | Medium | $$$ | 128K tokens |
| `gpt-4o-mini` | Balanced performance/cost | Fast | $$ | 128K tokens |
| `gpt-3.5-turbo` | Simple tasks, high volume | Very Fast | $ | 16K tokens |

**Choosing the right model:**
- **Use GPT-4o when:**
    - Complex reasoning required
    - High accuracy is critical
    - Working with code or technical content
    - Quality > speed/cost

- **Use GPT-4o-mini when:**
    - Need good performance at lower cost
    - Most general-purpose tasks

- **Use GPT-3.5-turbo when:**
    - Simple classification or extraction
    - High-volume, low-complexity tasks
    - Speed is critical
    - Budget constraints

**Pro tip:** Start with gpt-4o for development, then evaluate if cheaper models work for your use case.

---

## Error Handling

```javascript
try {
    await basicCompletion();
} catch (error) {
    console.error("Error:", error.message);
    if (error.message.includes('API key')) {
        console.error("\nMake sure to set your OPENAI_API_KEY in a .env file");
    }
}
```

**Common errors:**
- `401 Unauthorized` - Invalid or missing API key
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - OpenAI service issue
- `Context length exceeded` - Too many tokens in conversation

**Best practices:**
- Always use try-catch with async calls
- Check error types and provide helpful messages
- Implement retry logic for transient failures
- Monitor token usage to avoid limit errors

---

## Key Takeaways

1. **Stateless Nature:** Models don't remember. You send full context each time.
2. **Message Roles:** `system` (behavior), `user` (input), `assistant` (AI response)
3. **Temperature:** Controls creativity (0 = focused, 2 = creative)
4. **Streaming:** Better UX for real-time applications
5. **Token Management:** Monitor usage for cost and limits
6. **Model Selection:** Choose based on task complexity and budget