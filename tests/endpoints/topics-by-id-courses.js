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
    endpoint: 'topics_courses',
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
  const endpointName = 'GET /topics/{id}/courses';
  const startTime = Date.now();
  
  // Topic IDs typically range from 1-20
  const topicId = randomInt(1, 20);
  const url = `${config.baseUrl}/topics/${topicId}/courses`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'courses returned for topic': (r) => {
      try {
        const json = r.json();
        return json !== null && json !== undefined;
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  randomSleep(1, 3);
}

export function teardown(data) {
}
