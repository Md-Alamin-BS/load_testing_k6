import { group, check } from 'k6';
import http from 'k6/http';
import { config } from '../../config/test-config.js';
import { authenticate, createAuthParams } from '../../utils/auth.js';
import { randomSleep, logInfo, logError } from '../../utils/helpers.js';

export const options = {
  scenarios: {
    edge_cases: {
      executor: 'constant-vus',
      vus: 5,
      duration: '3m',
      gracefulStop: '30s',
    },
  },
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // More lenient for error scenarios
    'checks': ['rate>0.5'], // Expect some failures in edge case testing
  },
  tags: {
    testType: 'edge-cases',
    scenario: 'negative-testing',
  },
};

export function setup() {
  logInfo('Starting Edge Case & Negative Testing Suite');
  const authData = authenticate();
  if (!authData || !authData.token) {
    throw new Error('Authentication failed in setup phase');
  }
  return authData;
}

export default function (authData) {
  const { token, userId } = authData;
  
  // Test 1: Check if progress values (0, 100, 150, -10) are validated correctly
  group('Boundary Values - Course Progress', () => {
    logInfo('Testing progress boundary values');
    
    // Test progress = 0 (lower boundary)
    let payload = JSON.stringify({
      course_id: 1,
      progress: 0
    });
    let res = http.put(
      `${config.baseUrl}/courses/update_progress`,
      payload,
      createAuthParams(token)
    );
    check(res, {
      'progress=0 accepted': (r) => r.status === 200 || r.status === 201,
    });
    
    // Test progress = 100 (upper boundary)
    payload = JSON.stringify({
      course_id: 1,
      progress: 100
    });
    res = http.put(
      `${config.baseUrl}/courses/update_progress`,
      payload,
      createAuthParams(token)
    );
    check(res, {
      'progress=100 accepted': (r) => r.status === 200 || r.status === 201,
    });
    
    // Test progress > 100 (beyond upper boundary - should fail or cap)
    payload = JSON.stringify({
      course_id: 1,
      progress: 150
    });
    res = http.put(
      `${config.baseUrl}/courses/update_progress`,
      payload,
      createAuthParams(token)
    );
    check(res, {
      'progress>100 handled': (r) => r.status === 200 || r.status === 400 || r.status === 422,
    });
    
    // Test negative progress (should fail)
    payload = JSON.stringify({
      course_id: 1,
      progress: -10
    });
    res = http.put(
      `${config.baseUrl}/courses/update_progress`,
      payload,
      createAuthParams(token)
    );
    check(res, {
      'negative progress rejected': (r) => r.status === 400 || r.status === 422,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 2: Verify handling of invalid IDs (999999, 0, -1, non-existent sections)
  group('Invalid IDs - Non-existent Resources', () => {
    logInfo('Testing invalid resource IDs');
    
    // Non-existent course ID (very large number)
    let res = http.get(
      `${config.baseUrl}/courses/999999`,
      createAuthParams(token)
    );
    check(res, {
      'non-existent course returns 404': (r) => r.status === 404 || r.status === 400,
    });
    
    // Zero course ID
    res = http.get(
      `${config.baseUrl}/courses/0`,
      createAuthParams(token)
    );
    check(res, {
      'zero course ID handled': (r) => r.status === 404 || r.status === 400 || r.status === 422,
    });
    
    // Negative course ID
    res = http.get(
      `${config.baseUrl}/courses/-1`,
      createAuthParams(token)
    );
    check(res, {
      'negative course ID rejected': (r) => r.status === 404 || r.status === 400 || r.status === 422,
    });
    
    // Invalid section index for quiz
    res = http.post(
      `${config.baseUrl}/courses/1/sections/9999/quiz-complete`,
      '{}',
      createAuthParams(token)
    );
    check(res, {
      'invalid section index handled': (r) => r.status === 404 || r.status === 400,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 3: Test API response to broken JSON, missing fields, and wrong data types
  group('Malformed Requests', () => {
    logInfo('Testing malformed payloads');
    
    // Empty payload where data is required
    let res = http.post(
      `${config.baseUrl}/enroll`,
      '{}',
      createAuthParams(token)
    );
    check(res, {
      'empty enroll payload rejected': (r) => r.status === 400 || r.status === 422,
    });
    
    // Missing required field (course_id)
    res = http.post(
      `${config.baseUrl}/enroll`,
      JSON.stringify({ user_id: userId || 1 }),
      createAuthParams(token)
    );
    check(res, {
      'missing course_id rejected': (r) => r.status === 400 || r.status === 422,
    });
    
    // Invalid JSON
    res = http.post(
      `${config.baseUrl}/enroll`,
      'invalid-json-here',
      createAuthParams(token)
    );
    check(res, {
      'invalid JSON rejected': (r) => r.status === 400 || r.status === 422,
    });
    
    // Wrong data types
    res = http.put(
      `${config.baseUrl}/courses/update_progress`,
      JSON.stringify({
        course_id: "not-a-number",
        progress: "also-not-a-number"
      }),
      createAuthParams(token)
    );
    check(res, {
      'wrong data types rejected': (r) => r.status === 400 || r.status === 422,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 4: Check if duplicate enrollments are handled properly
  group('Duplicate Operations - Idempotency', () => {
    logInfo('Testing duplicate enrollments');
    
    const enrollPayload = JSON.stringify({
      course_id: 1,
      user_id: userId || 1
    });
    
    // First enrollment
    let res1 = http.post(
      `${config.baseUrl}/enroll`,
      enrollPayload,
      createAuthParams(token)
    );
    
    // Duplicate enrollment (should be idempotent or return specific error)
    let res2 = http.post(
      `${config.baseUrl}/enroll`,
      enrollPayload,
      createAuthParams(token)
    );
    
    check(res2, {
      'duplicate enrollment handled': (r) => r.status === 200 || r.status === 409 || r.status === 400,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 5: Verify rejection of missing, invalid, and empty auth tokens
  group('Authorization - Invalid Tokens', () => {
    logInfo('Testing invalid authentication');
    
    // No authorization header
    let res = http.get(`${config.baseUrl}/courses`);
    check(res, {
      'no auth rejected': (r) => r.status === 401 || r.status === 403,
    });
    
    // Invalid token
    const invalidParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer invalid-token-12345'
      }
    };
    res = http.get(`${config.baseUrl}/courses`, invalidParams);
    check(res, {
      'invalid token rejected': (r) => r.status === 401 || r.status === 403,
    });
    
    // Expired token format (malformed)
    invalidParams.headers.Authorization = 'Bearer ';
    res = http.get(`${config.baseUrl}/courses`, invalidParams);
    check(res, {
      'empty token rejected': (r) => r.status === 401 || r.status === 403 || r.status === 422,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 6: Test handling of missing, negative, excessive, and invalid query params
  group('Query Parameters - Invalid Values', () => {
    logInfo('Testing invalid query parameters');
    
    // Missing required query param (user_id)
    let res = http.get(
      `${config.baseUrl}/mycourses`,
      createAuthParams(token)
    );
    check(res, {
      'missing required param handled': (r) => r.status === 400 || r.status === 422 || r.status === 200,
    });
    
    // Invalid limit value (negative)
    res = http.get(
      `${config.baseUrl}/recommendations?user_id=${userId || 1}&limit=-10`,
      createAuthParams(token)
    );
    check(res, {
      'negative limit handled': (r) => r.status === 400 || r.status === 422 || r.status === 500,
    });
    
    // Extremely large limit (potential DoS)
    res = http.get(
      `${config.baseUrl}/recommendations?user_id=${userId || 1}&limit=999999`,
      createAuthParams(token)
    );
    check(res, {
      'excessive limit handled': (r) => r.status === 400 || r.status === 200,
    });
    
    // Invalid user_id format
    res = http.get(
      `${config.baseUrl}/mycourses?user_id=not-a-number`,
      createAuthParams(token)
    );
    check(res, {
      'invalid user_id format rejected': (r) => r.status === 400 || r.status === 422,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 7: Check if simultaneous progress updates cause race condition issues
  group('Concurrent Operations - Race Conditions', () => {
    logInfo('Testing concurrent progress updates');
    
    // Simulate rapid progress updates (race condition)
    const courseId = 1;
    const batch = http.batch([
      ['PUT', `${config.baseUrl}/courses/update_progress`, 
       JSON.stringify({ course_id: courseId, progress: 25 }), createAuthParams(token)],
      ['PUT', `${config.baseUrl}/courses/update_progress`, 
       JSON.stringify({ course_id: courseId, progress: 50 }), createAuthParams(token)],
      ['PUT', `${config.baseUrl}/courses/update_progress`, 
       JSON.stringify({ course_id: courseId, progress: 75 }), createAuthParams(token)],
    ]);
    
    check(batch[0], {
      'concurrent update 1 processed': (r) => r.status === 200 || r.status === 201,
    });
    check(batch[1], {
      'concurrent update 2 processed': (r) => r.status === 200 || r.status === 201,
    });
    check(batch[2], {
      'concurrent update 3 processed': (r) => r.status === 200 || r.status === 201,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 8: Verify protection against SQL injection and XSS attacks
  group('Input Validation - Special Characters', () => {
    logInfo('Testing special character handling');
    
    // SQL Injection attempt (should be sanitized)
    // API validates input at framework level and returns 422 for invalid course_id format
    let res = http.get(
      `${config.baseUrl}/courses/1' OR '1'='1`,
      createAuthParams(token)
    );
    check(res, {
      'SQL injection prevented': (r) => r.status === 422 || r.status === 400 || r.status === 404,
    });
    
    // XSS attempt in course ID
    res = http.get(
      `${config.baseUrl}/courses/<script>alert('xss')</script>`,
      createAuthParams(token)
    );
    check(res, {
      'XSS attempt rejected': (r) => r.status === 404 || r.status === 400 || r.status === 422,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 9: Ensure wrong HTTP methods (POST instead of GET, etc.) are rejected
  group('HTTP Method Violations', () => {
    logInfo('Testing wrong HTTP methods');
    
    // POST where GET is expected
    let res = http.post(
      `${config.baseUrl}/courses`,
      '{}',
      createAuthParams(token)
    );
    check(res, {
      'wrong method POST handled': (r) => r.status === 405 || r.status === 404 || r.status === 400,
    });
    
    // GET where POST is expected
    res = http.get(
      `${config.baseUrl}/enroll`,
      createAuthParams(token)
    );
    check(res, {
      'wrong method GET handled': (r) => r.status === 405 || r.status === 404,
    });
  });
  
  randomSleep(1, 2);
  
  // Test 10: Test edge cases in pagination (page 0, -1, 99999, limit 0)
  group('Pagination Edge Cases', () => {
    logInfo('Testing pagination boundaries');
    
    // Page 0 (should return first page or error)
    let res = http.get(
      `${config.baseUrl}/topics?page=0&limit=10`,
      createAuthParams(token)
    );
    check(res, {
      'page=0 handled': (r) => r.status === 200 || r.status === 400,
    });
    
    // Negative page
    res = http.get(
      `${config.baseUrl}/topics?page=-1&limit=10`,
      createAuthParams(token)
    );
    check(res, {
      'negative page handled': (r) => r.status === 200 || r.status === 400 || r.status === 422,
    });
    
    // Very large page number (empty results expected)
    res = http.get(
      `${config.baseUrl}/topics?page=99999&limit=10`,
      createAuthParams(token)
    );
    check(res, {
      'large page number handled': (r) => r.status === 200,
    });
    
    // Zero limit
    res = http.get(
      `${config.baseUrl}/topics?page=1&limit=0`,
      createAuthParams(token)
    );
    check(res, {
      'zero limit handled': (r) => r.status === 200 || r.status === 400 || r.status === 422,
    });
  });
}

export function teardown(data) {
  logInfo('Edge Case Testing Completed');
  logInfo('Review results for security vulnerabilities and error handling issues');
  console.log('');
  console.log('View Results:');
  console.log('   Grafana Dashboard: http://localhost:3000');
  console.log('   InfluxDB:          http://localhost:8086');
  console.log('');
  console.log('Tips:');
  console.log('   - Login to Grafana with admin/admin');
  console.log('   - High error rate is expected for edge case testing');
  console.log('   - Review which endpoints handled invalid inputs correctly');
  console.log('');
}
