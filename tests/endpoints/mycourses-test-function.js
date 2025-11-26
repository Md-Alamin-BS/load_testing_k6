// tests/endpoints/mycourses-test-function.js
// Reusable test function for mycourses endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { createTags } from '../../utils/helpers.js';

export function testMyCourses(authData) {
  const { token, userId } = authData;
  const url = `${config.baseUrl}/mycourses?user_id=${userId || 1}`;
  
  const params = createAuthParams(token, {
    tags: createTags('GET /mycourses'),
  });
  
  return http.get(url, params);
}
