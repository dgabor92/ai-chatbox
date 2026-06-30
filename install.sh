#!/usr/bin/env bash
set -e

echo "==> Installing root dependencies..."
npm install

echo "==> Installing backend dependencies..."
npm install --prefix backend

echo "==> Installing renderer dependencies..."
npm install --prefix renderer

echo "==> Installing main (LLM proxy) dependencies..."
npm install --prefix main

echo "==> Done. Run ./start.sh to launch the app."
