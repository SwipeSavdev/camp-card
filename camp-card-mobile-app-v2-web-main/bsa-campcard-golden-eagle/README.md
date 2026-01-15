# Golden Eagle Dinner 2026 — HTML Donor Pitch Slick (VS Code Ready)

This folder is a **static HTML + CSS** rebuild of the sponsor/donor packet.

## What's inside
- `index.html` — 7-page donor pitch slick (screen + print/PDF ready)
- `styles.css` — modern layout + brand variables (colors, fonts, spacing)
- `print.css` — clean pagination (Letter) and page breaks for “Save as PDF”
- `assets/` — logos + imagery extracted from the original PDF for brand alignment

## How to view
### Option A (fast)
Open `index.html` directly in Chrome/Edge/Safari.

### Option B (recommended)
From this folder run a local server:
```bash
python -m http.server 8080
```
Then open:
`http://localhost:8080`

## Export to PDF
In Chrome:
- File → Print… → Destination: **Save as PDF**
- More settings: Paper size **Letter**
- Make sure **Background graphics** is ON (for gradients and hero headers)

## Brand tweaks
Brand colors live in `styles.css` under `:root`:
- `--brand-blue`
- `--brand-red`
- `--brand-navy`

Swap images in `/assets` if you’d like updated logos or fresh photography.
