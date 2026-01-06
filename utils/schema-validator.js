/**
 * SchemaValidator - Validate objects against JSON schemas
 * 
 * Ensures LLM outputs match expected structure
 */
export class SchemaValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode ?? true;
  }

  /**
   * Validate object against schema
   * @param {Object} obj - Object to validate
   * @param {Object} schema - JSON schema
   * @returns {Object} { valid: boolean, errors: [], sanitized: Object }
   */
  validate(obj, schema) {
    const errors = [];
    const sanitized = {};

    // Check required properties
    if (schema.required && Array.isArray(schema.required)) {
      for (const prop of schema.required) {
        if (!(prop in obj)) {
          errors.push(`Missing required property: ${prop}`);
        }
      }
    }

    // Validate properties
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          const value = obj[key];
          const propErrors = this._validateProperty(value, propSchema, key);
          errors.push(...propErrors);

          if (propErrors.length === 0) {
            sanitized[key] = value;
          } else if (!this.strictMode) {
            sanitized[key] = value; // Include even if validation failed
          }
        }
      }
    }

    // Include non-schema properties in lenient mode
    if (!this.strictMode) {
      for (const [key, value] of Object.entries(obj)) {
        if (!(key in sanitized)) {
          sanitized[key] = value;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized
    };
  }

  /**
   * Validate a single property
   */
  _validateProperty(value, schema, propName) {
    const errors = [];

    // Type check
    if (schema.type) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== schema.type) {
        errors.push(
          `Property '${propName}': expected ${schema.type}, got ${actualType}`
        );
        return errors;
      }
    }

    // Enum check
    if (schema.enum && !schema.enum.includes(value)) {
      errors.push(
        `Property '${propName}': value '${value}' not in enum [${schema.enum.join(', ')}]`
      );
    }

    // String pattern check
    if (schema.pattern && typeof value === 'string') {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push(`Property '${propName}': value doesn't match pattern ${schema.pattern}`);
      }
    }

    // Min/max for numbers
    if (typeof value === 'number') {
      if (schema.minimum !== undefined && value < schema.minimum) {
        errors.push(`Property '${propName}': value ${value} is less than minimum ${schema.minimum}`);
      }
      if (schema.maximum !== undefined && value > schema.maximum) {
        errors.push(`Property '${propName}': value ${value} is greater than maximum ${schema.maximum}`);
      }
    }

    // Min/max length for strings and arrays
    if ((typeof value === 'string' || Array.isArray(value)) && value.length !== undefined) {
      if (schema.minLength !== undefined && value.length < schema.minLength) {
        errors.push(`Property '${propName}': length ${value.length} is less than minimum ${schema.minLength}`);
      }
      if (schema.maxLength !== undefined && value.length > schema.maxLength) {
        errors.push(`Property '${propName}': length ${value.length} is greater than maximum ${schema.maxLength}`);
      }
    }

    return errors;
  }

  /**
   * Repair object to match schema (best effort)
   * @param {Object} obj - Object to repair
   * @param {Object} schema - JSON schema
   * @returns {Object} Repaired object
   */
  repair(obj, schema) {
    const repaired = { ...obj };

    // Add missing required properties with defaults
    if (schema.required) {
      for (const prop of schema.required) {
        if (!(prop in repaired)) {
          const propSchema = schema.properties?.[prop];
          repaired[prop] = this._getDefaultValue(propSchema);
        }
      }
    }

    // Type coercion
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in repaired) {
          repaired[key] = this._coerceType(repaired[key], propSchema);
        }
      }
    }

    return repaired;
  }

  /**
   * Get default value for a schema type
   */
  _getDefaultValue(schema) {
    if (!schema) return null;
    if (schema.default !== undefined) return schema.default;
    
    switch (schema.type) {
      case 'string': return '';
      case 'number': return 0;
      case 'integer': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      default: return null;
    }
  }

  /**
   * Try to coerce value to correct type
   */
  _coerceType(value, schema) {
    if (!schema.type || value === null || value === undefined) {
      return value;
    }

    switch (schema.type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value);
      case 'integer':
        return Math.floor(Number(value));
      case 'boolean':
        return value === 'false' ? false : Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }
}

export default SchemaValidator;
