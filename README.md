# K6 Performance Testing Framework

A modular performance testing framework for API testing with real-time metrics visualization in Grafana and CI/CD automation.

## What This Framework Does

**In Simple Terms**: This framework simulates virtual users making API calls to test if your backend can handle real traffic. It measures response times, finds bottlenecks, and displays results in beautiful dashboards.

**Flow**: k6 (runs tests) → InfluxDB (stores metrics) → Grafana (visualizes data)

---

## Test Coverage

### Performance Test Types (4)
- **Load Testing**: Normal traffic (10 users, 2 min)
- **Stress Testing**: Find limits (5→20 users, 2.5 min)
- **Soak Testing**: Long-term stability (5 users, 3 min)
- **Spike Testing**: Traffic bursts (5→20 users spike, 1 min)

### API Endpoints Tested (9)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/topics` | GET | Browse topics |
| `/courses` | GET | List courses |
| `/courses/{id}` | GET | Course details |
| `/enroll` | POST | Enroll in course |
| `/courses/update_progress` | POST | Update progress |
| `/courses/{id}/sections/{idx}/quiz-complete` | POST | Submit quiz |
| `/mycourses` | GET | Enrolled courses |
| `/recommendations` | GET | Recommendations |
| `/topics/{id}/courses` | GET | Courses by topic |

### User Workflows (1)
- **Course Completion**: Browse → View → Enroll → Progress → Quiz

### Metrics Collected
- Response times (avg, p95, max)
- Requests per second (RPS)
- Error rates
- Workflow duration & success rates

---

## Running Tests: npm vs k6 Direct

**Should I install npm?**

- **Use npm (Recommended)**: If you want simpler, shorter commands
  - Easier to remember: `npm run test:load`
  - Scripts handle long commands for you
  - Good for regular testing
  
- **Use k6 directly (No npm)**: If you prefer not to install Node.js/npm
  - Only need k6 installed
  - Full control over command parameters
  - No additional dependencies
  - Commands are longer

**Both methods work identically** - choose based on your preference!

### Quick Comparison

| Feature | npm Method | Direct k6 Method |
|---------|-----------|------------------|
| **Prerequisites** | k6 + Docker + npm | k6 + Docker only |
| **Command Length** | Short (`npm run test:load`) | Long (full k6 command) |
| **Flexibility** | Pre-configured scripts | Full command control |
| **Best For** | Regular testing, beginners | Advanced users, CI/CD customization |

---

## Quick Start - Local Setup

### Step 1: Install Prerequisites

```bash
# Install k6 (Required)
# Windows: choco install k6
# macOS: brew install k6
# Linux: sudo apt-get install k6

# Install Docker Desktop (Required)
# Download from https://docs.docker.com/get-docker/

# Install Node.js/npm (Optional - for simplified commands)
# Download from https://nodejs.org/
# OR skip if you prefer using k6 commands directly

# Verify installations
k6 version
docker --version
node --version  # Optional
npm --version   # Optional
```

### Step 2: Clone and Configure

```bash
# Clone repository
git clone https://github.com/Md-Alamin-BS/load_testing_k6.git
cd load_testing_k6

# Setup environment variables
cp .env.example .env

# Edit .env with your credentials:
# BASE_URL=https://api.polanji.com
# USER_EMAIL=your-email@example.com
# USER_PASSWORD=your-password
```

### Step 3: Start Infrastructure

```bash
# Start InfluxDB + Grafana
docker-compose up -d

# Verify (should see 2 containers running)
docker-compose ps
```

**Services Started:**
- InfluxDB: `http://localhost:8086`
- Grafana: `http://localhost:3000` (admin/admin)

### Step 4: Run Your First Test

**Option A: Using npm (Recommended - Simpler)**

```bash
# Set unique Run ID (Linux/macOS)
export RUN_ID="test-001"

# Set unique Run ID (Windows PowerShell)
$env:RUN_ID="test-001"

# Run load test
npm run test:load
```

**Option B: Using k6 directly (No npm needed)**

```bash
# Windows PowerShell
$env:RUN_ID="test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js

# Linux/macOS
RUN_ID="test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js
```

**Expected output:**
```
✓ status is 200
✓ response time < 500ms
checks............: 100.00%
http_req_duration.: avg=245ms p(95)=450ms
```

### Step 5: View Results in Grafana

1. Open: `http://localhost:3000`
2. Login: `admin` / `admin`
3. Go to: **Dashboards** → **Browse** → **K6** folder
4. Open: **K6 Endpoint Performance**
5. **Set time range**: "Last 1 hour" (top-right)
6. **Select Run ID**: `test-001`
7. View metrics! 

---

## Quick Start - GitHub Actions (CI/CD)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/your-repo.git
git push -u origin main
```

### Step 2: Add GitHub Secrets

1. Go to: **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `BASE_URL`: `https://api.polanji.com`
   - `WEBSITE_URL`: `https://www.polanji.com`
   - `USER_EMAIL`: Your test email
   - `USER_PASSWORD`: Your test password

### Step 3: Run Tests

**Option A - Manual Trigger:**
1. Go to **Actions** tab
2. Select **K6 Performance Tests**
3. Click **Run workflow**
4. Choose test type and Run ID
5. Download results from **Artifacts** section

**Option B - Automatic on PR:**
- Tests run automatically when you create a pull request
- Results posted as PR comment

**Option C - Scheduled:**
- Daily at 2 AM UTC (load tests)
- Weekly on Mondays (stress tests)

---

## View Results in Grafana

### Dashboard 1: Endpoint Performance

**What it shows:**
- Requests per second
- Response times (avg, p95, max)
- Error rates by endpoint
- Response time trends

**How to use:**
1. Select **Run ID** (e.g., `test-001`)
2. Select **Endpoint** (e.g., `/courses`)
3. Adjust **time range** to include your test

### Dashboard 2: Workflow Performance

**What it shows:**
- Workflow success/error counts
- Workflow duration (avg, p95, max)
- Individual step performance

**How to use:**
1. Select **Run ID**
2. Select **Workflow** (e.g., `CourseCompletion`)
3. View end-to-end metrics

---

## Dashboard Screenshots

Below are screenshots of the Grafana dashboards showing actual test results from successful runs.

### Endpoint Performance Dashboard

This dashboard displays real-time metrics for individual API endpoints including response times, throughput, error rates, and the endpoint performance table with detailed statistics.

![Endpoint Performance Dashboard](docs/images/endpoint-dashboard.png)

*Screenshot shows: Endpoint performance metrics with Run ID filtering, response time graphs, RPS gauges, and comprehensive endpoint table with all 9 tested endpoints.*

### Workflow Performance Dashboard

This dashboard shows end-to-end workflow execution metrics including step-by-step performance, success rates, and the workflow execution table.

![Workflow Performance Dashboard](docs/images/workflow-dashboard.png)

*Screenshot shows: Course Completion workflow metrics with individual step durations, success/error counts, and detailed workflow execution table.*

---

## Project Structure

```
assignment_k6/
├── tests/
│   ├── endpoints/      # 9 API endpoint tests
│   ├── scenarios/      # 4 performance test types
│   └── workflows/      # User journey tests
├── utils/
│   ├── auth.js        # Authentication
│   ├── helpers.js     # Utilities
│   └── metrics.js     # Custom metrics
├── grafana/
│   └── dashboards/    # Pre-built dashboards
├── .github/workflows/ # CI/CD automation
├── config/
│   └── test-config.js # Test configuration
└── docker-compose.yml # Infrastructure setup
```

---

## Troubleshooting

### Issue: "No Data" in Grafana
**Solution:**
1. Set time range to "Last 6 hours"
2. Verify Run ID is correct
3. Check InfluxDB has data:
   ```bash
   docker exec k6-influxdb influx -database k6 -execute "SELECT COUNT(*) FROM http_reqs"
   ```

### Issue: Docker containers not starting
**Solution:**
```bash
docker-compose down -v
docker-compose up -d
```

### Issue: Authentication fails
**Solution:**
- Check `.env` file has correct credentials
- Verify API endpoint is accessible
- Review k6 output for error messages

### Issue: GitHub Actions fails
**Solution:**
- Verify secrets are configured in repository settings
- Check workflow logs in Actions tab
- Ensure YAML syntax is correct

### Issue: "npm: command not found" or don't want to install npm
**Solution:**
You don't need npm! Use k6 directly:

**Windows PowerShell:**
```powershell
$env:RUN_ID="test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js
```

**Linux/macOS:**
```bash
RUN_ID="test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js
```

See the "Common Test Commands" section below for all test types.

---

## Common Test Commands

### Using npm (Recommended - Simpler)

```bash
# Set Run ID first (Linux/macOS)
export RUN_ID="my-test-001"

# Set Run ID first (Windows PowerShell)
$env:RUN_ID="my-test-001"

# Run scenario tests
npm run test:load          # Load test
npm run test:stress        # Stress test
npm run test:soak          # Soak test
npm run test:spike         # Spike test
npm run test:edge-cases    # Edge cases test

# Run workflow test
npm run test:workflow      # Course completion workflow

# Run all endpoints test
npm run test:endpoints     # All endpoints combined

# Run individual endpoint tests
npm run test:topics        # Topics endpoint
npm run test:courses       # Courses endpoint
npm run test:course-by-id  # Course by ID endpoint
npm run test:enroll        # Enroll endpoint
npm run test:update-progress     # Update progress endpoint
npm run test:quiz-complete       # Quiz complete endpoint
npm run test:mycourses           # My courses endpoint
npm run test:recommendations     # Recommendations endpoint
npm run test:section-quizzes     # Section quizzes endpoint
npm run test:topics-by-id-courses # Courses by topic endpoint
```

### Using k6 directly (No npm needed)

```bash
# Windows PowerShell - Scenario Tests
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=stress tests/scenarios/stress-test.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=soak tests/scenarios/soak-test.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=spike tests/scenarios/spike-test.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=edge-cases tests/scenarios/edge-cases.js

# Windows PowerShell - Workflow & Endpoints
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 tests/workflows/course-completion-workflow.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/all-endpoints.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/topics.js
$env:RUN_ID="my-test-001"; k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/courses.js

# Linux/macOS - Scenario Tests
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=load tests/scenarios/load-test.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=stress tests/scenarios/stress-test.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=soak tests/scenarios/soak-test.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=spike tests/scenarios/spike-test.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 --env TEST_TYPE=edge-cases tests/scenarios/edge-cases.js

# Linux/macOS - Workflow & Endpoints
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 tests/workflows/course-completion-workflow.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/all-endpoints.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/topics.js
RUN_ID="my-test-001" k6 run --out influxdb=http://localhost:8086/k6 tests/endpoints/courses.js

# See package.json for complete list of all individual endpoint tests
```

### Using PowerShell/Bash Scripts (Alternative)

```powershell
# Windows PowerShell
.\scripts\run-test.ps1 -TestType load -RunId "test-001"
.\scripts\run-test.ps1 -TestType stress -RunId "test-002"
.\scripts\run-test.ps1 -TestType topics -RunId "test-003"
.\scripts\run-test.ps1 -TestType enroll -RunId "test-004"

# Linux/macOS Bash
./scripts/run-test.sh test-001 load dev
./scripts/run-test.sh test-002 stress dev
./scripts/run-test.sh test-003 topics dev
./scripts/run-test.sh test-004 enroll dev
```

### Docker Infrastructure

```bash
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose ps          # Check status
docker-compose logs        # View logs
```

---

## Performance Analysis Report

**[PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md)** - Comprehensive performance testing analysis with:
- Bottleneck identification and root cause analysis
- Evidence-based performance metrics
- Detailed recommendations for optimization
- Capacity planning and scalability assessment
- Business impact analysis

**Key Findings:**
- Overall System Health: Excellent (99.54% success rate)
- Response Times: Best-in-class (P95: 95ms)
- Critical Issue Identified: Quiz completion endpoint has 2-3% failure rate
- Scalability: System handles 10-20 concurrent users with linear scaling

---

## Assignment Compliance

- 4 performance test types (Load, Stress, Soak, Spike)
- 9 API endpoints tested
- 1 end-to-end workflow
- InfluxDB + Grafana reporting
- Run ID filtering
- All metrics (RPS, avg, p95, max, errors)
- No hardcoded credentials
- Modular, maintainable code
- CI/CD integration
- Docker support
- Screenshots of Grafana dashboards (Workflow & Endpoint Table)
- Grafana dashboards in JSON format (`grafana/dashboards/`)

---

