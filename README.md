# AutoRecordLive

AutoRecordLive records live streams for you. Follow a host or channel by URL, and the app records each broadcast automatically when it goes live. Recordings are stored so you can watch or download them later.

## Repository layout

| Path | Contents |
| --- | --- |
| [`fe/`](fe/) | Front end. The core web app is in [`fe/app/`](fe/app/), a React + TypeScript SPA built with Vite. |
| [`be/`](be/) | Back-end services: live-status monitoring, recording orchestration, and APIs. |
| [`docs/`](docs/) | Product, architecture, and development documentation. |

## Getting started

Run the core web app locally:

```bash
cd fe/app
npm install
npm run dev
```

The development server runs at http://localhost:8484. See the [app README](fe/app/README.md) for more scripts.

## Documentation

- [Front-end architecture overview](docs/fe-arch.md)
- [Front-end init guide](docs/fe-init-guide.md)
- [Roadmap](docs/roadmap.md)
- [Reference app study](docs/study/ref-app-study.md)

## Contributing

See [AGENTS.md](AGENTS.md) for the development workflow and commit message conventions. It also lists the Trello boards where work is tracked.
