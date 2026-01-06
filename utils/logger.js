/**
 * Logger - Structured logging for debugging and monitoring
 * 
 * Provides different log levels and formatted output
 */
export class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info'; // error, warn, info, debug
    this.prefix = options.prefix || '[AI-Agent]';
    this.includeTimestamp = options.includeTimestamp ?? true;
    this.includeLevel = options.includeLevel ?? true;

    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };

    this.currentLevel = this.levels[this.level] || 2;
  }

  /**
   * Get formatted timestamp
   */
  _getTimestamp() {
    if (!this.includeTimestamp) return '';
    const now = new Date();
    const time = now.toLocaleTimeString();
    return `[${time}] `;
  }

  /**
   * Format log message
   */
  _format(level, message, data = null) {
    let output = this._getTimestamp();
    output += this.prefix + ' ';
    
    if (this.includeLevel) {
      output += `[${level.toUpperCase()}] `;
    }

    output += message;

    if (data) {
      output += '\n' + JSON.stringify(data, null, 2);
    }

    return output;
  }

  /**
   * Log error message
   */
  error(message, data = null) {
    if (this.currentLevel >= this.levels.error) {
      console.error(this._format('error', message, data));
    }
  }

  /**
   * Log warning message
   */
  warn(message, data = null) {
    if (this.currentLevel >= this.levels.warn) {
      console.warn(this._format('warn', message, data));
    }
  }

  /**
   * Log info message
   */
  info(message, data = null) {
    if (this.currentLevel >= this.levels.info) {
      console.log(this._format('info', message, data));
    }
  }

  /**
   * Log debug message
   */
  debug(message, data = null) {
    if (this.currentLevel >= this.levels.debug) {
      console.log(this._format('debug', message, data));
    }
  }

  /**
   * Set logging level
   */
  setLevel(level) {
    this.level = level;
    this.currentLevel = this.levels[level] || 2;
  }
}

export default Logger;
