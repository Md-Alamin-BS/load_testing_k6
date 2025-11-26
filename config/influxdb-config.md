# K6 InfluxDB Configuration
# This file contains configuration for sending k6 metrics to InfluxDB

## InfluxDB v2 Configuration
# Set these environment variables before running k6:

# K6_OUT=influxdb=http://localhost:8086
# K6_INFLUXDB_ORGANIZATION=k6-org
# K6_INFLUXDB_BUCKET=k6-metrics
# K6_INFLUXDB_TOKEN=k6-admin-token-12345
# K6_INFLUXDB_INSECURE=false
# K6_INFLUXDB_PUSH_INTERVAL=10s

## Example k6 run command with InfluxDB output:
# k6 run --out influxdb=http://localhost:8086 tests/scenarios/load-test.js

## Tags to include in metrics:
# All tests are configured to include the following tags:
# - runId: Unique identifier for each test run
# - testType: Type of test (load, stress, soak, spike)
# - endpoint: API endpoint being tested
# - workflow: Workflow name (for workflow tests)
# - environment: Testing environment (dev, staging, prod)

## Custom Metrics
# The framework sends the following custom metrics to InfluxDB:
# - endpoint_errors: Counter for endpoint errors
# - endpoint_successes: Counter for successful endpoint calls
# - endpoint_duration: Trend for endpoint response times
# - workflow_errors: Counter for workflow errors
# - workflow_successes: Counter for successful workflows
# - workflow_duration: Trend for workflow completion times
# - workflow_step_duration: Trend for individual workflow step times
# - course_enrollments: Counter for course enrollments
# - quiz_completions: Counter for quiz completions
# - progress_updates: Counter for progress updates

## InfluxDB Query Examples:
# View all test runs:
# from(bucket: "k6-metrics")
#   |> range(start: -24h)
#   |> filter(fn: (r) => r._measurement == "http_reqs")
#   |> group(columns: ["runId"])
#
# View endpoint metrics for specific test run:
# from(bucket: "k6-metrics")
#   |> range(start: -24h)
#   |> filter(fn: (r) => r.runId == "run-1" and r._measurement == "http_req_duration")
#   |> group(columns: ["endpoint"])
