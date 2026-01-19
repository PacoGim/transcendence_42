#!/bin/bash

set -e
echo "Setting up environment variables..."
source ./setup_env_vars.sh

echo "Starting Grafana server..."
exec grafana-server --homepath=/usr/share/grafana --config=/etc/grafana/grafana.ini web &
GF_PID=$!

echo "Waiting for Grafana..."
until curl -s --cacert "$GF_SERVER_CERT_FILE" "$GF_URL_HEALTH" > /dev/null; do
    sleep 2
done

echo "Creating Grafana user..."
USER=$(curl --cacert "$GF_SERVER_CERT_FILE" POST "$GF_ADDR/api/admin/users" \
    -u "$GF_SECURITY_ADMIN_USER:$GF_SECURITY_ADMIN_PASSWORD" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\":\"$GF_USER_NAME\",
        \"email\":\"$GF_USER_MAIL\",
        \"login\":\"$GF_USER_LOGIN\",
        \"password\":\"$GF_USER_PWD\"
    }")

echo "User creation response: $USER"

echo "Grafana setup complete. Server is running."

wait $GF_PID