# syntax=docker/dockerfile:experimental

FROM rust:stretch

COPY ./src /src
COPY ./Cargo.toml /Cargo.toml

RUN cargo build --release
