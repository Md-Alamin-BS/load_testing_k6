import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { getRandomCourseId, getRandomSectionIndex } from '../../utils/data-generator.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export const options = {
  vus: 8,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'section_quizzes',
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
  const endpointName = 'GET /section-quizzes';
  const startTime = Date.now();
  
  const courseId = getRandomCourseId();
  const sectionIndex = getRandomSectionIndex();
  const url = `${config.baseUrl}/section-quizzes?course_id=${courseId}&section_index=${sectionIndex}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'quiz data returned': (r) => {
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
