# Motion+ LLC — Email Setup Guide (Zoho Mail Free)

## Overview
This guide sets up professional email addresses (@motionplusllc.com) for the team
using **Zoho Mail's free plan** (5 users, 5GB each — perfect for your team size).

> **Note:** Replace `motionplusllc.com` with whatever domain you purchase.

---

## Step 1: Purchase a Domain

Before setting up email, you need a domain. Recommended registrars:
- **Namecheap** — cheapest, ~$9/year for .com
- **Google Domains** (now Squarespace) — ~$12/year
- **Cloudflare** — at-cost pricing

Suggested domains: `motionplusllc.com`, `motionplus.co`, `getmotionplus.com`

---

## Step 2: Sign Up for Zoho Mail

1. Go to **https://www.zoho.com/mail/zohomail-pricing.html**
2. Click **"Forever Free Plan"** (bottom of the page)
3. Sign up with your personal email
4. Enter your purchased domain when prompted

---

## Step 3: Verify Domain Ownership

Zoho will give you a **TXT record** to add to your domain's DNS settings.

1. Log into your domain registrar (e.g. Namecheap)
2. Go to **DNS settings** for your domain
3. Add the TXT record Zoho provides (looks like: `zoho-verification=zb12345678.zmverify.zoho.com`)
4. Wait ~5 minutes, then click "Verify" in Zoho

---

## Step 4: Configure MX Records

Replace any existing MX records with Zoho's. Add these in your domain's DNS:

| Priority | Host | Value |
|----------|------|-------|
| 10 | @ | mx.zoho.com |
| 20 | @ | mx2.zoho.com |
| 50 | @ | mx3.zoho.com |

---

## Step 5: Configure SPF Record (prevents spam flagging)

Add this TXT record to your DNS:

| Type | Host | Value |
|------|------|-------|
| TXT | @ | `v=spf1 include:zoho.com ~all` |

---

## Step 6: Create User Mailboxes

In the Zoho Admin Console (**https://mailadmin.zoho.com**):

1. Go to **User Details** → **Add User**
2. Create each account from `email-users.txt`:

| Email | Name | Role |
|-------|------|------|
| team@motionplusllc.com | Motion+ Team | Shared Inbox |
| asharp@motionplusllc.com | Aaron Sharp | COO |
| jpark@motionplusllc.com | Jesse Park | CEO |
| sonyishi@motionplusllc.com | Sandra Onyishi | CFO |
| adavidson@motionplusllc.com | Alexzander Davidson | CTO |

> **Free plan limit:** 5 users. `team@` can be a group/alias instead of a user
> to save a slot. To do this: create it as a **Group** → **Distribution List**
> that forwards to all 4 team members.

---

## Step 7: Access Email

Each team member can access their inbox at:
- **Web:** https://mail.zoho.com
- **Mobile:** Download "Zoho Mail" app (iOS / Android)

### Connect to Gmail (read-only forwarding)
To get notifications in Gmail:
1. In Zoho Mail → **Settings** → **Email Forwarding**
2. Add your personal Gmail address as a forwarding address
3. Confirm in Gmail
4. All incoming mail now copies to Gmail too

### Connect to Windows Mail / Outlook
1. In Zoho: **Settings** → **Mail Accounts** → **IMAP Access** → Enable
2. In Windows Mail or Outlook, add an account:
   - **IMAP Server:** `imappro.zoho.com` (Port 993, SSL)
   - **SMTP Server:** `smtppro.zoho.com` (Port 465, SSL)
   - **Username:** your full email (e.g. `asharp@motionplusllc.com`)
   - **Password:** your Zoho password (or App Password if 2FA enabled)

---

## Step 8: Add a New Team Member Later

1. Open `email-users.txt` and add a new line:
   ```
   newperson@motionplusllc.com | New Person | Title
   ```
2. Log into **https://mailadmin.zoho.com**
3. Go to **User Details** → **Add User**
4. Enter their name and desired email address
5. Share their login credentials

> If you're on the free plan and already have 5 users, you'll need to upgrade
> to the **Mail Lite** plan ($1/user/month) to add more.

---

## DNS Summary (All Records Needed)

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| TXT | @ | (Zoho verification code) | Domain verification |
| MX | @ | mx.zoho.com (priority 10) | Mail routing |
| MX | @ | mx2.zoho.com (priority 20) | Mail routing |
| MX | @ | mx3.zoho.com (priority 50) | Mail routing |
| TXT | @ | v=spf1 include:zoho.com ~all | Spam prevention |

---

## Quick Reference

- **Zoho Admin:** https://mailadmin.zoho.com
- **Zoho Webmail:** https://mail.zoho.com
- **Zoho Status:** https://status.zoho.com
- **IMAP:** imappro.zoho.com:993 (SSL)
- **SMTP:** smtppro.zoho.com:465 (SSL)
