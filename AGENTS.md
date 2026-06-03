# Quick Prints — Agent Context

> **For coding agents:** Read this file at the start of every session.

---

## Project Overview

**Quick Prints** is a standalone web app for cosmetic shops (Zero Lines) to create and print thermal receipt-sized templates on 80mm paper.

- **Use case:** Sales specialists hand customers printed vouchers, business cards, treatment info, and skincare instructions
- **Tech:** Vanilla HTML/CSS/JS, no build step, localStorage persistence
- **Paper:** 80mm thermal receipt paper
- **Folder:** `/Users/metabt/Desktop/print jobs/`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | Single `index.html` (SPA with view switching) |
| Styling | Vanilla CSS (`css/style.css`) |
| Scripting | Vanilla JS ES modules (`js/app.js`, `js/data.js`, `js/templates.js`) |
| State | localStorage |
| Icons | Inline SVG |
| Fonts | Inter (UI), Courier New (receipt) |

**No build step.** Open `index.html` directly or serve via static server.

---

## File Structure

```
print jobs/
├── index.html          # Single-page app shell
├── css/style.css       # All styles (app + receipt preview + print)
├── js/
│   ├── app.js          # View routing, event handlers, settings UI
│   ├── data.js         # localStorage CRUD, default data
│   └── templates.js    # Template schemas, defaults, render functions
├── assets/             # Logo images (empty, add here)
└── AGENTS.md           # This file
```

---

## Views

1. **Templates Grid** (`#view-templates`) — Select from 4 template types
2. **Editor** (`#view-editor`) — Form + live 80mm preview side by side
3. **Settings** (`#view-settings`) — Shop info, workers, locations, hours

---

## Templates

| ID | Name | Description |
|----|------|-------------|
| `discount` | Discount Voucher | Percent-off code with validity |
| `businesscard` | Business Card | Specialist card with contact toggles |
| `facial` | Facial / Treatment Voucher | Treatment info with benefits list |
| `skincare` | Skincare Instructions | Product-use plan with steps |

Each template is defined in `js/templates.js` with:
- `fields[]` — form field schema (type, label, default)
- `render(data, shop, worker)` — returns HTML string for receipt

---

## Data Model (localStorage)

| Key | Contents |
|-----|----------|
| `qp_shop` | `{ name, logo, email, phone, whatsapp, locations[], hours{} }` |
| `qp_workers` | `[ { id, name, role, phone, email } ]` |
| `qp_editor_state` | `{ [templateId]: { ...fieldValues } }` |

---

## Key Conventions

- **Receipt width:** 80mm — CSS `width: 80mm` on `.receipt-preview`
- **Print:** `window.print()` with `@media print` hiding app chrome
- **Worker fields:** `workerId` type fields populate from Settings workers list
- **Checkbox toggles:** Control visibility of email/phone/opening hours on printed output
- **First-run:** Defaults seeded automatically on first load

---

## Quick Commands

```bash
# Preview locally
open "/Users/metabt/Desktop/print jobs/index.html"

# Or serve
python3 -m http.server 8000

# Deploy (static site)
# Upload folder to Vercel / Netlify / Cloudflare Pages
```

---

## Owner Preferences

- Simplicity over complexity — vanilla solutions
- No build step
- Works offline
- Mobile/tablet friendly (shops use tablets)
