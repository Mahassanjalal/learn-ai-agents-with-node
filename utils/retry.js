/**
 * RetryManager - Handle retries with exponential backoff
 * 
 * Useful for unreliable operations like API calls or network requests
 */
export class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000; // ms
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.maxDelay = options.maxDelay || 30000; // ms
    this.shouldRetry = options.shouldRetry || ((error) => true);
  }

  /**
   * Execute function with retry logic
   * @param {Function} fn - Async function to execute
   * @returns {Promise<any>} Result of function
   */
  async execute(fn) {
    let lastError;
    let delay = this.initialDelay;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Check if we should retry this error
        if (!this.shouldRetry(error)) {
          throw error;
        }

        // Don't delay after final attempt
        if (attempt < this.maxRetries) {
          console.log(
            `Attempt ${attempt + 1} failed: ${error.message}. Retrying in ${delay}ms...`
          );
          await this._sleep(delay);
          delay = Math.min(delay * this.backoffMultiplier, this.maxDelay);
        }
      }
    }

    throw new Error(
      `Failed after ${this.maxRetries + 1} attempts: ${lastError.message}`
    );
  }

  /**
   * Sleep for specified milliseconds
   */
  _sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default RetryManager;
