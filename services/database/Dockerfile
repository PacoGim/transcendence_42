FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y build-essential ca-certificates curl unzip && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

WORKDIR /app/services/database

COPY srcs ./srcs
COPY package.json .

RUN mkdir -p /app/services/database/data

RUN bun install

CMD ["bun", "--watch", "./srcs/index.ts"]