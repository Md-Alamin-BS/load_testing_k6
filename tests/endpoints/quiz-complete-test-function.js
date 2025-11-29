import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { createAuthParams } from '../../utils/auth.js';
import { handleResponse, createTags } from '../../utils/helpers.js';
import { generateQuizCompletionData, getRandomCourseId, getRandomSectionIndex } from '../../utils/data-generator.js';
import { recordEndpointMetric, recordBusinessEvent } from '../../utils/metrics.js';

export function testQuizComplete(token, courseId = null, sectionIndex = null, score = null) {
  const endpointName = 'POST /courses/{id}/sections/{index}/quiz-complete';
  const startTime = Date.now();
  
  const cId = courseId || getRandomCourseId();
  const sIdx = sectionIndex !== null ? sectionIndex : getRandomSectionIndex();
  const quizData = generateQuizCompletionData(cId, sIdx, score);
  
  const url = `${config.baseUrl}${config.endpoints.quizComplete(cId, sIdx)}`;
  
  const params = createAuthParams(token, {
    tags: createTags(endpointName),
  });
  
  const response = http.post(url, JSON.stringify(quizData), params);
  const duration = Date.now() - startTime;
  
  // Handle 404 gracefully - quiz may not exist for random course/section combinations
  // This is expected when test data doesn't match actual quiz availability
  const checkResult = handleResponse(response, endpointName, {
    'quiz completion successful or quiz not found': (r) => 
      r.status === 200 || r.status === 201 || r.status === 404,
  });
  
  recordEndpointMetric(endpointName, duration, checkResult);
  
  // Only record business event for actual successful completions
  if (response.status === 200 || response.status === 201) {
    recordBusinessEvent('quiz_completion');
  }
  
  return response;
}
