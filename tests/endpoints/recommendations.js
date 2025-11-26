// tests/endpoints/recommendations.js
// Test for /recommendations endpoint - AI-powered course recommendations

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep, randomInt } from '../../utils/helpers.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'recommendations',
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
  const endpointName = 'GET /recommendations';
  const startTime = Date.now();
  
  // Vary the limit parameter for realistic load
  const limit = [10, 20, 48, 100][randomInt(0, 3)];
  const url = `${config.baseUrl}/recommendations?user_id=${userId || 1}&limit=${limit}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'recommendations returned': (r) => {
      try {
        const json = r.json();
        return json && Array.isArray(json);
      } catch (e) {
        return false;
      }
    },
    'respects limit': (r) => {
      try {
        const json = r.json();
        return Array.isArray(json) && json.length <= limit;
      } catch (e) {
        return false;
      }
    },
    'courses have required fields': (r) => {
      try {
        const json = r.json();
        if (Array.isArray(json) && json.length > 0) {
          const course = json[0];
          return course.id !== undefined && course.course_title !== undefined;
        }
        return true;
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
