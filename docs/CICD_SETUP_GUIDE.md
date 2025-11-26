# 🚀 CI/CD Pipeline Setup Guide

Complete step-by-step guide to set up GitHub Actions CI/CD pipeline with cloud monitoring for k6 performance tests.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Setup Steps](#setup-steps)
4. [Running Tests](#running-tests)
5. [Viewing Results](#viewing-results)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ k6 performance tests working locally
- ✅ GitHub account
- ✅ Git installed on your machine
- ✅ Basic understanding of GitHub Actions
- ✅ API credentials for testing

**Optional for Cloud Monitoring:**
- InfluxDB Cloud account (free tier)
- Grafana Cloud account (free tier)

---

## Architecture Overview

```
┌─────────────────┐
│   Developer     │
│  Pushes Code    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│      GitHub Repository              │
│  ┌───────────────────────────────┐ │
│  │   .github/workflows/          │ │
│  │   - performance-tests.yml     │ │
│  │   - scheduled-tests.yml       │ │
│  └───────────────────────────────┘ │
└────────┬────────────────────────────┘
         │ Triggers
         ▼
┌─────────────────────────────────────┐
│     GitHub Actions Runner           │
│  (Ubuntu VM in Cloud)               │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  1. Checkout code           │  │
│  │  2. Install k6              │  │
│  │  3. Run performance tests   │  │
│  │  4. Send metrics to cloud   │  │
│  │  5. Upload artifacts        │  │
│  └─────────────────────────────┘  │
└────────┬──────────┬─────────────────┘
         │          │
         │          └──────────┐
         ▼                     ▼
┌──────────────────┐   ┌──────────────────┐
│  InfluxDB Cloud  │   │ GitHub Artifacts │
│  (Time-Series)   │   │  (JSON/HTML)     │
└────────┬─────────┘   └──────────────────┘
         │
         │ Query
         ▼
┌──────────────────┐
│  Grafana Cloud   │
│  (Dashboards)    │
└──────────────────┘
```

---

## Setup Steps

### Step 1: Create GitHub Repository

**1.1. Create Repository on GitHub**

1. Go to: https://github.com/new
2. Fill in details:
   - **Repository name**: `k6-performance-testing`
   - **Visibility**: Private (recommended - contains credentials references)
   - **Initialize**: Do NOT add README/gitignore (you already have them)
3. Click **Create repository**

**1.2. Connect Local Repository**

```powershell
# Navigate to your project
cd E:\Documents\Work\assignment_k6

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: K6 performance testing framework"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/k6-performance-testing.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**1.3. Verify Files Uploaded**

Go to your repository on GitHub and verify:
- ✅ `.github/workflows/` folder with YAML files
- ✅ `tests/` folder with test scripts
- ✅ `grafana/dashboards/` with JSON files
- ✅ `README.md` and other docs
- ❌ `.env` file should NOT be present (ignored)

---

### Step 2: Configure GitHub Secrets

**2.1. Navigate to Settings**

1. Go to your repository on GitHub
2. Click **Settings** tab (top right)
3. In left sidebar: **Secrets and variables** → **Actions**
4. You'll see "Actions secrets" page

**2.2. Add Secrets One by One**

Click **New repository secret** button and add each:

```
Name: BASE_URL
Secret: https://api.polanji.com
```

Click "Add secret", then repeat for:

```
Name: WEBSITE_URL
Secret: https://www.polanji.com
```

```
Name: USER_EMAIL
Secret: performancetest07@gmail.com
```

```
Name: USER_PASSWORD
Secret: user123456
```

**2.3. Verify Secrets Added**

You should see 4 secrets listed:
- `BASE_URL`
- `WEBSITE_URL`
- `USER_EMAIL`
- `USER_PASSWORD`

⚠️ **Security Note**: Secret values are encrypted and hidden. Only GitHub Actions can access them.

---

### Step 3: Set Up InfluxDB Cloud (Optional)

Skip this step if you only want to download test results as artifacts. Follow this for cloud monitoring.

**3.1. Sign Up for InfluxDB Cloud**

1. Go to: https://cloud2.influxdata.com/signup
2. Click **Get started for free**
3. Choose **Sign up with Google** or enter email
4. Select region: **AWS us-east-1** (or closest to GitHub Actions runners)
5. Complete registration

**3.2. Create Bucket**

1. After login, you'll see InfluxDB Cloud UI
2. Click **Load Data** (left sidebar) → **Buckets**
3. Click **Create Bucket** button
4. Enter details:
   - **Name**: `k6-metrics`
   - **Delete Data**: After **30 days** (or customize)
5. Click **Create**

**3.3. Generate API Token**

1. Click **Load Data** → **API Tokens**
2. Click **Generate API Token** → **Custom API Token**
3. Configure:
   - **Description**: `github-actions-k6`
   - Scroll to **Buckets** section
   - Find `k6-metrics` bucket
   - Check **Read** and **Write** boxes
4. Click **Generate** button
5. **IMPORTANT**: Copy the token immediately (you can't see it again!)
   - It looks like: `abc123def456xyz789...` (long string)
6. Save it temporarily in Notepad

**3.4. Get Organization Name and URL**

1. Look at top-left corner of InfluxDB UI
2. Note your **Organization name** (e.g., `your-email@example.com` or custom name)
3. Click **Load Data** → **Client Libraries** → **Python**
4. Copy the **URL** shown (e.g., `https://us-east-1-1.aws.cloud2.influxdata.com`)

**3.5. Add InfluxDB Secrets to GitHub**

Go back to GitHub repository → Settings → Secrets and add:

```
Name: INFLUXDB_URL
Secret: https://us-east-1-1.aws.cloud2.influxdata.com
(Your actual URL from step 3.4)
```

```
Name: INFLUXDB_TOKEN
Secret: abc123def456xyz789...
(Your actual token from step 3.3)
```

```
Name: INFLUXDB_ORG
Secret: your-email@example.com
(Your organization name from step 3.4)
```

```
Name: INFLUXDB_BUCKET
Secret: k6-metrics
```

Now you should have **8 total secrets** in GitHub.

---

### Step 4: Verify Workflow Files

**4.1. Check Workflows Exist**

In your GitHub repository, navigate to:
- `.github/workflows/performance-tests.yml`
- `.github/workflows/scheduled-tests.yml`

Click on each file to verify content looks correct.

**4.2. Enable GitHub Actions**

1. Click **Actions** tab in your repository
2. If you see "Workflows are disabled", click **I understand my workflows, go ahead and enable them**
3. You should see two workflows listed:
   - K6 Performance Tests
   - K6 Scheduled Tests

---

### Step 5: Run Your First Test

**5.1. Manual Test Run**

1. In your repository, click **Actions** tab
2. Click **K6 Performance Tests** (left sidebar)
3. Click **Run workflow** button (right side)
4. Fill in the form:
   - **Use workflow from**: `main` (default)
   - **Test Type**: Select `load`
   - **Run ID**: Enter `github-test-001`
   - **Environment**: `dev` (default)
5. Click **Run workflow** (green button)

**5.2. Monitor Execution**

1. The page will refresh - you'll see a new workflow run at the top
2. It shows: "K6 Performance Tests #1" with a yellow circle (running)
3. Click on this workflow run
4. Click on **run-k6-tests** job
5. Watch the logs in real-time:
   ```
   ✓ Checkout code
   ✓ Setup k6
   ✓ Run k6 test
   ✓ Upload results
   ```
6. Wait for completion (~2-5 minutes)
7. When done, you'll see a green checkmark ✓

**5.3. View Results**

After completion:

1. Scroll down to **Artifacts** section
2. You'll see:
   - **k6-results** (JSON summary) - Click to download
   - **k6-html-report** (HTML report) - Click to download
3. Extract the HTML report ZIP
4. Open `report.html` in your browser
5. View detailed metrics, response times, and graphs!

---

### Step 6: Set Up Grafana Cloud (Optional)

Only if you completed Step 3 (InfluxDB Cloud).

**6.1. Sign Up for Grafana Cloud**

1. Go to: https://grafana.com/auth/sign-up/create-user
2. Click **Sign up for free**
3. Enter email and create account
4. Choose **Free** plan (14-day trial, then limited free forever)
5. Complete registration

**6.2. Access Your Grafana Instance**

1. After login, you'll see your Grafana Cloud dashboard
2. Click on your stack name (e.g., `yourname.grafana.net`)
3. Click **Launch** or **Go to Grafana**
4. You're now in your Grafana instance!

**6.3. Add InfluxDB Data Source**

1. In Grafana, click **Connections** (left sidebar)
2. Click **Add new connection**
3. Search for **InfluxDB** and click on it
4. Click **Add new data source** button
5. Configure the data source:
   - **Name**: `InfluxDB-k6-cloud`
   - **Query Language**: Select **InfluxQL** (NOT Flux!)
   - **URL**: Paste your InfluxDB URL (from Step 3.4)
     - Example: `https://us-east-1-1.aws.cloud2.influxdata.com`
   - Scroll down to **Auth** section:
     - Check **Basic auth**
   - Scroll down to **InfluxDB Details**:
     - **Database**: `k6-metrics`
     - **User**: Your InfluxDB username (email)
     - **Password**: Your InfluxDB token (from Step 3.3)
6. Click **Save & Test** (bottom)
7. Should show: "Data source is working" ✓

**6.4. Import Dashboards**

1. Click **Dashboards** (left sidebar) → **New** → **Import**
2. You need to get the JSON files to your cloud Grafana
3. **Option A - Upload JSON**:
   - In your local repo, open: `grafana/dashboards/endpoint-dashboard.json`
   - Copy entire content (Ctrl+A, Ctrl+C)
   - In Grafana import page, click **Import via panel json**
   - Paste JSON content
   - Click **Load**
4. Configure import:
   - **InfluxDB-k6-cloud**: Select your data source from dropdown
   - **Folder**: Select or create "K6 Tests"
5. Click **Import**
6. Repeat for `workflow-dashboard.json`

**6.5. View Dashboard**

1. Click **Dashboards** → **Browse**
2. Open "K6 Tests" folder
3. Click on **K6 Endpoint Performance** dashboard
4. You should see dropdowns for **Run ID** and **Endpoint**
5. Set time range to **Last 24 hours** (top-right)
6. Wait for your first test to send data!

---

## Running Tests

### Method 1: Manual Trigger (GitHub UI)

Best for: Ad-hoc testing, debugging, specific test runs

1. Go to **Actions** tab
2. Select **K6 Performance Tests**
3. Click **Run workflow**
4. Choose parameters and run

### Method 2: Pull Request Trigger (Automatic)

Best for: Code review, catching regressions before merge

```powershell
# Create feature branch
git checkout -b feature/new-endpoint

# Make changes to code
# Add tests for new feature

# Commit and push
git add .
git commit -m "Add new endpoint test"
git push origin feature/new-endpoint

# Go to GitHub → Create Pull Request
# Tests automatically run on PR!
```

### Method 3: Scheduled Tests (Automatic)

Best for: Continuous monitoring, daily health checks

- Already configured in `scheduled-tests.yml`
- Runs daily at 2 AM UTC
- Runs weekly stress tests on Mondays
- Check **Actions** tab for results

### Method 4: API Trigger (Advanced)

Best for: Integration with other CI/CD tools

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/k6-performance-testing/actions/workflows/performance-tests.yml/dispatches \
  -d '{"ref":"main","inputs":{"testType":"load","runId":"api-test-001"}}'
```

---

## Viewing Results

### Option 1: GitHub Artifacts (Always Available)

1. Go to **Actions** tab
2. Click on completed workflow run
3. Scroll to **Artifacts** section
4. Download:
   - **k6-results**: JSON summary with metrics
   - **k6-html-report**: Beautiful HTML report with charts

**HTML Report Contains:**
- Summary statistics
- Response time distribution
- Request rate over time
- Error breakdown
- Per-endpoint metrics

### Option 2: Grafana Dashboards (If Cloud Setup)

1. Go to your Grafana Cloud instance
2. Open **K6 Endpoint Performance** dashboard
3. Select:
   - **Run ID**: Your test run (e.g., `github-test-001`)
   - **Time Range**: Last 24 hours
   - **Endpoint**: Specific API to analyze
4. View real-time metrics:
   - RPS (Requests Per Second)
   - Average response time
   - P95, P99 percentiles
   - Error rates

### Option 3: InfluxDB Data Explorer

1. Go to InfluxDB Cloud
2. Click **Data Explorer** (left sidebar)
3. Query your data:
   ```sql
   SELECT * FROM "http_reqs" 
   WHERE "runId" = 'github-test-001'
   ```
4. Analyze raw metrics

### Option 4: PR Comments (Automatic)

If triggered by PR:
- Results automatically posted as PR comment
- Summary shows pass/fail status
- Link to detailed artifacts
- Response time comparison with baseline

---

## Troubleshooting

### Issue 1: Workflow Doesn't Appear in Actions Tab

**Symptoms:**
- Actions tab is empty
- No workflows listed

**Solution:**
```powershell
# Verify workflow files exist
git ls-files .github/workflows/

# Should show:
# .github/workflows/performance-tests.yml
# .github/workflows/scheduled-tests.yml

# If missing, commit and push them
git add .github/workflows/
git commit -m "Add GitHub Actions workflows"
git push
```

### Issue 2: Authentication Fails

**Symptoms:**
```
Error: Login failed: Invalid credentials
```

**Solution:**
1. Go to Settings → Secrets
2. Verify `USER_EMAIL` and `USER_PASSWORD` are correct
3. Test locally first:
   ```powershell
   $env:USER_EMAIL="your-email@example.com"
   $env:USER_PASSWORD="your-password"
   k6 run tests/scenarios/load-test.js
   ```
4. Update secrets if needed

### Issue 3: InfluxDB Connection Error

**Symptoms:**
```
WARN[0000] Request Failed error="Post...InfluxDB...dial tcp: lookup"
```

**Solution:**
1. Check `INFLUXDB_URL` in secrets (must include `https://`)
2. Verify `INFLUXDB_TOKEN` is correct
3. Check InfluxDB Cloud status: https://status.influxdata.com
4. Test connection manually:
   ```bash
   curl -i "$INFLUXDB_URL/ping"
   ```

### Issue 4: No Data in Grafana

**Symptoms:**
- Grafana shows "No Data"
- RunID dropdown is empty

**Solution:**
1. **Check time range**: Set to "Last 24 hours"
2. **Verify InfluxDB has data**:
   - Go to InfluxDB Cloud
   - Click Data Explorer
   - Query: `SELECT * FROM "http_reqs" LIMIT 10`
   - Should return results
3. **Check Grafana datasource**:
   - Configuration → Data Sources → InfluxDB-k6-cloud
   - Click "Test" - should show success
4. **Check database name**:
   - Grafana datasource database should match InfluxDB bucket name
   - Both should be: `k6-metrics`

### Issue 5: Tests Fail in CI but Pass Locally

**Symptoms:**
- Local tests: ✅ Pass
- GitHub Actions tests: ❌ Fail

**Possible Causes:**
1. **Network latency**: GitHub runners may be slower
2. **Timeouts**: Default timeouts too strict for CI
3. **Rate limiting**: API rate limits triggered by CI

**Solution:**
```javascript
// Adjust thresholds for CI
export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // Increase from 500ms
    'http_req_failed': ['rate<0.05'],      // Increase from 0.01
  },
};

// Or disable thresholds for specific CI runs
if (__ENV.CI === 'true') {
  delete options.thresholds;
}
```

### Issue 6: Secrets Not Available in Workflow

**Symptoms:**
```
Error: Environment variable USER_EMAIL not set
```

**Solution:**
1. Verify secrets are added in Settings → Secrets
2. Check workflow YAML uses secrets correctly:
   ```yaml
   env:
     USER_EMAIL: ${{ secrets.USER_EMAIL }}
     USER_PASSWORD: ${{ secrets.USER_PASSWORD }}
   ```
3. Secrets must be on the **same repository** as workflow
4. For organization repos, check organization-level secrets

---

## Best Practices

### 1. Use Descriptive Run IDs

**Good:**
```
github-pr-123-load
github-main-2024-01-15-stress
github-release-v2.0-soak
```

**Bad:**
```
test-1
run
my-test
```

### 2. Set Realistic Thresholds

```javascript
thresholds: {
  'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  'http_req_failed': ['rate<0.01'],  // 1% error rate
  'http_reqs': ['count>100'],        // Minimum requests
}
```

### 3. Schedule Tests at Off-Peak Hours

```yaml
schedule:
  # 2 AM UTC = Off-peak for most APIs
  - cron: '0 2 * * *'
```

### 4. Store Results Long-Term

- InfluxDB retention: 90+ days
- Download artifacts for critical releases
- Export to S3/Azure Blob for compliance

### 5. Monitor Trends, Not Just Point Values

- Track performance over weeks/months
- Alert on degradation trends (>10% slower)
- Compare releases for regression testing

### 6. Secure Your Secrets

- ✅ Use GitHub Secrets (encrypted at rest)
- ✅ Rotate tokens every 90 days
- ❌ Never commit `.env` file
- ❌ Never log secret values
- 🔒 Limit secret access (Settings → Environments)

---

## Cost Estimates

### Free Tier (Recommended for Start)

| Service | Free Tier | Enough For |
|---------|-----------|------------|
| GitHub Actions | 2,000 minutes/month | ~400 test runs |
| InfluxDB Cloud | 30-day retention, limited writes | ~1,000 tests/month |
| Grafana Cloud | 3 users, 14-day logs | Small team |

**Total Cost**: $0/month

### Paid Tier (Production Scale)

| Service | Paid Plan | Cost |
|---------|-----------|------|
| GitHub Actions | Additional minutes | $0.008/minute |
| InfluxDB Cloud | 90-day retention, more writes | $9-49/month |
| Grafana Cloud | More users, longer retention | $8-29/month |

**Total Cost**: $20-80/month for professional use

---

## Next Steps

After completing setup:

1. ✅ **Run first test** - Verify everything works
2. ✅ **Create PR** - Test automatic triggers
3. ✅ **View Grafana** - Check dashboards populate
4. ✅ **Schedule tests** - Enable continuous monitoring
5. ✅ **Set alerts** - Get notified of failures
6. ✅ **Document** - Share setup with team
7. ✅ **Iterate** - Add more tests as needed

---

## Support Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **k6 Documentation**: https://k6.io/docs/
- **InfluxDB Cloud Docs**: https://docs.influxdata.com/influxdb/cloud/
- **Grafana Docs**: https://grafana.com/docs/grafana/latest/
- **k6 Community Slack**: https://k6.io/slack

---

## Summary Checklist

Before going live, verify:

- [ ] Code pushed to GitHub
- [ ] All secrets configured
- [ ] Workflows enabled in Actions tab
- [ ] First manual test run successful
- [ ] Artifacts downloadable
- [ ] InfluxDB Cloud receiving data (if configured)
- [ ] Grafana dashboards showing data (if configured)
- [ ] Scheduled tests configured and enabled
- [ ] Team notified of CI/CD setup
- [ ] Documentation updated

**🎉 Congratulations! Your CI/CD pipeline is ready!**

---

**Last Updated**: 2024-01-15
**Version**: 1.0
