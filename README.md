# Naina's Beauty n Beyond: website

A cinematic portfolio website for a makeup artist, with:

- **Cinematic opening**: loader with a lipstick-swatch progress bar, curtain reveal, full-screen makeup video, gold powder that follows the mouse (click for a burst)
- **"The Ritual" scroll film**: real makeup footage that plays forwards and backwards as you scroll, in six scenes (Kit → Base → Naina → Glow → Lips → Reveal), with brush-stroke scene changes and film-style labels
- **Lookbook**: her own work scrolls sideways, ending with a booking button
- Moving text band, gold custom cursor, 3D-tilt offer cards and scroll-in animations
- **Portfolio** ("The Work"), **Journal** (blog), **Offers**, **Services**
- **Booking form** (occasion, date, ready-by time, number of faces, location)
- **Admin panel** (`/admin.html`): add, edit, publish/unpublish and delete portfolio looks, blog posts, offers and services; upload photos; change every headline, photo and story scene; see and manage booking requests

Everything runs **free**: the website is hosted on **GitHub Pages**, and the content, photos and bookings are saved in a free **Supabase** database.

---

## How it works

| Mode | When | What happens |
|---|---|---|
| **Demo mode** | `assets/js/config.js` is empty (default) | The site shows the starter content. The admin works, but changes are saved only in that browser. Admin password: `demo` |
| **Live mode** | You paste your Supabase details into `config.js` | Admin changes and bookings are saved in the database and everyone sees them |

---

## Step 1: Put the website on GitHub Pages (free)

1. Create a new repository on GitHub, e.g. `makeup-portfolio` (Public).
2. Upload **all the files and folders** from this project (keep the folder structure: `index.html`, `post.html`, `admin.html`, `assets/`, `supabase/`, `.nojekyll`).
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then **Save**.
5. After a minute the site is live at `https://YOUR-USERNAME.github.io/makeup-portfolio/`.

At this point the site works in demo mode.

## Step 2: Connect the free database (Supabase)

1. Sign up at **supabase.com** (free plan) and click **New project**. Choose a name, a database password and choose the **London (eu-west-2)** region so booking data stays in the UK.
2. When it's ready, open **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this project, **change the email on the last line** to the email she will log in with, paste the whole file and click **Run**.
4. Create her admin login: **Authentication → Users → Add user → Create new user**. Enter the same email and a strong password, and tick **Auto Confirm User**.
5. Stop strangers creating accounts: **Authentication → Sign In / Providers → Email** and turn **off** "Allow new users to sign up". (The database only lets the email in the `admins` table edit anything anyway, but this keeps things tidy.)
6. Get your keys: **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
7. In GitHub, open `assets/js/config.js`, click the pencil icon, paste them in:

   ```js
   window.SITE_CONFIG = {
     SUPABASE_URL: "https://xxxxxxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi..."
   };
   ```

   and **Commit changes**. The anon key is meant to be public; the security rules in `schema.sql` protect the data.

## Step 3: First login

1. Go to `https://YOUR-USERNAME.github.io/makeup-portfolio/admin.html` and sign in with the email and password from step 2.4.
2. Click **Import starter content** to copy the sample portfolio, blog posts, offers and services into the database.
3. Open **Website text & photos** and change the studio name, headline, photos, story scenes and contact details (WhatsApp, Instagram, email).

## Logging in to the admin

- **Now (demo mode):** open `admin.html`, use any email and the password `demo`. Changes only save in that browser.
- **After going live (step 2):** sign in with **Mwah2magirlies@hotmail.co.uk** and the password Naina chose when creating her user in Supabase (Authentication → Users → Add user). Only that email is allowed to edit, because it's the one in the `admins` table. Forgot the password? In Supabase go to Authentication → Users → her user → Send password recovery, or set a new one there.

## Email notifications (free, about 10 minutes)

Uses **EmailJS** (free plan, 200 emails a month), sending from Naina's own Hotmail, so no domain is needed.

1. Sign up at **emailjs.com** with Mwah2magirlies@hotmail.co.uk.
2. **Email Services → Add New Service → Outlook**, connect her Hotmail account. Copy the **Service ID**.
3. **Email Templates → Create New Template**, then set:
   - To Email: `{{to_email}}`
   - From Name: `{{from_name}}`
   - Reply To: `{{reply_to}}`
   - Subject: `{{subject}}`
   - Content: switch to the code/HTML editor and enter `{{{html}}}` (three curly brackets)
   Save, and copy the **Template ID**.
4. **Account → General**: copy the **Public Key**.
5. **Account → Security**: add `https://gurditsingh09bedi.github.io` to the allowed origins so nobody else can use the key.
6. Paste the three values into `assets/js/config.js` under `EMAILJS` and commit.

What happens then:
- **New request:** Naina gets an email straight away with all the details and a button to open the admin. If the client gave an email, they get a "we've got your request, not confirmed yet" email.
- **Accept:** in Bookings click **Accept**, fill in price, deposit and arrival time, check the preview and click **Send & mark confirmed**. The client gets a branded confirmation email.
- **Decline:** click **Decline**, pick a reason (fully booked, outside area, timing clash, service not offered, or other) and add a note. The client gets a polite email with the reason.
- **No email address?** Use the **WhatsApp message** button: it opens WhatsApp with the confirmation or reason already typed.
- Until EmailJS is set up, the buttons open her email app or WhatsApp with the message ready, so it works from day one.

## Using the admin panel

- **Bookings**: every form request appears here. Set the status (New → Confirmed → Done / Cancelled), message the client on WhatsApp, or delete.
- **Portfolio / Journal**: *+ Add*, then add a title, a cover photo, more photos and the text. Use **Preview** to check formatting. Untick **Published** to keep it as a draft.
- **Offers**: add a deal with a badge, price and old price. Click **Hide** to take it off the site without deleting it.
- **Services**: your price list. "Order" controls which comes first.
- **Website text & photos**: brand name, opening screen, the five story scenes, About, section headings, booking dropdown and contact details.

Text formatting in posts: `## Heading`, `**bold**`, `- bullet point`, `1. numbered point`.

**Story footage:** the scroll film and opening video use free clips from Mixkit (mixkit.co, Mixkit Stock Video Free License). The scene titles, text and tags are editable in the admin; the footage itself lives in `assets/ritual/` and `assets/media/`. The `raw/` folder and `get-videos.ps1` were only used to prepare the clips and don't need to be uploaded to GitHub.

## Legal pages

`privacy.html` and `terms.html` fill in the business name, address, email, ICO number, deposit and travel wording from **Admin → Website text & photos → Business & legal details**. Fill these in before going live. See the compliance PDF for the full checklist.

## Free plan notes

- GitHub Pages: free for public repositories.
- Supabase free plan: plenty of room for a portfolio (database + photo storage). Free projects can be **paused after a period of no activity**; if the site ever stops loading content, open the Supabase dashboard and click **Restore project**.
- Photos are resized automatically before upload to keep things fast.

## Files

```
index.html          Home page (hero video, ritual film, lookbook, services, offers, journal, booking)
post.html           Single blog post / portfolio look (post.html#the-post-slug)
admin.html          Admin panel
assets/css/         site.css (shared), home.css (home page), admin.css (admin)
assets/js/config.js Supabase keys (empty = demo mode)
assets/js/seed.js   Starter content
assets/js/store.js  Data layer (Supabase or demo)
assets/js/home.js   Home page logic: loader, powder, ritual film, lookbook, cursor
assets/ritual/      Scroll film frames (one sprite sheet per scene) + manifest.js
assets/media/       Opening video and poster images
assets/js/admin.js  Admin panel logic
assets/img/         Photos
supabase/schema.sql Database tables and security rules
```
