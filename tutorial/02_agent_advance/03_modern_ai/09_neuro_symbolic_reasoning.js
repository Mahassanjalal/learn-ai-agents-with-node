// Phase 4: Neuro-Symbolic Reasoning - Combine neural networks with logical rules
// Demonstrates hybrid AI combining LLM outputs with formal logic reasoning

import { Runnable, RunnableConfig } from "../../../core/index.js";
import { Logger } from "../../../utils/logger.js";

/**
 * Simple rule engine for symbolic reasoning
 */
class RuleEngine {
  constructor() {
    this.rules = [];
    this.logger = new Logger({ level: "info", prefix: "[RuleEngine]" });
  }

  /**
   * Add a rule: if condition then action
   */
  addRule(name, condition, action) {
    this.rules.push({ name, condition, action });
    this.logger.info(`Rule added: ${name}`);
  }

  /**
   * Apply all matching rules to facts
   */
  applyRules(facts) {
    const results = [];
    
    for (const rule of this.rules) {
      try {
        if (rule.condition(facts)) {
          const action = rule.action(facts);
          results.push({
            rule: rule.name,
            triggered: true,
            result: action
          });
          this.logger.info(`Rule triggered: ${rule.name}`);
        }
      } catch (err) {
        this.logger.warn(`Rule ${rule.name} error: ${err.message}`);
      }
    }

    return results;
  }
}

/**
 * Neuro-Symbolic reasoner combining LLM + Logic
 */
class NeuroSymbolicReasoner extends Runnable {
  constructor() {
    super();
    this.ruleEngine = new RuleEngine();
    this.logger = new Logger({ level: "info", prefix: "[NeuroSymbolic]" });
    this._setupRules();
  }

  /**
   * Setup domain-specific reasoning rules
   */
  _setupRules() {
    // Rule 1: High confidence recommendations
    this.ruleEngine.addRule(
      "high_confidence",
      (facts) => facts.confidence > 0.8,
      (facts) => `Strong recommendation: ${facts.recommendation}`
    );

    // Rule 2: Low confidence needs verification
    this.ruleEngine.addRule(
      "low_confidence_verify",
      (facts) => facts.confidence < 0.5,
      (facts) => `Suggestion needs expert review: ${facts.recommendation}`
    );

    // Rule 3: Multiple confirmations increase confidence
    this.ruleEngine.addRule(
      "multi_source_agreement",
      (facts) => facts.sources && facts.sources.length > 2,
      (facts) => `Multiple sources agree - increase confidence to ${Math.min(1, facts.confidence + 0.2)}`
    );

    // Rule 4: Contradiction detection
    this.ruleEngine.addRule(
      "contradiction_detected",
      (facts) => facts.contradictions && facts.contradictions.length > 0,
      (facts) => `⚠️ Contradictions found: ${facts.contradictions.join(", ")}`
    );

    // Rule 5: Temporal reasoning
    this.ruleEngine.addRule(
      "recent_data",
      (facts) => facts.recency && facts.recency === "recent",
      (facts) => `✓ Based on recent data - reasoning is current`
    );

    // Rule 6: Unknown data quality
    this.ruleEngine.addRule(
      "low_quality_data",
      (facts) => facts.quality && facts.quality < 3,
      (facts) => `⚠️ Low data quality (${facts.quality}/10) - conclusions are provisional`
    );
  }

  /**
   * Simulate LLM reasoning (neural component)
   */
  async _neuralReasoning(input) {
    // In real system, this would call actual LLM
    const neuralOutput = {
      understanding: `Understanding "${input}"`,
      initial_hypothesis: "Hypothesis based on pattern matching",
      confidence: Math.random() * 0.7 + 0.3, // 0.3 to 1.0
      supporting_evidence: ["evidence 1", "evidence 2"],
      potential_issues: ["issue 1"]
    };

    this.logger.info(`Neural reasoning confidence: ${neuralOutput.confidence.toFixed(2)}`);
    return neuralOutput;
  }

  /**
   * Combine neural and symbolic reasoning
   */
  async _call(input, config) {
    this.logger.info(`Processing: ${input}`);

    // Step 1: Neural reasoning
    const neuralOutput = await this._neuralReasoning(input);

    // Step 2: Extract facts for rules
    const facts = {
      input,
      recommendation: input,
      confidence: neuralOutput.confidence,
      sources: neuralOutput.supporting_evidence,
      recency: "recent",
      quality: 7,
      contradictions: neuralOutput.potential_issues.length > 0 ? neuralOutput.potential_issues : []
    };

    // Step 3: Apply symbolic rules
    const symbolicOutput = this.ruleEngine.applyRules(facts);

    // Step 4: Combine results
    const finalReasoning = {
      neuralComponent: {
        hypothesis: neuralOutput.initial_hypothesis,
        confidence: neuralOutput.confidence.toFixed(2),
        evidence: neuralOutput.supporting_evidence
      },
      symbolicComponent: {
        rulesApplied: symbolicOutput.length,
        conclusions: symbolicOutput.map(r => r.result)
      },
      confidence_adjusted: this._adjustConfidence(neuralOutput.confidence, symbolicOutput),
      recommendation: this._generateRecommendation(neuralOutput, symbolicOutput)
    };

    return finalReasoning;
  }

  /**
   * Adjust confidence based on symbolic reasoning
   */
  _adjustConfidence(neuralConfidence, symbolicResults) {
    let adjustment = 0;

    // Increase if multiple sources agree
    const multiSource = symbolicResults.find(r => r.rule === "multi_source_agreement");
    if (multiSource) adjustment += 0.15;

    // Decrease if contradictions found
    const contradictions = symbolicResults.find(r => r.rule === "contradiction_detected");
    if (contradictions) adjustment -= 0.2;

    const adjusted = Math.max(0, Math.min(1, neuralConfidence + adjustment));
    return adjusted.toFixed(2);
  }

  /**
   * Generate final recommendation
   */
  _generateRecommendation(neuralOutput, symbolicResults) {
    const conclusions = symbolicResults.map(r => r.result);
    return {
      based_on: "Neural pattern matching + Symbolic rules",
      reasoning_steps: conclusions,
      reliability: conclusions.length > 3 ? "high" : "moderate"
    };
  }
}

/**
 * Interactive demo
 */
async function demonstrateNeuroSymbolic() {
  const reasoner = new NeuroSymbolicReasoner();
  const config = new RunnableConfig({
    metadata: { lesson: "neuro-symbolic" },
    tags: ["phase4", "hybrid-ai"]
  });

  console.log("\n=== Neuro-Symbolic Reasoning Demo ===\n");

  const queries = [
    "Should we approve this high-risk loan application?",
    "Is this medical diagnosis reliable based on symptoms?",
    "Should we scale this successful marketing campaign?"
  ];

  for (const query of queries) {
    console.log(`\n📌 Query: ${query}`);
    console.log("─".repeat(50));

    const result = await reasoner.invoke(query, config);

    console.log("\n🧠 Neural Component:");
    console.log(`  Hypothesis: ${result.neuralComponent.hypothesis}`);
    console.log(`  Confidence: ${result.neuralComponent.confidence}`);
    console.log(`  Evidence: ${result.neuralComponent.evidence.join(", ")}`);

    console.log("\n⚙️ Symbolic Component:");
    console.log(`  Rules Applied: ${result.symbolicComponent.rulesApplied}`);
    result.symbolicComponent.conclusions.forEach((c, i) => {
      console.log(`    ${i + 1}. ${c}`);
    });

    console.log("\n✓ Adjusted Confidence:", result.confidence_adjusted);
    console.log("✓ Recommendation Reliability:", result.recommendation.reliability);
  }
}

/**
 * Show decision boundary with hybrid approach
 */
async function showDecisionBoundary() {
  const reasoner = new NeuroSymbolicReasoner();

  console.log("\n=== Decision Boundary Analysis ===\n");
  console.log("Confidence levels with neural + symbolic correction:\n");

  const confidences = [0.3, 0.5, 0.7, 0.85, 0.95];
  
  for (const conf of confidences) {
    // Simulate facts
    const facts = {
      input: "test",
      recommendation: "test",
      confidence: conf,
      sources: conf > 0.7 ? ["src1", "src2", "src3"] : ["src1"],
      recency: "recent",
      quality: conf > 0.6 ? 8 : 5,
      contradictions: conf < 0.5 ? ["contradiction"] : []
    };

    const symbolicResults = reasoner.ruleEngine.applyRules(facts);
    const adjusted = reasoner._adjustConfidence(conf, symbolicResults);

    console.log(`Neural confidence: ${conf.toFixed(2)} → Adjusted: ${adjusted}`);
    console.log(`  Applied rules: ${symbolicResults.length}`);
    console.log();
  }
}

async function main() {
  await demonstrateNeuroSymbolic();
  await showDecisionBoundary();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
