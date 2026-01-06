// Phase 1: Multi-Agent Collaboration with Message Passing
// Demonstrates agents communicating and working together to solve a problem.

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { HumanMessage, AIMessage, SystemMessage } from "../../../core/message.js";
import { Logger } from "../../../utils/logger.js";

/**
 * Represents a single agent in a multi-agent system.
 * Agents can:
 * - Process messages
 * - Maintain internal state
 * - Communicate with other agents
 */
class Agent extends Runnable {
  constructor(name, role, collaborators = {}) {
    super();
    this.agentName = name;
    this.role = role;
    this.collaborators = collaborators;
    this.messageHistory = [];
    this.logger = new Logger({ level: "info", prefix: `[${name}]` });
  }

  /**
   * Core agent logic - process input and decide on action
   */
  async _call(input, config) {
    // Add to history
    const msgIn = new HumanMessage(input);
    this.messageHistory.push(msgIn);

    // Simulate agent thinking
    this.logger.info(`Processing: "${input}"`);

    // Generate response
    const response = await this._generateResponse(input, config);

    // Store response
    const msgOut = new AIMessage(response, { fromAgent: this.agentName });
    this.messageHistory.push(msgOut);

    return response;
  }

  /**
   * Generate response - override in subclasses or use logic here
   */
  async _generateResponse(input, config) {
    // Example: Analyst agent
    if (this.agentName === "analyst") {
      return `Analysis of "${input}": Extract key insights.`;
    }
    // Example: Summarizer agent
    if (this.agentName === "summarizer") {
      return `Summary: "${input}" reduced to essentials.`;
    }
    // Example: Reviewer agent
    if (this.agentName === "reviewer") {
      return `Review: "${input}" meets quality standards.`;
    }
    return `Response from ${this.agentName}: ${input}`;
  }

  /**
   * Collaborate with another agent
   */
  async collaborateWith(agentName, message) {
    const agent = this.collaborators[agentName];
    if (!agent) {
      this.logger.warn(`Unknown collaborator: ${agentName}`);
      return null;
    }
    return await agent.invoke(message);
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.messageHistory.map(m => ({
      type: m.type,
      content: m.content,
      timestamp: new Date(m.timestamp).toISOString()
    }));
  }
}

/**
 * Coordinator orchestrates multi-agent workflow
 */
class AgentCoordinator extends Runnable {
  constructor(agents = {}) {
    super();
    this.agents = agents;
    this.workflow = [];
    this.logger = new Logger({ level: "info", prefix: "[Coordinator]" });
  }

  /**
   * Define sequential workflow of agents
   */
  defineWorkflow(steps) {
    // steps = [{ agent: 'analyst', input: 'text' }, ...]
    this.workflow = steps;
  }

  /**
   * Execute workflow
   */
  async _call(initialInput, config) {
    let input = initialInput;
    const results = {};

    for (const step of this.workflow) {
      const { agent: agentName, input: agentInput } = step;
      const agent = this.agents[agentName];

      if (!agent) {
        this.logger.warn(`Unknown agent: ${agentName}`);
        continue;
      }

      const finalInput = agentInput || input;
      this.logger.info(`Executing: ${agentName}`);

      const output = await agent.invoke(finalInput, config);
      results[agentName] = output;
      input = output; // Pass output as input to next step
    }

    return results;
  }
}

async function main() {
  const config = new RunnableConfig({
    metadata: { lesson: "multi-agent-collaboration" },
    tags: ["phase1", "agents"]
  });

  // Create agents
  const analyst = new Agent("analyst", "data analyst");
  const summarizer = new Agent("summarizer", "summarizer");
  const reviewer = new Agent("reviewer", "quality reviewer");

  // Set up collaboration
  analyst.collaborators = { summarizer, reviewer };
  summarizer.collaborators = { analyst, reviewer };
  reviewer.collaborators = { analyst, summarizer };

  // Create coordinator
  const coordinator = new AgentCoordinator({
    analyst,
    summarizer,
    reviewer
  });

  // Define workflow
  coordinator.defineWorkflow([
    { agent: "analyst", input: "Node.js with local LLMs enables privacy-preserving AI." },
    { agent: "summarizer" }, // Input from previous step
    { agent: "reviewer" } // Input from previous step
  ]);

  // Execute
  console.log("\n=== Multi-Agent Collaboration Workflow ===\n");
  const results = await coordinator.invoke("", config);

  console.log("\n=== Workflow Results ===");
  Object.entries(results).forEach(([agent, output]) => {
    console.log(`${agent}: ${output}`);
  });

  // Show histories
  console.log("\n=== Agent Message Histories ===");
  [analyst, summarizer, reviewer].forEach(agent => {
    console.log(`\n${agent.agentName} history:`);
    agent.getHistory().forEach(msg => {
      console.log(`  [${msg.type}] ${msg.content}`);
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
