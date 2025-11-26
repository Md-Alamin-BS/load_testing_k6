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
    soak_test: {
      executor: 'constant-vus',
      vus: config.scenarios.soak.vus,
      duration: config.scenarios.soak.duration,
      gracefulStop: config.scenarios.soak.gracefulStop,
    },
  },
  thresholds: Object.assign({}, config.thresholds, {
    // Soak test focuses on memory leaks and degradation over time
    http_req_duration: ['p(95)<3000', 'p(99)<5000'], // Allow slightly higher response times
  }),
  tags: {
    testType: 'soak',
    scenario: 'soak-test',
  },
};

export function setup() {
  console.log('=== Starting Soak Test ===');
  console.log(`VUs: ${config.scenarios.soak.vus}, Duration: ${config.scenarios.soak.duration}`);
  console.log('Testing for memory leaks and performance degradation over time...');
  const authData = authenticate();
  if (!authData) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const token = authData.token;
  
  // Realistic user behavior over extended period
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
  
  randomSleep(2, 4);
}

export function teardown(data) {
  console.log('=== Soak Test Completed ===');
  console.log('Review metrics for performance degradation trends');
  console.log('');
  console.log('View Results:');
  console.log('   Grafana Dashboard: http://localhost:3000');
  console.log('   InfluxDB:          http://localhost:8086');
  console.log('');
  console.log('Tips:');
  console.log('   - Login to Grafana with admin/admin');
  console.log('   - Select Run ID from dropdown to filter results');
  console.log('   - Look for memory leaks or performance degradation over time');
  console.log('');
}
