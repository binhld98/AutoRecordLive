# AutoRecordLive

AutoRecordLive records live streams for you. Follow a host or channel by URL, and the app records each broadcast automatically when it goes live. Recordings are stored so you can watch or download them later.

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

The development server runs at http://localhost:8484. See the [user app README](user-app/README.md) for more scripts.

## Documentation

- [User app architecture overview](docs/arch.md)
- [User app init guide](docs/guide/init-guide.md)
- [User app roadmap](docs/roadmap.md)
- [Reference app study](docs/study/ref-app-study.md)

## Contributing

See [AGENTS.md](AGENTS.md) for the development workflow and commit message conventions. It also lists the Trello boards where work is tracked.
