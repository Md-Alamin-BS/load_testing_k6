// tests/scenarios/spike-test.js
// Spike Testing: Tests system behavior under sudden load spikes

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
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: config.scenarios.spike.stages,
      gracefulRampDown: config.scenarios.spike.gracefulStop,
    },
  },
  thresholds: Object.assign({}, config.thresholds, {
    http_req_failed: ['rate<0.15'], // Allow higher error rate during spike (15%)
    http_req_duration: ['p(95)<3000', 'p(99)<5000'], // Allow higher response times during spike
  }),
  tags: {
    testType: 'spike',
    scenario: 'spike-test',
  },
};

export function setup() {
  console.log('=== Starting Spike Test ===');
  console.log('Testing system behavior under sudden traffic spikes...');
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const token = authData.token;
  
  // Rapid user actions during spike
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
  
  // Minimal sleep to maximize load during spike
  randomSleep(0.5, 1.5);
}

export function teardown(data) {
  console.log('=== Spike Test Completed ===');
  console.log('Review metrics for recovery time and error rates during spike');
  console.log('');
  console.log('📊 View Results:');
  console.log('   Grafana Dashboard: http://localhost:3000');
  console.log('   InfluxDB:          http://localhost:8086');
  console.log('');
  console.log('💡 Tips:');
  console.log('   - Login to Grafana with admin/admin');
  console.log('   - Select Run ID from dropdown to filter results');
  console.log('   - Check how system handled sudden traffic spike');
  console.log('');
}
