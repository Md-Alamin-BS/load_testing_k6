// tests/endpoints/course-by-id-test-function.js
// Reusable test function for GET /courses/{id} endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { createTags } from '../../utils/helpers.js';
import { getRandomCourseId } from '../../utils/data-generator.js';

export function testCourseById(token, courseId = null) {
  const actualCourseId = courseId || getRandomCourseId();
  const url = `${config.baseUrl}/courses/${actualCourseId}`;
  
  const params = createAuthParams(token, {
    tags: createTags('GET /courses/{id}'),
  });
  
  return http.get(url, params);
}
