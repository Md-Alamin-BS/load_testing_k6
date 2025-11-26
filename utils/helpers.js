import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

/**
 * Handle HTTP response and perform common checks
 * @param {Object} response - k6 HTTP response object
 * @param {string} endpointName - Name of the endpoint for metrics
 * @param {Object} customChecks - Additional custom checks
 * @returns {boolean} - True if all checks pass
 */
export function handleResponse(response, endpointName, customChecks = {}) {
  const defaultChecks = {
    'status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response has body': (r) => r.body.length > 0,
  };
  
  const allChecks = Object.assign({}, defaultChecks, customChecks);
  const result = check(response, allChecks, { endpoint: endpointName });
  
  if (!result) {
    console.error(`${endpointName} failed: Status ${response.status}, Body: ${response.body.substring(0, 200)}`);
  }
  
  return result;
}

/**
 * Create tags for metrics
 * @param {string} endpointName - Name of the endpoint
 * @param {string} workflowName - Name of the workflow (optional)
 * @returns {Object} - Tags object
 */
export function createTags(endpointName, workflowName = null) {
  const tags = {
    endpoint: endpointName,
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
    environment: __ENV.ENVIRONMENT || 'dev',
  };
  
  if (workflowName) {
    tags.workflow = workflowName;
  }
  
  return tags;
}

/**
 * Random sleep between min and max seconds
 * @param {number} min - Minimum sleep time in seconds
 * @param {number} max - Maximum sleep time in seconds
 */
export function randomSleep(min = 1, max = 3) {
  const sleepTime = min + Math.random() * (max - min);
  sleep(sleepTime);
}

/**
 * Extract value from response using dot notation path
 * @param {Object} response - k6 HTTP response object
 * @param {string} path - Dot notation path (e.g., 'data.id')
 * @returns {any} - Extracted value or null
 */
export function extractFromResponse(response, path) {
  try {
    const data = response.json();
    return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined) ? obj[key] : undefined, data);
  } catch (e) {
    console.error(`Failed to extract ${path} from response: ${e}`);
    return null;
  }
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Select random element from array
 * @param {Array} array - Array to select from
 * @returns {any} - Random element
 */
export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Retry function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in seconds
 * @returns {any} - Result of the function
 */
export function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return fn();
    } catch (e) {
      lastError = e;
      const delay = initialDelay * Math.pow(2, i);
      console.warn(`Attempt ${i + 1} failed, retrying in ${delay}s: ${e}`);
      sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Format timestamp for logging
 * @returns {string} - Formatted timestamp
 */
export function timestamp() {
  return new Date().toISOString();
}

/**
 * Log info message with timestamp
 * @param {string} message - Message to log
 */
export function logInfo(message) {
  console.log(`[INFO] [${timestamp()}] ${message}`);
}

/**
 * Log error message with timestamp
 * @param {string} message - Message to log
 */
export function logError(message) {
  console.error(`[ERROR] [${timestamp()}] ${message}`);
}
