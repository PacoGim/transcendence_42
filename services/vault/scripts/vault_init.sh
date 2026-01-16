#!/bin/bash

set -e

mkdir -p ${VAULT_SECURE_DIR}
chmod 700 ${VAULT_SECURE_DIR}

echo "Initializing Vault and generating keys..."
vault operator init -key-shares=1 -key-threshold=1 -format=json > ${VAULT_SECURE_DIR}/init.json

echo "Storing unseal key and root token..."
jq -r '.unseal_keys_b64[0]' ${VAULT_SECURE_DIR}/init.json > ${VAULT_UNSEAL_FILE}
jq -r '.root_token' ${VAULT_SECURE_DIR}/init.json > ${VAULT_ROOT_TOKEN_FILE}

echo "Encrypting unseal keys with passphrase ${VAULT_UNSEAL_PASSPHRASE}..."
gpg --symmetric --cipher-algo AES256 --batch --yes \
    --pinentry-mode loopback --passphrase "${VAULT_UNSEAL_PASSPHRASE}" \
    --output ${VAULT_SEALED_FILE} ${VAULT_UNSEAL_FILE}
rm -f ${VAULT_UNSEAL_FILE}

chmod 600 ${VAULT_SECURE_DIR}/*

echo "Vault initialized."