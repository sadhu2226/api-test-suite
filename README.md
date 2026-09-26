# API Test Automation Suite

An automated test suite that validates the correctness, reliability, and contract
stability of a REST API — built with **Playwright** and **JavaScript**.

This project demonstrates a practical QA/SDET skill set: designing test coverage
(not just writing scripts), validating response schemas, testing negative/edge
cases, and wiring tests into a CI pipeline that runs automatically on every commit.

## Why this project exists

Most junior QA candidates can describe *manual* testing. Very few can show a
working automation framework with real test design decisions behind it. This
project is that proof: a real API, a real coverage strategy, and a real CI
pipeline — not a toy script.

## What it tests

The suite targets [ReqRes](https://reqres.in), a public REST API, across:

| Area | Coverage |
|---|---|
| **Read endpoints** (`GET /users`) | Happy path, pagination, response time budget, out-of-range pages |
| **Write endpoints** (`POST` / `PUT` / `PATCH` / `DELETE`) | Successful create/update/delete, empty payloads, unexpected fields |
| **Authentication** (`POST /login`, `POST /register`) | Valid + invalid credentials, missing fields, unregistered accounts |
| **Contract/schema validation** | Every list and single-user response is validated against a JSON Schema, so a silent API shape change (renamed/missing/retyped field) fails the build even if status codes look fine |

## Why these design choices matter (interview talking points)

- **Schema validation, not just status codes** — a `200 OK` with a broken body
  is still a bug. Validating against a JSON Schema catches contract drift that
  status-code-only checks miss entirely.
- **Negative and edge cases get equal weight to happy paths** — e.g. what
  happens on an empty payload, a non-numeric ID, or deleting something that's
  already gone. This is usually where real bugs live.
- **No hardcoded fixture data assumptions** — tests assert on *shape and
  behavior*, not on brittle assumptions like "there are always exactly 12
  users," so the suite survives the underlying data changing.
- **CI-first** — the suite runs automatically via GitHub Actions on every push
  and PR, with the HTML report uploaded as a build artifact. This is how QA
  work actually plugs into a real engineering workflow.

## Getting started

```bash
git clone <your-repo-url>
cd api-test-suite
npm install
```

This project requires a free API key from ReqRes (they added this as a rate-limiting
measure — it takes 30 seconds to get):

1. Sign up at https://reqres.in/signup
2. Copy `.env.example` to `.env`
3. Paste your key into `.env`:
   ```
   REQRES_API_KEY=your_key_here
   ```

Then run the suite:

```bash
npm test
```

View the HTML report:

```bash
npm run report
```

## Running in CI

The included GitHub Actions workflow (`.github/workflows/api-tests.yml`) runs
the full suite on every push/PR to `main`. To enable it in your own fork:

1. Go to your repo's **Settings → Secrets and variables → Actions**
2. Add a secret named `REQRES_API_KEY` with your key
3. Push a commit — the workflow runs automatically and uploads the HTML report
   as a downloadable artifact

## Project structure

```
api-test-suite/
├── tests/
│   ├── users.get.spec.js      # read endpoint coverage
│   ├── users.write.spec.js    # write endpoint + edge case coverage
│   └── auth.spec.js           # login/register coverage
├── schemas/
│   ├── user.schema.json       # JSON Schema for a single user
│   └── userList.schema.json   # JSON Schema for a paginated user list
├── utils/
│   └── validateSchema.js      # Ajv-based schema validation helper
├── .github/workflows/
│   └── api-tests.yml          # CI pipeline definition
└── playwright.config.js
```

## Possible extensions

- Add contract testing against an OpenAPI spec directly (if the API under test
  publishes one)
- Add load/performance smoke tests using Playwright's request context in a loop
- Publish the HTML report to GitHub Pages after each CI run
- Parameterize the suite to run against multiple environments (staging/prod)

## Tech stack

- [Playwright Test](https://playwright.dev/docs/test-intro) — test runner + API client
- [Ajv](https://ajv.js.org/) — JSON Schema validation
- GitHub Actions — CI/CD
