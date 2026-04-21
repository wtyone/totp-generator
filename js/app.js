function getCurrentSeconds() {
  return Math.round(new Date().getTime() / 1000.0);
}

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
  const queryParams = search.substr(1).split('&').reduce(function (q, query) {
    const chunks = query.split('=');
    const key = chunks[0];
    let value = decodeURIComponent(chunks[1]);
    value = isNaN(Number(value)) ? value : Number(value);
    return (q[key] = value, q);
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
      qrImport: 'QR Import',
      importQR: 'Import from QR Code',
      pasteQR: 'Paste QR image...',
      clickPaste: 'Click & paste QR screenshot',
      tokenCopied: 'Token copied!',
      linkCopied: 'Link copied!',
      noQRFound: 'No QR code found in image. Try a clearer screenshot.'
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
      secretKey: '密钥 (Base-32)',
      secretPlaceholder: '输入您的密钥',
      algorithmParams: '算法参数',
      algorithm: '算法',
      digits: '位数',
      period: '周期 (秒)',
      qrImport: '二维码导入',
      importQR: '导入二维码',
      pasteQR: '粘贴二维码图片...',
      clickPaste: '点击并粘贴二维码截图',
      tokenCopied: '令牌已复制！',
      linkCopied: '链接已复制！',
      noQRFound: '图片中未找到二维码，请尝试更清晰的截图。'
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
      secret_key: 'JBSWY3DPEHPK3PXP', // Default test key ("Hello!" in Base32)
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
    };
  },

  mounted: function () {
    this.loadFromStorage();
    this.getKeyFromUrl();
    this.getQueryParameters()
    this.update();

    this.intervalHandle = setInterval(() => this.update(), 500);

    this.clipboardButton = new ClipboardJS('#clipboard-button');
    this.clipboardButton.on('success', () => {
      this.showMessage(i18n.t('tokenCopied'));
    });
  },

  unmounted: function () {
    clearInterval(this.intervalHandle);
  },

  computed: {
    totp: function () {
      return new OTPAuth.TOTP({
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period,
        secret: OTPAuth.Secret.fromBase32(stripSpaces(this.secret_key)),
      });
    },
    remainingTime: function () {
      const now = Date.now();
      const periodEnd = Math.ceil(now / (this.period * 1000)) * (this.period * 1000);
      return new Date(periodEnd);
    },
    tokenDigits: function () {
      if (!this.token) return [];
      return this.token.split('');
    },
    timerOffset: function () {
      const circumference = 201;
      const progress = this.updatingIn / this.period;
      return circumference * (1 - progress);
    },
    timerRingOffset: function () {
      const circumference = 37.7;
      const progress = this.updatingIn / this.period;
      return circumference * (1 - progress);
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
      // 确保 period 和 digits 是数字类型
      const periodNum = Number(this.period);
      const digitsNum = Number(this.digits);

      const now = Date.now();
      const currentPeriodStart = Math.floor(now / (periodNum * 1000)) * (periodNum * 1000);
      const elapsed = now - currentPeriodStart;
      const remaining = periodNum * 1000 - elapsed;

      this.updatingIn = Math.ceil(remaining / 1000);
      this.progressPercent = (remaining / (periodNum * 1000)) * 100;

      // Set expiresAt timestamp
      this.expiresAt = new Date(Math.ceil(now / (periodNum * 1000)) * (periodNum * 1000));

      // Calculate counter for TOTP
      const counter = Math.floor(now / 1000 / periodNum);

      // 使用 HOTP 静态方法生成令牌，避免实例状态问题
      const secretObj = OTPAuth.Secret.fromBase32(stripSpaces(this.secret_key));

      // 正确用法：generate({ counter: number }) 传入对象参数
      const newToken = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter,
        secret: secretObj
      }), digitsNum);

      const newPrevToken = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter - 1,
        secret: secretObj
      }), digitsNum);

      const newNextToken = truncateTo(OTPAuth.HOTP.generate({
        algorithm: this.algorithm,
        digits: digitsNum,
        counter: counter + 1,
        secret: secretObj
      }), digitsNum);

      // Force Vue to detect changes by reassigning
      this.token = newToken;
      this.prevToken = newPrevToken;
      this.nextToken = newNextToken;
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
      navigator.clipboard.writeText(this.shareLink);
      this.showMessage(i18n.t('linkCopied'));
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
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
    }
  },

  watch: {
    secret_key: function () { this.saveToStorage(); },
    digits: function () { this.saveToStorage(); },
    period: function () { this.saveToStorage(); },
    algorithm: function () { this.saveToStorage(); }
  }
});

app.mount('#app');
