FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y build-essential ca-certificates curl unzip && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app/backend/docker_custom_exporter

COPY ./srcs ./srcs
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN bun install

CMD ["bun", "--watch", "./srcs/index.ts"]