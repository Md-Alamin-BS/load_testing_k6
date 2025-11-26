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
    load_test: {
      executor: 'constant-vus',
      vus: config.scenarios.load.vus,
      duration: config.scenarios.load.duration,
      gracefulStop: config.scenarios.load.gracefulStop,
    },
  },
  thresholds: config.thresholds,
  tags: {
    testType: 'load',
    scenario: 'load-test',
  },
};

export function setup() {
  console.log('=== Starting Load Test ===');
  console.log(`VUs: ${config.scenarios.load.vus}, Duration: ${config.scenarios.load.duration}`);
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const token = authData.token;
  
  // Simulate realistic user behavior with weighted actions
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
  
  randomSleep(1, 3);
}

export function teardown(data) {
  console.log('=== Load Test Completed ===');
  console.log('');
  console.log('View Results:');
  console.log('   Grafana Dashboard: http://localhost:3000');
  console.log('   InfluxDB:          http://localhost:8086');
  console.log('');
  console.log('Tips:');
  console.log('   - Login to Grafana with admin/admin');
  console.log('   - Select Run ID from dropdown to filter results');
  console.log('   - Choose endpoint from dropdown to see specific metrics');
  console.log('');
}
