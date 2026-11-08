# Sezzle Calculator

A React/TypeScript frontend and Go API for addition, subtraction, multiplication,
and division.

## Run locally

Requires Bash (macOS/Linux, or WSL on Windows), Node.js 22.12+ (or 24), npm, and Go
1.22+.

From the project folder:

```sh
./start.sh
```

The script installs frontend dependencies if missing, builds the backend in a
temporary folder, and starts both servers. Open http://localhost:5173. Press
**Ctrl+C** to stop both. Ports 5173 and 8080 must be available.

To start the services separately, run the backend in one terminal:

```sh
cd backend
go run .
```

In a second terminal, start the frontend:

```sh
cd frontend
npm ci
npm run dev
```

Vite forwards `/api` requests to `127.0.0.1:8080`. The backend listens only on
this computer's loopback interface.

## API

Send JSON to `POST /api/calculate`. Operations are `add`, `subtract`, `multiply`,
and `divide`.

```sh
curl http://127.0.0.1:8080/api/calculate \
  -H 'Content-Type: application/json' \
  -d '{"operation":"divide","a":12,"b":3}'
```

Success (`200`): `{"result":4}`

Invalid input returns `400` with an error, for example
`{"error":"cannot divide by zero"}`. Missing/null operands, invalid JSON, unknown
operations, and overflowing results are also rejected. Other HTTP methods return
`405`.

## Tests and coverage

From `backend`:

```sh
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
```

From `frontend`:

```sh
npm ci
npm run test:coverage
npm run build
```

Coverage reports: `backend/coverage.html` and `frontend/coverage/index.html`.
The production frontend build is written to `frontend/dist`.

Latest test run: 18 backend cases passed with 88.9% statement coverage (the server
entry point is untested). Eight frontend tests passed with 97.43% statement and
88.46% branch coverage across `App.tsx` and `api.ts`.

## Design notes

- `backend/`: server setup in `main.go`, JSON handling in `handler.go`, and
  arithmetic in `calculator.go`. Go's standard library is enough for this API;
  separate arithmetic functions are easy to test.
- `frontend/src/`: one form in `App.tsx` and an API helper in `api.ts`. React
  manages inputs and feedback; the backend validates requests and calculates.
- Operand pointers distinguish missing values from zero. Floating-point numbers
  can produce decimal rounding artifacts, for example with `0.1 + 0.2`.
- Advanced operations and Docker were left out to keep the scope small.

AI assistance and prompts are documented in [PROMPTS.md](PROMPTS.md).
