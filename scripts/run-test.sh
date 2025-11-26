#!/bin/bash

export RUN_ID="${1:-run-$(date +%s)}"
export TEST_TYPE="${2:-load}"
export ENVIRONMENT="${3:-dev}"

echo "======================================"
echo "Starting k6 Performance Test"
echo "======================================"
echo "Run ID: $RUN_ID"
echo "Test Type: $TEST_TYPE"
echo "Environment: $ENVIRONMENT"
echo "======================================"

# Run the appropriate test based on TEST_TYPE
case "$TEST_TYPE" in
  # Scenario Tests
  load)
    k6 run tests/scenarios/load-test.js
    ;;
  stress)
    k6 run tests/scenarios/stress-test.js
    ;;
  soak)
    k6 run tests/scenarios/soak-test.js
    ;;
  spike)
    k6 run tests/scenarios/spike-test.js
    ;;
  edge)
    k6 run tests/scenarios/edge-cases.js
    ;;
  # Workflow Tests
  workflow)
    k6 run tests/workflows/course-completion-workflow.js
    ;;
  # Endpoint Tests
  endpoints)
    k6 run tests/endpoints/all-endpoints.js
    ;;
  topics)
    k6 run tests/endpoints/topics.js
    ;;
  courses)
    k6 run tests/endpoints/courses.js
    ;;
  course-by-id)
    k6 run tests/endpoints/course-by-id.js
    ;;
  enroll)
    k6 run tests/endpoints/enroll.js
    ;;
  update-progress)
    k6 run tests/endpoints/update-progress.js
    ;;
  quiz-complete)
    k6 run tests/endpoints/quiz-complete.js
    ;;
  mycourses)
    k6 run tests/endpoints/mycourses.js
    ;;
  recommendations)
    k6 run tests/endpoints/recommendations.js
    ;;
  section-quizzes)
    k6 run tests/endpoints/section-quizzes.js
    ;;
  topics-by-id-courses)
    k6 run tests/endpoints/topics-by-id-courses.js
    ;;
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Available types:"
    echo "  Scenarios: load, stress, soak, spike, edge"
    echo "  Workflow: workflow"
    echo "  Endpoints: endpoints, topics, courses, course-by-id, enroll, update-progress,"
    echo "             quiz-complete, mycourses, recommendations, section-quizzes, topics-by-id-courses"
    exit 1
    ;;
esac

echo "======================================"
echo "Test completed!"
echo "View results in Grafana: http://localhost:3000"
echo "======================================"
