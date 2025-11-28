FROM hashicorp/vault:1.21

WORKDIR /app/services/vault

RUN apk update && apk add openssl curl unzip bash clang

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

RUN mkdir -p ./certs
RUN chmod 755 ./certs

RUN openssl req -x509 -nodes \
    -out ./certs/vault.crt \
    -keyout ./certs/vault.key \
    -days 365 \
    -subj "/C=FR/ST=IDF/L=Paris/O=42/OU=42/CN=localhost"

RUN chmod 755 ./certs/vault.key

COPY conf ./conf
COPY srcs ./srcs
COPY package.json .

RUN chmod +x ./conf/entrypoint.sh

RUN bun install

CMD ["./conf/entrypoint.sh"]