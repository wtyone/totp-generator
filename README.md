# TOTP Generator

[English](README.md) | [中文](README.zh-CN.md)

A pure frontend Time-based One-Time Password (TOTP) generator with QR code import and parameter sharing support.

### Features

- Real-time TOTP token generation
- QR code screenshot paste import
- Share link with encoded parameters
- Auto-save configuration to sessionStorage
- Auto language switching (EN/ZH)
- Responsive design for mobile

### Usage

#### Basic Usage

1. Open `index.html`
2. Enter your Base-32 secret key in "Configuration Settings"
3. TOTP token will be generated and refreshed automatically

#### URL Parameters

Configure via URL query parameters:

```
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `key` | Base-32 secret key | *(empty)* |
| `digits` | Token digits | `6` |
| `period` | Refresh period (seconds) | `30` |
| `algorithm` | Algorithm (SHA1/SHA256/SHA512) | `SHA1` |

#### Share Link

Click "Share Link" to generate a shareable URL:

```
index.html#eyJrIjoiSlJTV1kzRFBFSFAzUFhQIiwiZCI6NiwicCI6MzAsImEiOiJTSEExIn0=
```

The hash is a Base64-encoded JSON with fields: `k` (key), `d` (digits), `p` (period), `a` (algorithm).

#### QR Code Import

1. Expand "Configuration Settings"
2. Click the paste area
3. Paste a screenshot containing `otpauth://` QR code
4. Configuration will be auto-imported

Supports `otpauth://` URI format:

```
otpauth://totp/Issuer:Account?secret=KEY&algorithm=SHA1&digits=6&period=30
```

### Configuration Parameters

| Parameter | Type | Description | Valid Values |
|-----------|------|-------------|--------------|
| Secret Key | String | Base-32 encoded key | Any Base-32 string |
| Algorithm | String | HMAC algorithm | SHA1, SHA256, SHA512 |
| Digits | Number | Token length | Usually 6 or 8 |
| Period | Number | Refresh period (seconds) | Usually 30 |

### Technical Details

#### Dependencies

- [Vue 3](https://vuejs.org/) - Frontend framework
- [OTPAuth](https://github.com/hectorm/otpauth) - TOTP/HOTP implementation
- [Clipboard.js](https://clipboardjs.com/) - Copy functionality
- [jsQR](https://github.com/cozmo/jsQR) - QR code parsing
- [qrcode-generator](https://github.com/niclas/node-qrcode) - QR code generation

#### Security

- All calculations done client-side, no server transmission
- Configuration saved in sessionStorage, cleared on browser close
- URL parameters auto-cleared after loading

### Running Locally

No server required, just open `index.html`:

```bash
# Or use a simple HTTP server
npx serve .
# Or
python -m http.server 8080
```

### File Structure

```
totp-generator/
├── index.html
├── README.md
├── README.zh-CN.md
├── css/
│   └── bulma-0.9.4.min.css
├── js/
│   ├── app.js
│   └── assets/
│       ├── vue-3.4.20.global.prod.js
│       ├── otpauth-9.1.3.min.js
│       ├── clipboard-2.0.6.min.js
│       ├── jsqr-1.4.0.min.js
│       └── qrcode.min.js
```

## License

MIT
