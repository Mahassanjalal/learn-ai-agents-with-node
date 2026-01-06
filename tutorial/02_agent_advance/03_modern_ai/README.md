# 📖 Modern AI Tutorials - Phase-Based Learning

This directory contains practical implementations of modern AI patterns and techniques, organized by learning phase.

---

## 🎯 Phase Organization

### **Phase 1: Advanced Agents (Months 1-2)**
Master multi-agent coordination, tool ecosystems, and complex state management.

**Tutorials:**
- `01_parallel_orchestration.js` - Run multiple analysis tasks concurrently with `RunnableParallel`
- `02_react_math_agent.js` - Reasoning + Acting loop for multi-step problem solving
- `05_multi_agent_collaboration.js` - Multi-agent systems with message passing and orchestration
- *(More coming)*: Hierarchical agents, fallback strategies

**Key Concepts:**
- Parallel task execution and result aggregation
- ReAct pattern (Thought → Action → Observation)
- Tool/function calling with structured input/output
- Agent decision-making and control flow
- Multi-agent communication and coordination
- Workflow orchestration and state management

**Learning Outcomes:**
- ✅ Run multiple independent agents in parallel
- ✅ Implement ReAct reasoning loops
- ✅ Understand agent orchestration patterns
- ✅ Build multi-agent collaborations
- ✅ Manage message passing between agents
- ✅ Create coordinated agent workflows

---

### **Phase 2: Advanced LLM Techniques (Months 3-4)**
Deep dive into retrieval-augmented generation, fine-tuning, and model optimization.

**Tutorials:**
- `03_rag_local_search.js` - Semantic search and retrieval with cosine similarity
- `06_dynamic_prompt_optimization.js` - Learn from LLM outputs and optimize prompts iteratively
- *(More coming)*: Vector embeddings, fine-tuning workflows, model routing

**Key Concepts:**
- Retrieval-Augmented Generation (RAG) pipeline
- Semantic similarity and vector operations
- Context building from retrieved documents
- LLM output parsing and validation
- Prompt quality scoring and metrics
- Iterative prompt refinement
- Learning from LLM performance

**Learning Outcomes:**
- ✅ Implement RAG without external ML libraries
- ✅ Understand semantic search fundamentals
- ✅ Build retrieval + generation workflows
- ✅ Score prompt quality automatically
- ✅ Optimize prompts based on output analysis
- ✅ Track improvement over iterations

---

### **Phase 3: Production Systems (Months 5-6)**
Build robust, monitored, scalable agent systems.

**Tutorials:**
- `04_resilient_llm_call.js` - Retry logic, timeouts, token counting, validation
- `07_distributed_coordination.js` - Distribute agent workflows with shared state persistence
- *(More coming)*: REST API servers, WebSocket streaming, monitoring dashboards

**Key Concepts:**
- Error handling with exponential backoff
- Timeout management for hung operations
- Token counting and context budgeting
- Schema validation for structured outputs
- Comprehensive logging and observability
- Distributed agent coordination
- Shared state management across processes
- Workflow persistence and recovery

**Learning Outcomes:**
- ✅ Build resilient LLM calls with retry/timeout
- ✅ Manage tokens and context windows
- ✅ Validate structured LLM outputs
- ✅ Monitor agent execution
- ✅ Distribute agents across processes
- ✅ Persist and recover agent workflows
- ✅ Coordinate distributed agent systems

---

### **Phase 4: Cutting-Edge Topics (Months 7+)**
Explore emerging techniques: self-improvement, hybrid systems, interpretability.

**Tutorials:**
- `08_self_improving_agents.js` - Agents that learn from outcomes and improve over time
- `09_neuro_symbolic_reasoning.js` - Combine neural networks with logical rule systems
- `10_attention_visualization.js` - Understand what the agent/model is focusing on

**Key Concepts:**
- Self-reflection and performance metrics
- Learning from execution history
- Memory-based improvement strategies
- Hybrid neuro-symbolic systems
- Rule engines and formal logic
- Attention mechanisms and focus
- Model interpretability
- Visualization of agent decision-making

**Learning Outcomes:**
- ✅ Implement self-improving agent loops
- ✅ Track and analyze agent performance
- ✅ Build rule-based reasoning systems
- ✅ Combine symbolic and neural approaches
- ✅ Visualize attention distributions
- ✅ Understand model focus and reasoning
- ✅ Explain agent decision-making

---

## 🚀 Quick Start

### Run Phase 1 Tutorials
```bash
# Parallel orchestration (no LLM needed)
node 01_parallel_orchestration.js

# ReAct math agent (requires Qwen model)
node 02_react_math_agent.js

# Multi-agent collaboration (no LLM needed)
node 05_multi_agent_collaboration.js
```

### Run Phase 2 Tutorials
```bash
# RAG semantic search (no LLM needed)
node 03_rag_local_search.js

# Dynamic prompt optimization (mocked LLM)
node 06_dynamic_prompt_optimization.js
```

### Run Phase 3 Tutorials
```bash
# Resilient LLM patterns (mocked LLM)
node 04_resilient_llm_call.js

# Distributed agent coordination (no external deps)
node 07_distributed_coordination.js
```

### Run Phase 4 Tutorials
```bash
# Self-improving agents (file-based persistence)
node 08_self_improving_agents.js

# Neuro-symbolic reasoning (rule engine + logic)
node 09_neuro_symbolic_reasoning.js

# Attention visualization (token tracking)
node 10_attention_visualization.js
```

---

## 📊 Tutorial Matrix

| Phase | Tutorial | File | Dependencies | Requires Model | Topics |
|-------|----------|------|--------------|---|---------|
| 1 | Parallel Orchestration | `01_parallel_orchestration.js` | Core only | ❌ | Parallel execution, RunnableParallel |
| 1 | ReAct Math Agent | `02_react_math_agent.js` | node-llama-cpp | ✅ | ReAct, tool calling, reasoning loops |
| 1 | Multi-Agent Collaboration | `05_multi_agent_collaboration.js` | Core + helpers | ❌ | Agent coordination, message passing, orchestration |
| 2 | RAG Semantic Search | `03_rag_local_search.js` | Core + helpers | ❌ | Semantic search, RAG, vector operations |
| 2 | Dynamic Prompt Optimization | `06_dynamic_prompt_optimization.js` | Core + utils | ❌ | Prompt quality, optimization, iterative refinement |
| 3 | Resilient LLM Calls | `04_resilient_llm_call.js` | Core + utils | ❌ | Retry, timeout, token count, validation |
| 3 | Distributed Coordination | `07_distributed_coordination.js` | Core + helpers | ❌ | Distributed workflows, shared state, persistence |
| 4 | Self-Improving Agents | `08_self_improving_agents.js` | Core + helpers | ❌ | Self-reflection, learning, performance tracking |
| 4 | Neuro-Symbolic Reasoning | `09_neuro_symbolic_reasoning.js` | Core | ❌ | Rule engines, hybrid AI, logical reasoning |
| 4 | Attention Visualization | `10_attention_visualization.js` | Core | ❌ | Attention tracking, interpretability, focus analysis |

---

## 🎓 Learning Path Recommendation

1. **Start with Phase 1** - Build comfort with parallel execution and ReAct
2. **Move to Phase 2** - Understand retrieval-augmented approaches
3. **Study Phase 3** - Learn production-grade resilience patterns
4. **Explore Phase 4** - Research cutting-edge techniques (coming soon)

---

## 💡 Key Classes Used

### From `core/`
- `Runnable` - Base class for all components
- `RunnableParallel` - Execute multiple runnables concurrently
- `RunnableConfig` - Control execution with callbacks and metadata

### From `helpers/`
- `JsonParser` - Robustly parse LLM JSON output
- `PromptDebugger` - Inspect exact prompts sent to models
- `MemoryManager` - Persist agent state

### From `utils/`
- `RetryManager` - Exponential backoff retry logic
- `TimeoutManager` - Enforce timeout on async operations
- `TokenCounter` - Count and budget tokens
- `SchemaValidator` - Validate JSON against schemas
- `Logger` - Structured logging with levels

---

## 📝 Each Tutorial Explains

Every tutorial file includes:
- Clear phase and topic header
- Real-world use case description
- Step-by-step implementation
- Key concepts highlighted
- Usage examples
- Common patterns
- Extension ideas

---

## 🔗 Related Reading

- [Main README Learning Path](../../README.md#-learning-path)
- [Phase Roadmap](../../README.md#-future-learning-topics)
- Concept docs in [docs/](../../docs/)
- Foundation tutorials in [01_agent_fundamentals/](../01_agent_fundamentals/)

---

## 🎯 Next Implementations

**Phase 1 - Coming Soon:**
- ✅ Multi-agent collaboration with message passing
- Hierarchical agent coordination
- Fallback strategies for agent failures
- Dynamic team composition

**Phase 2 - Coming Soon:**
- ✅ Dynamic prompt optimization
- Fine-tuning patterns with domain data
- Model selection and routing
- Cost optimization strategies

**Phase 3 - Coming Soon:**
- ✅ Distributed agent coordination
- REST API for agents
- WebSocket streaming for real-time updates
- Health monitoring and dashboards

**Phase 4 - Complete:**
- ✅ Self-improving agent loops
- ✅ Symbolic reasoning integration
- ✅ Interpretability and visualization

---

**Status:** 🚀 All 4 phases with 10 tutorials complete! Comprehensive learning path available.

*Last Updated: January 2026*
