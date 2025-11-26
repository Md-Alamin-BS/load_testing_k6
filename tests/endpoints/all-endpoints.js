// tests/endpoints/all-endpoints.js
// Combined test for all endpoints

import { group } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate } from '../../utils/auth.js';
import { randomSleep } from '../../utils/helpers.js';

// Import individual endpoint test functions
import { testTopics } from './topics-test-function.js';
import { testCourses } from './courses-test-function.js';
import { testEnroll } from './enroll-test-function.js';
import { testUpdateProgress } from './update-progress-test-function.js';
import { testQuizComplete } from './quiz-complete-test-function.js';
import { testMyCourses } from './mycourses-test-function.js';
import { testRecommendations } from './recommendations-test-function.js';
import { testCourseById } from './course-by-id-test-function.js';

export const options = {
  stages: config.scenarios.load.stages || [
    { duration: '30s', target: 5 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: config.thresholds,
  tags: {
    testType: 'all-endpoints',
  },
};

export function setup() {
  console.log('Setting up all endpoints test...');
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const { token } = authData;
  
  group('Topics Endpoint', () => {
    testTopics(token);
  });
  
  randomSleep(1, 2);
  
  group('Courses Endpoint', () => {
    testCourses(token);
  });
  
  randomSleep(1, 2);
  
  group('Course By ID Endpoint', () => {
    testCourseById(token);
  });
  
  randomSleep(1, 2);
  
  group('My Courses Endpoint', () => {
    testMyCourses(authData);
  });
  
  randomSleep(1, 2);
  
  group('Recommendations Endpoint', () => {
    testRecommendations(authData);
  });
  
  randomSleep(1, 2);
  
  group('Enrollment Endpoint', () => {
    testEnroll(authData);
  });
  
  randomSleep(1, 2);
  
  group('Update Progress Endpoint', () => {
    testUpdateProgress(token);
  });
  
  randomSleep(1, 2);
  
  group('Quiz Complete Endpoint', () => {
    testQuizComplete(token);
  });
  
  randomSleep(2, 4);
}

export function teardown(data) {
  console.log('All endpoints test completed');
}
