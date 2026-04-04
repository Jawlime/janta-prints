# Janta Prints Website

Print and branding studio based in Kisumu, Kenya.

**Live site:** https://janta-prints.vercel.app

## Stack
- Static HTML/CSS/JS — no framework
- Hosted on Vercel
- `css/tokens.css` — design tokens (edit here to retheme)
- `css/base.css` — shared components
- `js/main.js` — scroll reveals, nav, accordion, cursor
- `js/api.js` — integrations (Formspree, demo stubs)

## Pages
`index.html`, `pages/services.html`, `pages/jerseys.html`, `pages/portfolio.html`, `pages/about.html`, `pages/blog.html`, `pages/faq.html`, `pages/contact.html`, `pages/quote.html`, `pages/studio.html`, `pages/account.html`, `pages/register.html`, `pages/order-tracking.html`, `pages/privacy.html`, `pages/terms.html` + 6 blog articles.

## To deploy
Push to GitHub → import on Vercel → auto-deploys on every commit.

## To connect real forms
Open `js/api.js` and set `JP.ENV.FEATURES.realQuoteSubmit = true`, then add your Formspree ID to `contact.html` and `quote.html` where it says `YOUR_FORM_ID`.
