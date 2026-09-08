# HASHTELICOM Backend

Node.js + Express + MongoDB (Mongoose) backend for the HASHTELICOM frontend,
built with ES6 modules (`"type": "module"`).

## Setup

```bash
cd backend
npm install
npm run dev   # nodemon, or `npm start` for plain node
```

The `.env` file is already filled in with the credentials you provided
(MongoDB, Cloudinary, PRP SMS, Gmail SMTP). Change `JWT_SECRET` /
`ADMIN_JWT_SECRET` before deploying to production.

Server runs on `http://localhost:5000` (`PORT` in `.env`). Health check:
`GET /api/health`.

## Folder structure

```
backend/
  config/          db.js, cloudinary.js
  middleware/      userAuth.js, adminAuth.js, errorMiddleware.js, multer.js
  utils/           asyncHandler, ApiError, ApiResponse, generateToken,
                   sendEmail (nodemailer), sendSms (PRP), otpUtil
  models/
    user/          User, Cart, Order
    admin/         Admin, Product, Category, Banner, Collection,
                   HomepageConfig, FooterConfig/TopbarConfig, Faq/Page
  controllers/
    user/          auth, profile, address, wishlist, cart, order,
                   product (storefront), category (storefront), content
    admin/         auth, product, category, order, customer, banner,
                   siteConfig, page, dashboard
  routes/
    user/          mirrors controllers/user
    admin/         mirrors controllers/admin
    index.js       mounts everything under /api
  server.js
```

User auth and admin auth are completely separate: different JWT secrets,
different cookies (`user_token` vs `admin_token`), different middleware
(`protectUser` vs `protectAdmin`).

## API overview

All responses are `{ success, data, message }` (see `utils/ApiResponse.js`);
all errors are `{ success: false, message, errors }`.

**User account** — `/api/user/auth`, `/api/user/profile`,
`/api/user/addresses`, `/api/user/wishlist`, `/api/user/cart`,
`/api/user/orders` (all except auth require login via cookie or
`Authorization: Bearer <token>`).

- Signup flow: `POST /signup` → OTP sent via SMS + email →
  `POST /verify-signup-otp` → logged in.
- Login: `POST /login` (password) or `POST /request-otp-login` +
  `POST /verify-otp-login`.
- Forgot password: `POST /forgot-password` → `POST /reset-password`.

**Storefront (public, no login needed)** — `/api/user/products`,
`/api/user/categories`, `/api/user/homepage`, `/api/user/footer`,
`/api/user/topbar`, `/api/user/faqs`, `/api/user/pages/:slug`,
`/api/user/search?q=`.

**Admin** — `/api/admin/auth`, `/api/admin/products`,
`/api/admin/categories`, `/api/admin/orders`, `/api/admin/customers`,
`/api/admin/banners`, `/api/admin/collections`,
`/api/admin/homepage-config`, `/api/admin/footer-config`,
`/api/admin/topbar-config`, `/api/admin/faqs`, `/api/admin/pages`,
`/api/admin/dashboard/overview`, `/api/admin/dashboard/inventory`
(all require an admin login).

To create your first admin, call `POST /api/admin/auth/register` once
(consider removing/protecting that route afterwards).

Product/category/banner/collection create & update endpoints accept
`multipart/form-data` — images go straight to Cloudinary.

## Frontend integration

`frontend/src/services/` has one file per feature (matching the
folders above), all going through `frontend/src/services/api.js`
(axios, `withCredentials: true`, auto-unwraps `{ data }`, normalizes
errors to `err.message`). Admin-only services live in
`frontend/src/services/admin/`.

Set `VITE_API_BASE_URL` in `frontend/.env` (see `.env.example`) —
defaults to `http://localhost:5000/api`.

**Note:** `ShopContext.jsx` and the admin pages still read/write
dummy data + localStorage as they did before. The services are ready
to call, but wiring each component/context to use them instead of the
dummy data is the next step — happy to do that next if you tell me
which flow to start with (auth, product listing, cart, or checkout).

## Update: generic CMS content store + simplified product images

- Added `/api/content` (public, GET) and `/api/admin/content/:key` (admin, PUT) —
  a generic key/value store (`models/admin/SiteContent.model.js`) that now
  backs every admin-editable CMS piece: banners, collections, category cards,
  feature banners, trust badges, topbar settings, popular searches, footer
  settings/links, pages, FAQs, category filter configs, and site branding
  assets (logo/login/signup images). Recognized keys are whitelisted in
  `controllers/admin/siteContent.controller.js`.
- Product/category/banner/collection image fields are now plain strings
  (Cloudinary URLs), and admin create/update endpoints accept **JSON**, not
  multipart — `images`/`image` can be a base64 data URI (freshly picked file,
  already compressed client-side) or an existing hosted URL (unchanged on
  edit); `config/cloudinary.js`'s `resolveImage`/`resolveImages` upload only
  the data URIs and pass hosted URLs through untouched.
- `Product` was simplified to a flat schema (`stock`, `discount`, `colors`
  as mixed — supports both plain strings and rich `{name,hex,image,stock}`
  variant objects — `sku`, etc.) matching the frontend's product shape
  exactly, so no adapter is needed on the storefront read path.
- Admin auth is real email+password now (`/api/admin/auth/register` once to
  create your first admin, then `/api/admin/auth/login`). The frontend's
  `AdminAuthContext` handles the session; `AdminLoginPage` was rewritten to
  match (no more OTP demo).

## Update: Reviews, Payment Methods, Preferences

- **Reviews** (`models/user/Review.model.js`) — one review per user per
  product. `GET/POST /api/user/products/:productId/reviews` (list is public,
  create requires login); `GET /api/user/reviews` (my reviews),
  `PUT/DELETE /api/user/reviews/:id`, `POST /api/user/reviews/:id/helpful`.
  Creating/editing/deleting a review recomputes that product's `rating` and
  `reviews` count automatically.
- **Payment methods** — added to the `User` model (`paymentMethods[]`).
  Only **non-sensitive display data** is ever stored for a card — last 4
  digits, cardholder name, expiry (MM/YY). The full card number and CVV are
  never persisted, matching standard PCI practice for a store that doesn't
  process its own card payments. `GET/POST/DELETE /api/user/payment-methods`.
- **Preferences** — added to the `User` model (`preferences.privacy`,
  `preferences.notifications`), simple non-sensitive toggle settings.
  `GET/PUT /api/user/preferences`.

## Update: Real forgot-password (email link) + Social Login

### Forgot password — now a clickable email link, not an OTP
- `POST /api/user/auth/forgot-password` `{ email }` — always responds the
  same way whether or not the account exists (prevents email enumeration).
  If the account exists, emails a link: `{CLIENT_URL}/reset-password/<token>`.
- `GET /api/user/auth/reset-password/:token/valid` — the reset page calls
  this first to confirm the link hasn't expired (1 hour) before showing the form.
- `POST /api/user/auth/reset-password/:token` `{ newPassword }` — sets the
  new password. The raw token is only ever emailed, never stored — only its
  SHA-256 hash is kept (`utils/resetToken.js`), so a database leak alone
  can't be used to reset accounts.
- Frontend: `frontend/src/pages/ResetPasswordPage.jsx` at route
  `/reset-password/:token`.

### Social login (Google / Facebook)
Both work the same way: the frontend gets a token from the provider's own
SDK (no password ever touches our server), sends it to our backend, which
verifies it directly with Google/Facebook's servers and issues our normal
session cookie. First-time sign-in auto-creates the account (email already
verified by the provider); if that email already has a password account,
the social login gets linked to it instead of erroring.

**To enable Google login:**
1. Go to https://console.cloud.google.com/apis/credentials, create an
   OAuth 2.0 Client ID (type: Web application).
2. Add your frontend origin (e.g. `http://localhost:5173`) under
   "Authorized JavaScript origins".
3. Put the Client ID in `frontend/.env` as `VITE_GOOGLE_CLIENT_ID=...`.
4. (Optional but recommended) also set `GOOGLE_CLIENT_ID` in `backend/.env`
   to the same value — the backend will then double-check the token's
   audience matches your app.

**To enable Facebook login:**
1. Go to https://developers.facebook.com/apps, create an app → add the
   "Facebook Login" product.
2. Add your frontend origin under Settings → Basic → App Domains, and under
   Facebook Login → Settings → "Valid OAuth Redirect URIs".
3. Put the App ID in `frontend/.env` as `VITE_FACEBOOK_APP_ID=...`.

Until these env vars are filled in, clicking those buttons shows a clear
"not configured yet" message instead of silently failing.

**Apple Sign-In** isn't wired up — it needs an Apple Developer account, a
Sign-in-with-Apple Services ID, and server-side JWT signing with a private
key (a fundamentally different setup from Google/Facebook's token-based
flow). The button is still there in the UI but shows the same "not
configured" message; ask if you'd like this built out too once you have an
Apple Developer account.

### User model changes
- `mobileNumber` and `password` are now only *required* for local
  (email+password) signups — social-login accounts don't need either.
- Added `authProvider` (`local`/`google`/`facebook`), `googleId`, `facebookId`.

## Update: AI chatbot, locked-down admin registration, admin email alerts

### Real AI shopping assistant (was a scripted demo before)
- `POST /api/chat` `{ message, history }` — public, works for guests too.
  Calls the Claude API with a system prompt describing HASHTELICOM's
  policies (shipping, returns, order tracking, login methods).
- **Set `ANTHROPIC_API_KEY` in `backend/.env`** (get one at
  https://console.anthropic.com/) to enable it. Until it's set, the chatbot
  still replies — with a message explaining it isn't configured yet — the
  UI never breaks.

### Admin registration is now locked to a whitelist
- `ADMIN_ALLOWED_EMAILS` in `.env` — comma-separated, **max 2 emails**.
  `POST /api/admin/auth/register` now rejects any email not on this list,
  so random visitors can never create an admin account no matter what they
  submit. Leave the second slot blank for a single-admin setup.

### Email alerts to the admin(s)
- **On every admin login** — an email goes to every address in
  `ADMIN_ALLOWED_EMAILS`, so a login you didn't make is noticed immediately.
- **On every new order** — same list gets an email with the order ID,
  amount, customer, and item list, the moment a customer checks out.
- Both are best-effort (`utils/sendEmail.js` → `sendAdminLoginAlert` /
  `sendNewOrderAlert`): if sending fails, it's logged and never blocks the
  actual login or checkout.

### On the OTP-login flow you asked me to re-verify
The code path (generate OTP → save with expiry → email it → user submits →
compare + expiry check → issue session) is correct and I re-traced it
end-to-end. The one thing I genuinely can't verify from here: whether the
PRP SMS API accepts the exact parameter names I guessed
(`ApiKey`/`SenderId`/`TemplateName`/`Mobile`/`Otp`) — I don't have their API
docs and can't make live calls to their server from this environment.
`utils/sendSms.js` now logs the raw response for every attempt
(`console.log('📱 PRP SMS API response...')`) — send yourself a test OTP and
check the server console; if the SMS doesn't arrive, that log line (or the
`⚠️ SMS send failed` error) will show exactly what PRP's API is objecting
to, and the fix is just adjusting those field names in `sendOtpSms()`.
**Either way, login itself isn't blocked** — the same OTP is always also
emailed (`sendOtpEmail`), so you can log in via that even if the SMS
provider needs a tweak.
