# K6 InfluxDB Configuration Guide

## What This File Does
This file explains how k6 test results are stored in InfluxDB and visualized in Grafana. Think of it as:
- **k6** = The test runner (simulates users)
- **InfluxDB** = The database (stores test results)
- **Grafana** = The dashboard (shows pretty graphs)

---

## Current Setup (InfluxDB v1.8)

### How It Works
When you run tests, k6 automatically sends metrics to InfluxDB. This is already configured in `docker-compose.yml`:

```yaml
K6_OUT=influxdb=http://influxdb:8086/k6
```

**Don't need to change anything!** The setup works automatically when Docker used.

### Connection Details
- **InfluxDB URL**: `http://localhost:8086` (from your computer) or `http://influxdb:8086` (from Docker)
- **Database Name**: `k6`
- **Port**: 8086

---

## What Metrics Are Collected?

### Automatic K6 Metrics
These are collected by k6 automatically:
- **http_reqs**: Total number of HTTP requests
- **http_req_duration**: How long each request took
- **http_req_failed**: Number of failed requests
- **vus**: Number of virtual users at any moment
- **iterations**: How many times tests completed

### Custom Metrics (Built into Our Tests)
Our framework also tracks:
- **endpoint_errors** / **endpoint_successes**: Success/failure counts per API endpoint
- **endpoint_duration**: Response time for each endpoint
- **workflow_errors** / **workflow_successes**: Success/failure of complete user workflows
- **workflow_duration**: Time to complete entire workflows (like enrolling in a course)
- **course_enrollments**: Number of course enrollments
- **quiz_completions**: Number of quizzes completed
- **progress_updates**: Number of progress updates

### Test Tags (For Filtering Results)
Every metric includes these labels for easy filtering:
- **runId**: Unique ID for each test run (e.g., "run-1")
- **testType**: Type of test (load, stress, soak, spike)
- **endpoint**: Which API endpoint was called
- **workflow**: Workflow name (for workflow tests)
- **environment**: Environment tested (dev, staging, prod)

---

## How to Use

### Running Tests (Data Goes to InfluxDB Automatically)
```bash
# Run any test - metrics auto-saved to InfluxDB
docker-compose run k6 run /tests/scenarios/load-test.js

# Or use the PowerShell script
.\scripts\run-test.ps1 -TestType load
```

### Viewing Results in Grafana
1. Go to `http://localhost:3000`
2. Login: `admin` / `admin`
3. Navigate to dashboards - your test results are already there!

---

## Querying InfluxDB (Advanced)

If you want to query the database directly:

### Connect to InfluxDB
```bash
docker exec -it k6-influxdb influx
```

### Example Queries

**View all measurements (metric types):**
```sql
USE k6
SHOW MEASUREMENTS
```

**See all test runs:**
```sql
SELECT * FROM http_reqs GROUP BY "runId" LIMIT 10
```

**Get response times for a specific endpoint:**
```sql
SELECT mean(value) FROM http_req_duration 
WHERE endpoint = '/api/topics' 
AND time > now() - 1h 
GROUP BY time(1m)
```

**Count errors by endpoint:**
```sql
SELECT count(value) FROM http_req_failed 
WHERE value > 0 
GROUP BY endpoint
```

---

## Troubleshooting

### Can't See Metrics in Grafana?
1. Check if InfluxDB is running: `docker ps` (should see k6-influxdb)
2. Verify k6 is sending data: Look for `✓ output: InfluxDB` in test output
3. Check Grafana data source: Go to Configuration → Data Sources → InfluxDB

### Data Not Persisting?
InfluxDB data is stored in a Docker volume (`influxdb-data`). To clear old data:
```bash
docker-compose down -v
docker-compose up -d
```

### Need to Change Configuration?
Edit `docker-compose.yml` and restart:
```bash
docker-compose down
docker-compose up -d
```

---

## Notes

- This setup uses **InfluxDB v1.8** - the connection string and queries are different
- All test files in `/tests` are pre-configured to send metrics to InfluxDB
- Grafana dashboards in `/grafana/dashboards` are automatically loaded on startup
- Data is retained until the Docker volume is manually deleted
