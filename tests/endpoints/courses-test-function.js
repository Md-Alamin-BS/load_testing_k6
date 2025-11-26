// tests/endpoints/courses-test-function.js
// Reusable test function for courses endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags } from '../../utils/helpers.js';
import { generateCourseFilters } from '../../utils/data-generator.js';
import { recordEndpointMetric } from '../../utils/metrics.js';

export function testCourses(token) {
  const endpointName = 'GET /courses';
  const startTime = Date.now();
  
  const filters = generateCourseFilters();
  const queryString = Object.keys(filters).map(key => key + '=' + encodeURIComponent(filters[key])).join('&');
  const url = `${config.baseUrl}${config.endpoints.courses}${queryString ? '?' + queryString : ''}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.get(url, params);
  const duration = Date.now() - startTime;
  
  const checkResult = handleResponse(response, endpointName, {
    'courses returned': (r) => {
      try {
        const json = r.json();
        return json && (Array.isArray(json) || Array.isArray(json.data) || json.courses);
      } catch (e) {
        return false;
      }
    },
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  return response;
}
