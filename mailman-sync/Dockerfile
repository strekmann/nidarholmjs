# syntax=docker/dockerfile:experimental

FROM rust:slim-stretch

COPY ./src /src
COPY ./Cargo.toml /Cargo.toml

RUN cargo build --release && scp target/release/nidarholm-mailman-sync gavin.strekmann.no: && ssh gavin.strekmann.no DATABASE=nidarholm ./nidarholm-mailman-sync
