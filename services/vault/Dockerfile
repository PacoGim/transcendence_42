FROM hashicorp/vault:1.21

WORKDIR /app/services/vault

RUN apk update && apk add openssl curl unzip bash clang gpg jq gnupg

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN mkdir -p ./certs
RUN chmod 755 ./certs

RUN openssl req -x509 -nodes \
    -out ./certs/vault.crt \
    -keyout ./certs/vault.key \
    -days 365 \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

RUN chmod 755 ./certs/vault.key

COPY scripts ./scripts
COPY srcs ./srcs
COPY package.json .

RUN chmod +x ./scripts/entrypoint.sh \
    && chmod +x ./scripts/vault_init.sh

RUN bun install

CMD ["./scripts/entrypoint.sh"]