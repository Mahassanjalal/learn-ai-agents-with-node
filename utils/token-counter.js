
/**
 * TokenCounter - Count and estimate tokens in text
 * 
 * Useful for tracking API costs and managing context windows
 * Uses a simple approximation: ~4 characters = 1 token
 */
export class TokenCounter {
  constructor(options = {}) {
    this.tokenizer = options.tokenizer || null;
    this.estimationRatio = options.estimationRatio || 4; // chars per token
    this.contextSize = options.contextSize || 4096;
  }

  /**
   * Count tokens in text (estimation or actual)
   * @param {string} text - Text to count
   * @returns {number} Token count
   */
  count(text) {
    if (!text) return 0;

    // If we have a tokenizer, use it for accurate count
    if (this.tokenizer) {
      try {
        return this.tokenizer.encode(text).length;
      } catch (error) {
        console.warn('Tokenizer failed, falling back to estimation:', error.message);
      }
    }

    // Otherwise estimate based on character count
    return Math.ceil(text.length / this.estimationRatio);
  }

  /**
   * Estimate tokens in a conversation
   * @param {Array} messages - Array of message objects with 'content' property
   * @returns {number} Total token count
   */
  countMessages(messages) {
    if (!Array.isArray(messages)) return 0;

    let total = 0;
    for (const message of messages) {
      total += this.count(message.content || '');
      // Add ~4 tokens per message for formatting
      total += 4;
    }
    return total;
  }

  /**
   * Check if tokens exceed context limit
   * @param {string} text - Text to check
   * @param {number} bufferTokens - Reserved tokens for response (default 512)
   * @returns {Object} { isWithinLimit, tokenCount, remainingTokens }
   */
  isWithinLimit(text, bufferTokens = 512) {
    const tokenCount = this.count(text);
    const remainingTokens = this.contextSize - tokenCount - bufferTokens;
    
    return {
      isWithinLimit: remainingTokens > 0,
      tokenCount,
      remainingTokens: Math.max(0, remainingTokens)
    };
  }

  /**
   * Truncate text to fit within token limit
   * @param {string} text - Text to truncate
   * @param {number} maxTokens - Maximum tokens allowed
   * @returns {string} Truncated text
   */
  truncateToTokens(text, maxTokens) {
    if (!text) return '';

    let estimate = text;
    while (this.count(estimate) > maxTokens && estimate.length > 0) {
      // Remove characters in chunks (10% of remaining)
      const chunkSize = Math.max(1, Math.floor(estimate.length * 0.1));
      estimate = estimate.slice(0, -chunkSize);
    }
    return estimate;
  }
}

export default TokenCounter;
