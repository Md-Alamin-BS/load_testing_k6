FROM grafana/k6:latest

USER root

COPY tests /tests
COPY config /config
COPY utils /utils

WORKDIR /

# Set environment variables
ENV K6_OUT=influxdb=http://influxdb:8086
ENV K6_INFLUXDB_ORGANIZATION=k6-org
ENV K6_INFLUXDB_BUCKET=k6-metrics
ENV K6_INFLUXDB_TOKEN=k6-admin-token-12345

# Default command
CMD ["run", "/tests/scenarios/load-test.js"]
