# Quick Prints — Agent Context

> **For coding agents:** Read this file at the start of every session.  
> **Project logs:** `/Users/metabt/Desktop/Hermes Project Logs/print jobs/`

---

## Project Overview

**Quick Prints** is a standalone web app for cosmetic shops (Zero Lines) to create and print thermal receipt-sized templates on 80mm paper.

- **Use case:** Sales specialists hand customers printed vouchers, business cards, treatment info, and skincare instructions
- **Tech:** Vanilla HTML/CSS/JS, no build step, localStorage persistence
- **Paper:** 80mm thermal receipt paper
- **Languages:** English, Spanish, French (EN/ES/FR)
- **Folder:** `/Users/metabt/Desktop/print jobs/`
- **Live:** https://bullishrobr-dev.github.io/print-jobs/
- **Repo:** https://github.com/bullishrobr-dev/print-jobs

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | Single `index.html` (SPA with view switching) |
| Styling | Vanilla CSS (`css/style.css`) |
| Scripting | Vanilla JS global scripts (`js/app.js`, `js/data.js`, `js/templates.js`, `js/translations.js`) |
| State | localStorage |
| Icons | Inline SVG |
| Fonts | Inter (UI), Courier New / SF Mono (receipt) |
| Print | Hidden iframe with inline CSS (reliable for thermal printers) |

**No build step.** Open `index.html` directly or serve via static server.

---

## File Structure

```
print jobs/
├── index.html              # Single-page app shell
├── css/style.css           # All styles (app + luxury receipt preview + print fallback)
├── js/
│   ├── app.js              # View routing, event handlers, settings UI, iframe print
│   ├── data.js             # localStorage CRUD, default data, version checking
│   ├── templates.js        # Template schemas, per-language defaults, luxury renderers
│   └── translations.js     # EN/ES/FR translation dictionary
├── assets/                 # Logo images (empty, uploaded via Settings base64)
└── AGENTS.md               # This file
```

---

## Views

1. **Templates Grid** (`#view-templates`) — 4 built-in templates + Custom Template Builder + language switcher
2. **Editor** (`#view-editor`) — Dynamic form + live 80mm preview side by side
3. **Settings** (`#view-settings`) — Shop info, logo upload, workers, locations, hours

---

## Templates

| ID | Name | Description |
|----|------|-------------|
| `discount` | Discount Voucher | Percent-off code with validity |
| `businesscard` | Business Card | Specialist card with contact toggles |
| `facial` | Facial / Treatment Voucher | Treatment info with benefits list |
| `skincare` | Skincare Instructions | Product-use plan with steps |
| `custom_*` | Custom Template | User-created via Custom Template Builder |

Each template is defined in `js/templates.js` with:
- `fields[]` — form field schema (type, labelKey, default)
- `render(data, shop, worker)` — returns HTML string for receipt

**Default text is translated per language** via `QP_TEMPLATE_DEFAULTS` in `templates.js`.

---

## Receipt Design System (Luxury)

The receipt uses a luxury thermal-paper aesthetic:
- **Double-line borders** (`═══`) for major section breaks
- **Single lines** for minor separations
- **Dotted lines** for worker contact info
- **Labels**: 8px bold uppercase with wide letter-spacing (e.g. "EMAIL:")
- **Titles**: 11px bold uppercase with letter-spacing
- **Shop tagline** appears below logo on every receipt
- **Footer** always shows: locations, email, phone, WhatsApp, website, opening hours

CSS classes: `rc-logo`, `rc-brand`, `rc-tagline`, `rc-title`, `rc-subtitle`, `rc-highlight`, `rc-meta`, `rc-label`, `rc-value`, `rc-divider`, `rc-divider--double`, `rc-divider--dotted`, `rc-divider--light`, `rc-center`, `rc-paragraph`, `rc-row`, `rc-hours`, `rc-list`, `rc-worker-name`, `rc-worker-contact`, `rc-loc-name`, `rc-loc-addr`, `rc-loc-item`

---

## Data Model (localStorage)

| Key | Contents |
|-----|----------|
| `qp2_shop` | `{ name, tagline, logo, email, phone, whatsapp, website, locations[], hours{} }` |
| `qp2_workers` | `[ { id, name, role, phone, whatsapp, email } ]` |
| `qp2_editor_state` | `{ [templateId]: { ...fieldValues } }` |
| `qp2_lang` | `"en"` / `"es"` / `"fr"` |
| `qp2_version` | Data schema version (auto-resets data on breaking changes) |

---

## Key Conventions

- **Receipt width:** 80mm — CSS `width: 80mm` on `.receipt-preview`
- **Print:** Hidden iframe with inline CSS (`qpDoPrint()` in `app.js`)
- **Worker fields:** `workerId` type fields populate from Settings workers list
- **Checkbox toggles (Business Card only):** Control visibility of worker email/phone/WhatsApp on printed output
- **Shop footer:** Always visible on every receipt (locations, email, phone, WhatsApp, website, hours)
- **Single location:** Shows name + address without "LOCATIONS:" header
- **Custom templates:** Support placeholders `{shop_name}`, `{shop_tagline}`, `{shop_email}`, `{shop_phone}`, `{shop_whatsapp}`, `{shop_website}`, `{worker_name}`, `{worker_role}`, `{worker_phone}`, `{worker_email}`, `{worker_whatsapp}`, `{locations}`, `{hours}`

---

## Quick Commands

```bash
# Preview locally
open "/Users/metabt/Desktop/print jobs/index.html"

# Or serve
python3 -m http.server 8000

# Deploy to GitHub Pages
cd "/Users/metabt/Desktop/print jobs"
git add -A && git commit -m "describe change" && git push origin main
# GitHub Pages auto-rebuilds from main branch
```

---

## Owner Preferences

- Simplicity over complexity — vanilla solutions
- No build step
- Works offline
- Mobile/tablet friendly (shops use tablets)
- Luxury aesthetic — receipts must look premium
- Thermal printer optimized (80mm, iframe printing)
