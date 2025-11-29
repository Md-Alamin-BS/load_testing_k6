import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { generateTopicFilters } from '../../utils/data-generator.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 10,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'topics',
  },
};

export function setup() {
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (data) {
  const token = data.token;
  const endpointName = 'GET /topics';
  const startTime = Date.now();
  
  // Generate query parameters - k6 compatible (no URLSearchParams)
  const filters = generateTopicFilters();
  const queryParts = [];
  for (const key in filters) {
    if (filters.hasOwnProperty(key)) {
      queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`);
    }
  }
  const queryString = queryParts.join('&');
  const url = `${config.baseUrl}${config.endpoints.topics}${queryString ? '?' + queryString : ''}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'topics returned': (r) => {
      try {
        const json = r.json();
        return json && (Array.isArray(json) || Array.isArray(json.data) || json.topics);
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
