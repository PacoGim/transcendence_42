FROM debian:bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="$PATH:/root/.bun/bin"

ARG TARGETARCH

WORKDIR /app

RUN apt-get update

RUN apt-get -y install curl tar gzip unzip bash ca-certificates && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://bun.com/install | bash

RUN curl -L "https://github.com/ava-labs/avalanchego/releases/download/v1.13.5/avalanchego-linux-${TARGETARCH}-v1.13.5.tar.gz" \
| tar -xz && mv avalanchego-v1.13.5/avalanchego /usr/local/bin/

COPY package.json ./
COPY script/start.sh /start.sh
RUN chmod +x /start.sh

RUN bun install

# CMD ["sleep", "infinity"]
# CMD ["bun", "--watch", "srcs/index.ts"]
# CMD ["/start.sh"]
ENTRYPOINT ["/start.sh"]
