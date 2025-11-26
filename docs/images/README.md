# Screenshots Directory

This directory contains screenshots for the documentation.

## Required Screenshots

### 1. Endpoint Dashboard (`endpoint-dashboard.png`)

**What to capture:**
- Full Grafana dashboard view
- Run ID dropdown visible and selected
- Endpoint dropdown visible and selected
- All metrics panels showing data:
  - Requests Per Second gauge
  - Average Response Time gauge
  - P95 Response Time gauge
  - Maximum Response Time gauge
  - Response time over time graph
  - Request rate graph
  - Endpoint performance table

**How to capture:**
1. Run a test: `docker-compose run --rm -e RUN_ID=screenshot-demo k6 run /tests/scenarios/load-test.js`
2. Open Grafana: http://localhost:3000
3. Navigate to K6 Endpoint Performance Dashboard
4. Select Run ID: `screenshot-demo`
5. Select an endpoint from dropdown
6. Take full-page screenshot
7. Save as `endpoint-dashboard.png`

### 2. Workflow Dashboard (`workflow-dashboard.png`)

**What to capture:**
- Full Grafana dashboard view
- Run ID dropdown visible and selected
- Workflow Name dropdown visible and selected
- All metrics panels showing data:
  - Total executions stat
  - Total errors stat
  - Average duration gauge
  - P95 duration gauge
  - Maximum duration gauge
  - Error rate gauge
  - Duration over time graph
  - Steps performance graph
  - Steps summary table

**How to capture:**
1. Run workflow test: `docker-compose run --rm -e RUN_ID=workflow-demo k6 run /tests/workflows/course-completion-workflow.js`
2. Open Grafana: http://localhost:3000
3. Navigate to K6 Workflow Performance Dashboard
4. Select Run ID: `workflow-demo`
5. Select Workflow: `CourseCompletionWorkflow`
6. Take full-page screenshot
7. Save as `workflow-dashboard.png`

## Optional Screenshots

### 3. Test Execution Output (`test-execution.png`)

**What to capture:**
- Terminal/console showing k6 test running
- Should show:
  - Test progress
  - Real-time metrics
  - Final summary

### 4. GitHub Actions Workflow (`github-actions.png`)

**What to capture:**
- GitHub Actions workflow run page
- Should show:
  - Workflow name
  - Successful run status
  - Steps completed
  - Artifacts uploaded

### 5. Docker Services Running (`docker-services.png`)

**What to capture:**
- Output of `docker-compose ps`
- All services (influxdb, grafana, k6) shown as running

## Screenshot Guidelines

1. **Resolution**: Minimum 1920x1080
2. **Format**: PNG preferred (lossless)
3. **File size**: Keep under 5MB each
4. **Clarity**: Ensure text is readable
5. **Full view**: Capture entire dashboard, not partial
6. **Data visible**: Ensure graphs show actual data, not "No data"

## Tools for Screenshots

### Browser Extensions
- **Firefox**: Built-in screenshot tool (Shift+F2, type "screenshot --fullpage")
- **Chrome**: Full Page Screen Capture extension
- **Edge**: Built-in screenshot (Ctrl+Shift+S)

### Desktop Tools
- **Windows**: Snipping Tool, ShareX
- **Mac**: Cmd+Shift+4
- **Linux**: GNOME Screenshot, Spectacle

## Updating README

After capturing screenshots, update the README.md:

1. Copy images to this directory
2. Update image links in README.md:
   ```markdown
   ![Endpoint Dashboard](docs/images/endpoint-dashboard.png)
   ![Workflow Dashboard](docs/images/workflow-dashboard.png)
   ```
3. Verify images display correctly in GitHub

## Placeholder Files

If you need to submit without actual screenshots (NOT recommended), you can create placeholder images:

```bash
# Create blank placeholder images
convert -size 1920x1080 xc:gray docs/images/endpoint-dashboard.png
convert -size 1920x1080 xc:gray docs/images/workflow-dashboard.png
```

**Note:** Actual screenshots are required for assignment completion!

## Troubleshooting

### No Data in Screenshots

**Problem:** Dashboard shows "No data" in screenshot

**Solutions:**
1. Wait for test to complete before taking screenshot
2. Adjust time range in Grafana to include your test time
3. Verify Run ID matches in dashboard filter
4. Check that k6 is sending data to InfluxDB

### Images Too Large

**Problem:** Image file size > 5MB

**Solutions:**
1. Use PNG compression tools
2. Reduce resolution slightly (1600x900 still acceptable)
3. Crop unnecessary whitespace
4. Use image optimization tools (TinyPNG, ImageOptim)

### Images Not Showing in README

**Problem:** Images don't display in GitHub

**Solutions:**
1. Verify path is correct (case-sensitive)
2. Ensure images are committed to repository
3. Use relative paths from README location
4. Check image file extensions match

---

**Once you have captured all screenshots, update this README and the main project README accordingly.**
