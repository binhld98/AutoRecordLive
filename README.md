# AutoRecordLive

AutoRecordLive records live streams for you. Follow a host or channel by URL, and the app records each broadcast automatically when it goes live. Recordings are stored so you can watch or download them later.

The product is now called LiveCatch. See the [product charter](docs/charter.md) for what it does and what v1 covers.

## Repository layout

This repository holds only the user app. The back end, admin console, and landing pages are out of scope.

| Path | Contents |
| --- | --- |
| [`user-app/`](user-app/) | The user app: React + TypeScript, built with Vite. |
| [`docs/`](docs/) | Product, architecture, and development documentation. |

## Getting started

Run the user app locally:

```bash
cd user-app
npm install
npm run dev
```

The development server runs at <http://localhost:8484>.

## Documentation

## Contributing

See [AGENTS.md](AGENTS.md) for the task tracking, development workflow and commit message conventions.
