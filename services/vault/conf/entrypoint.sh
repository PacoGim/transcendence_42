#!/bin/sh
set -e

vault server -dev -log-level=debug -config=./conf/config.hcl &
VAULT_PID=$!

echo "⏳ Waiting for Vault to be ready..."
until curl -s http://localhost:8200/v1/sys/health >/dev/null; do
  sleep 1
done
echo "✅ Vault is ready."

bun ./srcs/index.ts

kill $VAULT_PID