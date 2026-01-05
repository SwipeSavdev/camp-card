#!/bin/bash
# Stop Camp Card Backend Server
set -e

SERVICE_NAME="campcard"

echo "Stopping $SERVICE_NAME service..."

# Stop the service if it exists and is running
if systemctl is-active --quiet $SERVICE_NAME; then
    systemctl stop $SERVICE_NAME
    echo "$SERVICE_NAME service stopped successfully"
else
    echo "$SERVICE_NAME service is not running"
fi

# Wait for the process to fully terminate
sleep 5

echo "Stop script completed"
