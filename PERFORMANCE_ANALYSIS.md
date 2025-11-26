# Performance Testing Analysis
**Target API:** https://api.polanji.com  
**Date:** November 26, 2025  
**Testing Framework:** k6

---

## Test Summary

I ran 4 different test scenarios to evaluate the API performance:

| Test Type | Duration | Virtual Users | Total Requests | Success Rate |
|-----------|----------|---------------|----------------|--------------|
| Load Test | 2m 2s | 10 (constant) | 581 | 99.48% |
| Stress Test | 2m 31s | 0→20 (ramping) | 1,080 | 99.54% |
| Soak Test | 3m 3s | 5 (constant) | 296 | 99.77% |
| Workflow Test | 2m 8s | 0→10 (ramping) | 267 | 100% |
| Endpoint Test | 1m 11s | 1 (constant) | 41 | 97.40% |

**Total Requests Tested:** 2,265  
**Overall Success Rate:** 99.56%

---

## Performance Metrics

**Response Times:**
- Average: 84ms
- Median (p50): 79ms
- P95: 95ms
- P99: ~100ms
- Maximum: 382ms

**Throughput:**
- Load Test: 4.73 requests/second
- Stress Test: 7.13 requests/second

---

## Findings

### Issue Found: Quiz Completion Endpoint

The `POST /courses/{course_id}/sections/{section_index}/quiz-complete` endpoint is returning 404 errors.

**Details:**
- Error Message: `{"detail":"Section quiz not found"}`
- Failure Rate: 2-3% of attempts
- Total Failures: 9 out of 1,969 requests

**Breakdown by Test:**
```
Load Test:     3 failures (2.6% of quiz attempts)
Stress Test:   5 failures (2.1% of quiz attempts)
Soak Test:     1 failure (1.5% of quiz attempts)
Endpoint Test: 1 failure (20% of quiz attempts)
```

**Likely Cause:**
- Missing quiz records in the database for some course/section combinations
- The test data is randomly selecting course IDs and section indices, and some combinations don't have quizzes set up

### Other Endpoints

All other endpoints (topics, courses, enroll, update_progress, recommendations, etc.) performed well with 0% error rate.

---

## Performance Observations

**What Worked Well:**
- Fast response times (95% of requests under 100ms)
- System handled load increase smoothly (10→20 users)
- No timeouts or crashes
- Workflow test completed successfully (7-step user journey with 100% success)

**Response Time Under Load:**
- Minimal degradation when doubling the load
- Stress test with 20 users only added 5ms to P95 response time

---

## Suggestions for Improvement

1. **Fix Quiz Endpoint Issues**
   - Verify all course/section combinations have quiz records in the database
   - Add better error handling instead of returning 404

2. **Add Monitoring**
   - Track error rates for individual endpoints
   - Set up alerts for error spikes

3. **Consider Adding**
   - Rate limiting to prevent abuse
   - Database indexing for quiz lookups if not already present

---

## Capacity Analysis

**Current System Can Handle:**
- 10-20 concurrent users comfortably
- Around 5-7 requests per second sustained load

**For Higher Load:**
- Would need to test with more virtual users to find the breaking point
- Consider caching for frequently accessed data
- Database read replicas for scaling

---

## Test Configuration Used

**Load Test:**
- 10 constant virtual users for 2 minutes
- Simulates steady baseline load

**Stress Test:**
- Ramp from 0→5→15→20→0 users
- Tests how system handles increasing load

**Workflow Test:**
- Simulates complete user journey (browse topics → enroll → complete course)
- 7 sequential API calls per workflow

**Endpoint Test:**
- Tests each endpoint individually
- Validates all APIs are functional

---

## Conclusion

The API performs well overall with fast response times and good stability. The main issue identified is the quiz completion endpoint returning 404 errors for about 3% of requests, likely due to incomplete test data in the database. Other than that, the system handles the tested load without any problems.

---

**Test Results Stored In:** InfluxDB (http://localhost:8086/k6)  
**Visualizations Available In:** Grafana (http://localhost:3000)
