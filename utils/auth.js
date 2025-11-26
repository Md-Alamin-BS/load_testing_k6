import http from 'k6/http';
import { check } from 'k6';
import { config } from '../config/test-config.js';
import { handleResponse } from './helpers.js';

/**
 * Authenticate user and return access token
 * @returns {string|null} - Authentication token or null if login fails
 */
export function authenticate() {
  const loginUrl = `${config.baseUrl}${config.endpoints.login}`;
  
  const payload = {
    username: config.user.email,
    password: config.user.password,
  };
  
  const params = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    tags: {
      name: 'Authentication',
      endpoint: config.endpoints.login,
    },
  };
  
  const response = http.post(loginUrl, payload, params);
  
  const checkResult = check(response, {
    'login successful': (r) => r.status === 200,
    'token received': (r) => r.json('access_token') !== undefined || r.json('token') !== undefined,
  });
  
  if (!checkResult) {
    console.error(`Authentication failed: Status ${response.status}, Body: ${response.body}`);
    return null;
  }
  
  // Parse response to get token and user data
  const data = response.json();
  const token = data.access_token || data.token;
  const user = data.user || {};
  
  // Return both token and user data
  return {
    token: token,
    userId: user.id || user.user_id || null,
    user: user
  };
}

/**
 * Get authorization headers with token
 * @param {string} token - Authentication token
 * @returns {Object} - Headers object with authorization
 */
export function getAuthHeaders(token) {
  return Object.assign({}, config.http.headers, {
    'Authorization': `Bearer ${token}`,
  });
}

/**
 * Create authenticated HTTP params object
 * @param {string} token - Authentication token
 * @param {Object} additionalParams - Additional parameters to merge
 * @returns {Object} - Complete params object for k6 http requests
 */
export function createAuthParams(token, additionalParams = {}) {
  return Object.assign({
    headers: getAuthHeaders(token),
    timeout: config.http.timeout,
  }, additionalParams);
}
