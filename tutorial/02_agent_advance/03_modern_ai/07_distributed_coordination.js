// Phase 3: Distributed Agent Coordination with State Management
// Coordinate agents across different processes/systems with shared state.

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { MemoryManager } from "../../../helpers/memory-manager.js";
import { Logger } from "../../../utils/logger.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Shared state backend for distributed agents
 * In real system, this would be Redis, Postgres, etc.
 */
class SharedStateBackend {
  constructor(storePath) {
    this.storePath = storePath;
    this.logger = new Logger({ level: "info", prefix: "[SharedState]" });
  }

  async read(key) {
    try {
      const data = await fs.readFile(path.join(this.storePath, `${key}.json`), "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async write(key, value) {
    await fs.mkdir(this.storePath, { recursive: true });
    await fs.writeFile(path.join(this.storePath, `${key}.json`), JSON.stringify(value, null, 2));
    this.logger.info(`Wrote ${key}`);
  }

  async append(key, value) {
    const existing = (await this.read(key)) || [];
    existing.push({ ...value, timestamp: Date.now() });
    await this.write(key, existing);
  }
}

/**
 * Distributed agent with access to shared state
 */
class DistributedAgent extends Runnable {
  constructor(name, role, sharedState) {
    super();
    this.agentName = name;
    this.role = role;
    this.sharedState = sharedState;
    this.logger = new Logger({ level: "info", prefix: `[${name}]` });
  }

  async _call(input, config) {
    this.logger.info(`Processing: "${input}"`);

    // Read shared context
    const context = (await this.sharedState.read("context")) || { messages: [] };

    // Process with context
    const result = await this._process(input, context);

    // Update shared state
    await this.sharedState.append("messages", {
      agent: this.agentName,
      input,
      output: result,
      role: this.role
    });

    return result;
  }

  async _process(input, context) {
    // Simulate agent processing
    if (this.role === "validator") {
      const isValid = input.length > 5;
      return { valid: isValid, reason: isValid ? "Valid input" : "Too short" };
    }
    if (this.role === "processor") {
      return { processed: input.toUpperCase(), length: input.length };
    }
    if (this.role === "finalizer") {
      const prevMessages = context.messages || [];
      return { summary: `Processed ${prevMessages.length} messages before this.` };
    }
    return { output: input };
  }
}

/**
 * Coordinator manages distributed workflow
 */
class DistributedCoordinator extends Runnable {
  constructor(sharedState) {
    super();
    this.sharedState = sharedState;
    this.logger = new Logger({ level: "info", prefix: "[Coordinator]" });
    this.agents = {};
  }

  registerAgent(name, agent) {
    this.agents[name] = agent;
    this.logger.info(`Registered agent: ${name}`);
  }

  async _call(input, config) {
    // Clear shared state for fresh run
    await this.sharedState.write("context", { initialized: Date.now() });

    const agentSequence = ["validator", "processor", "finalizer"];
    let result = input;

    for (const roleName of agentSequence) {
      const agent = Object.values(this.agents).find(a => a.role === roleName);
      if (!agent) continue;

      result = await agent.invoke(result, config);
      this.logger.info(`${agent.agentName} completed`);
    }

    return result;
  }

  async getExecutionLog() {
    return await this.sharedState.read("messages");
  }
}

async function main() {
  const storePath = path.join(__dirname, ".distributed-state");
  const sharedState = new SharedStateBackend(storePath);

  // Create coordinator and agents
  const coordinator = new DistributedCoordinator(sharedState);

  const validator = new DistributedAgent("validator-1", "validator", sharedState);
  const processor = new DistributedAgent("processor-1", "processor", sharedState);
  const finalizer = new DistributedAgent("finalizer-1", "finalizer", sharedState);

  coordinator.registerAgent("validator", validator);
  coordinator.registerAgent("processor", processor);
  coordinator.registerAgent("finalizer", finalizer);

  // Execute distributed workflow
  console.log("\n=== Distributed Agent Coordination ===\n");
  const config = new RunnableConfig({
    metadata: { session: "distributed-demo" },
    tags: ["phase3", "distributed"]
  });

  const result = await coordinator.invoke("Hello World", config);
  console.log("\nFinal Result:", result);

  // Show execution log
  const log = await coordinator.getExecutionLog();
  console.log("\n=== Execution Log ===");
  log.forEach((entry, i) => {
    console.log(`\nStep ${i + 1}: ${entry.agent} (${entry.role})`);
    console.log(`  Input: ${JSON.stringify(entry.input).slice(0, 50)}`);
    console.log(`  Output: ${JSON.stringify(entry.output).slice(0, 50)}`);
  });

  console.log(`\n✓ State persisted to ${storePath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
