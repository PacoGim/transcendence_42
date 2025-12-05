api_addr = "${VAULT_ADDR}"
cluster_addr= "https://${VAULT_CLUSTER_ADDR}"
disable_mlock = true

listener "tcp" {
    address = "${VAULT_TCP_ADDR}"
    cluster_address = "${VAULT_CLUSTER_ADDR}"
    tls_cert_file = "${VAULT_CERT_PATH}" 
    tls_key_file = "${VAULT_KEY_PATH}"
}

storage "raft" {
    path = "${VAULT_DATA_PATH}"
    node_id = "node1"
}