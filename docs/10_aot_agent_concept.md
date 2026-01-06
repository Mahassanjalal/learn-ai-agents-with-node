# Concept: Atom of Thought (AoT) Pattern for AI Agents

## The Core Idea

**Atom of Thought = "SQL for Reasoning"**

Just as SQL breaks complex data operations into atomic, composable statements, AoT breaks reasoning into minimal, executable steps.

## What is an Atom?

An atom is the **smallest unit of reasoning** that:
1. Expresses exactly **one** idea
2. Can be **validated independently**
3. Can be **executed deterministically**
4. **Cannot hide** a mistake

### Examples

❌ **Not atomic** (compound statement):
```
"Search for rooms in Graz and filter by capacity"
```

✅ **Atomic** (separate steps):
```
1. Search for rooms in Graz
2. Filter rooms by minimum capacity of 30
```

## The Three Layers
```
┌─────────────────────────────────┐
│   LLM (Planning Layer)          │
│   - Proposes atomic plan        │
│   - Does NOT execute            │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   Validator (Safety Layer)      │
│   - Checks plan structure       │
│   - Validates dependencies      │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│   Executor (Execution Layer)    │
│   - Runs atoms deterministically│
│   - Manages state               │
└─────────────────────────────────┘
```

## Why Separation Matters

### Traditional LLM Approach (ReAct)
```
LLM thinks → LLM acts → LLM thinks → LLM acts
```
**Problem:** Execution logic lives inside the model (black box)

### Atom of Thought Approach
```
LLM plans → System validates → System executes
```
**Benefit:** Execution logic lives in code (white box)

## Mental Model

Think of AoT as the difference between:

| Cooking | Programming |
|---------|------------|
| **Recipe** (AoT plan) | **Algorithm** |
| "Boil water" | `boilWater()` |
| "Add pasta" | `addPasta()` |
| "Cook 8 minutes" | `cook(8)` |

vs.

| Improvising | Natural Language |
|-------------|------------------|
| "Make dinner" | "Figure it out" |
| (figure it out) | (hallucinate) |

## The Atom Structure
```javascript
{
  "id": 2,
  "kind": "tool",           // tool | decision | final
  "name": "multiply",       // operation name
  "input": {                // explicit inputs
    "a": "<result_of_1>",   // reference to previous result
    "b": 3
  },
  "dependsOn": [1]          // must wait for atom 1
}
```

**Why this structure?**
- `id`: Establishes order
- `kind`: Categorizes operation type
- `name`: References executable function
- `input`: Makes data flow explicit
- `dependsOn`: Declares dependencies

## Dependency Graph

Atoms form a **directed acyclic graph (DAG)**:
```
     ┌─────┐
     │  1  │ add(15, 7)
     └──┬──┘
        │
     ┌──▼──┐
     │  2  │ multiply(result_1, 3)
     └──┬──┘
        │
     ┌──▼──┐
     │  3  │ subtract(result_2, 10)
     └──┬──┘
        │
     ┌──▼──┐
     │  4  │ final
     └─────┘
```

**Properties:**
- Can be executed in topological order
- Can parallelize independent branches
- Failures stop at failed node
- Easy to visualize and debug

## State Management
```javascript
const state = {};

// After atom 1
state[1] = 22;  // result of add(15, 7)

// After atom 2
state[2] = 66;  // result of multiply(22, 3)

// After atom 3
state[3] = 56;  // result of subtract(66, 10)
```

**State is:**
- Explicit (key-value map)
- Immutable per atom (no overwrites)
- Traceable (full history)
- Inspectable (debugging)

## Comparison: AoT vs ReAct

### Question: "What is (15 + 7) × 3 - 10?"

#### ReAct Output (text):
```
Thought: I need to add 15 and 7 first
Action: add(15, 7)
Observation: 22
Thought: Now multiply by 3
Action: multiply(22, 3)
Observation: 66
Thought: Finally subtract 10
Action: subtract(66, 10)
Observation: 56
Answer: 56
```

#### AoT Output (JSON):
```json
{
  "atoms": [
    {"id": 1, "kind": "tool", "name": "add", "input": {"a": 15, "b": 7}},
    {"id": 2, "kind": "tool", "name": "multiply", "input": {"a": "<result_of_1>", "b": 3}, "dependsOn": [1]},
    {"id": 3, "kind": "tool", "name": "subtract", "input": {"a": "<result_of_2>", "b": 10}, "dependsOn": [2]},
    {"id": 4, "kind": "final", "name": "report", "dependsOn": [3]}
  ]
}
```

### Key Differences

| Aspect | ReAct | AoT |
|--------|-------|-----|
| **Format** | Natural language | Structured data |
| **Validation** | Impossible | Before execution |
| **Testing** | Mock entire LLM | Test executor independently |
| **Debugging** | Read through text | Inspect atom N |
| **Replay** | Re-run entire conversation | Re-run from any atom |
| **Audit trail** | Conversational history | Data structure |

## When AoT Shines

### ✅ Perfect for:
- **Multi-step workflows** (booking, pipelines)
- **API orchestration** (call A, then B with A's result)
- **Financial transactions** (auditable, reversible)
- **Compliance-sensitive systems** (every step logged)
- **Production agents** (failures must be clean)

### ❌ Not ideal for:
- **Creative writing**
- **Open-ended exploration**
- **Brainstorming**
- **Single-step queries**

## Real-World Analogy

**ReAct is like a chef improvising:**
- Flexible
- Creative
- Hard to replicate exactly
- Mistakes hidden in process

**AoT is like following a recipe:**
- Repeatable
- Testable
- Step X failed? Start from step X-1
- Every ingredient and action is explicit

## The Hidden Benefit: Debuggability

When something goes wrong:

**ReAct:**
```
"The model said something weird in iteration 7"
→ Re-read entire conversation
→ Guess where it went wrong
→ Hope it doesn't happen again
```

**AoT:**
```
"Atom 3 failed with 'Division by zero'"
→ Look at atom 3's inputs
→ Check where those inputs came from (atom 1, 2)
→ Fix tool or add validation
→ Re-run from atom 3
```

## Implementation Checklist

✅ **LLM side:**
- [ ] System prompt enforces JSON output
- [ ] Grammar constrains to valid schema
- [ ] Atoms are minimal (one operation each)
- [ ] Dependencies are explicit

✅ **System side:**
- [ ] Validator checks tool names
- [ ] Validator checks dependencies
- [ ] Executor resolves references
- [ ] Executor is deterministic
- [ ] State is immutable

## The Bottom Line

**ReAct asks:**
"What would an intelligent agent say next?"

**AoT asks:**
"What is the minimal, executable plan?"

For production systems, you want the second question.



# Code Explanation: aot-agent.js

This example demonstrates the **Atom of Thought** prompting pattern using a mathematical calculator as the domain.

## Three-Phase Architecture

### Phase 1: Planning (LLM)
```javascript
async function generatePlan(userPrompt) {
    const grammar = await llama.createGrammarForJsonSchema(planSchema);
    const planText = await session.prompt(userPrompt, { grammar });
    return grammar.parse(planText);
}
```

**Key points:**
- LLM outputs **structured JSON** (enforced by grammar)
- LLM does NOT execute calculations
- Each atom represents one operation
- Dependencies are explicit (`dependsOn` array)

**Example output:**
```json
{
  "atoms": [
    {"id": 1, "kind": "tool", "name": "add", "input": {"a": 15, "b": 7}},
    {"id": 2, "kind": "tool", "name": "multiply", "input": {"a": "<result_of_1>", "b": 3}},
    {"id": 3, "kind": "tool", "name": "subtract", "input": {"a": "<result_of_2>", "b": 10}},
    {"id": 4, "kind": "final", "name": "report", "dependsOn": [3]}
  ]
}
```

### Phase 2: Validation (System)
```javascript
function validatePlan(plan) {
    const allowedTools = new Set(Object.keys(tools));
    
    for (const atom of plan.atoms) {
        if (ids.has(atom.id)) throw new Error(`Duplicate ID`);
        if (atom.kind === "tool" && !allowedTools.has(atom.name)) {
            throw new Error(`Unknown tool: ${atom.name}`);
        }
    }
}
```

**Validates:**
- No duplicate atom IDs
- Only allowed tools are referenced
- Dependencies make sense
- JSON structure is correct

### Phase 3: Execution (System)
```javascript
function executePlan(plan) {
    const state = {};
    
    for (const atom of sortedAtoms) {
        // Resolve dependencies
        let resolvedInput = {};
        for (const [key, value] of Object.entries(atom.input)) {
            if (value.startsWith('<result_of_')) {
                const refId = parseInt(value.match(/\d+/)[0]);
                resolvedInput[key] = state[refId];
            }
        }
        
        // Execute
        state[atom.id] = tools[atom.name](resolvedInput.a, resolvedInput.b);
    }
}
```

**Key behaviors:**
- Executes atoms in order (sorted by ID)
- Resolves `<result_of_N>` references from state
- Each atom stores its result in `state[atom.id]`
- Execution is **deterministic** (same plan + same state = same result)

## Why This Matters

### Comparison with ReAct

| Aspect | ReAct | Atom of Thought |
|--------|-------|-----------------|
| **Planning** | Implicit (in LLM reasoning) | Explicit (JSON structure) |
| **Execution** | LLM decides next step | System follows plan |
| **Validation** | None | Before execution |
| **Debugging** | Hard (trace through text) | Easy (inspect atoms) |
| **Testing** | Hard (mock LLM) | Easy (test executor) |
| **Failures** | May hallucinate | Fail at specific atom |

### Benefits

1. **No hidden reasoning**: Every operation is an explicit atom
2. **Testable**: Execute plan without LLM involvement
3. **Debuggable**: Know exactly which atom failed
4. **Auditable**: Plan is a data structure, not text
5. **Deterministic**: Same input = same output (given same plan)

## Tool Implementation

Tools are **pure functions** with no side effects:
```javascript
const tools = {
    add: (a, b) => {
        const result = a + b;
        console.log(`EXECUTING: add(${a}, ${b}) = ${result}`);
        return result;
    },
    // ... more tools
};
```

**Why pure functions?**
- Easy to test
- Easy to replay
- No hidden state
- Composable

## State Flow
```
User Question
      ↓
[LLM generates plan]
      ↓
{atoms: [...]} ← JSON plan
      ↓
[System validates]
      ↓
Plan valid
      ↓
[System executes atom 1] → state[1] = result
      ↓
[System executes atom 2] → state[2] = result (uses state[1])
      ↓
[System executes atom 3] → state[3] = result (uses state[2])
      ↓
Final Answer
```

## Error Handling
```javascript
// Atom validation fails → re-prompt LLM
validatePlan(plan); // throws if invalid

// Tool execution fails → stop at that atom
if (b === 0) throw new Error("Division by zero");

// Dependency missing → clear error message
if (!(depId in state)) {
    throw new Error(`Atom ${atom.id} depends on incomplete atom ${depId}`);
}
```

## When to Use AoT

✅ **Use AoT when:**
- Execution must be auditable
- Failures must be recoverable
- Multiple steps with dependencies
- Testing is important
- Compliance matters

❌ **Don't use AoT when:**
- Single-step tasks
- Creative/exploratory tasks
- Brainstorming
- Natural conversation

## Extension Ideas

1. **Add compensation atoms** for rollback
2. **Add retry logic** per atom
3. **Parallelize independent atoms** (atoms with no shared dependencies)
4. **Persist plan** for debugging
5. **Visualize atom graph** (dependency tree)