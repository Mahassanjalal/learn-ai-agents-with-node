import { Runnable } from './runnable.js';

/**
 * RunnableParallel - Execute multiple Runnables in parallel
 *
 * Useful for:
 * - Running multiple independent tasks concurrently
 * - Gathering data from multiple sources
 * - Building complex agent workflows
 *
 * Example:
 * const parallel = new RunnableParallel({
 *   analysis: analyticsRunnable,
 *   summary: summaryRunnable,
 *   keywords: keywordRunnable
 * });
 *
 * const results = await parallel.invoke("input text");
 * // results = { analysis: ..., summary: ..., keywords: ... }
 */
export class RunnableParallel extends Runnable {
  constructor(options = {}) {
    super();

    if (typeof options !== 'object' || Array.isArray(options)) {
      throw new Error('RunnableParallel requires an object of named Runnables');
    }

    this.runnables = options;
    this.runnableNames = Object.keys(options);

    // Validate that all values are Runnables
    for (const [name, runnable] of Object.entries(this.runnables)) {
      if (!runnable || typeof runnable.invoke !== 'function') {
        throw new Error(`Property '${name}' must be a Runnable with an invoke() method`);
      }
    }
  }

  /**
   * Execute all Runnables in parallel with the same input
   *
   * @param {any} input - The input to pass to all Runnables
   * @param {Object} config - Optional configuration
   * @returns {Promise<Object>} Object with results keyed by Runnable names
   */
  async _call(input, config) {
    const promises = {};

    // Start all Runnables in parallel
    for (const [name, runnable] of Object.entries(this.runnables)) {
      promises[name] = runnable.invoke(input, config);
    }

    // Wait for all to complete
    const results = {};
    for (const [name, promise] of Object.entries(promises)) {
      results[name] = await promise;
    }

    return results;
  }

  /**
   * Stream results from the fastest Runnable first
   *
   * @param {any} input - The input to pass to all Runnables
   * @param {Object} config - Optional configuration
   * @yields {Object} Partial results as they complete
   */
  async *_stream(input, config) {
    const promises = {};
    const results = {};

    // Start all Runnables
    for (const name of this.runnableNames) {
      promises[name] = this.runnables[name].invoke(input, config)
        .then(result => {
          results[name] = result;
          return result;
        });
    }

    // Yield results as they complete (race pattern)
    let completed = 0;
    while (completed < this.runnableNames.length) {
      // Wait for next promise to complete
      const nextPromise = Promise.race(Object.entries(promises).map(([name, p]) => 
        p.then(() => name)
      ));

      const completedName = await nextPromise;
      completed++;

      // Yield current state of results
      yield { ...results };

      // Remove completed promise
      delete promises[completedName];
    }
  }

  /**
   * Batch process: run all Runnables on all inputs
   *
   * @param {Array<any>} inputs - Array of inputs
   * @param {Object} config - Optional configuration
   * @returns {Promise<Array<Object>>} Array of result objects
   */
  async batch(inputs, config = {}) {
    return Promise.all(
      inputs.map(input => this._call(input, config))
    );
  }

  /**
   * Get list of Runnable names
   */
  getRunnames() {
    return this.runnableNames;
  }

  /**
   * Check if a named Runnable exists
   */
  hasRunnable(name) {
    return name in this.runnables;
  }

  /**
   * Get a specific Runnable by name
   */
  getRunnable(name) {
    return this.runnables[name];
  }
}

export default RunnableParallel;