// tests/endpoints/recommendations-test-function.js
// Reusable test function for recommendations endpoint

import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { createTags, randomInt } from '../../utils/helpers.js';

export function testRecommendations(authData, limit = null) {
  const { token, userId } = authData;
  const actualLimit = limit || [10, 20, 48][randomInt(0, 2)];
  const url = `${config.baseUrl}/recommendations?user_id=${userId || 1}&limit=${actualLimit}`;
  
  const params = createAuthParams(token, {
    tags: createTags('GET /recommendations'),
  });
  
  return http.get(url, params);
}
