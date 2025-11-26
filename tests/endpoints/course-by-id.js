// tests/endpoints/course-by-id.js
// Test for GET /courses/{course_id} endpoint - Get full course details

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { getRandomCourseId } from '../../utils/data-generator.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'course_by_id',
  },
};

export function setup() {
  const token = authenticate();
  if (!token || !token.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return { token: token.token };
}

export default function (data) {
  const { token } = data;
  const endpointName = 'GET /courses/{id}';
  const startTime = Date.now();
  
  const courseId = getRandomCourseId();
  const url = `${config.baseUrl}/courses/${courseId}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'course details returned': (r) => {
      try {
        const json = r.json();
        return json !== null && json !== undefined;
      } catch (e) {
        return false;
      }
    },
    'has course structure': (r) => {
      try {
        const json = r.json();
        // MongoDB course structure may have sections or content
        return json && (json.sections !== undefined || json.content !== undefined || json.course_title !== undefined);
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
