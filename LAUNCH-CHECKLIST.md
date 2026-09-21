# Bluestem Grange — launch checklist

Open this file in the editor and click the checkboxes, or use the [Launch checklist Canvas](/Users/schneidan/.cursor/projects/Users-schneidan-Sites-bluestem-grange/canvases/launch-checklist.canvas.tsx) beside chat.

**Where you are now:** You already created a **Partner development store**. Phase 0 below starts with logging into that store’s admin, then connecting this theme with CLI. Phases 1–3 are build-and-test work. Phase 4 is how you turn that same store into a **live, paying** shop when you’re ready (you do **not** need a second store).

---

## Big picture (read once)

| Stage | What it is | Money |
| --- | --- | --- |
| Partner account | Free dashboard for developers | Free |
| Development store | Full Shopify admin + password-gated storefront | Free (can’t take real money) |
| Paid plan on that same store | Public shop, real checkout, domain | Monthly Shopify bill |

Everything you add now (products, theme, pages) **stays** when you pick a paid plan. You are not rebuilding later.

---

## Phase 0 — Account, store admin, and theme preview

- [ ] Create Shopify Partner account
- [ ] Create development store and bookmark admin
- [ ] Log into the store admin from Partners and set a store password / name
- [ ] Install Shopify CLI
- [ ] Run `shopify theme dev` and confirm preview
- [ ] (Optional) Push theme once and open it in the theme editor

### 0.1–0.2 Partner + development store (you’re past most of this)

1. [Shopify Partners](https://partners.shopify.com) → sign in.
2. Left sidebar → **Stores**.
3. You should see your development store listed. Note the **store name** and the `….myshopify.com` URL (e.g. `bluestem-grange-dev.myshopify.com`).

**Log into the store admin (do this next):**

1. On the Stores list, find your store → click **Log in** (or open the store → Log in).
2. You’ll land in **Shopify admin** (Products, Orders, Online Store, Settings, etc.).
3. Bookmark that admin URL. It looks like:  
   `https://admin.shopify.com/store/YOUR-STORE-HANDLE`
4. **Settings → General:** set **Store name** to `Bluestem Grange` (customer-facing).
5. **Online Store → Preferences:** note the **Storefront password**. Visitors to `YOUR-STORE.myshopify.com` need this password until you go live and turn it off. Keep the password on while building.

You now have two dashboards:

- **Partners** (`partners.shopify.com`) — list of stores, transfer tools.
- **Store admin** (`admin.shopify.com/store/…`) — day-to-day shop work. Use this for products, themes, settings.

### 0.3 Install Shopify CLI

On your Mac (Terminal or Cursor terminal):

```bash
brew tap shopify/shopify
brew install shopify-cli
shopify version
```

You should see a version number (this Mac already had CLI available earlier). If `command not found`, open a **new** terminal tab and try again.

### 0.4 Connect this repo and preview the theme

This repo **is** the theme. `shopify theme dev` syncs it to a temporary development theme on your store and gives you a live preview URL.

**1. Get your store handle**

From admin URL `https://admin.shopify.com/store/bluestem-grange-dev`, the handle is `bluestem-grange-dev`.  
CLI flag: `--store=bluestem-grange-dev.myshopify.com`

**2. Run from the theme folder**

```bash
cd /Users/schneidan/Sites/bluestem-grange
ls layout/theme.liquid
shopify theme dev --store=YOUR-STORE.myshopify.com
```

**3. Browser login**

- A browser window opens (or the terminal prints a login URL).
- Sign in with the **same email** as your Partner account.
- Approve access to the development store if asked.

**4. Success looks like**

Terminal prints a **Preview URL**. Open it. You should see:

- Bluestem Grange wordmark header (not stock Dawn).
- Product grid (placeholder soaps until Phase 1).
- Not `http://localhost/bluestem-grange/` — that Apache site is only for static layout. Liquid + cart need the CLI preview URL.

Leave the terminal running while you edit theme files. Stop with `Ctrl+C`. Next day, same command again.

**Common fixes**

| Problem | Try |
| --- | --- |
| `shopify: command not found` | Reinstall CLI; new Terminal tab |
| Wrong / unknown store | Full `--store=name.myshopify.com`; confirm store in Partners → Stores |
| Login loop | `shopify auth logout`, then `theme dev` again |
| Looks like Dawn / wrong theme | Preview URL should include `preview_theme_id`; or admin → Online Store → Themes → open the CLI development theme |
| Not a theme directory | `cd` into folder that contains `layout/theme.liquid` |

**Optional: one-time push + theme editor**

If you want the theme listed under Online Store → Themes (not only the live `theme dev` session):

```bash
cd /Users/schneidan/Sites/bluestem-grange
shopify theme push --store=YOUR-STORE.myshopify.com --unpublished
```

Then in admin → **Online Store → Themes** → find that theme → **Customize** (theme editor) or **Preview**. For day-to-day coding, prefer `theme dev`.

When preview looks right, tick Phase 0 and move on.

---

## Phase 1 — Catalog and navigation

Do this in **store admin** (not Partners).

- [ ] Add real soap products (dozen+) with photos, price, inventory
- [ ] Create Bar soap collection and wire homepage grid
- [ ] Create About / Shipping / Contact pages + Main menu (Shop → /collections/all)
- [ ] Smoke-test product → cart → checkout

### 1.1 Add products

1. Admin → **Products** → **Add product**.
2. Fill: Title, Description, Price, Status = Active (or Draft until ready).
3. **Media:** upload photos.
4. **Inventory:** track quantity, set a stock number.
5. **Shipping:** weight ≈ 4.5 oz (or your real weight).
6. Leave variants as the single default while everything is one bar.
7. Save. Repeat for each soap.

### 1.2 Collection + homepage grid

1. **Products → Collections → Create collection** (e.g. “Bar soap”).
2. Manual: add products. Or Automated: condition “Product tag equals soap” (then tag each product `soap`).
3. With `theme dev` running, open the Preview URL → or admin → Online Store → Themes → Customize on your theme.
4. Homepage **Product grid** section: leave Collection blank for all products, or select “Bar soap”. Set products per page to 12 / 24 / 36.

### 1.3 Pages + menu

1. **Online Store → Pages → Add page** for: About, Shipping, Contact.
2. On each page’s right sidebar, **Theme template**: pick `about`, `shipping`, or `contact` when listed.
3. **Online Store → Navigation → Main menu**:
   - Shop / Products → `/collections/all` (or Catalog → All products)
   - About, Shipping, Contact, Cart
   - No Ingredients page — put ingredients on each product description instead.

### 1.4 Smoke-test cart

1. Open the Preview URL (password if prompted — from Preferences).
2. Open a product → Add to cart → Cart → Checkout.
3. Development stores use **test** checkout; you won’t charge a real card yet (Phase 2 sets Bogus Gateway / test mode properly).

---

## Phase 2 — Payments, shipping, tax (still on the free development store)

- [ ] Enable payments in test mode / Bogus Gateway
- [ ] Set shipping rates and tax
- [ ] Place a full test order

### 2.1 Test payments

On a free development store, use Shopify’s **Test payment gateway** (not live Shopify Payments).

1. Admin → **Settings → Payments**.
2. If a credit-card provider is already active (e.g. Shopify Payments), click **Manage** → **Deactivate…** and confirm. You can only have one card provider active.
3. Open the other providers list:
   - Look for **(More) payment providers**, **See all**, or **Choose a provider**, **or**
   - Under **Supported payment methods** / additional providers, browse the list.
4. Find **Test payment gateway** (sometimes still labeled **Bogus Gateway**).
5. Click it → **Activate Test payment gateway** → **Save**.

**Place a test order at checkout** with these details (Shopify’s gateway expects them):

| Field | Use |
| --- | --- |
| Card number | `1` (success), `2` (decline), or `3` (exception) — or the longer Visa-style test numbers Shopify shows on that Payments page |
| Name on card | Anything |
| Expiry | Any future date |
| Security code | Any 3 digits (e.g. `123`) |

Success: order appears under admin → **Orders**, marked as a test / paid via the test gateway. No real money moves.

**If you don’t see Test payment gateway:** use the search box in “all providers,” or check you’re in the store admin (not the Partners dashboard). Shopify’s docs: [Activating a payment gateway in test mode](https://help.shopify.com/en/manual/checkout-settings/test-orders/payments-test-mode).

**Later (paid plan):** Settings → Payments → Shopify Payments → **Manage** → enable **Test mode** — different feature; not required for Phase 2 on a free development store.

### 2.2 Shipping

1. **Settings → Shipping and delivery**.
2. Add rates for the United States (flat rate and/or weight-based). Match the story on your Shipping page.

### 2.3 Tax

1. **Settings → Taxes and duties**.
2. Set up United States (and Colorado collection if required for your situation). Shopify Tax or manual rates.

### 2.4 Test order

1. Storefront → add a product → checkout with Bogus / test card details Shopify shows in their docs for Bogus Gateway.
2. Confirm the order appears under admin → **Orders**.

---

## Phase 3 — Policies

- [ ] Fill Refund, Privacy, Terms, Shipping policies
- [ ] Confirm policies show at checkout

1. **Settings → Policies**.
2. Fill **Refund**, **Privacy**, **Terms of service**, **Shipping** (use Shopify’s generator, then edit to sound like Bluestem).
3. Run a test checkout again; policy links should appear in the checkout footer.
4. Leave **Customer accounts** as guest checkout for launch.

---

## Phase 4 — Promote / go live (pick the path that matches you)

You may have **two** Shopify things with the same login:

| Thing | What it is |
| --- | --- |
| **Partner account** | Dashboard at partners.shopify.com |
| **Development store** | Free store you made under Partners (password-gated, for building) |
| **Regular / “live” store** | Store you signed up for earlier (has or had a paid plan / trial) |

**They do not merge.** Same email ≠ one store. Phase 4 is choosing **which store becomes the public Bluestem shop**, then putting the theme (and catalog) there.

### First: figure out which store has your work

1. Partners → **Stores** → note the development store handle (`something.myshopify.com`).
2. Open your **older** store admin (store switcher top-left in admin, or the bookmark from when you created it). Note that handle too.
3. Ask: products, pages, theme preview — which store did you build on?

Usually: theme + smoke tests are on the **development store**; the older store may be empty or an old experiment.

### Path A — Make the development store live (simplest if all work is there)

Use this if the Partner development store has the theme and products you care about, and the older store isn’t needed.

1. Log into the **development** store admin.
2. **Settings → Plan** → choose a paid plan → enter billing.
3. Connect domain, turn off password, enable live payments (steps below under “Finish going live”).
4. Older unused store: leave it, pause it, or close it later under Settings → Plan so you’re not billed twice.

No “attach to Partner” step — the store just stops being free and becomes a normal paid shop.

### Path B — Use your existing regular store as the live shop (common if that store already has the domain / billing)

Use this if you already pay for (or want to keep) the **older** store as the real Bluestem shop.

You don’t attach the Partner store to it. You **copy the theme over** (and recreate or import products/pages).

**Move the theme with CLI (recommended — this is your custom theme):**

```bash
cd /Users/schneidan/Sites/bluestem-grange

# Preview / push to the EXISTING live store (use that store’s handle)
shopify theme push --store=YOUR-LIVE-STORE.myshopify.com --unpublished
```

Or while developing against the live store:

```bash
shopify theme dev --store=YOUR-LIVE-STORE.myshopify.com
```

Then in the **live** store admin → Online Store → Themes → Preview the unpublished theme → **Publish** when ready.

**Or download/upload ZIP:**

1. On the store that has the good theme: Online Store → Themes → … → **Download theme file** (email link).
2. On the live store: Themes → **Add theme** → **Upload zip file**.

**Still copy by hand (theme ZIP does not include these):**

- Products, collections, inventory  
- Pages, navigation menus  
- Settings → Policies  
- Shipping / tax / payments  
- Files / images in Content → Files (product images usually come with products if you recreate or use an importer)

Work on the live store from here; you can ignore or delete the development store when you’re done with it.

### Path C — “Transfer ownership” (usually wrong for you)

Partner **Transfer ownership** is for handing a development store to a **client**. You’re the brand owner with both accounts — you don’t need to transfer to yourself. Skip Path C unless Shopify Support tells you otherwise.

### Finish going live (whichever store you chose)

- [ ] Paid plan active on the store that will be public
- [ ] **Settings → Domains** — connect custom domain; wait for SSL
- [ ] **Online Store → Preferences** — turn **password** off
- [ ] **Settings → Payments** — turn off Test payment gateway; set up live Shopify Payments
- [ ] Place a small real test order; refund if you want
- [ ] Confirm Main menu, pages, and published theme look right on the custom domain

### What “attach Partner + store” actually means

- Same login already lets you open both.
- Partners does **not** glue an old merchant store into your development store.
- Collaborator / staff access is for other people’s stores — not required when you own both.

---

## Phase 5 — Theme features (build with the agent)

Run `shopify theme dev` while we code. Do in order.

- [ ] 5a Product image gallery
- [ ] 5b Search template + header entry
- [ ] 5c Sold-out / low-stock messaging
- [ ] 5d Cart count check + SEO / favicon polish
- [x] 5e Collection switcher + tag filters (done in theme; wire menu links in admin)
- [ ] 5f Related products on product page

---

## Collections and filters (how Shopify thinks about this)

**Products** are individual items.  
**Collections** are groups of products (e.g. “Bar soap”, “Gift sets”). Each has a URL like `/collections/bar-soap`.  
**Tags** are labels on products (e.g. `lavender`, `oatmeal`). They are not collections; they filter *within* a collection.

There is no special “products page” type. Browsing is usually:

- `/collections/all` — every product  
- `/collections/your-collection` — one group  
- `/collections/your-collection/lavender` — that group, filtered by tag  

The homepage can show a limited grid; full browsing + filters belong on **collection** URLs.

### Set up in admin

1. **Products → Collections** — you already made two. Note their handles (URL ends).
2. **Online Store → Navigation → Main menu**
   - Set **Shop** (or Products) to point at **All products** / `/collections/all` (Catalog → All, or Collections → Products).
   - Optionally add each type collection as its own menu item.
   - Remove **Ingredients** if it’s still in the menu (ingredients live on product pages now).
3. Open the Shopify preview at `/collections/all` (not the homepage, not localhost). You should see collection pills plus a **Filter** button (tags only show if products have tags). Checking tags reloads the page with multi-tag URLs (`tag1+tag2`).

### Tag tips

- Keep tags consistent: `lavender` not `Lavender ` / `Lavendar`.
- Fragrance and material can share one tag list (filters show every tag used in that collection).
- Clicking a tag filters to that tag; click it again (or **All**) to clear.

### Optional later: Search & Discovery

For price / availability checkboxes and multi-filter UI, install Shopify’s **Search & Discovery** app and configure storefront filters. The theme’s tag chips work without that app.

---

## Phase 6 — Launch day

- [ ] Real products published; placeholders gone
- [ ] Menu and content pages look right
- [ ] Policies + shipping + tax correct on a test checkout
- [ ] Gallery, search, filters, related OK on phone and desktop
- [ ] Storefront password off
- [ ] Soft launch / announce

---

## Out of scope for this pass

Customer accounts UI, AJAX cart drawer, blog, discount bars, Theme Store certification, multi-variant UI while everything is single-bar soap.
