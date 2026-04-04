# Deployment Guide — Janta Prints

## Live on Vercel
Push changes to the GitHub repo → Vercel auto-deploys within 30 seconds.

## Before going live checklist
- [ ] Replace `YOUR_FORM_ID` in `contact.html` and `quote.html` with your Formspree form ID
- [ ] Add real social media URLs (search `href="#" class="jp-footer__social-link"` across all pages)
- [ ] Add full street address (search `Kisumu, Kenya` in `about.html` and `contact.html`)
- [ ] Submit sitemap to Google Search Console: `https://janta-prints.vercel.app/sitemap.xml`
- [ ] Add custom domain in Vercel Settings → Domains

## Formspree setup (free, 5 min)
1. Go to formspree.io → create account → New Form
2. Copy your Form ID (looks like `xpwzgkjv`)
3. In `contact.html` and `quote.html`, replace `YOUR_FORM_ID` with it
4. Submissions go to your email automatically

## Custom domain
1. Buy `jantaprints.co.ke` from your registrar
2. In Vercel → Project → Settings → Domains → Add domain
3. Follow the DNS instructions Vercel gives you
