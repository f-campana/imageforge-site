#!/usr/bin/env bash
set -euo pipefail

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://example.com}"
HOST="${ANIMATION_CHECK_HOST:-127.0.0.1}"
CANONICAL_PORT="${ANIMATION_CHECK_PORT:-3205}"
FIXTURE_PORT="${ANIMATION_FIXTURE_PORT:-3206}"

CANONICAL_PID=""
FIXTURE_PID=""

cleanup() {
  if [[ -n "${CANONICAL_PID}" ]]; then
    kill "${CANONICAL_PID}" >/dev/null 2>&1 || true
    wait "${CANONICAL_PID}" 2>/dev/null || true
    CANONICAL_PID=""
  fi

  if [[ -n "${FIXTURE_PID}" ]]; then
    kill "${FIXTURE_PID}" >/dev/null 2>&1 || true
    wait "${FIXTURE_PID}" 2>/dev/null || true
    FIXTURE_PID=""
  fi
}

wait_for_server() {
  local url="$1"

  for _ in $(seq 1 60); do
    if curl -fsS "${url}" >/dev/null; then
      return 0
    fi

    sleep 1
  done

  echo "[animation:check] server did not become ready at ${url}" >&2
  return 1
}

trap cleanup EXIT

echo "[animation:check] build canonical"
NEXT_PUBLIC_SITE_URL="${SITE_URL}" pnpm build

echo "[animation:check] start server canonical"
NEXT_PUBLIC_SITE_URL="${SITE_URL}" pnpm exec next start --hostname "${HOST}" --port "${CANONICAL_PORT}" >/tmp/animation-check-canonical.log 2>&1 &
CANONICAL_PID="$!"
wait_for_server "http://${HOST}:${CANONICAL_PORT}/"

echo "[animation:check] collect matrix canonical"
BASE_URL="http://${HOST}:${CANONICAL_PORT}" pnpm animation:matrix -- --output .tmp/animation/matrix-canonical.json

echo "[animation:check] assert safety canonical"
pnpm animation:safety -- --matrix .tmp/animation/matrix-canonical.json

kill "${CANONICAL_PID}" >/dev/null 2>&1 || true
wait "${CANONICAL_PID}" 2>/dev/null || true
CANONICAL_PID=""

echo "[animation:check] build fixture"
NEXT_PUBLIC_SITE_URL="${SITE_URL}" BENCHMARK_ENABLE_LOCAL_FIXTURE=1 BENCHMARK_SNAPSHOT_FIXTURE=sample pnpm build

echo "[animation:check] start server fixture"
NEXT_PUBLIC_SITE_URL="${SITE_URL}" BENCHMARK_ENABLE_LOCAL_FIXTURE=1 BENCHMARK_SNAPSHOT_FIXTURE=sample pnpm exec next start --hostname "${HOST}" --port "${FIXTURE_PORT}" >/tmp/animation-check-fixture.log 2>&1 &
FIXTURE_PID="$!"
wait_for_server "http://${HOST}:${FIXTURE_PORT}/"

echo "[animation:check] collect matrix fixture"
BASE_URL="http://${HOST}:${FIXTURE_PORT}" pnpm animation:matrix -- --output .tmp/animation/matrix-fixture.json

echo "[animation:check] assert safety fixture"
pnpm animation:safety -- --matrix .tmp/animation/matrix-fixture.json

kill "${FIXTURE_PID}" >/dev/null 2>&1 || true
wait "${FIXTURE_PID}" 2>/dev/null || true
FIXTURE_PID=""

echo "[animation:check] completed canonical + fixture passes"
