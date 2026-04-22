function stripSpaces(str) {
  return str.replace(/\s/g, '');
}

function truncateTo(str, digits) {
  if (str.length <= digits) {
    return str;
  }

  return str.slice(-digits);
}

function parseURLSearch(search) {
  if (!search || search.length <= 1) return {};
  var queryParams = search.substring(1).split('&').reduce(function (q, query) {
    var chunks = query.split('=');
    var key = chunks[0];
    if (!key) return q;
    var rawValue = chunks.length > 1 ? chunks.slice(1).join('=') : '';
    var value;
    try {
      value = decodeURIComponent(rawValue);
    } catch (e) {
      value = rawValue;
    }
    value = isNaN(Number(value)) || value === '' ? value : Number(value);
    q[key] = value;
    return q;
  }, {});

  return queryParams;
}

// Internationalization
const i18n = {
  isChinese: navigator.language.startsWith('zh') || navigator.languages.some(l => l.startsWith('zh')),

  texts: {
    en: {
      title: 'Current Token',
      expires: 'Expires',
      previous: 'Previous',
      next: 'Next',
      copyToken: 'Copy Token',
      shareLink: 'Share Link',
      configSettings: 'Configuration Settings',
      secretConfig: 'Secret Key Configuration',
      secretKey: 'Secret Key (Base-32)',
      secretPlaceholder: 'Enter your secret key',
      algorithmParams: 'Algorithm Parameters',
      algorithm: 'Algorithm',
      digits: 'Digits',
      period: 'Period (s)',
      tokenCopied: 'Token copied!',
      linkCopied: 'Link copied!',
      noQRFound: 'No QR code found in image. Try a clearer screenshot.',
      copyFailed: 'Copy failed, please copy manually.',
      qrImport: 'QR Import',
      importQR: 'Import from QR Code',
      pasteQR: 'Paste QR image...',
      clickPaste: 'Click & paste QR screenshot',
      // QR Export
      exportQR: 'QR Export',
      issuer: 'Issuer',
      issuerPlaceholder: 'e.g. Google, GitHub',
      username: 'Username',
      usernamePlaceholder: 'e.g. user@example.com',
      generateQR: 'Generate QR Code',
      qrGenerated: 'QR code generated!',
      qrLabel: 'Scan with authenticator app',
      fillAllFields: 'Please fill all fields',
      secretWarning: 'Warning: Secret should be Base32 (A-Z, 2-7 only). Current format may not work with some authenticator apps.',
      copyUri: 'Copy URI'
    },
    zh: {
      title: '当前令牌',
      expires: '过期时间',
      previous: '上一个',
      next: '下一个',
      copyToken: '复制令牌',
      shareLink: '分享链接',
      configSettings: '配置设置',
      secretConfig: '密钥配置',
      secretKey: '密钥（Base-32）',
      secretPlaceholder: '输入您的密钥',
      algorithmParams: '算法参数',
      algorithm: '算法',
      digits: '位数',
      period: '周期（秒）',
      copyFailed: '复制失败，请手动复制。',
      qrImport: '二维码导入',
      importQR: '导入二维码',
      pasteQR: '粘贴二维码图片...',
      clickPaste: '点击并粘贴二维码截图',
      tokenCopied: '令牌已复制！',
      linkCopied: '链接已复制！',
      noQRFound: '图片中未找到二维码，请尝试更清晰的截图。',
      // QR Export
      exportQR: '二维码导出',
      issuer: '发行者',
      issuerPlaceholder: '例如: Google, GitHub',
      username: '用户名',
      usernamePlaceholder: '例如: user@example.com',
      generateQR: '生成二维码',
      qrGenerated: '二维码已生成！',
      qrLabel: '使用验证器应用扫码',
      fillAllFields: '请填写所有字段',
      secretWarning: '警告：密钥应为 Base32 格式（仅包含 A-Z 和 2-7）。当前格式可能在某些验证器应用中无法正常工作。',
      copyUri: '复制 URI'
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
      showConfig: false,
      expiresAt: new Date(),
      // QR Export related
      issuer: '',
      username: '',
      showQRResult: false,
      generatedQRUrl: '',
      qrImageDataUrl: '',
      qrSecretWarning: false
    };
  },

  mounted: function () {
    this.loadFromStorage();
    this.getKeyFromUrl();
    this.getQueryParameters();
    this.update();

    this.intervalHandle = setInterval(() => this.update(), 500);

    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', () => {
      this.showMessage(i18n.t('tokenCopied'));
    });
  },

  unmounted: function () {
    clearInterval(this.intervalHandle);
    if (this.clipboardButton) this.clipboardButton.destroy();
  },

  computed: {
    remainingTime: function () {
      const now = Date.now();
      const periodEnd = Math.ceil(now / (this.period * 1000)) * (this.period * 1000);
      return new Date(periodEnd);
    },
    tokenDigits: function () {
      if (!this.token) return [];
      return this.token.split('');
    }
  },

  methods: {
    formatTime: function (date) {
      const h = date.getHours().toString().padStart(2, '0');
      const m = date.getMinutes().toString().padStart(2, '0');
      const s = date.getSeconds().toString().padStart(2, '0');
      return h + ':' + m + ':' + s;
    },

    update: function () {
      var periodNum = Number(this.period);
      var digitsNum = Number(this.digits);

      if (!periodNum || periodNum <= 0) periodNum = 30;
      if (!digitsNum || digitsNum <= 0) digitsNum = 6;

      var now = Date.now();
      var currentPeriodStart = Math.floor(now / (periodNum * 1000)) * (periodNum * 1000);
      var elapsed = now - currentPeriodStart;
      var remaining = periodNum * 1000 - elapsed;

      this.updatingIn = Math.ceil(remaining / 1000);
      this.progressPercent = (remaining / (periodNum * 1000)) * 100;

      this.expiresAt = new Date(currentPeriodStart + periodNum * 1000);

      var counter = Math.floor(now / 1000 / periodNum);

      var secretStr = stripSpaces(this.secret_key);
      if (!secretStr || !this.isValidBase32(secretStr)) {
        this.token = '------';
        this.prevToken = '------';
        this.nextToken = '------';
        return;
      }

      try {
        var secretObj = OTPAuth.Secret.fromBase32(secretStr);
      } catch (e) {
        this.token = '------';
        this.prevToken = '------';
        this.nextToken = '------';
        return;
      }

      this.token = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter,
        secret: secretObj
      }), digitsNum);

      this.prevToken = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter - 1,
        secret: secretObj
      }), digitsNum);

      this.nextToken = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter + 1,
        secret: secretObj
      }), digitsNum);
    },

    generateShareLink: function () {
      const params = {
        k: this.secret_key,
        d: this.digits,
        p: this.period,
        a: this.algorithm
      };
      const encoded = btoa(JSON.stringify(params));
      this.shareLink = location.origin + location.pathname + '#' + encoded;
    },

    copyShareLink: function () {
      this.generateShareLink();
      var self = this;
      navigator.clipboard.writeText(this.shareLink).then(function () {
        self.showMessage(i18n.t('linkCopied'));
      }).catch(function () {
        self.showMessage(i18n.t('copyFailed'));
      });
    },

    showMessage: function (msg) {
      this.copyMessage = msg;
      setTimeout(() => {
        this.copyMessage = '';
      }, 3000);
    },

    parseShareLink: function (encoded) {
      try {
        const params = JSON.parse(atob(encoded));
        if (params.k) this.secret_key = params.k;
        if (params.d) this.digits = Number(params.d);
        if (params.p) this.period = Number(params.p);
        if (params.a) this.algorithm = params.a;
      } catch (e) {
        // Not a valid encoded link, treat as raw key
        if (encoded && encoded.length > 0) {
          this.secret_key = encoded;
        }
      }
    },

    getKeyFromUrl: function () {
      const hash = document.location.hash.replace(/[#\/]+/, '');

      if (hash.length > 0) {
        this.parseShareLink(hash);
        // Clear URL from browser history
        history.replaceState(null, document.title, location.pathname);
      }
    },
    getQueryParameters: function () {
      const queryParams = parseURLSearch(window.location.search);

      if (queryParams.key) {
        this.secret_key = queryParams.key;
      }

      if (queryParams.digits) {
        this.digits = queryParams.digits;
      }

      if (queryParams.period) {
        this.period = queryParams.period;
      }

      if (queryParams.algorithm) {
        this.algorithm = queryParams.algorithm;
      }

      // Clear URL from browser history if any query params present
      if (window.location.search) {
        history.replaceState(null, document.title, location.pathname);
      }
    },

    parseOtpauth: function (uri) {
      // Parse otpauth:// format: otpauth://totp/issuer:account?secret=KEY&algorithm=ALG&digits=N&period=N
      try {
        const url = new URL(uri);
        if (url.protocol !== 'otpauth:') return null;

        const params = url.searchParams;
        const result = {};

        if (params.get('secret')) {
          result.secret_key = params.get('secret');
        }
        if (params.get('digits')) {
          result.digits = parseInt(params.get('digits'), 10);
        }
        if (params.get('period')) {
          result.period = parseInt(params.get('period'), 10);
        }
        if (params.get('algorithm')) {
          result.algorithm = params.get('algorithm').toUpperCase();
        }

        return result;
      } catch (e) {
        return null;
      }
    },

    importFromQR: function (data) {
      // data can be otpauth:// URI or raw secret key
      const otpauthData = this.parseOtpauth(data);
      if (otpauthData) {
        Object.assign(this, otpauthData);
      } else if (data && data.length > 0) {
        // Treat as raw secret key
        this.secret_key = data;
      }
    },

    focusPasteArea: function () {
      document.getElementById('paste-area').focus();
    },

    handlePaste: function (event) {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          this.scanQRFromImage(file);
          break;
        }
      }
    },

    scanQRFromImage: function (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(i18n.t('noQRFound'));
        return;
      }

      var reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          var maxSize = 2000;
          if (img.width > maxSize || img.height > maxSize) {
            alert(i18n.t('noQRFound'));
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            this.importFromQR(code.data);
          } else {
            alert(i18n.t('noQRFound'));
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    loadFromStorage: function () {
      const saved = sessionStorage.getItem('totp_config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          if (config.secret_key) this.secret_key = config.secret_key;
          if (config.digits) this.digits = Number(config.digits);
          if (config.period) this.period = Number(config.period);
          if (config.algorithm) this.algorithm = config.algorithm;
        } catch (e) { }
      }
    },

    saveToStorage: function () {
      sessionStorage.setItem('totp_config', JSON.stringify({
        secret_key: this.secret_key,
        digits: this.digits,
        period: this.period,
        algorithm: this.algorithm
      }));
    },

    // QR Export Methods
    isValidBase32: function (str) {
      const cleaned = str.replace(/\s/g, '').toUpperCase();
      if (cleaned.length === 0) return true;
      const base32Regex = /^[A-Z2-7]+$/;
      return base32Regex.test(cleaned);
    },

    validateQRSecret: function () {
      this.qrSecretWarning = this.secret_key && !this.isValidBase32(this.secret_key);
    },

    generateQRCode: function () {
      const issuer = this.issuer.trim();
      const username = this.username.trim();
      const secret = this.secret_key.trim();

      if (!issuer || !username || !secret) {
        this.showMessage(i18n.t('fillAllFields'));
        return;
      }

      // Build TOTP URI - only add non-default parameters for better compatibility
      const issuerEncoded = encodeURIComponent(issuer);
      const usernameEncoded = encodeURIComponent(username);
      let uri = `otpauth://totp/${issuerEncoded}:${usernameEncoded}?secret=${secret}&issuer=${issuerEncoded}`;

      // Only add algorithm if not default (SHA1)
      if (this.algorithm !== 'SHA1') {
        uri += `&algorithm=${this.algorithm}`;
      }
      // Only add digits if not default (6)
      if (this.digits !== 6) {
        uri += `&digits=${this.digits}`;
      }
      // Only add period if not default (30)
      if (this.period !== 30) {
        uri += `&period=${this.period}`;
      }

      this.generatedQRUrl = uri;

      // Generate QR code using qrcode-generator library
      const qr = qrcode(0, 'M');
      qr.addData(this.generatedQRUrl);
      qr.make();

      // Create data URL
      this.qrImageDataUrl = qr.createDataURL(6, 8);
      this.showQRResult = true;
      this.showMessage(i18n.t('qrGenerated'));
    },

    copyQRUri: function () {
      var self = this;
      navigator.clipboard.writeText(this.generatedQRUrl).then(function () {
        self.showMessage(i18n.t('linkCopied'));
      }).catch(function () {
        self.showMessage(i18n.t('copyFailed'));
      });
    }
  },

  watch: {
    secret_key: function () { this.saveToStorage(); this.validateQRSecret(); },
    digits: function () { this.saveToStorage(); },
    period: function () { this.saveToStorage(); },
    algorithm: function () { this.saveToStorage(); }
  }
});

app.mount('#app');
