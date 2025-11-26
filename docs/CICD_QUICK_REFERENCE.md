# 🎯 CI/CD Quick Reference Card

Fast reference for common CI/CD operations. For detailed instructions, see [CICD_SETUP_GUIDE.md](CICD_SETUP_GUIDE.md).

---

## 🚀 Quick Start (5 Minutes)

```bash
# 1. Push to GitHub
git add .
git commit -m "Setup CI/CD"
git push origin main

# 2. Add secrets in GitHub (Settings → Secrets):
# - BASE_URL
# - WEBSITE_URL  
# - USER_EMAIL
# - USER_PASSWORD

# 3. Run test (Actions → Run workflow)
# 4. Download results from Artifacts
```

---

## 📋 Required GitHub Secrets

### Minimum (Local Results Only)
```
BASE_URL=https://api.polanji.com
WEBSITE_URL=https://www.polanji.com
USER_EMAIL=your-email@example.com
USER_PASSWORD=your-password
```

### With Cloud Monitoring (+ Grafana)
```
+ INFLUXDB_URL=https://your-influxdb-cloud.com
+ INFLUXDB_TOKEN=your-token
+ INFLUXDB_ORG=your-org
+ INFLUXDB_BUCKET=k6-metrics
```

---

## 🎬 Run Test Methods

### 1. Manual (GitHub UI)
1. Go to **Actions** tab
2. Select **K6 Performance Tests**
3. Click **Run workflow**
4. Choose test type and run

### 2. On Pull Request (Automatic)
```bash
git checkout -b feature/new-test
# Make changes
git push origin feature/new-test
# Create PR → Tests run automatically
```

### 3. Scheduled (Automatic)
- Daily: 2 AM UTC
- Weekly: Monday 3 AM UTC
- Check Actions tab for results

### 4. API Call
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/USER/REPO/actions/workflows/performance-tests.yml/dispatches \
  -d '{"ref":"main","inputs":{"testType":"load"}}'
```

---

## 📊 View Results

### Option 1: GitHub Artifacts
1. Actions → Click workflow run
2. Scroll to **Artifacts**
3. Download **k6-html-report**
4. Open HTML in browser

### Option 2: Grafana Cloud
1. Go to grafana.com/login
2. Open dashboard
3. Select Run ID from dropdown
4. View metrics

### Option 3: InfluxDB Cloud
1. Go to cloud2.influxdata.com
2. Data Explorer
3. Query: `SELECT * FROM "http_reqs"`

---

## 🔧 Common Commands

### Check Workflow Status
```bash
# List recent runs
gh run list --workflow=performance-tests.yml

# View run details
gh run view <run-id>

# Download artifacts
gh run download <run-id>
```

### Update Secrets
```bash
# Using GitHub CLI
gh secret set BASE_URL --body "https://api.polanji.com"

# Or via UI: Settings → Secrets → Edit
```

### Trigger Workflow Manually
```bash
# Using GitHub CLI
gh workflow run performance-tests.yml \
  -f testType=load \
  -f runId=cli-test-001
```

---

## 🐛 Quick Troubleshooting

### No workflows visible
```bash
# Check workflows exist
ls -la .github/workflows/

# Push workflows
git add .github/workflows/
git commit -m "Add workflows"
git push
```

### Authentication fails
```
# Verify secrets
Settings → Secrets → Check all 4 exist

# Test locally first
$env:USER_EMAIL="your-email"
k6 run tests/scenarios/load-test.js
```

### No data in Grafana
```
# Check time range (set to "Last 24 hours")
# Verify InfluxDB has data:
# InfluxDB Cloud → Data Explorer → 
# Query: SELECT * FROM "http_reqs"
```

### Tests fail in CI
```javascript
// Increase timeouts for CI
export const options = {
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // More lenient
  },
};
```

---

## 📦 Workflow File Locations

```
.github/workflows/
├── performance-tests.yml    # Main workflow
└── scheduled-tests.yml      # Scheduled runs
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| GitHub Actions | https://github.com/YOUR_USER/YOUR_REPO/actions |
| InfluxDB Cloud | https://cloud2.influxdata.com |
| Grafana Cloud | https://grafana.com/login |
| k6 Docs | https://k6.io/docs/using-k6/k6-options/ |

---

## 💰 Cost (Free Tier)

| Service | Free Limit | Enough For |
|---------|------------|------------|
| GitHub Actions | 2,000 min/month | ~400 tests |
| InfluxDB Cloud | 30 days retention | ~1,000 tests |
| Grafana Cloud | 3 users | Small team |

---

## ✅ Setup Checklist

- [ ] Code pushed to GitHub
- [ ] 4 secrets added (or 8 with InfluxDB)
- [ ] Workflows visible in Actions tab
- [ ] First test run successful
- [ ] Artifacts downloadable
- [ ] (Optional) Grafana showing data

---

## 📞 Support

- GitHub Actions issues: Check workflow logs
- k6 errors: Review k6 documentation
- InfluxDB issues: Check cloud2.influxdata.com status
- General help: See [CICD_SETUP_GUIDE.md](CICD_SETUP_GUIDE.md)

---

**Print this page for quick reference!** 📋
