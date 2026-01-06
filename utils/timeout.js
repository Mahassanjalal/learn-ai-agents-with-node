/**
 * TimeoutManager - Add timeouts to async operations
 * 
 * Prevents operations from hanging indefinitely
 */
export class TimeoutManager {
  constructor(options = {}) {
    this.defaultTimeout = options.defaultTimeout || 30000; // ms
  }

  /**
   * Execute function with timeout
   * @param {Function} fn - Async function to execute
   * @param {number} timeout - Timeout in milliseconds (optional)
   * @returns {Promise<any>} Result of function
   */
  async execute(fn, timeout = this.defaultTimeout) {
    return Promise.race([
      fn(),
      this._createTimeoutPromise(timeout)
    ]);
  }

  /**
   * Create a promise that rejects after timeout
   */
  _createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${timeout}ms`));
      }, timeout);
    });
  }
}

export default TimeoutManager;
