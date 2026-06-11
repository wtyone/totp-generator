# TOTP 生成器

[English](README.md) | [中文](README.zh-CN.md)

一个纯前端的基于时间的一次性密码（TOTP）生成器，支持二维码导入、二维码导出和分享链接。

## 功能

- 实时生成 TOTP 令牌
- 显示上一组和下一组令牌
- 支持通过粘贴截图、添加图片或摄像头扫描导入二维码
- 支持导出验证器二维码
- 支持通过分享链接传递参数
- 自动保存配置到 `sessionStorage`
- 中英文自动切换
- 响应式设计，适配桌面和移动端

## 使用方法

### 基本使用

1. 打开 `index.html`。
2. 在配置面板中输入 Base32 密钥。
3. 页面会自动生成并刷新 TOTP 令牌。

### URL 参数

支持通过 URL Query 参数直接配置：

```text
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `key` | Base32 密钥 | 空 |
| `digits` | 令牌位数 | `6` |
| `period` | 刷新周期（秒） | `30` |
| `algorithm` | 算法：SHA1、SHA256、SHA512 | `SHA1` |

### 分享链接

点击“分享链接”生成可分享的 URL：

```text
index.html#eyJrIjoiSkJTV1kzRFBFSFAzUFhQIiwiZCI6NiwicCI6MzAsImEiOiJTSEExIn0=
```

Hash 部分是 Base64 编码的 JSON，包含字段 `k`（密钥）、`d`（位数）、`p`（周期）、`a`（算法）。

### 二维码导入

可以通过三种方式导入验证器二维码：

- 在二维码粘贴区域粘贴截图。
- 点击“添加图片”选择本地图片。
- 点击“摄像头扫描”，将摄像头对准二维码。

识别成功后，页面会自动导入配置。

支持的 URI 格式：

```text
otpauth://totp/Issuer:Account?secret=KEY&algorithm=SHA1&digits=6&period=30
```

### 二维码导出

1. 填写发行方、账户和密钥。
2. 点击“生成二维码”。
3. 使用验证器应用扫描生成的二维码，或复制 URI。

## 安全说明

- 所有计算都在浏览器本地完成。
- 密钥不会发送到服务器。
- 配置保存在 `sessionStorage` 中，浏览器会话结束后清除。
- URL 参数加载后会从浏览器历史中移除。

## 依赖

- [Vue 3](https://vuejs.org/)
- [OTPAuth](https://github.com/hectorm/otpauth)
- [Clipboard.js](https://clipboardjs.com/)
- [jsQR](https://github.com/cozmo/jsQR)
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator)

## 本地运行

可以直接打开 `index.html`，也可以启动一个简单的 HTTP 服务：

```bash
python -m http.server 8080
```

## 文件结构

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

## 许可证

MIT
