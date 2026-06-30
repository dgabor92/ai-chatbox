#!/usr/bin/env bash

PIDFILE=".pids"

if [ -f "$PIDFILE" ]; then
  while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "==> Stopping PID $pid"
      kill "$pid" 2>/dev/null || true
    fi
  done < "$PIDFILE"
  rm -f "$PIDFILE"
fi

# Fallback: kill any lingering processes
pkill -f "electron ." 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "stt_server.py" 2>/dev/null || true

echo "==> All processes stopped."
