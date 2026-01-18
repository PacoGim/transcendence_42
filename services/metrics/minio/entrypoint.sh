#!/bin/bash

VAULT_API_ADDR=http://vault:6988

echo "Waiting for Vault API to be healthy..."
until curl -s $VAULT_API_ADDR/health > /dev/null; do
    echo "Vault API is not healthy yet. Retrying in 2 seconds..."
    sleep 2
done

ENV_VARS=(MINIO_ROOT_USER
MINIO_ROOT_PASSWORD
)

KEYS=(minio_root_user
minio_root_password
)

echo "Fetching MinIO secrets from Vault..."

vault_fetch() {
    local secret_name=$1
    local res=$(curl -s "$VAULT_API_ADDR/vault/getSecret" \
        -H "Content-Type: application/json" \
        -d "{\"name\":\"$secret_name\"}"
    )
    local value=$(echo "$res" | jq -r '.message.value')
    echo "$value"
}

for i in "${!ENV_VARS[@]}"; do
    ENV_VAR=${ENV_VARS[$i]}
    KEY=${KEYS[$i]}
    VALUE=$(vault_fetch "$KEY")

    export "$ENV_VAR=$VALUE"
    echo "Exported $ENV_VAR from Vault."
done
echo "here is MINIO_ROOT_USER=$MINIO_ROOT_USER"
echo "here is MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD"
echo "Environment variables setup complete."

exec minio server /data --console-address ":9001"