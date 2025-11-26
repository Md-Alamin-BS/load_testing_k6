// tests/endpoints/enroll.js
// Test for /enroll endpoint

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { generateEnrollmentData } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export const options = {
  vus: 8,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'enroll',
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
  const endpointName = 'POST /enroll';
  const startTime = Date.now();
  
  const enrollmentData = generateEnrollmentData();
  const url = `${config.baseUrl}${config.endpoints.enroll}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.post(url, JSON.stringify(enrollmentData), params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'enrollment successful': (r) => r.status === 200 || r.status === 201,
    'enrollment data returned': (r) => {
      try {
        const json = r.json();
        return json && (json.success || json.enrolled || json.data);
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  if (checkResult) {
    recordBusinessEvent('enrollment');
  }
  
  randomSleep(1, 3);
}

export function teardown(data) {
  // Cleanup if needed
}
