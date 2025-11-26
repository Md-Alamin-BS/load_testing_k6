# PowerShell script to run k6 tests with InfluxDB output

param(
    [string]$RunId = "run-$(Get-Date -Format 'yyyyMMddHHmmss')",
    [string]$TestType = "load",
    [string]$Environment = "dev"
)

# Set test configuration
$env:RUN_ID = $RunId
$env:TEST_TYPE = $TestType
$env:ENVIRONMENT = $Environment

Write-Host "======================================"
Write-Host "Starting k6 Performance Test"
Write-Host "======================================"
Write-Host "Run ID: $RunId"
Write-Host "Test Type: $TestType"
Write-Host "Environment: $Environment"
Write-Host "======================================"

# Run the appropriate test based on TestType
switch ($TestType) {
    "load" {
        k6 run tests/scenarios/load-test.js
    }
    "stress" {
        k6 run tests/scenarios/stress-test.js
    }
    "soak" {
        k6 run tests/scenarios/soak-test.js
    }
    "spike" {
        k6 run tests/scenarios/spike-test.js
    }
    "workflow" {
        k6 run tests/workflows/course-completion-workflow.js
    }
    "endpoints" {
        k6 run tests/endpoints/all-endpoints.js
    }
    default {
        Write-Host "Unknown test type: $TestType"
        Write-Host "Available types: load, stress, soak, spike, workflow, endpoints"
        exit 1
    }
}

Write-Host "======================================"
Write-Host "Test completed!"
Write-Host "View results in Grafana: http://localhost:3000"
Write-Host "======================================"
