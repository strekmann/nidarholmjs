FROM rust:bullseye AS build
WORKDIR /app
COPY ./src /app/src
COPY ./Cargo.toml /app/Cargo.toml

RUN cargo build --release --locked

FROM gcr.io/distroless/cc
COPY --from=build /app/target/release/nidarholm-mailman-sync /
CMD ["./nidarholm-mailman-sync"]
