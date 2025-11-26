// tests/endpoints/courses.js
// Test for /courses endpoint

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { generateCourseFilters } from '../../utils/data-generator.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'courses',
  },
};

export function setup() {
  const token = authenticate();
  if (!token) {
    throw new Error('Authentication failed in setup phase');
  }
  return { token };
}

export default function (data) {
  const { token } = data;
  const endpointName = 'GET /courses';
  const startTime = Date.now();
  
  // Generate query parameters
  const filters = generateCourseFilters();
  const queryString = new URLSearchParams(filters).toString();
  const url = `${config.baseUrl}${config.endpoints.courses}${queryString ? '?' + queryString : ''}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'courses returned': (r) => {
      try {
        const json = r.json();
        return json && (Array.isArray(json) || Array.isArray(json.data) || json.courses);
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
