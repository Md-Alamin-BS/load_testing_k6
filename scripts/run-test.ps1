param(
    [string]$RunId = "run-$(Get-Date -Format 'yyyyMMddHHmmss')",
    [string]$TestType = "load",
    [string]$Environment = "dev"
)

$env:RUN_ID = $RunId
$env:TEST_TYPE = $TestType
$env:ENVIRONMENT = $Environment

Write-Host "======================================"
Write-Host "k6 Performance Test"
Write-Host "======================================"
Write-Host "Run ID: $RunId"
Write-Host "Test Type: $TestType"
Write-Host "Environment: $Environment"
Write-Host "======================================"

# Run the appropriate test based on TestType
switch ($TestType) {
    # Scenario Tests
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
    "edge" {
        k6 run tests/scenarios/edge-cases.js
    }
    # Workflow Tests
    "workflow" {
        k6 run tests/workflows/course-completion-workflow.js
    }
    # Endpoint Tests
    "endpoints" {
        k6 run tests/endpoints/all-endpoints.js
    }
    "topics" {
        k6 run tests/endpoints/topics.js
    }
    "courses" {
        k6 run tests/endpoints/courses.js
    }
    "course-by-id" {
        k6 run tests/endpoints/course-by-id.js
    }
    "enroll" {
        k6 run tests/endpoints/enroll.js
    }
    "update-progress" {
        k6 run tests/endpoints/update-progress.js
    }
    "quiz-complete" {
        k6 run tests/endpoints/quiz-complete.js
    }
    "mycourses" {
        k6 run tests/endpoints/mycourses.js
    }
    "recommendations" {
        k6 run tests/endpoints/recommendations.js
    }
    "section-quizzes" {
        k6 run tests/endpoints/section-quizzes.js
    }
    "topics-by-id-courses" {
        k6 run tests/endpoints/topics-by-id-courses.js
    }
    default {
        Write-Host "Unknown test type: $TestType"
        Write-Host "Available types:"
        Write-Host "  Scenarios: load, stress, soak, spike, edge"
        Write-Host "  Workflow: workflow"
        Write-Host "  Endpoints: endpoints, topics, courses, course-by-id, enroll, update-progress,"
        Write-Host "             quiz-complete, mycourses, recommendations, section-quizzes, topics-by-id-courses"
        exit 1
    }
}

Write-Host "======================================"
Write-Host "Test completed!"
Write-Host "View results in Grafana: http://localhost:3000"
Write-Host "======================================"
