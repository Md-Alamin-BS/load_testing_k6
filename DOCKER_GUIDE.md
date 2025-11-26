# Docker Compose Commands Reference

## Starting the Stack

### Start all services (InfluxDB, Grafana)
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Check service status
```bash
docker-compose ps
```

## Running Tests

### Run load test
```bash
docker-compose run --rm -e RUN_ID=load-test-001 -e TEST_TYPE=load k6 run /tests/scenarios/load-test.js
```

### Run stress test
```bash
docker-compose run --rm -e RUN_ID=stress-test-001 -e TEST_TYPE=stress k6 run /tests/scenarios/stress-test.js
```

### Run soak test
```bash
docker-compose run --rm -e RUN_ID=soak-test-001 -e TEST_TYPE=soak k6 run /tests/scenarios/soak-test.js
```

### Run spike test
```bash
docker-compose run --rm -e RUN_ID=spike-test-001 -e TEST_TYPE=spike k6 run /tests/scenarios/spike-test.js
```

### Run workflow test
```bash
docker-compose run --rm -e RUN_ID=workflow-001 -e TEST_TYPE=workflow k6 run /tests/workflows/course-completion-workflow.js
```

### Run all endpoints test
```bash
docker-compose run --rm -e RUN_ID=endpoints-001 -e TEST_TYPE=endpoints k6 run /tests/endpoints/all-endpoints.js
```

## Managing Services

### Stop all services
```bash
docker-compose down
```

### Stop and remove volumes (clean slate)
```bash
docker-compose down -v
```

### Restart services
```bash
docker-compose restart
```

### Rebuild containers
```bash
docker-compose build --no-cache
```

## Accessing Services

### InfluxDB
- URL: http://localhost:8086
- Username: admin
- Password: admin123456
- Organization: k6-org
- Bucket: k6-metrics

### Grafana
- URL: http://localhost:3000
- Username: admin
- Password: admin

## Troubleshooting

### View InfluxDB logs
```bash
docker-compose logs influxdb
```

### View Grafana logs
```bash
docker-compose logs grafana
```

### Access InfluxDB container
```bash
docker-compose exec influxdb sh
```

### Access Grafana container
```bash
docker-compose exec grafana sh
```

### Remove all containers and start fresh
```bash
docker-compose down -v
docker-compose up -d
```
