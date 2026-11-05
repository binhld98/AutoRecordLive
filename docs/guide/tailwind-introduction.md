# Introduction to Tailwind CSS

The LiveCatch user app is styled with Tailwind CSS. This guide covers the basics you need to read and write Tailwind classes, and takes 10 to 20 minutes to read. It started as notes from the course [Tailwind CSS v4 Full Course 2026](https://www.youtube.com/watch?v=6biMWgD6_JY) and is checked against the [official docs](https://tailwindcss.com/docs). The [initialization guide](./init-guide.md) explains how Tailwind was installed in the app.

Everything here applies to Tailwind CSS v4, the version the app uses (4.3 at the time of writing). Tutorials written for v3 often show a `tailwind.config.js` file and `@tailwind` directives. v4 replaced both, so skip those parts.

## 1. What Tailwind is

Tailwind is a **utility-first** CSS framework. You don't write a CSS class for each component. You put small, single-purpose classes straight on the HTML, and each class sets one or two CSS properties.

Plain CSS:

```html
<button class="save-button">Save</button>

<style>
  .save-button {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: #0ea5e9;
    color: white;
    font-weight: 600;
  }
  .save-button:hover {
    background-color: #0284c7;
  }
</style>
```

Tailwind:

```html
<button class="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600">
  Save
</button>
```

What you get from this:

- **No naming or switching files.** The styles sit on the element, so you see them where you use them.
- **A shared design scale.** `px-4`, `text-lg`, and `bg-sky-500` come from one set of spacing, type, and colour values, so pages stay consistent.
- **Safe changes.** Removing a class from one element can't break another page, because classes aren't shared.
- **Small CSS.** Tailwind generates only the classes you use.

What it costs: class lists get long, and you have to learn the names. The fix for long lists is to make components (section 9), and the names become familiar quickly because they follow a pattern.

## 2. How it works

Tailwind is a build tool, not a stylesheet you download. When the app builds, Tailwind:

1. Scans the project's source files for anything that looks like a class name.
2. Generates CSS only for the classes it finds.
3. Writes that CSS where `@import "tailwindcss";` appears in your stylesheet.

In the app, the `@tailwindcss/vite` plugin runs this during `npm run dev` and `npm run build`. Scanning is automatic in v4. It skips `.gitignore`d files and `node_modules`, so there is no `content` list to maintain.

One rule follows from this: **write class names in full.** Tailwind reads source files as plain text and doesn't run your code, so it can't see class names you build from pieces.

```tsx
// Wrong: Tailwind never sees "bg-red-500" or "bg-green-500"
<div className={`bg-${color}-500`} />

// Right: both full class names appear in the source
<div className={isError ? "bg-red-500" : "bg-green-500"} />
```

## 3. Reading class names

Most classes follow the pattern `property-value`. Some examples:

| Class | CSS |
| --- | --- |
| `p-4` | `padding: 1rem` |
| `px-4` | `padding-left` and `padding-right: 1rem` |
| `mt-2` | `margin-top: 0.5rem` |
| `w-full` | `width: 100%` |
| `text-center` | `text-align: center` |
| `text-lg` | larger `font-size` with a matching `line-height` |
| `font-bold` | `font-weight: 700` |
| `bg-sky-500` | `background-color` from the sky palette |
| `rounded-lg` | `border-radius` |
| `hidden` | `display: none` |

Direction suffixes are the same everywhere: `t` top, `r` right, `b` bottom, `l` left, `x` horizontal, `y` vertical. In code that has to work right to left too, `s` (start) and `e` (end) follow the text direction, as in `ps-4` and `me-2`.

A minus sign in front makes a value negative: `-mt-2`.

### Spacing

Spacing utilities (padding, margin, gap, width, height, and others) are multiples of one base unit, `0.25rem`, which is 4 px by default. So `p-1` is 4 px, `p-4` is 16 px, and `p-10` is 40 px. Any whole number works in v4, so `w-17` is fine without extra setup.

Sizes can also be fractions (`w-1/2` is 50%) or keywords: `w-full`, `w-screen`, `h-svh`, `min-h-svh`, `w-auto`, `size-8` (width and height together).

### Colours

The default palette has colour names (`slate`, `gray`, `red`, `orange`, `green`, `sky`, `blue`, `violet`, and others) and shades from `50` (lightest) to `950` (darkest). The same colour names work with any colour utility:

```html
<p class="bg-red-50 text-red-700 border border-red-200">Something went wrong.</p>
```

Add `/` and a percentage to set opacity: `bg-black/50` is black at 50%.

### Typography

- Size: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, up to `text-9xl`
- Weight: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Other: `leading-tight` (line height), `tracking-tight` (letter spacing), `truncate` (one line with an ellipsis), `line-clamp-2`, `uppercase`, `italic`, `underline`

### Borders, radius, and shadows

- `border` gives a 1 px border, `border-2` a 2 px one, `border-b` the bottom only. Set the colour with `border-gray-200`.
- `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-full` (a circle or pill shape)
- `shadow-sm`, `shadow-md`, `shadow-lg`; `ring-2 ring-sky-500` draws an outline ring that doesn't affect layout.

## 4. Layout

### Flexbox

```html
<header class="flex items-center justify-between gap-4 p-4">
  <span class="font-bold">LiveCatch</span>
  <nav class="flex gap-2">…</nav>
</header>
```

- `flex` turns it on; `flex-col` stacks children vertically.
- `items-center` (cross axis) and `justify-between` / `justify-center` (main axis) align children.
- `gap-4` spaces children without margins.
- `flex-1` lets a child take the free space; `shrink-0` stops it shrinking.

### Grid

```html
<ul class="grid grid-cols-3 gap-6">
  <li>…</li>
</ul>
```

- `grid-cols-3` makes three equal columns. `col-span-2` makes an item span two.
- `gap-x-*` and `gap-y-*` set column and row gaps separately.

### Positioning

- `relative`, `absolute`, `fixed`, `sticky`
- `top-0`, `right-4`, `inset-0` (all four sides at 0)
- `z-10`, `z-50` for stacking order

A common pattern is a badge on the corner of a thumbnail:

```html
<div class="relative">
  <img src="…" class="w-full rounded-lg" />
  <span class="absolute top-2 left-2 rounded bg-red-600 px-2 text-xs text-white">LIVE</span>
</div>
```

## 5. States: hover, focus, and others

Put a **variant** and a colon in front of a class to apply it only in that state:

```html
<button class="bg-sky-500 hover:bg-sky-600 focus-visible:ring-2 active:bg-sky-700 disabled:opacity-50">
  Follow
</button>
```

Common variants: `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `first:`, `last:`, `odd:`, `placeholder:`.

To style a child when its **parent** is hovered, mark the parent with `group` and use `group-hover:` on the child:

```html
<a class="group flex items-center gap-2">
  <span>Recordings</span>
  <svg class="opacity-0 group-hover:opacity-100">…</svg>
</a>
```

`peer` works the same way for a **sibling** that comes earlier, for example `peer-invalid:` on an error message after an input.

Variants stack, read from left to right: `dark:hover:bg-gray-800` applies on hover in dark mode.

## 6. Responsive design

Tailwind is **mobile first**. A class with no prefix applies at every width. A breakpoint prefix applies **from that width up**:

| Prefix | Minimum width |
| --- | --- |
| `sm:` | 40rem (640 px) |
| `md:` | 48rem (768 px) |
| `lg:` | 64rem (1024 px) |
| `xl:` | 80rem (1280 px) |
| `2xl:` | 96rem (1536 px) |

```html
<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">…</ul>
```

This shows one column on phones, two from 640 px, and four from 1024 px.

Style the phone layout first with plain classes, then add prefixes for larger screens. `sm:` doesn't mean "on small screens". It means "from the `sm` width up". To target only below a breakpoint, use `max-*`: `max-md:hidden` hides an element below 768 px.

Container queries are built into v4. Mark a parent with `@container` and use `@sm:`, `@md:`, and so on to respond to the **parent's** width instead of the screen's. This is useful for cards that appear in both wide and narrow places.

## 7. Dark mode

The `dark:` variant applies a class when dark mode is on:

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">…</div>
```

By default, dark mode follows the operating system setting (`prefers-color-scheme`). To let the user switch it with a toggle, change what `dark:` means in your CSS. The app does it this way, so `dark:` applies inside any element with the `dark` class:

```css
@custom-variant dark (&:is(.dark *));
```

## 8. Arbitrary values and customizing the theme

### Arbitrary values

When the scale has no value you need, put one in square brackets:

```html
<div class="w-[327px] bg-[#1da1f2] grid-cols-[200px_1fr]">…</div>
```

Use an underscore where the CSS value has a space. To use a CSS variable, put it in parentheses: `bg-(--brand-color)`.

Use these for one-off values. If you write the same bracket value twice, add it to the theme.

### The `@theme` block

In v4 you customize Tailwind in CSS, not in a JavaScript config. Variables declared in `@theme` become design tokens, and Tailwind creates utilities from them:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.65 0.2 25);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
```

Now `bg-brand`, `text-brand`, `border-brand`, `font-display`, and `3xl:` all exist. The prefix of the variable name tells Tailwind which utilities to make: `--color-*` for colours, `--font-*` for font families, `--breakpoint-*` for breakpoints, `--radius-*` for radius, `--spacing` for the base spacing unit, and so on. Each token is also a normal CSS variable, such as `var(--color-brand)`, so other CSS can use it.

## 9. Reusing styles

Long class lists repeated in many places are a sign you need a component, not a CSS class. In React, put the classes in a component once and reuse it:

```tsx
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{children}</span>
}
```

For repeats inside one component, map over data instead of copying markup.

Tailwind has CSS tools for the cases a component can't cover:

- `@apply` uses Tailwind classes inside your own CSS. It's handy for base styles or third-party HTML you can't put classes on. Use it sparingly, because it brings back the class naming that Tailwind avoids.
- `@layer base { … }` holds global element styles, such as the `body` background.
- `@utility` defines a custom utility class that works with every variant (`hover:`, `md:`, and others).

To force a class to win over another, add `!` at the end: `bg-red-500!`. This sets `!important`, so treat it as a last resort.

## 10. Tools

- **Tailwind CSS IntelliSense** (VS Code extension): autocomplete, hover previews of the generated CSS, and warnings for conflicting classes.
- **Prettier plugin** (`prettier-plugin-tailwindcss`): sorts classes into a standard order, so class lists read the same everywhere.
- **Browser dev tools**: inspect an element to see exactly what CSS each class produced.

## 11. Tailwind in LiveCatch

The app adds a few things on top of plain Tailwind. They come from shadcn/ui, the component library it uses.

- **Semantic colours.** `src/index.css` defines colours by role, not by hue: `background`, `foreground`, `primary`, `muted`, `muted-foreground`, `border`, `destructive`, and others. `@theme inline` turns them into utilities such as `bg-primary`, `text-muted-foreground`, and `border-border`. Prefer these over palette colours like `bg-gray-100`, so the whole app changes together when the theme changes.
- **Dark mode by class.** Each semantic colour has a light value under `:root` and a dark value under `.dark`. A `dark` class on `<html>` switches every colour, so components rarely need `dark:` classes of their own.
- **`cn()` for class names.** `@/lib/utils` exports `cn`, which joins class names conditionally and resolves conflicts so the last one wins. Use it when a component accepts a `className` prop:

  ```tsx
  import { cn } from "@/lib/utils"

  function Card({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("rounded-lg border bg-card p-4", className)} {...props} />
  }

  // p-6 replaces p-4 instead of both ending up in the class list
  <Card className="p-6" />
  ```

## 12. Further reading

- [Tailwind CSS docs](https://tailwindcss.com/docs): the reference for every utility. Use the search box (Ctrl+K) to look up a CSS property, such as "letter spacing", and find its class.
- [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes): the official explanation of the approach.
- [Theme variables](https://tailwindcss.com/docs/theme): every `@theme` namespace and its default values.
- [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide): what changed from v3, useful when a tutorial or answer doesn't match v4.
