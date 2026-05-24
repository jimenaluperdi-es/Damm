FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    git \
    curl \
    bash \
    openjdk-21-jdk \
    maven \
    nodejs \
    npm \
    gh

RUN npm install -g opencode-ai

WORKDIR /app

CMD ["/bin/bash"]