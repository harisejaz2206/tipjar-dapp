# 🚀 Turbopack Font Optimization Guide

## ⚠️ Important: Why we don't use `@import url(...)` in `globals.css`

When using **Turbopack (Next.js 13+ with App Router)**, CSS `@import url(...)` **cannot** be placed inside `globals.css` or any PostCSS-processed file **after other rules** — it will **crash the build**.

Even placing it *above* `@import "tailwindcss"` is **discouraged** because Tailwind injects its own CSS reset and layering, which may override your imported font styles or cause unpredictable order issues.

## ✅ The Right Way (Turbopack-friendly)

We use **Next.js built-in `next/font/google`** in `layout.tsx`:

```typescript
import { Orbitron, Rajdhani } from "next/font/google";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: 'swap', // Prevents FOUC
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani", 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: 'swap',
});
```

Then in `tailwind.config.js`:

```javascript
fontFamily: {
  'orbitron': ['var(--font-orbitron)', 'monospace'],
  'rajdhani': ['var(--font-rajdhani)', 'sans-serif'],
}
```

## 🎯 Benefits of This Approach

1. **No Build Crashes** - Turbopack compatible
2. **Better Performance** - Fonts are optimized and preloaded
3. **No FOUC** - Flash of Unstyled Content is prevented
4. **Type Safety** - TypeScript support for font weights
5. **Automatic Optimization** - Next.js handles font loading

## 💡 TL;DR

> **Don't use `@import url(...)` in `globals.css` with Turbopack.**  
> **Use `next/font/google` — it's faster, avoids FOUC, and won't break the build.**

## 🔧 Usage in Components

```jsx
// Use Tailwind classes
<h1 className="font-orbitron font-bold">Futuristic Header</h1>
<p className="font-rajdhani">Clean body text</p>

// Or use CSS variables directly
<div style={{ fontFamily: 'var(--font-orbitron)' }}>Direct usage</div>
```

This approach ensures our futuristic TipJar dApp fonts load perfectly with Turbopack! 🚀✨ 