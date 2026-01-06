// Phase 4: Attention Visualization - Understand what the agent is focusing on
// Demonstrates how to track and visualize model attention across tokens

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { Logger } from "../../../utils/logger.js";

/**
 * Attention tracker for model outputs
 */
class AttentionTracker {
  constructor() {
    this.logger = new Logger({ level: "info", prefix: "[Attention]" });
    this.attentionHistory = [];
  }

  /**
   * Simulate attention distribution over tokens
   */
  calculateAttention(tokens, focusIndices = []) {
    // Initialize uniform distribution
    const attention = tokens.map(() => 1 / tokens.length);

    // Boost attention on focus indices
    focusIndices.forEach(idx => {
      if (idx < tokens.length) {
        attention[idx] = Math.min(1, attention[idx] * 3);
      }
    });

    // Normalize
    const sum = attention.reduce((a, b) => a + b, 0);
    return attention.map(a => a / sum);
  }

  /**
   * Track attention over generation steps
   */
  trackGeneration(inputTokens, generationSteps) {
    const history = [];

    for (let step = 0; step < generationSteps; step++) {
      // Calculate which tokens the model focuses on at this step
      const focusIndices = this._selectAttentionFocus(inputTokens, step);
      const attention = this.calculateAttention(inputTokens, focusIndices);

      history.push({
        step,
        focusTokenIndices: focusIndices,
        attentionDistribution: attention.map(a => a.toFixed(3))
      });
    }

    this.attentionHistory = history;
    return history;
  }

  /**
   * Simulate attention focus selection (in real model, computed by attention heads)
   */
  _selectAttentionFocus(tokens, step) {
    // Early steps: focus on question/task
    if (step < 2) {
      const questionIndices = tokens
        .map((t, i) => t.includes("?") ? i : -1)
        .filter(i => i !== -1);
      return questionIndices.slice(0, 3);
    }

    // Middle steps: focus on relevant context
    const focusIndices = [];
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].length > 3) focusIndices.push(i);
    }
    return focusIndices.slice(0, Math.min(5, focusIndices.length));
  }

  /**
   * Visualize attention as ASCII heatmap
   */
  visualizeAttention(attention, tokens) {
    console.log("\n📊 Attention Distribution:");
    console.log("─".repeat(60));

    // Tokens with attention bars
    tokens.forEach((token, i) => {
      const att = attention[i];
      const barLength = Math.round(att * 40);
      const bar = "█".repeat(barLength);
      console.log(`${token.padEnd(12)} │ ${bar} ${(att * 100).toFixed(1)}%`);
    });

    console.log("─".repeat(60));
  }

  /**
   * Create heatmap matrix
   */
  createHeatmap(tokens, attentionSequence) {
    console.log("\n🔥 Attention Heatmap (Token × Generation Step):");
    console.log("─".repeat(70));

    // Header with step numbers
    let header = "Token".padEnd(12) + "│";
    for (let i = 0; i < Math.min(8, attentionSequence.length); i++) {
      header += ` Step${i} │`;
    }
    console.log(header);
    console.log("─".repeat(70));

    // Rows for each token
    tokens.slice(0, 8).forEach((token, tokenIdx) => {
      let row = token.padEnd(12) + "│";
      
      for (let step = 0; step < Math.min(8, attentionSequence.length); step++) {
        const att = parseFloat(attentionSequence[step].attentionDistribution[tokenIdx]);
        const intensity = Math.round(att * 5); // 0-5 scale
        const symbol = ["░", "▒", "▓", "█", "█", "█"][intensity]; // Heat intensity
        row += `   ${symbol}    │`;
      }
      
      console.log(row);
    });

    console.log("─".repeat(70));
  }
}

/**
 * Agent with attention awareness
 */
class AttentionAwareAgent extends Runnable {
  constructor() {
    super();
    this.attentionTracker = new AttentionTracker();
    this.logger = new Logger({ level: "info", prefix: "[Agent]" });
  }

  async _call(input, config) {
    this.logger.info(`Processing with attention tracking: ${input}`);

    // Tokenize input (simple whitespace split)
    const tokens = this._tokenize(input);
    this.logger.info(`Tokens: ${tokens.join(", ")}`);

    // Simulate generation with attention tracking
    const attentionSequence = this.attentionTracker.trackGeneration(tokens, 5);

    // Analyze attention patterns
    const analysis = this._analyzeAttention(tokens, attentionSequence);

    return {
      input,
      tokens,
      attentionSequence,
      analysis,
      visualization: {
        heatmap: "See console output",
        focusAreas: this._extractFocusAreas(analysis)
      }
    };
  }

  /**
   * Simple tokenization
   */
  _tokenize(text) {
    // Keep important punctuation with words
    const tokens = text
      .split(/\s+/)
      .filter(t => t.length > 0)
      .slice(0, 10); // Limit for visualization

    return tokens;
  }

  /**
   * Analyze attention patterns
   */
  _analyzeAttention(tokens, attentionSequence) {
    const analysis = {
      averageAttention: {},
      highAttentionTokens: [],
      attentionShift: []
    };

    // Calculate average attention per token
    tokens.forEach((token, idx) => {
      const avgAtt = attentionSequence.reduce((sum, step) => {
        return sum + parseFloat(step.attentionDistribution[idx]);
      }, 0) / attentionSequence.length;

      analysis.averageAttention[token] = avgAtt.toFixed(3);

      if (avgAtt > 0.15) {
        analysis.highAttentionTokens.push({
          token,
          attention: avgAtt.toFixed(3)
        });
      }
    });

    // Calculate attention shifts between steps
    for (let i = 1; i < attentionSequence.length; i++) {
      const prevStep = attentionSequence[i - 1];
      const currStep = attentionSequence[i];
      
      let maxShift = 0;
      let shiftedToken = "";
      
      tokens.forEach((token, idx) => {
        const prev = parseFloat(prevStep.attentionDistribution[idx]);
        const curr = parseFloat(currStep.attentionDistribution[idx]);
        const shift = Math.abs(curr - prev);
        
        if (shift > maxShift) {
          maxShift = shift;
          shiftedToken = token;
        }
      });

      if (maxShift > 0.1) {
        analysis.attentionShift.push({
          fromStep: i - 1,
          toStep: i,
          maxShiftToken: shiftedToken,
          magnitude: maxShift.toFixed(3)
        });
      }
    }

    return analysis;
  }

  /**
   * Extract interpretable focus areas
   */
  _extractFocusAreas(analysis) {
    return {
      primaryFocus: analysis.highAttentionTokens.slice(0, 3),
      summary: `Model focuses on ${analysis.highAttentionTokens.length} key tokens`
    };
  }
}

/**
 * Demo: Attention visualization
 */
async function demonstrateAttention() {
  const agent = new AttentionAwareAgent();
  const config = new RunnableConfig({
    metadata: { lesson: "attention-visualization" },
    tags: ["phase4", "interpretability"]
  });

  console.log("\n=== Attention Visualization Demo ===");

  const queries = [
    "What is the capital of France?",
    "How do neural networks learn patterns?"
  ];

  for (const query of queries) {
    console.log(`\n\n📝 Query: ${query}`);
    console.log("═".repeat(60));

    const result = await agent.invoke(query, config);

    // Show tokens
    console.log("\n🔤 Tokens analyzed:");
    result.tokens.forEach((t, i) => console.log(`  ${i}: "${t}"`));

    // Show attention heatmap
    agent.attentionTracker.createHeatmap(result.tokens, result.attentionSequence);

    // Show analysis
    console.log("\n📊 Attention Analysis:");
    console.log("─".repeat(60));
    
    console.log("\nAverage Attention per Token:");
    Object.entries(result.analysis.averageAttention).forEach(([token, att]) => {
      if (parseFloat(att) > 0.05) {
        console.log(`  "${token}": ${att}`);
      }
    });

    console.log("\nHigh Attention Tokens:");
    result.analysis.highAttentionTokens.forEach(item => {
      console.log(`  ✓ "${item.token}": ${item.attention}`);
    });

    if (result.analysis.attentionShift.length > 0) {
      console.log("\nAttention Shifts:");
      result.analysis.attentionShift.forEach(shift => {
        console.log(`  → "${shift.maxShiftToken}" (Step ${shift.fromStep} → ${shift.toStep})`);
      });
    }

    console.log("\n💡 Insights:");
    console.log(`  ${result.visualization.focusAreas.summary}`);
    result.visualization.focusAreas.primaryFocus.forEach((item, i) => {
      console.log(`  ${i + 1}. "${item.token}" (attention: ${item.attention})`);
    });
  }
}

/**
 * Compare attention patterns
 */
async function compareAttentionPatterns() {
  const agent = new AttentionAwareAgent();
  const config = new RunnableConfig({});

  console.log("\n\n=== Attention Pattern Comparison ===");
  console.log("\nComparing how attention changes based on query type:\n");

  const queryTypes = [
    { type: "factual", query: "What is Paris?" },
    { type: "reasoning", query: "Why do we learn things?" },
    { type: "creative", query: "Imagine a world where colors have sounds" }
  ];

  const patterns = [];

  for (const { type, query } of queryTypes) {
    const result = await agent.invoke(query, config);
    const topTokens = result.analysis.highAttentionTokens.slice(0, 3);

    patterns.push({
      type,
      query,
      focusTokens: topTokens.map(t => t.token).join(", ")
    });
  }

  console.log("Query Type | Sample Query | Key Focus Tokens");
  console.log("─".repeat(60));
  patterns.forEach(p => {
    console.log(`${p.type.padEnd(10)} | ${p.query.padEnd(35)} | ${p.focusTokens}`);
  });
}

async function main() {
  await demonstrateAttention();
  await compareAttentionPatterns();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
