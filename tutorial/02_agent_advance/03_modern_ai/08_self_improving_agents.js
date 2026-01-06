// Phase 4: Self-Improving Agents - Learn from outcomes and refine behavior
// Demonstrates how agents can analyze their own performance and improve.

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { MemoryManager } from "../../../helpers/memory-manager.js";
import { Logger } from "../../../utils/logger.js";

/**
 * Self-improving agent learns from every interaction
 */
class SelfImprovingAgent extends Runnable {
  constructor(name) {
    super();
    this.agentName = name;
    this.logger = new Logger({ level: "info", prefix: `[${name}]` });
    this.memory = new MemoryManager(`./memories-${name}.json`);

    // Track performance metrics
    this.metrics = {
      totalTasks: 0,
      successful: 0,
      failed: 0,
      avgQuality: 0,
      improvements: []
    };
  }

  async _call(input, config) {
    this.metrics.totalTasks++;

    // Load learned strategies
    const strategies = await this.memory.loadMemories();

    // Execute task
    const { output, success, quality } = await this._executeTask(input, strategies);

    // Learn from outcome
    if (success) {
      this.metrics.successful++;
    } else {
      this.metrics.failed++;
    }

    // Update quality metric
    this.metrics.avgQuality = 
      (this.metrics.avgQuality * (this.metrics.totalTasks - 1) + quality) / this.metrics.totalTasks;

    // Extract and store learnings
    const learning = {
      taskType: this._classifyTask(input),
      approach: this._getApproachUsed(input),
      quality,
      success,
      lesson: success ? "This works!" : "Try different approach next time"
    };

    await this.memory.addMemory({
      type: "learning",
      key: `task_${this.metrics.totalTasks}`,
      value: JSON.stringify(learning),
      source: "self-observation"
    });

    // Self-reflect and suggest improvement
    if (this.metrics.totalTasks % 3 === 0) {
      const improvement = await this._reflectAndImprove();
      if (improvement) {
        this.metrics.improvements.push(improvement);
        this.logger.info(`Self-improvement: ${improvement}`);
      }
    }

    return { output, quality, metrics: this.getMetrics() };
  }

  /**
   * Simulate task execution
   */
  async _executeTask(input, strategies) {
    // Base quality
    let quality = 5;

    // Try to use learned strategies
    if (strategies.memories && strategies.memories.length > 0) {
      const learned = strategies.memories.filter(m => m.type === "learning");
      if (learned.length > 0) {
        quality += 2; // Learned approaches are better
        this.logger.info(`Using ${learned.length} learned strategies`);
      }
    }

    // Randomly vary success
    const success = Math.random() > 0.3;
    if (!success) quality -= 2;

    return { output: `Processed "${input}"`, success, quality: Math.max(1, quality) };
  }

  /**
   * Classify task type from input
   */
  _classifyTask(input) {
    if (input.includes("analyze")) return "analysis";
    if (input.includes("generate")) return "generation";
    if (input.includes("validate")) return "validation";
    return "general";
  }

  /**
   * Determine which approach was used
   */
  _getApproachUsed(input) {
    return this.metrics.totalTasks % 2 === 0 ? "approach_A" : "approach_B";
  }

  /**
   * Self-reflection and improvement
   */
  async _reflectAndImprove() {
    const successRate = this.metrics.successful / this.metrics.totalTasks;

    if (successRate < 0.5) {
      return "Success rate low - try different approach";
    }
    if (this.metrics.avgQuality > 7) {
      return "Quality improving - refine current approach";
    }
    if (this.metrics.failed > 2) {
      return "Multiple failures detected - fundamental strategy change needed";
    }

    return null;
  }

  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      total: this.metrics.totalTasks,
      successful: this.metrics.successful,
      failed: this.metrics.failed,
      successRate: (this.metrics.successful / this.metrics.totalTasks * 100).toFixed(1) + "%",
      avgQuality: this.metrics.avgQuality.toFixed(1),
      improvements: this.metrics.improvements
    };
  }
}

/**
 * Multi-run simulation showing improvement over time
 */
async function demonstrateSelfImprovement() {
  const agent = new SelfImprovingAgent("learning-agent");

  console.log("\n=== Self-Improving Agent Demo ===\n");
  console.log("Running agent 9 times to show learning and improvement...\n");

  const config = new RunnableConfig({
    metadata: { lesson: "self-improvement" },
    tags: ["phase4", "learning"]
  });

  const tasks = [
    "analyze customer feedback",
    "generate product recommendations",
    "validate user input",
    "analyze performance metrics",
    "generate code snippet",
    "validate API response",
    "analyze market trends",
    "generate test cases",
    "validate schema"
  ];

  for (let i = 0; i < tasks.length; i++) {
    const result = await agent.invoke(tasks[i], config);
    
    console.log(`Task ${i + 1}: "${tasks[i]}"`);
    console.log(`  Quality: ${result.quality.toFixed(1)}/10`);
    console.log(`  Success Rate: ${result.metrics.successRate}`);
    
    if (result.metrics.improvements.length > 0) {
      console.log(`  💡 Self-Improvement: ${result.metrics.improvements[result.metrics.improvements.length - 1]}`);
    }
    console.log();
  }

  // Final metrics
  console.log("=== Final Metrics ===");
  const finalMetrics = agent.getMetrics();
  Object.entries(finalMetrics).forEach(([key, value]) => {
    if (key === "improvements") {
      console.log(`${key}:`);
      value.forEach(imp => console.log(`  - ${imp}`));
    } else {
      console.log(`${key}: ${value}`);
    }
  });
}

/**
 * Show agent learning patterns
 */
async function showLearningPatterns() {
  const agent = new SelfImprovingAgent("pattern-agent");
  const config = new RunnableConfig({});

  console.log("\n=== Learning Pattern Analysis ===\n");

  // Run several tasks
  for (let i = 0; i < 6; i++) {
    const input = `task_${i}`;
    await agent.invoke(input, config);
  }

  // Show patterns
  const memories = await agent.memory.loadMemories();
  console.log("Learned patterns:");
  memories.memories.forEach((mem, idx) => {
    if (mem.type === "learning") {
      const learning = JSON.parse(mem.value);
      console.log(`\nLearning ${idx + 1}:`);
      console.log(`  Task Type: ${learning.taskType}`);
      console.log(`  Approach: ${learning.approach}`);
      console.log(`  Quality: ${learning.quality}/10`);
      console.log(`  Success: ${learning.success}`);
    }
  });
}

async function main() {
  await demonstrateSelfImprovement();
  await showLearningPatterns();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
