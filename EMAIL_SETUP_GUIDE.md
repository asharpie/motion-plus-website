# Motion+ Email Setup Guide — Zoho Mail (Free Plan)

Zoho Mail's free plan supports up to **5 users** with custom domain email. Since Motion+ has exactly 5 addresses (4 personal + 1 team), this is a perfect fit at **$0/month**.

> **Note:** If you need more than 5 accounts later, Zoho's paid plan is $1/user/month — still very affordable.

---

## Prerequisites

- A purchased domain name (e.g., `motionplusllc.com`)
- Access to your domain's DNS settings (through your domain registrar like Namecheap, Google Domains, GoDaddy, or Vercel)

---

## Step 1: Sign Up for Zoho Mail

1. Go to [https://www.zoho.com/mail/zohomail-pricing.html](https://www.zoho.com/mail/zohomail-pricing.html)
2. Click **"Forever Free Plan"** (or "Free Plan" — up to 5 users, 5GB/user)
3. Click **"Sign Up Now"**
4. Choose **"Business email"** and enter your domain: `motionplusllc.com`
5. Create your admin account (use `asharp@motionplusllc.com` as the first/admin account)
6. Set a strong password

---

## Step 2: Verify Your Domain

Zoho will ask you to verify domain ownership. You'll need to add a **TXT record** to your domain's DNS.

1. Zoho will show you a verification code like: `zoho-verification=zb12345678.zmverify.zoho.com`
2. Log in to your **domain registrar** (or Vercel if you manage DNS there)
3. Go to **DNS Settings** for `motionplusllc.com`
4. Add a new **TXT record**:
   - **Host/Name:** `@`
   - **Value:** (paste the code Zoho gave you)
   - **TTL:** 300 (or default)
5. Wait 5–15 minutes, then click **"Verify"** in Zoho

---

## Step 3: Configure MX Records

MX records tell other email servers to deliver mail to Zoho. Add these to your DNS:

| Priority | Host | Value |
|----------|------|-------|
| 10 | @ | `mx.zoho.com` |
| 20 | @ | `mx2.zoho.com` |
| 50 | @ | `mx3.zoho.com` |

> **Important:** Delete any existing MX records first (there may be default ones from your registrar).

---

## Step 4: Configure SPF Record (Prevents Spam Flagging)

Add a **TXT record** to your DNS:

- **Host/Name:** `@`
- **Type:** TXT
- **Value:** `v=spf1 include:zoho.com ~all`

---

## Step 5: Configure DKIM (Email Authentication)

1. In Zoho Mail admin, go to **Email Authentication** > **DKIM**
2. Click **"Add"** and Zoho will generate a TXT record value
3. Add the TXT record to your DNS as instructed
4. Verify in Zoho

---

## Step 6: Create Team Email Accounts

1. In Zoho Mail admin ([https://mailadmin.zoho.com](https://mailadmin.zoho.com)), go to **Users**
2. Click **"Add User"** and create each account:

| Name | Email | Role |
|------|-------|------|
| Aaron Sharp | asharp@motionplusllc.com | COO (Admin) |
| Jesse Park | jpark@motionplusllc.com | CEO |
| Sandra Onyishi | sonyishi@motionplusllc.com | CFO |
| Alexzander Davidson | adavidson@motionplusllc.com | CTO |

3. For the **team@motionplusllc.com** address:
   - Go to **Groups** > **Create Group**
   - Group name: `Team`
   - Group email: `team@motionplusllc.com`
   - Add all 4 members to the group
   - Enable **"Allow anyone to email this group"**
   - This way, emails to team@ reach everyone

---

## Step 7: Set Up on Your Devices

### Option A: Zoho Mail App (Recommended)

1. Download **Zoho Mail** app from the App Store or Google Play
2. Sign in with your `@motionplusllc.com` email and password
3. You'll get push notifications for new emails

### Option B: Apple Mail / Outlook / Gmail App

Use these IMAP/SMTP settings:

**Incoming Mail (IMAP):**
- Server: `imappro.zoho.com`
- Port: `993`
- Security: SSL
- Username: your full email (e.g., `asharp@motionplusllc.com`)
- Password: your Zoho password (or App Password if 2FA is enabled)

**Outgoing Mail (SMTP):**
- Server: `smtppro.zoho.com`
- Port: `465`
- Security: SSL
- Username: your full email
- Password: your Zoho password

### Option C: Forward to Gmail

If you prefer to read emails in Gmail:
1. Log in to Zoho Mail webmail: [https://mail.zoho.com](https://mail.zoho.com)
2. Go to **Settings** > **Mail Forwarding**
3. Add your personal Gmail address
4. Verify the forwarding address
5. All incoming mail to your @motionplusllc.com address will also appear in Gmail

To **send from Gmail** as your Motion+ address:
1. In Gmail, go to **Settings** > **Accounts** > **Send mail as**
2. Click **"Add another email address"**
3. Enter your @motionplusllc.com address
4. Use SMTP server: `smtppro.zoho.com`, port 465, SSL
5. Enter your Zoho credentials
6. Verify via the confirmation email

---

## DNS Records Summary

Here's everything you need to add to your domain's DNS. This is the complete list:

```
TYPE    HOST    VALUE                                     PRIORITY
TXT     @       zoho-verification=<your-code>             -
MX      @       mx.zoho.com                               10
MX      @       mx2.zoho.com                              20
MX      @       mx3.zoho.com                              50
TXT     @       v=spf1 include:zoho.com ~all              -
TXT     <selector>._domainkey   <DKIM value from Zoho>    -
```

---

## Troubleshooting

- **Emails going to spam?** Make sure SPF and DKIM are correctly configured. Use [https://mxtoolbox.com](https://mxtoolbox.com) to verify.
- **Can't receive emails?** Check that MX records are correct and have propagated (can take up to 48 hours, usually 15 minutes).
- **Can't log in on mobile?** If you enabled 2-Factor Authentication, generate an App Password in Zoho Security settings.

---

## Cost

- **Zoho Mail Free Plan:** $0/month for up to 5 users, 5GB storage each
- **If you outgrow 5 users:** Zoho Mail Lite is $1/user/month (5GB) or $1.25/user/month (10GB)
