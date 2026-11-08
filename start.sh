#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

for tool in go node npm; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "Please install $tool before starting the app." >&2
    exit 1
  fi
done

if [ ! -d frontend/node_modules ]; then
  (cd frontend && npm ci)
fi

build_dir=$(mktemp -d "${TMPDIR:-/tmp}/sezzle-calculator.XXXXXX")
pids=()

cleanup() {
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  rm -rf "$build_dir"
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "Building the backend..."
(cd backend && go build -o "$build_dir/calculator" .)

"$build_dir/calculator" &
pids+=("$!")

(cd frontend && exec node node_modules/vite/bin/vite.js --port 5173 --strictPort) &
pids+=("$!")

echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."

while kill -0 "${pids[0]}" 2>/dev/null && kill -0 "${pids[1]}" 2>/dev/null; do
  sleep 1
done

echo "One of the servers stopped. Shutting down the other." >&2
exit 1
