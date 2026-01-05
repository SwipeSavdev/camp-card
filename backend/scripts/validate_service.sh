#!/bin/bash
# Validate Camp Card Backend Service
set -e

SERVICE_NAME="campcard"
HEALTH_ENDPOINT="http://localhost:7010/actuator/health"
MAX_ATTEMPTS=30
SLEEP_SECONDS=10

echo "Validating $SERVICE_NAME service..."

# Check if service is running
if ! systemctl is-active --quiet $SERVICE_NAME; then
    echo "ERROR: $SERVICE_NAME service is not running"
    systemctl status $SERVICE_NAME
    exit 1
fi

echo "Service is running. Checking health endpoint..."

# Wait for health endpoint to respond
for i in $(seq 1 $MAX_ATTEMPTS); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_ENDPOINT 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        echo "Health check passed! (HTTP $HTTP_CODE)"

        # Get detailed health status
        HEALTH_STATUS=$(curl -s $HEALTH_ENDPOINT | grep -o '"status":"[^"]*"' | head -1)
        echo "Health status: $HEALTH_STATUS"

        echo "Validation successful!"
        exit 0
    fi

    echo "Attempt $i/$MAX_ATTEMPTS: Health check returned HTTP $HTTP_CODE, waiting..."
    sleep $SLEEP_SECONDS
done

echo "ERROR: Health check failed after $MAX_ATTEMPTS attempts"
echo "Checking service logs..."
journalctl -u $SERVICE_NAME --no-pager -n 50

exit 1
