// tests/endpoints/quiz-complete.js
// Test for /courses/{course_id}/sections/{section_index}/quiz-complete endpoint

import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags, randomSleep } from '../../utils/helpers.js';
import { generateQuizCompletionData, getRandomCourseId, getRandomSectionIndex } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export const options = {
  vus: 8,
  duration: '2m',
  thresholds: config.thresholds,
  tags: {
    testType: 'endpoint',
    endpoint: 'quiz_complete',
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
  const endpointName = 'POST /courses/{id}/sections/{index}/quiz-complete';
  const startTime = Date.now();
  
  const courseId = getRandomCourseId();
  const sectionIndex = getRandomSectionIndex();
  const quizData = generateQuizCompletionData(courseId, sectionIndex);
  
  const url = `${config.baseUrl}${config.endpoints.quizComplete(courseId, sectionIndex)}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.post(url, JSON.stringify(quizData), params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'quiz completion successful': (r) => r.status === 200 || r.status === 201,
    'quiz data returned': (r) => {
      try {
        const json = r.json();
        return json && (json.success || json.completed || json.data);
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  if (checkResult) {
    recordBusinessEvent('quiz_completion');
  }
  
  randomSleep(1, 3);
}

export function teardown(data) {
  // Cleanup if needed
}
