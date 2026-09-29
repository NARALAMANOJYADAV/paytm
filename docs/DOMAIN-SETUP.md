# Changing the site's domain

What to update when the site moves to a new address (for example a custom domain in place of the
`amplifyapp.com` one). It takes about 5 minutes. Nothing else in the code or database has to change.

## 1. Supabase: authentication URLs (required)

Supabase only sends password-reset links to addresses it trusts.

1. Open https://supabase.com/dashboard/project/fqnkulnmbuajikniyflv/auth/url-configuration
2. **Site URL**: set to the new address, e.g. `https://p2p.nbkrist.org`
3. **Redirect URLs**: add `https://p2p.nbkrist.org/**`. Keep the old address too until the switch is finished.
4. Click **Save**.

Nothing else in Supabase changes. Data access goes through the website's server, which Supabase
allows from any address. No CORS, database or storage settings are tied to the domain.

## 2. AWS Amplify: point the domain at the site

1. AWS Console → Amplify → app **prompt-to-production** → **Hosting → Custom domains → Add domain**.
2. Enter the domain and follow the DNS instructions Amplify shows. Add the listed records wherever the domain's
   DNS is managed. Amplify issues the HTTPS certificate automatically.
3. Under **Hosting → Environment variables**, set `NEXT_PUBLIC_SITE_URL` to the new address
   (e.g. `https://p2p.nbkrist.org`), then **Redeploy** the branch.
   This makes WhatsApp and other link previews use the new address.

## 3. Check

- Open the new address. The site should load over HTTPS.
- Sign in, then use **Forgot password**. The email link must open the new address.
- Share the link in WhatsApp. The preview image should appear.
- On a phone, open **Coordinator → QR Check-in → Start Camera**. The camera needs HTTPS.

## Current values

| Setting | Value |
|---|---|
| Supabase project | `fqnkulnmbuajikniyflv` (Mumbai) |
| Live address | https://feat-real-backend-redesign.d3o55sxplfs509.amplifyapp.com |
| Supabase Site URL | same as the live address |
| Supabase Redirect URLs | live address `/**`, `http://localhost:3400/**` (local testing) |
