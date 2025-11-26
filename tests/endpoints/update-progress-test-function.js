// tests/endpoints/update-progress-test-function.js
// Reusable test function for update progress endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags } from '../../utils/helpers.js';
import { generateProgressData } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export function testUpdateProgress(token, courseId = null, sectionIndex = null, progress = null) {
  const endpointName = 'PUT /courses/update_progress';
  const startTime = Date.now();
  
  const progressData = generateProgressData(courseId, sectionIndex, progress);
  const url = `${config.baseUrl}${config.endpoints.updateProgress}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.put(url, JSON.stringify(progressData), params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'progress update successful': (r) => r.status === 200 || r.status === 201,
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  if (checkResult) {
    recordBusinessEvent('progress_update');
  }
  
  return response;
}
