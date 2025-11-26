// tests/endpoints/mycourses.js
// Test for /mycourses endpoint - Get enrolled courses

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 8,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'mycourses',
  },
};

export function setup() {
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const { token, userId } = authData;
  const endpointName = 'GET /mycourses';
  const startTime = Date.now();
  
  // Build URL with user_id query parameter
  const url = `${config.baseUrl}/mycourses?user_id=${userId || 1}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'enrolled courses returned': (r) => {
      try {
        const json = r.json();
        return json && Array.isArray(json);
      } catch (e) {
        return false;
      }
    },
    'courses have progress': (r) => {
      try {
        const json = r.json();
        if (Array.isArray(json) && json.length > 0) {
          return json[0].course_progress !== undefined;
        }
        return true; // Empty array is valid
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  randomSleep(1, 3);
}

export function teardown(data) {
  // Cleanup if needed
}
