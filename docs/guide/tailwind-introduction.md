# Introduction to Tailwind CSS

The LiveCatch user app is styled with Tailwind CSS v4. This guide covers the fundamentals of reading and writing Tailwind code. The [initialization guide](./init-guide.md) covers how Tailwind is set up in the app.

Material written for v3 uses a `tailwind.config.js` file and `@tailwind` directives, which v4 replaces with configuration in CSS.

## 1. What Tailwind is

Tailwind is a **utility-first** CSS framework. It gives you a large set of small, single-purpose classes, and you build designs by combining them directly in your markup.

It differs from component frameworks such as Bootstrap, Material UI, and Ant Design. Those ship finished components, like buttons, cards, and modals, with a look already decided. You get a consistent UI quickly, but changing it means overriding the framework's styles. Tailwind ships no components and no visual style of its own. It provides the building blocks, and you decide how everything looks.

If you want ready-made components on top of Tailwind, there are options at different levels:

- **shadcn/ui** copies styled, accessible React components into your own project, so you own and edit the code. LiveCatch uses it.
- **Headless UI** and **Base UI** provide behaviour and accessibility (menus, dialogs, focus handling) with no styles. You add the styles with Tailwind classes.
- **Tailwind Plus** (formerly Tailwind UI) is a paid library of page sections and templates from the Tailwind team.

Tailwind is widely used in production, from small projects to large companies such as OpenAI, Shopify, and GitHub.

### From custom classes to utilities

In traditional CSS, you name a class after the thing it styles and write its rules in a stylesheet:

```html
<button class="save-button">Save</button>
```

```css
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
```

With the utility-first approach, you split those styles into small reusable classes, one per job, and apply them in the markup:

```html
<button class="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-600">
  Save
</button>
```

Each Tailwind class is a predefined CSS rule. For example, `px-4` sets the left and right padding to `1rem`, and `font-semibold` sets `font-weight: 600`.

### Why not inline styles

A Tailwind class list can look like inline `style="…"` attributes. It works differently in three ways:

- **Design constraints.** Inline styles accept any value. Tailwind classes pick from a shared scale of spacing, colours, font sizes, and shadows, so a page stays consistent without effort.
- **States and screen sizes.** Inline styles can't express hover, focus, or dark mode, and they can't use media queries. Tailwind can: `hover:bg-sky-600`, `md:flex`, `dark:text-white`.
- **Normal specificity.** Inline styles beat almost every stylesheet rule and are hard to override. Tailwind classes are ordinary low-specificity CSS.

### Advantages and trade-offs

Compared with hand-written CSS, Tailwind gives you:

- **No naming.** You don't have to invent names like `.card-header-inner-wrapper`.
- **No switching files.** The styles are on the element, so you see what an element looks like where you use it.
- **Safe changes.** Classes aren't tied to one component, so removing a class from one element can't break another page.
- **CSS that stops growing.** You reuse the same utilities, so the stylesheet stays small as the app grows.

The trade-offs are long class lists and a vocabulary to learn. The names follow regular patterns, so they become familiar quickly. Section 4 shows how to keep class lists manageable.

## 2. How Tailwind works

### Classes are generated on demand

Tailwind is a build tool, not a fixed stylesheet. While the app builds (in LiveCatch, through the `@tailwindcss/vite` plugin), Tailwind:

1. Scans the project's source files for anything that looks like a class name.
2. Generates CSS only for the classes it finds.
3. Puts the result where `@import "tailwindcss";` appears in your stylesheet.

This on-demand engine is often called the **Just-in-Time (JIT) compiler**, a name from its introduction in v2.1. Since v3 it's the only engine, so there's no mode to turn on. Because only used classes are generated, the final CSS stays small even in large apps.

In v4, source files are found automatically. Tailwind skips files listed in `.gitignore`, binary files, and `node_modules`. You can add or exclude paths with the `@source` directive.

Since Tailwind reads files as plain text and doesn't run your code, **write every class name in full**:

```tsx
// Wrong: Tailwind never sees "bg-red-500" or "bg-green-500", so it generates neither
<div className={`bg-${color}-500`} />

// Right: both full class names appear in the source
<div className={isError ? "bg-red-500" : "bg-green-500"} />
```

### What the generated CSS looks like

`@import "tailwindcss";` sets up four [cascade layers](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer), in this order:

| Layer | Contents |
| --- | --- |
| `theme` | Design tokens as CSS variables, such as colours, spacing, and fonts |
| `base` | Preflight, a reset that removes browser defaults, plus your global element styles |
| `components` | Empty by default, for your own reusable component classes |
| `utilities` | The utility classes you use |

A later layer always wins over an earlier one, whatever the selector specificity. This is why a utility class can always override a component class.

Utilities read their values from the theme variables. For example, `p-4`, `bg-sky-500`, and `hover:bg-sky-600` compile to:

```css
@layer theme {
  :root, :host {
    --color-sky-500: oklch(68.5% 0.169 237.323);
    --color-sky-600: oklch(58.8% 0.158 241.966);
    --spacing: 0.25rem;
  }
}

@layer utilities {
  .bg-sky-500 {
    background-color: var(--color-sky-500);
  }
  .p-4 {
    padding: calc(var(--spacing) * 4);
  }
  @media (hover: hover) {
    .hover\:bg-sky-600:hover {
      background-color: var(--color-sky-600);
    }
  }
}
```

The `theme` layer contains only the variables your classes use. Because tokens are real CSS variables, your own CSS can use them too, as in `var(--color-sky-500)`.

Preflight removes browser defaults, so a plain `<h1>` has the same size and weight as body text, and lists have no bullets. That's on purpose: you style every element explicitly.

### Arbitrary values

When the scale has no value you need, put one in square brackets, and Tailwind generates a class for it:

```html
<p class="text-[30px]">…</p>
```

```css
.text-\[30px\] {
  font-size: 30px;
}
```

Other examples are `w-[327px]`, `bg-[#1da1f2]`, and `grid-cols-[200px_1fr]`. Use an underscore where the CSS value has a space. To use a CSS variable, wrap it in parentheses: `bg-(--brand-color)`.

Arbitrary values are for one-off cases. If you need the same value twice, add it to the theme (section 4).

## 3. Writing classes

### Class names

Most classes follow a `property-value` pattern:

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

Direction suffixes are the same everywhere: `t` top, `r` right, `b` bottom, `l` left, `x` horizontal, and `y` vertical. `s` (start) and `e` (end) follow the text direction, as in `ps-4` and `me-2`. A leading minus makes a value negative, as in `-mt-2`.

**Spacing.** Padding, margin, gap, width, height, and similar utilities are multiples of one base unit, `--spacing`, which is `0.25rem` (4 px) by default. So `p-1` is 4 px, `p-4` is 16 px, and `p-10` is 40 px. Any whole number works, such as `w-17`. Sizes can also be fractions (`w-1/2` is 50%) or keywords: `w-full`, `w-screen`, `w-auto`, `min-h-svh`, and `size-8` (width and height together).

**Colours.** The default palette has named colours (`gray`, `slate`, `red`, `orange`, `green`, `sky`, `blue`, `violet`, and more) in shades from `50` (lightest) to `950` (darkest). Every colour utility uses the same names: `bg-red-50`, `text-red-700`, `border-red-200`. Add a slash and a percentage to set opacity: `bg-black/50`.

**Typography.**
- Size: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, up to `text-9xl`
- Weight: `font-normal`, `font-medium`, `font-semibold`, `font-bold`
- Other: `leading-tight` (line height), `tracking-tight` (letter spacing), `truncate`, `line-clamp-2`, `uppercase`, `underline`

**Borders and effects.**
- Borders: `border` (1 px), `border-2`, `border-b`, with colours like `border-gray-200`
- Radius: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-full`
- Shadows: `shadow-sm` and `shadow-lg`, plus `ring-2 ring-sky-500` for an outline ring that doesn't change the layout

### Layout

Use **flexbox** to arrange items in one direction, such as a header, a toolbar, or a row of buttons:

```html
<header class="flex items-center justify-between gap-4 p-4">
  <span class="font-bold">LiveCatch</span>
  <nav class="flex gap-2">…</nav>
</header>
```

- `flex` makes a flex container. `flex-col` stacks children vertically, and `flex-wrap` lets them wrap.
- `items-*` aligns children on the cross axis (`items-center`, `items-start`).
- `justify-*` distributes them on the main axis (`justify-between`, `justify-center`).
- `gap-*` spaces children without margins.
- On a child, `flex-1` fills the free space and `shrink-0` stops it shrinking.

Use **grid** for two-dimensional layouts, such as card lists and page structure:

```html
<ul class="grid grid-cols-3 gap-6">
  <li class="col-span-2">…</li>
  <li>…</li>
</ul>
```

- `grid-cols-3` makes three equal columns. `grid-rows-*` works the same way for rows.
- `col-span-2` makes an item span two columns.
- `gap-x-*` and `gap-y-*` set the column and row gaps separately.

For **positioning**, `relative`, `absolute`, `fixed`, and `sticky` set the position type. `top-0`, `left-2`, and `inset-0` (all four sides) place the element, and `z-10` sets the stacking order. A common case is a badge in the corner of a thumbnail:

```html
<div class="relative">
  <img src="…" class="w-full rounded-lg" />
  <span class="absolute top-2 left-2 rounded bg-red-600 px-2 text-xs text-white">LIVE</span>
</div>
```

### Variants: states, screen sizes, and dark mode

Put a **variant** and a colon in front of a class to apply it only under a condition. Variants can be stacked, so `dark:hover:bg-gray-800` applies on hover in dark mode.

**States.**

```html
<button class="bg-sky-500 hover:bg-sky-600 focus-visible:ring-2 active:bg-sky-700 disabled:opacity-50">
  Follow
</button>
```

Common state variants are `hover:`, `focus:`, `focus-visible:`, `active:`, `disabled:`, `first:`, `last:`, `odd:`, and `placeholder:`. In v4, `hover:` applies only on devices that support hovering, so taps on a phone don't leave elements stuck in their hover style.

To style a child when its parent is hovered, mark the parent with `group` and use `group-hover:` on the child. `peer` does the same for an earlier sibling. For example, `peer-invalid:` can show an error message after an invalid input.

```html
<a class="group flex items-center gap-2">
  <span>Recordings</span>
  <svg class="opacity-0 group-hover:opacity-100">…</svg>
</a>
```

**Screen sizes.** Tailwind uses **mobile-first** breakpoints. A class with no prefix applies at every screen width. A breakpoint prefix applies the class at that width and above, never below:

| Prefix | Applies from |
| --- | --- |
| `sm:` | 40rem (640 px) |
| `md:` | 48rem (768 px) |
| `lg:` | 64rem (1024 px) |
| `xl:` | 80rem (1280 px) |
| `2xl:` | 96rem (1536 px) |

Style the phone layout with plain classes first, then override it at larger breakpoints:

```html
<ul class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">…</ul>
```

This shows one column on phones, two from 640 px, and four from 1024 px. `sm:` doesn't mean "on small screens". It means "from the `sm` width up".

To target screens below a breakpoint, use a `max-*` prefix. `max-md:hidden` hides an element below 768 px. Combine the two for a range: `md:max-xl:flex` applies only from 768 px up to 1280 px.

Breakpoints respond to the screen width. To respond to the width of a parent element instead, mark the parent with `@container` and use container variants like `@sm:` and `@md:` on its children. This suits components that appear in both wide and narrow places.

**Dark mode.** The `dark:` variant applies a class when dark mode is on:

```html
<div class="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">…</div>
```

By default, `dark:` follows the operating system setting through the `prefers-color-scheme` media query. To let users choose with a toggle instead, redefine the variant in your CSS. LiveCatch makes `dark:` apply inside any element with the `dark` class:

```css
@custom-variant dark (&:is(.dark *));
```

## 4. Customizing and reusing styles

In v4 you configure Tailwind in your main CSS file with **directives**, not in a JavaScript config file.

### The theme

Variables declared in `@theme` become design tokens, and Tailwind creates matching utilities:

```css
@import "tailwindcss";

@theme {
  --color-brand: oklch(0.65 0.2 25);
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 120rem;
}
```

This adds `bg-brand`, `text-brand`, `border-brand`, `font-display`, and the `3xl:` variant. The variable's prefix, called a namespace, decides which utilities are created. `--color-*` makes colour utilities, `--font-*` font families, `--text-*` font sizes, `--radius-*` border radius, and `--breakpoint-*` breakpoints. `--spacing` sets the base unit for every spacing utility.

A new variable adds to the defaults, and a variable with an existing name replaces that default. To remove a whole set of defaults, reset its namespace first. For example, `--color-*: initial;` removes the default palette.

With `@theme inline`, utilities use a variable's value directly instead of a reference to the theme variable. Use it when a token refers to another variable, as LiveCatch does (section 5).

### Components first

Repeated class lists are a sign you need a component, not a new CSS class. In React, write the classes once in a component and reuse it:

```tsx
function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">{children}</span>
}
```

For repeated markup inside one component, render it from data with `map` instead of copying it.

### CSS directives for the rest

Some styles can't live in a component, such as global element styles or HTML from a third-party library. For these, write CSS with Tailwind's directives:

**`@layer base`** holds global styles for HTML elements:

```css
@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

**`@layer components`** holds reusable classes with several properties. Utilities come in a later layer, so they can still override these classes, as in `class="card p-8"`.

```css
@layer components {
  .card {
    border-radius: var(--radius-lg);
    padding: --spacing(6);
    background-color: var(--color-white);
  }
}
```

**`@utility`** defines your own utility class. Unlike a class in `@layer components`, it works with every variant (`hover:`, `md:`, and so on). In v3 this was written as `@layer utilities`.

```css
@utility content-auto {
  content-visibility: auto;
}
```

**`@apply`** inserts the CSS of existing utilities into your own rule, as in the `body` example above. It's convenient, but it brings back the class naming that utility-first avoids, so keep it for the cases above.

To force one class to win, add `!` at the end, as in `bg-red-500!`. This sets `!important`, so use it only as a last resort.

| Directive | Purpose |
| --- | --- |
| `@import "tailwindcss"` | Loads Tailwind's layers, theme, Preflight, and utilities |
| `@theme` | Defines design tokens and the utilities created from them |
| `@source` | Adds or excludes files for class scanning |
| `@utility` | Creates a custom utility that supports variants |
| `@custom-variant` | Creates or redefines a variant, such as `dark` |
| `@layer base` / `@layer components` | Puts your CSS in the right cascade layer |
| `@apply` | Inserts utility styles into your own CSS |

## 5. Tailwind in LiveCatch

The app adds a few conventions on top of plain Tailwind. They come from shadcn/ui.

- **Use semantic colours.** `src/index.css` names colours by role, not hue: `background`, `foreground`, `primary`, `muted`, `muted-foreground`, `border`, `destructive`, and others. `@theme inline` turns them into utilities like `bg-primary`, `text-muted-foreground`, and `border-border`. Use these instead of palette colours like `bg-gray-100`, so a theme change updates the whole app.
- **Dark mode uses a class.** Each semantic colour has a light value under `:root` and a dark value under `.dark`. The `dark` class switches all colours at once, so components rarely need their own `dark:` classes.
- **Combine classes with `cn()`.** `@/lib/utils` exports `cn`, which joins class names conditionally and resolves conflicts so the last one wins. Use it in components that accept a `className` prop:

  ```tsx
  import { cn } from "@/lib/utils"

  function Card({ className, ...props }: React.ComponentProps<"div">) {
    return <div className={cn("rounded-lg border bg-card p-4", className)} {...props} />
  }

  // p-6 replaces p-4 instead of both ending up in the class list
  <Card className="p-6" />
  ```

## 6. References

- [Tailwind CSS docs](https://tailwindcss.com/docs): the reference for every utility. Search (Ctrl+K) for a CSS property, such as "letter spacing", to find its class.
- [Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes): the official explanation of the approach.
- [Theme variables](https://tailwindcss.com/docs/theme): every `@theme` namespace and its defaults.
- [Functions and directives](https://tailwindcss.com/docs/functions-and-directives): the full list of directives.
- [Upgrade guide](https://tailwindcss.com/docs/upgrade-guide): what changed from v3, useful when a tutorial doesn't match v4.
