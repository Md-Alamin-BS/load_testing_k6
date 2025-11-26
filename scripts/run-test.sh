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
  workflow)
    k6 run tests/workflows/course-completion-workflow.js
    ;;
  endpoints)
    k6 run tests/endpoints/all-endpoints.js
    ;;
  *)
    echo "Unknown test type: $TEST_TYPE"
    echo "Available types: load, stress, soak, spike, edge, workflow, endpoints"
    exit 1
    ;;
esac

echo "======================================"
echo "Test completed!"
echo "View results in Grafana: http://localhost:3000"
echo "======================================"
