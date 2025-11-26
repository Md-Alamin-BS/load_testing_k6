import { group } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate } from '../../utils/auth.js';
import { randomChoice, randomSleep } from '../../utils/helpers.js';

import { testTopics } from '../endpoints/topics-test-function.js';
import { testCourses } from '../endpoints/courses-test-function.js';
import { testEnroll } from '../endpoints/enroll-test-function.js';
import { testUpdateProgress } from '../endpoints/update-progress-test-function.js';
import { testQuizComplete } from '../endpoints/quiz-complete-test-function.js';

export const options = {
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: config.scenarios.stress.stages,
      gracefulRampDown: config.scenarios.stress.gracefulStop,
    },
  },
  thresholds: Object.assign({}, config.thresholds, {
    http_req_failed: ['rate<0.10'], // Allow higher error rate in stress test (10%)
  }),
  tags: {
    testType: 'stress',
    scenario: 'stress-test',
  },
};

export function setup() {
  console.log('=== Starting Stress Test ===');
  console.log('Gradually increasing load to find system limits...');
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const token = authData.token;
  
  // More aggressive user behavior patterns in stress test
  const actions = ['topics', 'courses', 'enroll', 'progress', 'quiz'];
  const action = randomChoice(actions);
  
  switch (action) {
    case 'topics':
      group('Browse Topics', () => {
        testTopics(token);
      });
      break;
    
    case 'courses':
      group('Browse Courses', () => {
        testCourses(token);
      });
      break;
    
    case 'enroll':
      group('Enroll in Course', () => {
        testEnroll(authData);
      });
      break;
    
    case 'progress':
      group('Update Progress', () => {
        testUpdateProgress(token);
      });
      break;
    
    case 'quiz':
      group('Complete Quiz', () => {
        testQuizComplete(token);
      });
      break;
  }
  
  // Less sleep time in stress test to increase load
  randomSleep(0.5, 2);
}

export function teardown(data) {
  console.log('=== Stress Test Completed ===');
  console.log('Review metrics to identify system breaking points and bottlenecks');
  console.log('');
  console.log('View Results:');
  console.log('   Grafana Dashboard: http://localhost:3000');
  console.log('   InfluxDB:          http://localhost:8086');
  console.log('');
  console.log('Tips:');
  console.log('   - Login to Grafana with admin/admin');
  console.log('   - Select Run ID from dropdown to filter results');
  console.log('   - Check P95 response times during peak load');
  console.log('');
}
