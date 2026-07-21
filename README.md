# TOTP Generator

[English](README.md) | [中文](README.zh-CN.md)

A privacy-focused, build-free TOTP generator that runs entirely in the browser. Generate time-based verification codes, import or export authenticator QR codes, and share a configuration without sending secrets to an application backend.

> [!IMPORTANT]
> Secrets are stored unencrypted in the current tab's `sessionStorage`. Configuration URLs also contain the secret. Only use this tool on a trusted device, and only share configuration links through a trusted channel.

## Highlights

- Generate the previous, current, and next TOTP codes in real time
- Support SHA-1, SHA-256, and SHA-512 with 6- or 8-digit codes
- Import `otpauth://` QR codes with a camera, an image file, a pasted screenshot, or a selected screen area
- Generate setup QR codes for importing accounts into authenticator apps
- Keep up to 10 recently used configurations in the current browser session
- Copy codes, setup URIs, and Base64-encoded configuration links
- Detect the browser language and switch manually between English and Simplified Chinese
- Follow the system color preference and switch manually between light and dark themes
- Work responsively on desktop and mobile without a build step or CDN

## Quick Start

For all features, including camera scanning, serve the directory from localhost:

```bash
python -m http.server 8080
```

Then open <http://localhost:8080>.

You can also open `index.html` directly for basic code generation and image-based QR import. Camera access generally requires HTTPS or localhost and is unavailable from a normal `file://` page.

## Usage

### Generate a Code

1. Enter a Base32 secret in **Secret key**.
2. Optionally choose the algorithm, code length, and refresh period under **Advanced parameters**.
3. Click the current, previous, or next code to copy it.

Spaces are removed and letters are normalized to uppercase automatically. Valid Base32 input uses `A-Z` and `2-7`.

### Import a QR Code

Under **Import configuration**, use one of these methods:

- **Scan with camera** — point the device camera at an authenticator QR code.
- **Choose an image** — select an image containing an `otpauth://` QR code.
- **Paste a screenshot** — focus the image import control and paste an image from the clipboard.
- **Capture screen** — select a screen or window, drag over the QR code, then scan the selected area locally.

Imported issuer and account values are also used by the QR export form when available.

### Generate a Setup QR Code

1. Open **Create a setup QR code**.
2. Enter the issuer (required) and, if desired, an account name (optional).
3. Click **Generate QR code**.
4. Scan the result with an authenticator app or copy the generated setup URI.

### Use Generation History

Valid configurations are added to **Generation history** after a short delay. Select an entry to restore it, or use **Clear history** and confirm to remove all entries. A maximum of 10 entries is retained for the current tab session.

## Configuration Links

### Query Parameters

The application accepts these parameters when it starts:

```text
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| Parameter | Description | UI values | Default |
|---|---|---|---|
| `key` | Base32 secret | `A-Z`, `2-7` | Empty |
| `digits` | Code length | `6`, `8` | `6` |
| `period` | Refresh period in seconds | `30`, `60` | `30` |
| `algorithm` | HMAC algorithm | `SHA1`, `SHA256`, `SHA512` | `SHA1` |

### Share Links

**Copy configuration link** creates a URL whose hash contains Base64-encoded JSON:

```text
index.html#eyJrIjoiSkJTV1kzRFBFSFBLM1BYUCIsImQiOjYsInAiOjMwLCJhIjoiU0hBMSJ9
```

The fields are `k` (secret), `d` (digits), `p` (period), and `a` (algorithm). Base64 is an encoding, not encryption. Anyone with the URL can recover the secret.

Query strings and hashes are removed from the visible address after import. This does not erase copies of the URL or prevent a query string from appearing in HTTP server logs. Prefer hash-based share links and treat them as credentials.

## Data Storage and Privacy

| Data | Storage | Lifetime |
|---|---|---|
| Secret, algorithm, digits, and period | `sessionStorage` | Current tab session |
| Up to 10 history entries, including secrets | `sessionStorage` | Current tab session |
| Language and theme preferences | `localStorage` | Until site data is cleared |

- TOTP calculations and QR processing happen locally in the browser.
- All runtime libraries are included in this repository; the page does not load them from a CDN.
- Secrets in browser storage are not encrypted.
- Configuration links and setup URIs contain the secret.
- Camera input is processed in the page and requires explicit browser permission.

## Supported OTP Configuration

The importer and exporter use the standard TOTP setup URI form:

```text
otpauth://totp/Issuer:Account?secret=KEY&issuer=Issuer&algorithm=SHA1&digits=6&period=30
```

The generator follows the TOTP construction described by RFC 6238 and uses HOTP internally for adjacent counters.

## Technology

The application uses vendored browser builds, so no package installation or build command is required:

- [Vue 3.4.20](https://vuejs.org/) — user interface
- [OTPAuth 9.1.3](https://github.com/hectorm/otpauth) — TOTP/HOTP generation
- [jsQR 1.4.0](https://github.com/cozmo/jsQR) — QR code decoding
- [qrcode-generator](https://github.com/niclas/node-qrcode) — QR code generation
- Native Clipboard API with an `execCommand` fallback — copy operations

## Project Structure

```text
totp-generator/
├── index.html                 # Application markup and local asset loading
├── css/
│   ├── app.css                # Active responsive light/dark theme
│   └── bulma-0.9.4.min.css    # Retained legacy asset; not currently loaded
├── js/
│   ├── app.js                 # TOTP, QR, storage, language, and theme logic
│   └── assets/
│       ├── vue-3.4.20.global.prod.js
│       ├── otpauth-9.1.3.min.js
│       ├── jsqr-1.4.0.min.js
│       ├── qrcode.min.js
│       └── clipboard-2.0.6.min.js  # Retained legacy asset; not currently loaded
├── README.md
└── README.zh-CN.md
```

## Development

Edit `index.html`, `css/app.css`, or `js/app.js`, then refresh the browser. The project has no compilation step. When changing cached assets, update their query-string versions in `index.html`.
