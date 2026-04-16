# Motion+ Website — Vercel Deployment Guide

## Prerequisites

- A GitHub account ([github.com](https://github.com))
- A Vercel account ([vercel.com](https://vercel.com)) — sign up free with your GitHub account
- The `website/` folder from this project

---

## Step 1: Push to GitHub

1. Create a new repository on GitHub:
   - Go to [github.com/new](https://github.com/new)
   - Name it `motion-plus-website`
   - Set to **Private**
   - Click **Create repository**

2. In your terminal, navigate to the `website/` folder and run:

```bash
cd website
git init
git add .
git commit -m "Initial website build"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/motion-plus-website.git
git push -u origin main
```

---

## Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** > **"Project"**
3. Find and select your `motion-plus-website` repository
4. Configure the project:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** (leave empty — it's a static site)
   - **Output Directory:** `./` (leave as default)
5. Click **"Deploy"**
6. Your site will be live at `motion-plus-website.vercel.app` within ~30 seconds

---

## Step 3: Buy and Connect Your Domain

### Option A: Buy through Vercel (simplest)
1. In your Vercel project, go to **Settings** > **Domains**
2. Type your desired domain (e.g., `motionplusllc.com`)
3. If available, Vercel will let you purchase it directly
4. DNS is auto-configured — done!

### Option B: Buy elsewhere, connect to Vercel
1. Buy your domain from Namecheap, Google Domains, GoDaddy, etc.
2. In Vercel, go to **Settings** > **Domains** > **Add**
3. Enter your domain name
4. Vercel will show you DNS records to add. Either:

   **Method 1: Use Vercel's nameservers (recommended)**
   - In your registrar, change nameservers to:
     - `ns1.vercel-dns.com`
     - `ns2.vercel-dns.com`
   - This gives Vercel full DNS control (easiest for email setup too)

   **Method 2: Add A/CNAME records manually**
   - Add an **A record**: `@` → `76.76.21.21`
   - Add a **CNAME record**: `www` → `cname.vercel-dns.com`

5. Wait for DNS propagation (usually 5-15 minutes, up to 48 hours)

---

## Step 4: Set Up Email DNS (after domain is connected)

If you're using Vercel's nameservers, add the email DNS records in the Vercel dashboard:

1. Go to your Vercel project > **Settings** > **Domains** > click your domain
2. Add the records from **EMAIL_SETUP_GUIDE.md**:
   - MX records for Zoho
   - TXT record for SPF
   - TXT record for DKIM
   - TXT record for domain verification

---

## Step 5: Set Up Contact Form

1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form (free plan allows 50 submissions/month)
3. Copy your form ID (looks like `xyzabcde`)
4. In `contact.html`, find `YOUR_FORM_ID` and replace it with your actual ID:
   ```html
   <form action="https://formspree.io/f/xyzabcde" method="POST">
   ```
5. Commit and push the change — Vercel will auto-deploy

---

## Updating the Website

Any push to the `main` branch on GitHub automatically triggers a new deployment on Vercel. To update the site:

```bash
# Make your changes to the files
git add .
git commit -m "Update description"
git push
```

Vercel deploys in ~10 seconds. Your changes will be live almost immediately.

---

## File Structure Reference

```
website/
├── index.html              Home page
├── about.html              About & Team
├── u-clamp.html            U-Clamp product page
├── wrapid.html             Wrapid product page
├── shin-sheath.html        Shin Sheath product page
├── mech-chair.html         Mech Chair product page
├── investors.html          Investor information
├── contact.html            Contact form
├── css/
│   └── styles.css          Global stylesheet
├── js/
│   ├── main.js             Nav, footer, animations
│   └── stl-viewer.js       Three.js 3D model viewer
├── assets/
│   ├── images/             All images organized by product
│   └── models/             STL files for 3D viewers
├── vercel.json             Vercel routing configuration
├── TEAM_EMAILS.txt         Team email directory
├── EMAIL_SETUP_GUIDE.md    Zoho Mail setup instructions
└── DEPLOY_GUIDE.md         This file
```

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel hosting | Free (Hobby plan) |
| Domain name | ~$10-15/year |
| Zoho Mail (5 users) | Free |
| Formspree (contact form) | Free (50 submissions/month) |
| **Total** | **~$10-15/year** |
