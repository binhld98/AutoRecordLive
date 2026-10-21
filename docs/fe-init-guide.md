# Core front-end initialization guide

These steps create the core SPA in an empty `fe/app/` directory, using the stack from the [front-end architecture overview](./fe-arch.md). You end up with a configured project that shows a Hello World screen. Every command runs without prompts.

Last run with Node.js 22.23, npm 10.9, create-vite 9.3, Vite 8, React 19, TypeScript 6, Tailwind CSS 4, and shadcn 4.22.

## 1. Scaffold

```bash
cd fe/app
npm create -y vite@latest . -- --template react-ts --no-interactive
npm install
```

The template already includes oxlint, its config, a `lint` script, and `@types/node`.

## 2. Install libraries

```bash
npm install react-router react-hook-form zod "@hookform/resolvers@^5"
npm install -D tailwindcss @tailwindcss/vite
```

Pin `@hookform/resolvers` to 5.x. Version 6.0.0 fails with `ERESOLVE` because of a conflict in its own peer dependencies.

## 3. Configure Vite, TypeScript, and Tailwind

shadcn/ui's init checks this setup, so do it first.

`vite.config.ts`:

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const projectDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(projectDir, 'src'),
    },
  },
  server: {
    port: 8484,
  },
})
```

Add this to `compilerOptions` in both `tsconfig.json` and `tsconfig.app.json`. `tsconfig.json` needs a new `compilerOptions` block, and you can skip `baseUrl`, which TypeScript 6 deprecates.

```json
"paths": {
  "@/*": ["./src/*"]
}
```

Replace the contents of `src/index.css` with `@import "tailwindcss";`, and set the `<title>` in `index.html` to `AutoRecordLive`.

## 4. Initialize shadcn/ui

```bash
npx -y shadcn@latest init -y -t vite -b base -p nova --no-monorepo --no-rtl --css-variables
```

This writes `components.json` (style `base-nova`, base color `neutral`) and `src/lib/utils.ts`, adds theme variables to `index.css`, and installs the component dependencies. Don't use `--defaults`, because it selects the Next.js template.

`cn` is a dependency on purpose: it's shadcn's own class-name helper. `shadcn` has to stay installed because `index.css` imports from it, but only the build needs it, so move it to the dev dependencies:

```bash
SHADCN_VERSION=$(node -p "require('./package.json').dependencies.shadcn")
npm uninstall shadcn
npm install -D "shadcn@$SHADCN_VERSION"
```

## 5. Clean up and add Hello World

```bash
rm -r src/App.css src/assets src/components public/icons.svg
```

Replace `src/App.tsx` with:

```tsx
function App() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <h1 className="text-4xl font-semibold tracking-tight">Hello World</h1>
    </main>
  )
}

export default App
```

Then replace `README.md` with a short description of the app and a link to `../../docs/fe-arch.md`. Include prerequisites, quick start (`npm install`, `npm run dev`), the `dev`/`build`/`preview`/`lint` scripts, and how to add components with `npx shadcn@latest add <name>`.

## 6. Verify

```bash
npm run build
npm run lint
npm run dev -- --host 127.0.0.1
```

The build and lint should pass with no errors. At http://127.0.0.1:8484 you should see a centered "Hello World" in the Geist font, the tab title AutoRecordLive, and no console errors.
