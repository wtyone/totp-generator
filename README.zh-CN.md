# TOTP 生成器

[English](README.md) | [中文](README.zh-CN.md)

一个纯前端的基于时间的一次性密码（TOTP）生成器，支持二维码导入和参数分享。

### 功能特性

- 实时生成 TOTP 令牌
- 支持二维码截图粘贴导入
- 支持分享链接传递参数
- 自动保存配置到 sessionStorage
- 中英文自动切换
- 响应式设计，适配移动端

### 使用方法

#### 基本使用

1. 打开 `index.html` 页面
2. 在"配置设置"中输入 Base-32 格式的密钥
3. 页面会自动生成并刷新 TOTP 令牌

#### URL 参数传递

支持通过 URL Query 参数直接配置：

```
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `key` | Base-32 密钥 | *(空)* |
| `digits` | 令牌位数 | `6` |
| `period` | 刷新周期（秒） | `30` |
| `algorithm` | 算法（SHA1/SHA256/SHA512） | `SHA1` |

#### 分享链接

点击"分享链接"按钮生成分享 URL：

```
index.html#eyJrIjoiSlJTV1kzRFBFSFAzUFhQIiwiZCI6NiwicCI6MzAsImEiOiJTSEExIn0=
```

Hash 部分是 Base64 编码的 JSON，包含字段：`k`（密钥）、`d`（位数）、`p`（周期）、`a`（算法）。

#### 二维码导入

1. 点击"配置设置"展开面板
2. 点击粘贴区域
3. 粘贴包含 `otpauth://` 格式的二维码截图
4. 配置自动导入

支持解析 `otpauth://` URI 格式：

```
otpauth://totp/Issuer:Account?secret=KEY&algorithm=SHA1&digits=6&period=30
```

### 配置参数说明

| 参数 | 类型 | 说明 | 有效值 |
|------|------|------|--------|
| Secret Key | String | Base-32 编码密钥 | 任意 Base-32 字符串 |
| Algorithm | String | HMAC 算法 | SHA1, SHA256, SHA512 |
| Digits | Number | 令牌位数 | 通常为 6 或 8 |
| Period | Number | 刷新周期（秒） | 通常为 30 |

### 技术说明

#### 依赖库

- [Vue 3](https://vuejs.org/) - 前端框架
- [OTPAuth](https://github.com/hectorm/otpauth) - TOTP/HOTP 实现
- [Clipboard.js](https://clipboardjs.com/) - 复制功能
- [jsQR](https://github.com/cozmo/jsQR) - 二维码解析
- [qrcode-generator](https://github.com/niclas/node-qrcode) - 二维码生成

#### 安全考虑

- 所有计算在浏览器端完成，密钥不发送到服务器
- 配置保存在 sessionStorage，关闭浏览器后清除
- URL 参数加载后自动清除，避免泄露

### 本地运行

无需服务器，直接打开 `index.html`：

```bash
# 或使用简单 HTTP 服务器
npx serve .
# 或
python -m http.server 8080
```

### 文件结构

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

## 许可证

MIT
