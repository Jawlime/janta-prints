# Janta Prints — Website & Web App
**Kisumu, Kenya · Full Frontend Build**

---

## Project Structure

```
janta-prints/
├── index.html                  ← Homepage (copy from janta-prints-homepage.html)
├── css/
│   ├── tokens.css              ← DESIGN TOKENS (swap this to retheme everything)
│   └── base.css                ← Shared components, nav, footer, buttons, utilities
├── js/
│   └── main.js                 ← Shared JS (cursor, nav, reveals, accordion, tabs, toast)
├── pages/
│   ├── services.html           ← All service categories
│   ├── jerseys.html            ← Jersey & sports kits dedicated page
│   ├── portfolio.html          ← Filterable work gallery
│   ├── about.html              ← Company story, values, location
│   ├── blog.html               ← Blog listing
│   ├── faq.html                ← Accordion FAQ by category
│   ├── contact.html            ← Contact form + direct contact
│   ├── quote.html              ← 5-step multi-product quote builder
│   ├── account.html            ← Customer dashboard (orders, quotes, artwork, invoices)
│   ├── studio.html             ← Creative Studio (copy from janta-prints-studio.html)
│   ├── privacy.html            ← Privacy Policy
│   └── terms.html              ← Terms of Service
├── snippets.html               ← Copy-paste nav/footer HTML reference
└── studio_backend/
    ├── main.py                 ← Python FastAPI backend (all 8 image tools)
    ├── requirements.txt
    └── README.md
```

---

## How to Open Locally

No build step required. Just open any HTML file in a browser:

```bash
# Option A: double-click index.html in Finder/Explorer
# Option B: serve with a simple HTTP server (recommended to avoid CORS issues)
npx serve .
# or
python3 -m http.server 3000
```

---

## How to Retheme (Swap Palette)

**All colours live in one file: `css/tokens.css`**

Open the file and change the values in `:root`. Three preset palettes are included (commented out):
- **Dark Ember** (current) — charcoal background, orange + teal accents
- **Light Clay** — warm off-white background, dark crimson accents
- **Ocean Night** — deep navy background, sky blue + amber accents

To apply a preset:
1. Comment out the current `:root` block
2. Uncomment the preset you want
3. Save — every page updates instantly

To build a custom palette, change only these variables:
```css
:root {
  --col-bg:        /* page background */
  --col-surface:   /* card/panel background */
  --col-accent:    /* primary brand colour (CTA buttons, highlights) */
  --col-accent-2:  /* secondary accent (studio, info) */
  --col-text:      /* primary text */
  --col-text-muted:/* body text */
}
```

To swap fonts, change these + update the Google Fonts `<link>` in each page's `<head>`:
```css
  --font-display: 'Bebas Neue', sans-serif;  /* large headings */
  --font-heading: 'Syne', sans-serif;         /* labels, nav, buttons */
  --font-body:    'DM Sans', sans-serif;      /* paragraphs */
```

---

## How to Add a New Page

1. Copy any existing page as a template
2. Update the `<title>` and `data-page` attribute
3. Replace the `<main>` content
4. All nav, footer, cursor, toast, and reveal animations work automatically via `main.js` and `base.css`

The nav auto-highlights the active link based on the current filename.

---

## Connecting the Backend

### Quote Form (`pages/quote.html`)
The `submitQuote()` function at the bottom is the integration point.
Replace the `setTimeout` block with a `fetch` call to your API:

```js
async function submitQuote() {
  const payload = { ...qData, /* collect all form fields */ };
  const resp = await fetch('https://api.jantaprints.co.ke/quotes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (resp.ok) { /* show success */ }
}
```

### Contact Form (`pages/contact.html`)
Replace the `setTimeout` in `submitContact()` with your backend call.
Options: EmailJS (no backend needed), Formspree, or your own API.

### Account Dashboard (`pages/account.html`)
The login/logout functions are demo stubs. Wire to your auth provider:
- **Supabase Auth** (recommended — matches the tech stack in the PRD)
- **NextAuth.js** (if building with Next.js)
- Any JWT-based API

Replace `doLogin()` with an actual auth call, then load real orders from your API.

### Creative Studio (`pages/studio.html` / `studio_backend/`)
The API base URL is set at the top of `janta-prints-studio.html`:
```js
const API = window.API_BASE || 'http://localhost:8000';
```
For production, inject before the script:
```html
<script>window.API_BASE = 'https://api.jantaprints.co.ke';</script>
```
The studio works in demo mode (client-side Canvas simulation) without the backend.

---

## Payment Integration (M-Pesa)

Add M-Pesa STK Push to the order confirmation step. The flow:
1. Customer confirms order → your backend calls Daraja API `stkpush` endpoint
2. Customer gets M-Pesa prompt on their phone
3. On payment, Daraja sends a callback to your backend
4. Backend updates order status → sends confirmation email/SMS

Daraja credentials: get from Safaricom Business portal → https://developer.safaricom.co.ke

---

## SMS / WhatsApp Notifications

Use **Africa's Talking** for order status SMS updates (Kenyan-native):
```bash
pip install africastalking
```
```python
import africastalking
africastalking.initialize('username', 'api_key')
sms = africastalking.SMS
sms.send("Your order #JP-007 is ready for collection!", ["+254704570799"])
```

---

## Deployment Checklist

- [ ] Register domain: `jantaprints.co.ke` (via Kenya Network Information Centre — KENIC)
- [ ] Deploy frontend to **Vercel** (connect GitHub repo, auto-deploys on push)
- [ ] Deploy Python backend to **Railway** (`railway up` from `studio_backend/`)
- [ ] Set `window.API_BASE` to Railway URL in studio page
- [ ] Set up **Supabase** project (database + auth + file storage)
- [ ] Configure **M-Pesa Daraja** API credentials in backend `.env`
- [ ] Set up **Africa's Talking** SMS account
- [ ] Configure **SendGrid** or **Resend** for transactional emails
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google My Business listing (Kisumu address)

---

## File Sizes (reference)

| File | Size |
|------|------|
| `css/tokens.css` | ~4KB |
| `css/base.css` | ~14KB |
| `js/main.js` | ~6KB |
| `pages/quote.html` | ~21KB |
| `pages/account.html` | ~16KB |
| `pages/services.html` | ~23KB |
| `pages/jerseys.html` | ~19KB |
| Creative Studio frontend | ~77KB |
| Python backend (`main.py`) | ~31KB |

---

*Built for Janta Prints, Kisumu, Kenya · 2026*
