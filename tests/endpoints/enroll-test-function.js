// tests/endpoints/enroll-test-function.js
// Reusable test function for enroll endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags } from '../../utils/helpers.js';
import { generateEnrollmentData } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export function testEnroll(authData) {
  const endpointName = 'POST /enroll';
  const startTime = Date.now();
  
  const token = typeof authData === 'string' ? authData : authData.token;
  const userId = typeof authData === 'object' ? authData.userId : null;
  
  const enrollmentData = generateEnrollmentData();
  // Add user_id to enrollment data
  if (userId) {
    enrollmentData.user_id = userId;
  }
  
  const url = `${config.baseUrl}${config.endpoints.enroll}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.post(url, JSON.stringify(enrollmentData), params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'enrollment successful': (r) => r.status === 200 || r.status === 201,
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  if (checkResult) {
    recordBusinessEvent('enrollment');
  }
  
  return response;
}
