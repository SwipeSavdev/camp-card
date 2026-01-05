#!/bin/bash
# Start Camp Card Backend Server
set -e

SERVICE_NAME="campcard"
APPLICATION_DIR="/opt/campcard"
JAR_SOURCE="/opt/campcard/deploy/target/campcard-0.0.1-SNAPSHOT.jar"
JAR_DEST="$APPLICATION_DIR/campcard.jar"

echo "Starting $SERVICE_NAME deployment..."

# Create application directory if it doesn't exist
mkdir -p $APPLICATION_DIR
mkdir -p $APPLICATION_DIR/logs

# Copy JAR to application directory
if [ -f "$JAR_SOURCE" ]; then
    echo "Copying JAR from $JAR_SOURCE to $JAR_DEST"
    cp $JAR_SOURCE $JAR_DEST
else
    echo "ERROR: JAR file not found at $JAR_SOURCE"
    exit 1
fi

# Create campcard user if it doesn't exist
if ! id "campcard" &>/dev/null; then
    echo "Creating campcard user..."
    useradd -r -s /bin/false campcard
fi

# Set permissions
chown -R campcard:campcard $APPLICATION_DIR
chmod 755 $JAR_DEST

# Copy systemd service file
cp /opt/campcard/deploy/campcard.service /etc/systemd/system/
systemctl daemon-reload

# Start the service
echo "Starting $SERVICE_NAME service..."
systemctl start $SERVICE_NAME
systemctl enable $SERVICE_NAME

echo "Start script completed"
