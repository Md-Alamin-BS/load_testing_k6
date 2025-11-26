// tests/workflows/course-completion-workflow.js
// Workflow test simulating complete course completion journey
// This test chains multiple API calls in sequence to simulate real user behavior

import { group, sleep } from 'k6';
import { config } from '../../config/test-config.js';
import { authenticate } from '../../utils/auth.js';
import { randomSleep, extractFromResponse, logInfo, logError } from '../../utils/helpers.js';
import { recordWorkflowMetric, recordWorkflowStepMetric } from '../../utils/metrics.js';

// Import test functions
import { testTopics } from '../endpoints/topics-test-function.js';
import { testCourses } from '../endpoints/courses-test-function.js';
import { testEnroll } from '../endpoints/enroll-test-function.js';
import { testUpdateProgress } from '../endpoints/update-progress-test-function.js';
import { testQuizComplete } from '../endpoints/quiz-complete-test-function.js';

export const options = {
  scenarios: {
    course_completion: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: Object.assign({}, config.thresholds, {
    'workflow_duration': ['p(95)<20000'], // Workflow should complete in under 20s for 95% of cases (7-step journey)
  }),
  tags: {
    testType: 'workflow',
    workflow: 'course-completion',
  },
};

export function setup() {
  logInfo('Setting up course completion workflow test...');
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const token = authData.token;
  const workflowName = 'CourseCompletionWorkflow';
  const workflowStartTime = Date.now();
  let workflowSuccess = true;
  
  let courseId = null;
  let sectionIndex = 0;
  
  try {
    // Step 1: Browse Topics
    group('Step 1: Browse Topics', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Browsing topics`);
      
      const response = testTopics(token);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'BrowseTopics', stepDuration);
      
      if (response.status !== 200) {
        workflowSuccess = false;
        logError(`${workflowName}: Browse topics failed`);
      }
    });
    
    randomSleep(1, 2);
    
    // Step 2: Browse Courses
    group('Step 2: Browse Courses', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Browsing courses`);
      
      const response = testCourses(token);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'BrowseCourses', stepDuration);
      
      if (response.status === 200) {
        // Extract first course ID from response
        try {
          const json = response.json();
          const courses = json.data || json.courses || json;
          if (Array.isArray(courses) && courses.length > 0) {
            courseId = courses[0].id || courses[0].course_id || 1;
            logInfo(`${workflowName}: Selected course ID ${courseId}`);
          } else {
            courseId = 1; // Fallback
          }
        } catch (e) {
          courseId = 1; // Fallback
          logError(`${workflowName}: Could not extract course ID, using fallback`);
        }
      } else {
        workflowSuccess = false;
        courseId = 1; // Fallback
        logError(`${workflowName}: Browse courses failed`);
      }
    });
    
    randomSleep(2, 3);
    
    // Step 3: Enroll in Course
    group('Step 3: Enroll in Course', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Enrolling in course ${courseId}`);
      
      const response = testEnroll(authData, courseId);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'EnrollCourse', stepDuration);
      
      if (response.status !== 200 && response.status !== 201) {
        workflowSuccess = false;
        logError(`${workflowName}: Enroll failed`);
      }
    });
    
    randomSleep(2, 3);
    
    // Step 4: Start Course - Update Progress
    group('Step 4: Start Course Section', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Starting course section ${sectionIndex}`);
      
      const response = testUpdateProgress(token, courseId, sectionIndex, 25);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'StartSection', stepDuration);
      
      if (response.status !== 200 && response.status !== 201) {
        workflowSuccess = false;
        logError(`${workflowName}: Start section failed`);
      }
    });
    
    randomSleep(3, 5);
    
    // Step 5: Continue Progress
    group('Step 5: Continue Course Progress', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Continuing course progress`);
      
      const response = testUpdateProgress(token, courseId, sectionIndex, 75);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'ContinueProgress', stepDuration);
      
      if (response.status !== 200 && response.status !== 201) {
        workflowSuccess = false;
        logError(`${workflowName}: Continue progress failed`);
      }
    });
    
    randomSleep(2, 4);
    
    // Step 6: Complete Quiz
    group('Step 6: Complete Section Quiz', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Completing quiz for section ${sectionIndex}`);
      
      const response = testQuizComplete(token, courseId, sectionIndex, 85);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'CompleteQuiz', stepDuration);
      
      if (response.status !== 200 && response.status !== 201) {
        workflowSuccess = false;
        logError(`${workflowName}: Quiz completion failed`);
      }
    });
    
    randomSleep(1, 2);
    
    // Step 7: Final Progress Update
    group('Step 7: Mark Section Complete', () => {
      const stepStartTime = Date.now();
      logInfo(`${workflowName}: Marking section as complete`);
      
      const response = testUpdateProgress(token, courseId, sectionIndex, 100);
      const stepDuration = Date.now() - stepStartTime;
      recordWorkflowStepMetric(workflowName, 'MarkComplete', stepDuration);
      
      if (response.status !== 200 && response.status !== 201) {
        workflowSuccess = false;
        logError(`${workflowName}: Mark complete failed`);
      }
    });
    
  } catch (error) {
    workflowSuccess = false;
    logError(`${workflowName}: Workflow error - ${error.message}`);
  }
  
  // Record overall workflow metrics
  const workflowDuration = Date.now() - workflowStartTime;
  recordWorkflowMetric(workflowName, workflowDuration, workflowSuccess);
  
  if (workflowSuccess) {
    logInfo(`${workflowName}: Workflow completed successfully in ${workflowDuration}ms`);
  } else {
    logError(`${workflowName}: Workflow failed after ${workflowDuration}ms`);
  }
  
  randomSleep(3, 5);
}

export function teardown(data) {
  logInfo('Course completion workflow test finished');
}
