// tests/endpoints/update-progress.js
// Test for /courses/update_progress endpoint

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { generateProgressData } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'update_progress',
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
  const endpointName = 'POST /courses/update_progress';
  const startTime = Date.now();
  
  const progressData = generateProgressData();
  const url = `${config.baseUrl}${config.endpoints.updateProgress}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.post(url, JSON.stringify(progressData), params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'progress update successful': (r) => r.status === 200 || r.status === 201,
    'progress data returned': (r) => {
      try {
        const json = r.json();
        return json && (json.success || json.updated || json.data);
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  if (checkResult) {
    recordBusinessEvent('progress_update');
  }
  
  randomSleep(1, 3);
}

export function teardown(data) {
  // Cleanup if needed
}
