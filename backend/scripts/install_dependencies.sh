#!/bin/bash
# Install dependencies for Camp Card Backend
set -e

echo "Installing dependencies..."

# Check if Java 21 is installed
if ! command -v java &> /dev/null; then
    echo "Java not found. Installing Amazon Corretto 21..."

    # Install Amazon Corretto 21 (Amazon Linux 2023 / AL2)
    if [ -f /etc/amazon-linux-release ]; then
        yum install -y java-21-amazon-corretto-headless
    elif [ -f /etc/os-release ]; then
        # For Ubuntu/Debian
        apt-get update
        apt-get install -y wget gnupg
        wget -O- https://apt.corretto.aws/corretto.key | apt-key add -
        add-apt-repository 'deb https://apt.corretto.aws stable main'
        apt-get update
        apt-get install -y java-21-amazon-corretto-jdk
    fi
fi

# Verify Java installation
java -version

# Install CloudWatch agent if not present (for logging)
if ! command -v amazon-cloudwatch-agent &> /dev/null; then
    echo "Installing CloudWatch agent..."
    if [ -f /etc/amazon-linux-release ]; then
        yum install -y amazon-cloudwatch-agent
    fi
fi

echo "Dependencies installation completed"
