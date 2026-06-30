#!/usr/bin/env bash
set -e

PIDFILE=".pids"
> "$PIDFILE"

cleanup() {
  echo "==> Shutting down..."
  bash "$(dirname "$0")/stop.sh"
}
trap cleanup EXIT INT TERM

echo "==> Starting backend (port 5001)..."
npm run dev --prefix backend &
echo $! >> "$PIDFILE"

echo "==> Starting LLM proxy (main)..."
npm run dev --prefix main &
echo $! >> "$PIDFILE"

echo "==> Starting renderer (Vite, port 5173)..."
npm run dev --prefix renderer &
echo $! >> "$PIDFILE"

echo "==> Waiting for renderer to be ready..."
npx wait-on http://localhost:5173 --timeout 60000

echo "==> Launching Electron..."
npx electron . &
echo $! >> "$PIDFILE"

wait
