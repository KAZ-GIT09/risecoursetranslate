# Chat Summary — Rise Course Translate + Glossary

## Project goal

Add translation to Articulate Rise **xAPI** courses via one CDN script line, while keeping a private glossary of terms (ODF, TM Forum, Digital Twin, etc.) **untranslated** in every language.

**Repo:** https://github.com/Moyour/risecoursetranslate  
**Current version:** v1.8.9 (`@main` on CDN)

---

## The one line (set once, never change)

```html
<script src="https://cdn.jsdelivr.net/gh/Moyour/risecoursetranslate@main/risecoursetranslate.js" data-glossary="Translation Glossary.csv" defer></script>
```

Paste in **`scormcontent/index.html`**.

---

## Issues we faced (and fixes)

| # | Issue | Cause | Fix |
|---|--------|--------|-----|
| 1 | Dropdown / placement bugs on Rise cover | Rise DOM, overflow, React re-renders | v1.6.x — smart placement, portaled dropdown |
| 2 | Glossary seemed ignored | Placeholder characters corrupted by Google Translate | v1.8.3 — segment-based protection (skip terms during translation) |
| 3 | Glossary not loading | CSV `fetch()` blocked in xAPI / local `file://` | Tried `.js` fallback — **rejected by user** |
| 4 | CDN link kept changing | Pinned to commit hashes each fix | Switched to stable `@main` URL |
| 5 | Team workflow too technical | Manual CSV → JS conversion, terminal | **Update Glossary.command** — double-click only |
| 6 | Glossary broke again (v1.8.8) | `.js` loader mis-parsed CSV when source URL ended in `.js` | v1.8.8 parse fix |
| 7 | User wants **CSV only**, not `.js` | xAPI blocks CSV fetch even when file is in folder | v1.8.9 — **Update Glossary embeds CSV inside `index.html`**; course reads `embedded-csv` |

---

## Core problem (still relevant)

**Browsers and xAPI/LMS packages often cannot load `Translation Glossary.csv` via `fetch()`**, even when the file sits next to `index.html` in `scormcontent/`.

**Workaround (v1.8.9):**  
`Update Glossary` copies the CSV into the course **and** embeds the same data in `index.html` as:

```html
<script type="text/plain" id="rise-glossary" data-rise-glossary>
...csv content...
</script>
```

The translator loads **`embedded-csv`** first. You may still see `Glossary fetch failed` for the `.csv` URL — that is expected and OK if embedded load succeeds.

---

## Current workflow (simple)

### Team (non-technical)
1. Edit **`Translation Glossary.csv`** (or Excel → Save As CSV)
2. Double-click **`Update Glossary.command`**

### Publisher (you)
1. Export xAPI from Rise → unzip
2. Ensure script line is in `scormcontent/index.html` (once)
3. Run **Update Glossary** (syncs CSV + embeds into `index.html`)
4. Re-zip → upload to LMS

### One-time setup
- Copy `glossary-course-folder.example.txt` → `glossary-course-folder.txt`
- Add path to your `scormcontent` folder so Update Glossary copies files automatically

---

## xAPI folder layout

```
course-package/
├── scormdriver/              ← do not edit
└── scormcontent/
    ├── index.html              ← CDN script line + embedded glossary block (auto)
    └── Translation Glossary.csv
```

---

## Files involved

### On GitHub (public) — `risecoursetranslate` repo

| File | Purpose |
|------|---------|
| `risecoursetranslate.js` | Main translator — loaded from CDN |
| `Update Glossary.command` | Double-click to sync glossary into course |
| `scripts/update-glossary.py` | Reads CSV/Excel, copies CSV, embeds in `index.html` |
| `scripts/verify-glossary.mjs` | Dev check — CSV parses correctly |
| `glossary.example.csv` | Example format (fake terms) |
| `glossary-course-folder.example.txt` | Template for course path config |
| `test.html` | Local mock Rise page |
| `SETUP-GUIDE.md` | Setup instructions |
| `CHAT-SUMMARY.md` | This file |

### On your Mac (private — not on GitHub)

| File | Purpose |
|------|---------|
| `Translation Glossary.xlsx` | Original Excel glossary (your terms) |
| `Translation Glossary.csv` | Saved/exported glossary — team edits this |
| `glossary-course-folder.txt` | Path to your `scormcontent` folder (optional) |

### Inside xAPI package (private — uploaded to LMS)

| File | Purpose |
|------|---------|
| `scormcontent/index.html` | Rise course + CDN script line + embedded glossary |
| `scormcontent/Translation Glossary.csv` | Glossary file in course package |

### Do NOT use (removed from repo)

| Item | Why |
|------|-----|
| `Translation Glossary.js` | Removed — CSV + Update Glossary embed only |
| `scripts/build-glossary-js.mjs` | Removed — obsolete |
| `deepl-proxy.example.mjs` | Removed — not used |
| Commit-pinned CDN URLs | Use `@main` instead |
| Public GitHub hosting of glossary | Privacy — glossary stays in course upload only |

---

## How to verify glossary works

Open course → **F12** → **Console**:

| Check | Expected |
|-------|----------|
| `window.__riseTranslateVersion` | `"1.8.9"` |
| `window.__riseGlossaryCount` | `49` (or your term count) |
| Console message | `Glossary loaded: X protected term(s) from embedded-csv` |

Pick French/Spanish — terms like **ODF**, **TM Forum** should stay in English.

---

## Glossary CSV format

```csv
Source content,Target content,Notes (250 character max)
ODF,ODF,
TM Forum,TM Forum,
Digital Twin,Digital Twin,
```

- **Source content** = term to protect  
- Terms stay untranslated in **every** language  
- Not a translation dictionary

---

## Version timeline (key releases)

| Version | Change |
|---------|--------|
| v1.6.x | Rise UI — dropdown, cover vs floating placement |
| v1.8.0–v1.8.3 | Glossary support, Excel format, Rise-safe translation |
| v1.8.4–v1.8.7 | Fetch fallbacks, `.js` workaround (later removed) |
| v1.8.8 | Fix silent glossary parse failure |
| v1.8.9 | **CSV only** — embed via Update Glossary, no `.js` |

---

## Open risks / things to watch

1. **Re-export from Rise** overwrites `index.html` — must re-add script line and re-run **Update Glossary**
2. **Local testing** via double-clicking `index.html` (`file://`) — CSV fetch will fail; embedded glossary should still work after Update Glossary
3. **jsDelivr `@main` cache** — can take a few minutes to serve latest code after git push; hard-refresh browser
4. **Glossary terms split across Rise spans** — long phrases may partially translate if Rise splits text oddly in DOM

---

*Summary of chat through v1.8.9 — ODF Awareness / Translation Glossary course.*
