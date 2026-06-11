# TOTP Generator

[English](README.md) | [中文](README.zh-CN.md)

A pure frontend Time-based One-Time Password (TOTP) generator with QR code import, QR export, and share-link support.

## Features

- Real-time TOTP token generation
- Previous and next token preview
- QR import from pasted screenshots, image files, or camera scanning
- Authenticator QR code export
- Share link with encoded parameters
- Auto-save configuration to sessionStorage
- Auto language switching (EN/ZH)
- Responsive desktop and mobile design

## Usage

### Basic Usage

1. Open `index.html`.
2. Enter a Base32 secret key in the configuration panel.
3. The TOTP token is generated and refreshed automatically.

### URL Parameters

Configure via URL query parameters:

```text
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| Parameter | Description | Default |
| --- | --- | --- |
| `key` | Base32 secret key | empty |
| `digits` | Token digits | `6` |
| `period` | Refresh period in seconds | `30` |
| `algorithm` | Algorithm: SHA1, SHA256, SHA512 | `SHA1` |

### Share Link

Click "Share link" to generate a shareable URL:

```text
index.html#eyJrIjoiSkJTV1kzRFBFSFAzUFhQIiwiZCI6NiwicCI6MzAsImEiOiJTSEExIn0=
```

The hash is a Base64-encoded JSON payload with fields `k` (key), `d` (digits), `p` (period), and `a` (algorithm).

### QR Code Import

You can import an authenticator QR code in three ways:

- Paste a screenshot into the QR paste area.
- Click "Add image" and choose an image file.
- Click "Scan with camera" and point your camera at the QR code.

The configuration is imported automatically after a QR code is recognized.

Supported URI format:

```text
otpauth://totp/Issuer:Account?secret=KEY&algorithm=SHA1&digits=6&period=30
```

### QR Code Export

1. Fill issuer, account, and secret.
2. Click "Generate QR code".
3. Scan the generated QR code with an authenticator app, or copy the URI.

## Security

- All calculations run in the browser.
- Secrets are not sent to a server.
- Configuration is stored in `sessionStorage` and clears when the browser session ends.
- URL parameters are removed from browser history after loading.

## Dependencies

- [Vue 3](https://vuejs.org/)
- [OTPAuth](https://github.com/hectorm/otpauth)
- [Clipboard.js](https://clipboardjs.com/)
- [jsQR](https://github.com/cozmo/jsQR)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)

## Running Locally

Open `index.html` directly, or run a simple HTTP server:

```bash
python -m http.server 8080
```

## File Structure

```text
totp-generator/
├── index.html
├── README.md
├── README.zh-CN.md
├── css/
│   └── bulma-0.9.4.min.css
└── js/
    ├── app.js
    └── assets/
        ├── vue-3.4.20.global.prod.js
        ├── otpauth-9.1.3.min.js
        ├── clipboard-2.0.6.min.js
        ├── jsqr-1.4.0.min.js
        └── qrcode.min.js
```

## License

MIT
