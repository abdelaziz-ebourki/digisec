#!/usr/bin/env bash
# One-command E2E against the Docker stack:
#   npm test            # full suite
#   npm test -- admin.spec.ts   # single file (args forwarded to playwright)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTIFACTS="$ROOT/e2e/.artifacts"
API_LOG="$ARTIFACTS/api.log"

# 1. Boot (or rebuild) the full stack.
sg docker -c "docker compose -f $ROOT/docker-compose.yml up -d --build" 2>/dev/null \
  || docker compose -f "$ROOT/docker-compose.yml" up -d --build

# 2. Wait for api + web to answer.
for i in $(seq 1 60); do
  if curl -fs -o /dev/null http://localhost:8080/actuator/health \
    && curl -fs -o /dev/null http://localhost/; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    echo "Stack did not become healthy in time" >&2
    exit 1
  fi
  sleep 5
done

# 3. Fresh api log for extractVerificationToken(), tailed from the container.
mkdir -p "$ARTIFACTS"
: > "$API_LOG"
if command -v sg >/dev/null && sg docker -c true 2>/dev/null; then
  sg docker -c "docker compose -f $ROOT/docker-compose.yml logs -f api" > "$API_LOG" 2>&1 &
else
  docker compose -f "$ROOT/docker-compose.yml" logs -f api > "$API_LOG" 2>&1 &
fi
LOG_PID=$!
trap 'kill $LOG_PID 2>/dev/null || true' EXIT

# 4. Run the suite (extra args forwarded, e.g. a spec file or -g filter).
cd "$ROOT/e2e"
npx playwright test -c playwright.docker.config.ts "$@"
