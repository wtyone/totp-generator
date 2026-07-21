# TOTP 生成器

[English](README.md) | [中文](README.zh-CN.md)

一个注重隐私、无需构建的纯前端 TOTP 生成器。它可以生成基于时间的验证码、导入或导出身份验证器二维码，以及分享验证码配置；应用本身不会把密钥发送到后端。

> [!IMPORTANT]
> 密钥会以未加密形式保存在当前标签页的 `sessionStorage` 中，配置链接同样包含密钥。请仅在可信设备上使用本工具，并通过可信渠道分享配置链接。

## 功能特性

- 实时生成上一周期、当前周期和下一周期的 TOTP 验证码
- 支持 SHA-1、SHA-256、SHA-512，以及 6 位或 8 位验证码
- 支持通过摄像头、图片文件、粘贴截图或框选屏幕区域导入 `otpauth://` 二维码
- 生成可供身份验证器应用导入的设置二维码
- 在当前浏览器会话中保留最多 10 条最近使用的配置
- 复制验证码、设置 URI 和经过 Base64 编码的配置链接
- 自动识别浏览器语言，并支持手动切换英文和简体中文
- 自动跟随系统配色，并支持手动切换日间和夜间模式
- 适配桌面端与移动端，无需构建步骤或 CDN

## 快速开始

建议通过 localhost 运行，以便使用包括摄像头扫描在内的全部功能：

```bash
python -m http.server 8080
```

然后访问 <http://localhost:8080>。

也可以直接打开 `index.html`，使用验证码生成和图片二维码导入等基础功能。摄像头访问通常要求 HTTPS 或 localhost，在普通 `file://` 页面中不可用。

## 使用方法

### 生成验证码

1. 在**密钥**中输入 Base32 密钥。
2. 根据需要在**高级参数**中选择算法、验证码位数和刷新周期。
3. 点击当前、上一组或下一组验证码即可复制。

程序会自动移除空格并将字母转换为大写。有效的 Base32 输入只能包含 `A-Z` 和 `2-7`。

### 导入二维码

在**导入配置**中可以使用以下方式：

- **摄像头扫描**——将设备摄像头对准身份验证器二维码。
- **选择图片**——选择包含 `otpauth://` 二维码的图片。
- **粘贴截图**——聚焦图片导入控件，然后从剪贴板粘贴图片。
- **截取屏幕**——选择屏幕或窗口后，框选二维码区域并在本地识别。

如果二维码包含发行方和账户信息，导入后也会用于二维码导出表单。

### 生成设置二维码

1. 展开**生成导入二维码**。
2. 输入发行方（必填）；账户名称可按需填写。
3. 点击**生成二维码**。
4. 使用身份验证器应用扫描结果，或复制生成的设置 URI。

### 使用生成历史

有效配置会在短暂延迟后加入**生成历史**。点击历史条目可恢复配置；点击**清除历史**并再次确认可删除全部记录。当前标签页会话最多保留 10 条记录。

## 配置链接

### Query 参数

应用启动时支持以下参数：

```text
index.html?key=JBSWY3DPEHPK3PXP&digits=6&period=30&algorithm=SHA1
```

| 参数 | 说明 | 界面可选值 | 默认值 |
|---|---|---|---|
| `key` | Base32 密钥 | `A-Z`、`2-7` | 空 |
| `digits` | 验证码位数 | `6`、`8` | `6` |
| `period` | 刷新周期，单位为秒 | `30`、`60` | `30` |
| `algorithm` | HMAC 算法 | `SHA1`、`SHA256`、`SHA512` | `SHA1` |

### 分享链接

点击**复制配置链接**会生成一个 URL，其 Hash 中包含经过 Base64 编码的 JSON：

```text
index.html#eyJrIjoiSkJTV1kzRFBFSFBLM1BYUCIsImQiOjYsInAiOjMwLCJhIjoiU0hBMSJ9
```

其中字段分别为：`k`（密钥）、`d`（位数）、`p`（周期）和 `a`（算法）。Base64 只是编码，不是加密；任何获得该 URL 的人都可以还原密钥。

导入后，Query 和 Hash 会从当前地址栏中移除。但这不会删除已经复制的 URL，也无法阻止 Query 参数出现在 HTTP 服务器日志中。建议优先使用基于 Hash 的分享链接，并将其视为敏感凭据。

## 数据存储与隐私

| 数据 | 存储位置 | 保存期限 |
|---|---|---|
| 密钥、算法、位数和刷新周期 | `sessionStorage` | 当前标签页会话 |
| 最多 10 条历史记录，包括密钥 | `sessionStorage` | 当前标签页会话 |
| 语言和主题偏好 | `localStorage` | 直到清除站点数据 |

- TOTP 计算和二维码处理均在浏览器本地完成。
- 所有运行时依赖都包含在本仓库中，页面不会从 CDN 加载它们。
- 浏览器存储中的密钥未经过加密。
- 配置链接和设置 URI 都包含密钥。
- 摄像头画面仅在页面中处理，并且需要用户明确授权。

## 支持的 OTP 配置

二维码导入和导出采用标准 TOTP 设置 URI 格式：

```text
otpauth://totp/Issuer:Account?secret=KEY&issuer=Issuer&algorithm=SHA1&digits=6&period=30
```

生成器遵循 RFC 6238 描述的 TOTP 构造，并在内部使用 HOTP 计算相邻计数器的验证码。

## 技术实现

项目直接使用仓库内的浏览器版本依赖，不需要安装软件包或执行构建命令：

- [Vue 3.4.20](https://vuejs.org/)——用户界面
- [OTPAuth 9.1.3](https://github.com/hectorm/otpauth)——TOTP/HOTP 生成
- [jsQR 1.4.0](https://github.com/cozmo/jsQR)——二维码解析
- [qrcode-generator](https://github.com/niclas/node-qrcode)——二维码生成
- 原生 Clipboard API 与 `execCommand` 回退方案——复制操作

## 项目结构

```text
totp-generator/
├── index.html                 # 页面结构与本地资源加载
├── css/
│   ├── app.css                # 当前使用的响应式日间/夜间主题
│   └── bulma-0.9.4.min.css    # 保留的旧资源，当前未加载
├── js/
│   ├── app.js                 # TOTP、二维码、存储、语言和主题逻辑
│   └── assets/
│       ├── vue-3.4.20.global.prod.js
│       ├── otpauth-9.1.3.min.js
│       ├── jsqr-1.4.0.min.js
│       ├── qrcode.min.js
│       └── clipboard-2.0.6.min.js  # 保留的旧资源，当前未加载
├── README.md
└── README.zh-CN.md
```

## 开发说明

直接修改 `index.html`、`css/app.css` 或 `js/app.js`，刷新浏览器即可查看结果。项目没有编译步骤；修改缓存资源后，请同步更新 `index.html` 中对应的查询字符串版本。
