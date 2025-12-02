listener "tcp" {
    address = "${VAULT_TCP_ADDR}"
    tls_cert_file = "${VAULT_CERT_PATH}" 
    tls_key_file = "${VAULT_KEY_PATH}"
}

api_addr = "${VAULT_ADDR}"

storage "file" {
    path = "${VAULT_DATA_PATH}"
}