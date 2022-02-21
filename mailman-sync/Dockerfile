FROM lukemathwalker/cargo-chef:latest AS chef
WORKDIR app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder
COPY --from=planner /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --recipe-path recipe.json
# Build application
COPY . .
RUN cargo build --release --bin nidarholm-mailman-sync

FROM gcr.io/distroless/cc
COPY --from=builder /app/target/release/nidarholm-mailman-sync /usr/local/bin
ENTRYPOINT ["/usr/local/bin/nidarholm-mailman-sync"]
