function stripSpaces(str) {
  return String(str || '').replace(/\s/g, '');
}

function normalizeSecret(str) {
  return stripSpaces(str).toUpperCase();
}

function clampNumber(value, fallback, min, max) {
  var number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  number = Math.trunc(number);
  if (number < min) return fallback;
  if (typeof max === 'number' && number > max) return max;
  return number;
}

function normalizeAlgorithm(value) {
  var algorithm = String(value || '').toUpperCase();
  return ['SHA1', 'SHA256', 'SHA512'].indexOf(algorithm) >= 0 ? algorithm : 'SHA1';
}

function parseURLSearch(search) {
  if (!search || search.length <= 1) return {};

  return search.substring(1).split('&').reduce(function (params, query) {
    if (!query) return params;

    var chunks = query.split('=');
    var rawKey = chunks[0].replace(/\+/g, ' ');
    var rawValue = chunks.length > 1 ? chunks.slice(1).join('=').replace(/\+/g, ' ') : '';
    var key;
    var value;

    try {
      key = decodeURIComponent(rawKey);
    } catch (e) {
      key = rawKey;
    }

    if (!key) return params;

    try {
      value = decodeURIComponent(rawValue);
    } catch (e) {
      value = rawValue;
    }

    params[key] = value;
    return params;
  }, {});
}

function encodeBase64Json(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeBase64Json(data) {
  return JSON.parse(decodeURIComponent(escape(atob(data))));
}

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise(function (resolve, reject) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      var success = document.execCommand('copy');
      document.body.removeChild(textarea);
      success ? resolve() : reject(new Error('Copy command failed'));
    } catch (e) {
      document.body.removeChild(textarea);
      reject(e);
    }
  });
}

const i18n = {
  isChinese: navigator.language.startsWith('zh') || navigator.languages.some(function (l) { return l.startsWith('zh'); }),

  texts: {
    en: {
      subtitle: 'Offline time-based one-time password tool',
      title: 'Current Token',
      expires: 'Expires at',
      previous: 'Previous',
      next: 'Next',
      copyToken: 'Copy token',
      shareLink: 'Share link',
      configSettings: 'Configuration',
      configIntro: 'Enter a Base32 secret, import an authenticator QR code, or export a new setup QR code.',
      secretConfig: 'Secret',
      secretKey: 'Secret key',
      secretPlaceholder: 'JBSWY3DPEHPK3PXP',
      secretHelp: 'Base32 only: A-Z and 2-7. Spaces are ignored.',
      algorithmParams: 'Token parameters',
      algorithm: 'Algorithm',
      digits: 'Digits',
      period: 'Period (seconds)',
      tokenCopied: 'Token copied',
      linkCopied: 'Link copied',
      uriCopied: 'URI copied',
      noQRFound: 'No QR code found. Try a clearer image.',
      copyFailed: 'Copy failed. Please copy manually.',
      qrImport: 'QR import',
      importQR: 'Paste QR screenshot',
      pasteQR: 'Paste an image from your clipboard',
      clickPaste: 'Click here, then paste a QR screenshot',
      addImage: 'Add image',
      scanCamera: 'Scan with camera',
      stopCamera: 'Stop camera',
      cameraScanning: 'Point the camera at a QR code',
      cameraUnavailable: 'Camera is unavailable. Use localhost or HTTPS, then allow camera access.',
      exportQR: 'QR export',
      issuer: 'Issuer',
      issuerPlaceholder: 'GitHub',
      username: 'Account',
      usernamePlaceholder: 'user@example.com',
      generateQR: 'Generate QR code',
      qrGenerated: 'QR code generated',
      qrLabel: 'Scan with an authenticator app',
      fillAllFields: 'Please fill issuer, account, and a valid secret',
      secretWarning: 'Secret should be Base32: A-Z and 2-7 only.',
      copyUri: 'Copy URI',
      imported: 'Configuration imported',
      invalidSecret: 'Enter a valid Base32 secret to generate tokens.',
      securityNote: 'Everything runs locally in this browser. Secrets are stored only in sessionStorage and URL parameters are removed after loading.'
    },
    zh: {
      subtitle: '离线的基于时间的一次性密码工具',
      title: '当前令牌',
      expires: '过期时间',
      previous: '上一组',
      next: '下一组',
      copyToken: '复制令牌',
      shareLink: '分享链接',
      configSettings: '配置',
      configIntro: '输入 Base32 密钥，或通过验证器二维码导入、导出配置。',
      secretConfig: '密钥',
      secretKey: '密钥',
      secretPlaceholder: 'JBSWY3DPEHPK3PXP',
      secretHelp: '仅支持 Base32：A-Z 和 2-7。空格会被自动忽略。',
      algorithmParams: '令牌参数',
      algorithm: '算法',
      digits: '位数',
      period: '周期（秒）',
      tokenCopied: '令牌已复制',
      linkCopied: '链接已复制',
      uriCopied: 'URI 已复制',
      noQRFound: '未识别到二维码，请尝试更清晰的图片。',
      copyFailed: '复制失败，请手动复制。',
      qrImport: '二维码导入',
      importQR: '粘贴二维码截图',
      pasteQR: '从剪贴板粘贴图片',
      clickPaste: '点击此处，然后粘贴二维码截图',
      addImage: '添加图片',
      scanCamera: '摄像头扫描',
      stopCamera: '停止摄像头',
      cameraScanning: '请将摄像头对准二维码',
      cameraUnavailable: '摄像头不可用。请使用 localhost 或 HTTPS，并允许摄像头权限。',
      exportQR: '二维码导出',
      issuer: '发行方',
      issuerPlaceholder: 'GitHub',
      username: '账户',
      usernamePlaceholder: 'user@example.com',
      generateQR: '生成二维码',
      qrGenerated: '二维码已生成',
      qrLabel: '使用验证器应用扫描',
      fillAllFields: '请填写发行方、账户和有效密钥',
      secretWarning: '密钥应为 Base32 格式，仅包含 A-Z 和 2-7。',
      copyUri: '复制 URI',
      imported: '配置已导入',
      invalidSecret: '请输入有效的 Base32 密钥以生成令牌。',
      securityNote: '所有计算都在当前浏览器本地完成。密钥仅保存到 sessionStorage，URL 参数会在加载后自动清除。'
    }
  },

  t(key) {
    const lang = this.isChinese ? 'zh' : 'en';
    return this.texts[lang][key] || key;
  }
};

const app = Vue.createApp({
  data() {
    return {
      i18n: i18n,
      secret_key: '',
      digits: 6,
      period: 30,
      algorithm: 'SHA1',
      updatingIn: 30,
      progressPercent: 100,
      token: '------',
      prevToken: '------',
      nextToken: '------',
      clipboardButton: null,
      pasteFocused: false,
      shareLink: null,
      copyMessage: '',
      expiresAt: new Date(),
      issuer: '',
      username: '',
      showQRResult: false,
      generatedQRUrl: '',
      qrImageDataUrl: '',
      qrSecretWarning: false,
      intervalHandle: null,
      messageTimer: null,
      cameraActive: false,
      cameraStream: null,
      cameraFrameHandle: null,
      cameraCanvas: null,
      cameraStatus: ''
    };
  },

  mounted: function () {
    this.loadFromStorage();
    this.getKeyFromUrl();
    this.getQueryParameters();
    this.normalizeConfig();
    this.update();

    this.intervalHandle = setInterval(() => this.update(), 500);

    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', () => {
      this.showMessage(i18n.t('tokenCopied'));
    });
    this.clipboardButton.on('error', () => {
      copyText(this.token).then(() => {
        this.showMessage(i18n.t('tokenCopied'));
      }).catch(() => {
        this.showMessage(i18n.t('copyFailed'));
      });
    });
  },

  unmounted: function () {
    clearInterval(this.intervalHandle);
    clearTimeout(this.messageTimer);
    this.stopCameraScan();
    if (this.clipboardButton) this.clipboardButton.destroy();
  },

  methods: {
    formatTime: function (date) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      const s = date.getSeconds().toString().padStart(2, '0');
      return h + ':' + m + ':' + s;
    },

    isValidBase32: function (str) {
      const cleaned = normalizeSecret(str);
      return cleaned.length > 0 && /^[A-Z2-7]+=*$/.test(cleaned);
    },

    normalizeConfig: function () {
      this.digits = clampNumber(this.digits, 6, 1, 10);
      this.period = clampNumber(this.period, 30, 1, 300);
      this.algorithm = normalizeAlgorithm(this.algorithm);
    },

    resetTokens: function () {
      this.token = '------';
      this.prevToken = '------';
      this.nextToken = '------';
    },

    generateToken: function (secretObj, counter, digitsNum) {
      return OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter,
        secret: secretObj
      });
    },

    update: function () {
      var periodNum = clampNumber(this.period, 30, 1, 300);
      var digitsNum = clampNumber(this.digits, 6, 1, 10);

      var now = Date.now();
      var periodMs = periodNum * 1000;
      var currentPeriodStart = Math.floor(now / periodMs) * periodMs;
      var elapsed = now - currentPeriodStart;
      var remaining = periodMs - elapsed;

      this.updatingIn = Math.ceil(remaining / 1000);
      this.progressPercent = Math.max(0, Math.min(100, (remaining / periodMs) * 100));
      this.expiresAt = new Date(currentPeriodStart + periodMs);

      var secretStr = normalizeSecret(this.secret_key);
      if (!this.isValidBase32(secretStr)) {
        this.resetTokens();
        return;
      }

      try {
        var secretObj = OTPAuth.Secret.fromBase32(secretStr);
        var counter = Math.floor(now / 1000 / periodNum);
        this.token = this.generateToken(secretObj, counter, digitsNum);
        this.prevToken = this.generateToken(secretObj, counter - 1, digitsNum);
        this.nextToken = this.generateToken(secretObj, counter + 1, digitsNum);
      } catch (e) {
        this.resetTokens();
      }
    },

    generateShareLink: function () {
      this.normalizeConfig();
      const params = {
        k: normalizeSecret(this.secret_key),
        d: this.digits,
        p: this.period,
        a: this.algorithm
      };
      this.shareLink = location.origin + location.pathname + '#' + encodeBase64Json(params);
    },

    copyShareLink: function () {
      this.generateShareLink();
      copyText(this.shareLink).then(() => {
        this.showMessage(i18n.t('linkCopied'));
      }).catch(() => {
        this.showMessage(i18n.t('copyFailed'));
      });
    },

    showMessage: function (msg) {
      clearTimeout(this.messageTimer);
      this.copyMessage = msg;
      this.messageTimer = setTimeout(() => {
        this.copyMessage = '';
      }, 2600);
    },

    parseShareLink: function (encoded) {
      try {
        const params = decodeBase64Json(encoded);
        if (params.k) this.secret_key = normalizeSecret(params.k);
        if (params.d) this.digits = params.d;
        if (params.p) this.period = params.p;
        if (params.a) this.algorithm = params.a;
      } catch (e) {
        if (encoded && encoded.length > 0) {
          this.secret_key = normalizeSecret(encoded);
        }
      }
    },

    getKeyFromUrl: function () {
      const hash = document.location.hash.replace(/[#/]+/, '');

      if (hash.length > 0) {
        this.parseShareLink(hash);
        history.replaceState(null, document.title, location.pathname);
      }
    },

    getQueryParameters: function () {
      const queryParams = parseURLSearch(window.location.search);

      if (queryParams.key) this.secret_key = normalizeSecret(queryParams.key);
      if (queryParams.digits) this.digits = queryParams.digits;
      if (queryParams.period) this.period = queryParams.period;
      if (queryParams.algorithm) this.algorithm = queryParams.algorithm;

      if (window.location.search) {
        history.replaceState(null, document.title, location.pathname);
      }
    },

    parseOtpauth: function (uri) {
      try {
        const url = new URL(uri);
        if (url.protocol !== 'otpauth:' || url.hostname.toLowerCase() !== 'totp') return null;

        const params = url.searchParams;
        const result = {};
        const label = decodeURIComponent(url.pathname.replace(/^\//, ''));
        const labelParts = label.split(':');

        if (params.get('secret')) result.secret_key = normalizeSecret(params.get('secret'));
        if (params.get('digits')) result.digits = params.get('digits');
        if (params.get('period')) result.period = params.get('period');
        if (params.get('algorithm')) result.algorithm = params.get('algorithm');
        if (params.get('issuer')) result.issuer = params.get('issuer');
        if (labelParts.length > 1) {
          if (!result.issuer) result.issuer = labelParts[0];
          result.username = labelParts.slice(1).join(':');
        } else if (label) {
          result.username = label;
        }

        return result.secret_key ? result : null;
      } catch (e) {
        return null;
      }
    },

    importFromQR: function (data) {
      const value = String(data || '').trim();
      const otpauthData = this.parseOtpauth(value);

      if (otpauthData) {
        Object.assign(this, otpauthData);
        this.normalizeConfig();
        this.showMessage(i18n.t('imported'));
      } else if (value.length > 0) {
        this.secret_key = normalizeSecret(value);
        this.showMessage(i18n.t('imported'));
      }
    },

    focusPasteArea: function () {
      var pasteArea = document.getElementById('paste-area');
      if (pasteArea) pasteArea.focus();
    },

    handlePaste: function (event) {
      const items = event.clipboardData && event.clipboardData.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = items[i].getAsFile();
          if (file) this.scanQRFromImage(file);
          return;
        }
      }
    },

    triggerImagePicker: function () {
      if (this.$refs.imageInput) {
        this.$refs.imageInput.value = '';
        this.$refs.imageInput.click();
      }
    },

    handleImageSelect: function (event) {
      const file = event.target.files && event.target.files[0];
      if (file) this.scanQRFromImage(file);
    },

    scanQRFromImage: function (file) {
      if (file.size > 4 * 1024 * 1024) {
        this.showMessage(i18n.t('noQRFound'));
        return;
      }

      var reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          var maxSize = 2400;
          if (img.width > maxSize || img.height > maxSize) {
            this.showMessage(i18n.t('noQRFound'));
            return;
          }
          this.scanQRFromSource(img, img.width, img.height, true);
        };
        img.onerror = () => this.showMessage(i18n.t('noQRFound'));
        img.src = e.target.result;
      };
      reader.onerror = () => this.showMessage(i18n.t('noQRFound'));
      reader.readAsDataURL(file);
    },

    scanQRFromSource: function (source, width, height, showFailure) {
      if (!width || !height) return false;

      const canvas = this.cameraCanvas || document.createElement('canvas');
      this.cameraCanvas = canvas;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(source, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        this.importFromQR(code.data);
        return true;
      }

      if (showFailure) this.showMessage(i18n.t('noQRFound'));
      return false;
    },

    startCameraScan: async function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showMessage(i18n.t('cameraUnavailable'));
        return;
      }

      try {
        this.stopCameraScan();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        this.cameraStream = stream;
        this.cameraActive = true;
        this.cameraStatus = i18n.t('cameraScanning');

        this.$nextTick(async () => {
          const video = this.$refs.cameraVideo;
          if (!video) return;
          video.srcObject = stream;
          try {
            await video.play();
          } catch (e) { }
          this.scanCameraFrame();
        });
      } catch (e) {
        this.stopCameraScan();
        this.showMessage(i18n.t('cameraUnavailable'));
      }
    },

    stopCameraScan: function () {
      if (this.cameraFrameHandle) {
        cancelAnimationFrame(this.cameraFrameHandle);
        this.cameraFrameHandle = null;
      }

      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(function (track) {
          track.stop();
        });
        this.cameraStream = null;
      }

      if (this.$refs && this.$refs.cameraVideo) {
        this.$refs.cameraVideo.srcObject = null;
      }

      this.cameraActive = false;
      this.cameraStatus = '';
    },

    scanCameraFrame: function () {
      if (!this.cameraActive) return;

      const video = this.$refs.cameraVideo;
      if (video && video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        const found = this.scanQRFromSource(video, video.videoWidth, video.videoHeight, false);
        if (found) {
          this.stopCameraScan();
          return;
        }
      }

      this.cameraFrameHandle = requestAnimationFrame(() => this.scanCameraFrame());
    },

    loadFromStorage: function () {
      const saved = sessionStorage.getItem('totp_config');
      if (!saved) return;

      try {
        const config = JSON.parse(saved);
        if (config.secret_key) this.secret_key = normalizeSecret(config.secret_key);
        if (config.digits) this.digits = config.digits;
        if (config.period) this.period = config.period;
        if (config.algorithm) this.algorithm = config.algorithm;
        if (config.issuer) this.issuer = config.issuer;
        if (config.username) this.username = config.username;
      } catch (e) { }
    },

    saveToStorage: function () {
      sessionStorage.setItem('totp_config', JSON.stringify({
        secret_key: normalizeSecret(this.secret_key),
        digits: this.digits,
        period: this.period,
        algorithm: this.algorithm,
        issuer: this.issuer,
        username: this.username
      }));
    },

    validateQRSecret: function () {
      this.qrSecretWarning = Boolean(this.secret_key) && !this.isValidBase32(this.secret_key);
    },

    generateQRCode: function () {
      this.normalizeConfig();

      const issuer = this.issuer.trim();
      const username = this.username.trim();
      const secret = normalizeSecret(this.secret_key);

      if (!issuer || !username || !this.isValidBase32(secret)) {
        this.showMessage(i18n.t('fillAllFields'));
        return;
      }

      const issuerEncoded = encodeURIComponent(issuer);
      const usernameEncoded = encodeURIComponent(username);
      const secretEncoded = encodeURIComponent(secret);
      let uri = `otpauth://totp/${issuerEncoded}:${usernameEncoded}?secret=${secretEncoded}&issuer=${issuerEncoded}`;

      if (this.algorithm !== 'SHA1') uri += `&algorithm=${encodeURIComponent(this.algorithm)}`;
      if (Number(this.digits) !== 6) uri += `&digits=${encodeURIComponent(this.digits)}`;
      if (Number(this.period) !== 30) uri += `&period=${encodeURIComponent(this.period)}`;

      this.generatedQRUrl = uri;

      try {
        const qr = qrcode(0, 'M');
        qr.addData(this.generatedQRUrl);
        qr.make();
        this.qrImageDataUrl = qr.createDataURL(6, 8);
        this.showQRResult = true;
        this.showMessage(i18n.t('qrGenerated'));
      } catch (e) {
        this.showMessage(i18n.t('noQRFound'));
      }
    },

    copyQRUri: function () {
      copyText(this.generatedQRUrl).then(() => {
        this.showMessage(i18n.t('uriCopied'));
      }).catch(() => {
        this.showMessage(i18n.t('copyFailed'));
      });
    }
  },

  watch: {
    secret_key: function (value) {
      var normalized = normalizeSecret(value);
      if (value && value !== normalized) {
        this.secret_key = normalized;
        return;
      }
      this.validateQRSecret();
      this.saveToStorage();
    },
    digits: function () {
      this.digits = clampNumber(this.digits, 6, 1, 10);
      this.saveToStorage();
    },
    period: function () {
      this.period = clampNumber(this.period, 30, 1, 300);
      this.saveToStorage();
    },
    algorithm: function () {
      this.algorithm = normalizeAlgorithm(this.algorithm);
      this.saveToStorage();
    },
    issuer: function () { this.saveToStorage(); },
    username: function () { this.saveToStorage(); }
  }
});

app.mount('#app');
