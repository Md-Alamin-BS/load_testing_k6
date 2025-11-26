import { Counter, Rate, Trend, Gauge } from 'k6/metrics';

// Custom metrics for endpoint performance
export const endpointErrors = new Counter('endpoint_errors');
export const endpointSuccesses = new Counter('endpoint_successes');
export const endpointDuration = new Trend('endpoint_duration');

// Workflow metrics
export const workflowErrors = new Counter('workflow_errors');
export const workflowSuccesses = new Counter('workflow_successes');
export const workflowDuration = new Trend('workflow_duration');
export const workflowStepDuration = new Trend('workflow_step_duration');

// Business metrics
export const courseEnrollments = new Counter('course_enrollments');
export const quizCompletions = new Counter('quiz_completions');
export const progressUpdates = new Counter('progress_updates');

// Error rate metrics
export const authenticationErrors = new Rate('authentication_errors');
export const apiErrors = new Rate('api_errors');

// Response time percentiles (automatically calculated by k6 from Trend metrics)
export const p95ResponseTime = new Trend('p95_response_time');
export const p99ResponseTime = new Trend('p99_response_time');

/**
 * Record endpoint metrics
 * @param {string} endpointName - Name of the endpoint
 * @param {number} duration - Request duration in milliseconds
 * @param {boolean} success - Whether the request was successful
 * @param {Object} tags - Additional tags for the metric
 */
export function recordEndpointMetric(endpointName, duration, success, tags = {}) {
  const metricTags = Object.assign({
    endpoint: endpointName,
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
  }, tags);
  
  endpointDuration.add(duration, metricTags);
  
  if (success) {
    endpointSuccesses.add(1, metricTags);
  } else {
    endpointErrors.add(1, metricTags);
  }
}

/**
 * Record workflow metrics
 * @param {string} workflowName - Name of the workflow
 * @param {number} duration - Workflow duration in milliseconds
 * @param {boolean} success - Whether the workflow completed successfully
 * @param {Object} tags - Additional tags for the metric
 */
export function recordWorkflowMetric(workflowName, duration, success, tags = {}) {
  const metricTags = Object.assign({
    workflow: workflowName,
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
  }, tags);
  
  workflowDuration.add(duration, metricTags);
  
  if (success) {
    workflowSuccesses.add(1, metricTags);
  } else {
    workflowErrors.add(1, metricTags);
  }
}

/**
 * Record workflow step metrics
 * @param {string} workflowName - Name of the workflow
 * @param {string} stepName - Name of the step
 * @param {number} duration - Step duration in milliseconds
 * @param {Object} tags - Additional tags for the metric
 */
export function recordWorkflowStepMetric(workflowName, stepName, duration, success, tags = {}) {
  const metricTags = Object.assign({
    workflow: workflowName,
    step: stepName,
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
  }, tags);
  
  workflowStepDuration.add(duration, metricTags);
}

/**
 * Record business event
 * @param {string} eventType - Type of business event (enrollment, quiz_completion, etc.)
 * @param {Object} tags - Additional tags for the metric
 */
export function recordBusinessEvent(eventType, tags = {}) {
  const metricTags = Object.assign({
    runId: __ENV.RUN_ID || `run-${Date.now()}`,
    testType: __ENV.TEST_TYPE || 'load',
  }, tags);
  
  switch (eventType) {
    case 'enrollment':
      courseEnrollments.add(1, metricTags);
      break;
    case 'quiz_completion':
      quizCompletions.add(1, metricTags);
      break;
    case 'progress_update':
      progressUpdates.add(1, metricTags);
      break;
  }
}
