FROM pgvector/pgvector:pg16-bookworm

ARG SCWS_VERSION=1.2.3
ARG ZHPARSER_COMMIT=2d1bf73e46ebb82393610afbeb3af271f1056488

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        autoconf \
        automake \
        ca-certificates \
        curl \
        git \
        libtool \
        postgresql-server-dev-16

RUN curl -fsSL "https://github.com/hightman/scws/archive/refs/tags/${SCWS_VERSION}.tar.gz" \
        -o /tmp/scws.tar.gz \
    && mkdir /tmp/scws \
    && tar -xzf /tmp/scws.tar.gz -C /tmp/scws --strip-components=1 \
    && cd /tmp/scws \
    && autoreconf -fi \
    && ./configure \
    && make -j"$(nproc)" \
    && make install \
    && ldconfig \
    && rm -rf /tmp/scws*

RUN git clone https://github.com/amutu/zhparser.git /tmp/zhparser \
    && cd /tmp/zhparser \
    && git checkout "${ZHPARSER_COMMIT}" \
    && make SCWS_HOME=/usr/local -j"$(nproc)" \
    && make SCWS_HOME=/usr/local install \
    && ldconfig \
    && rm -rf /tmp/zhparser

RUN apt-get purge -y --auto-remove \
        autoconf automake build-essential curl git libtool postgresql-server-dev-16 \
    && rm -rf /var/lib/apt/lists/*
