listener "tcp" {
    address = "localhost:8201"
    tls_cert_file = "/app/backend/vault/certs/vault.crt" 
    tls_key_file = "/app/backend/vault/certs/vault.key"
}

api_addr = "http://localhost:8200"

storage "file" {
    path = "/vault/data"
}