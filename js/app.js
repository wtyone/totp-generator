function stripSpaces(value) {
  return String(value || '').replace(/\s/g, '').toUpperCase();
}

function parseURLSearch(search) {
  if (!search || search.length <= 1) return {};
  return search.substring(1).split('&').reduce(function (params, pair) {
    var chunks = pair.split('=');
    var key = chunks[0];
    if (!key) return params;
    var rawValue = chunks.length > 1 ? chunks.slice(1).join('=') : '';
    try {
      params[key] = decodeURIComponent(rawValue);
    } catch (error) {
      params[key] = rawValue;
    }
    return params;
  }, {});
}

function readPreference(key) {
  try { return localStorage.getItem(key); } catch (error) { return null; }
}

function writePreference(key, value) {
  try { localStorage.setItem(key, value); } catch (error) { /* Preferences remain available for this visit. */ }
}

var savedLanguage = readPreference('totp_language');
var browserIsChinese = (navigator.language || '').toLowerCase().startsWith('zh') ||
  (navigator.languages || []).some(function (language) { return language.toLowerCase().startsWith('zh'); });
var savedTheme = readPreference('totp_theme');
var initialTheme = savedTheme === 'light' || savedTheme === 'dark'
  ? savedTheme
  : (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

document.documentElement.dataset.theme = initialTheme;

const i18n = {
  isChinese: savedLanguage === 'zh' || (savedLanguage !== 'en' && browserIsChinese),
  texts: {
    en: {
      appName: 'TOTP Generator', appTitle: 'TOTP Generator', appDescription: 'A local TOTP code generator with QR code import.', localOnly: 'Runs locally', eyebrow: 'Time-based code', headline: 'TOTP code generator',
      switchToEnglish: 'Switch to English', switchToChinese: 'Switch to Chinese', switchToLight: 'Switch to light mode', switchToDark: 'Switch to dark mode', lightMode: 'Light', darkMode: 'Dark',
      intro: 'Enter a Base32 secret or scan a QR code to generate a verification code.',
      currentToken: 'Current code', active: 'Generated', waiting: 'Not configured', remaining: '{count} seconds remaining', tapToCopy: 'Click the code to copy',
      addSecret: 'Enter a secret to generate a code', previous: 'Previous', next: 'Next', copyToken: 'Copy code', shareLink: 'Copy configuration link',
      clickToCopy: 'Click to copy', copyPrevious: 'Copy previous code', copyNext: 'Copy next code',
      privacyTitle: 'Local processing', privacyText: 'Secrets and site history are stored only in this browser session and cleared when the session ends. Configuration links contain the secret.',
      configuration: 'Settings', settings: 'Code parameters', collapse: 'Collapse', expand: 'Open', secretKey: 'Secret key', clear: 'Clear',
      secretPlaceholder: 'Enter a Base32 secret', hideSecret: 'Hide secret', showSecret: 'Show secret', invalidSecret: 'Use only Base32 characters: A–Z and 2–7.',
      secretHelp: 'Spaces are removed automatically.', advancedSettings: 'Advanced parameters', digitUnit: 'digits', algorithm: 'Algorithm', digits: 'Digits', period: 'Refresh period', quickImport: 'Import configuration',
      importQR: 'Use a QR code', optional: 'Optional', scanCamera: 'Scan with camera', aimAtQR: 'Point at a QR code', chooseQR: 'Choose an image', pasteQR: 'or paste a screenshot', exportQR: 'Create a setup QR code',
      liveScan: 'Live scan', cameraTitle: 'Scan QR code', closeCamera: 'Close camera', startingCamera: 'Starting camera…', cameraHelp: 'Hold the QR code inside the frame. It will be recognized automatically.',
      issuer: 'Issuer', account: 'Account', generateQR: 'Generate QR code', generatedQRAlt: 'Generated authenticator QR code', copyUri: 'Copy setup URI', qrReady: 'Setup code ready', scanToImport: 'Scan with your authenticator app to import this account.', tokenHistory: 'Generation history', tokenHistoryHint: 'Select a saved secret to load it and generate its current code.', historyCount: '{count} saved', clearHistory: 'Clear history', confirmClearHistory: 'Click again to clear', historyEmpty: 'Enter your first valid secret and it will appear here.', activateToken: 'Use saved secret', historyActivated: 'Saved secret loaded', historyCleared: 'Generation history cleared',
      tokenCopied: 'Code copied', previousCopied: 'Previous code copied', nextCopied: 'Next code copied', linkCopied: 'Configuration link copied (contains the secret)', uriCopied: 'Setup URI copied',
      copyFailed: 'Could not copy. Please try again.', noQRFound: 'No valid QR code was found in that image.', qrImported: 'QR code imported', cameraUnavailable: 'Camera scanning requires HTTPS or localhost.', cameraDenied: 'Camera access was not allowed.',
      fillAllFields: 'Add a valid secret, issuer and account first.', qrGenerated: 'QR code generated'
    },
    zh: {
      appName: 'TOTP 生成器', appTitle: 'TOTP 生成器', appDescription: '本地 TOTP 动态验证码生成器，支持二维码导入。', localOnly: '本地运行', eyebrow: '动态验证码', headline: 'TOTP 验证码生成器',
      switchToEnglish: '切换到英文', switchToChinese: '切换到中文', switchToLight: '切换到日间模式', switchToDark: '切换到夜间模式', lightMode: '日间', darkMode: '夜间',
      intro: '输入 Base32 密钥或扫描二维码，即可生成验证码。',
      currentToken: '当前验证码', active: '已生成', waiting: '未配置', remaining: '剩余 {count} 秒', tapToCopy: '点击验证码复制',
      addSecret: '输入密钥后生成验证码', previous: '上一组', next: '下一组', copyToken: '复制验证码', shareLink: '复制配置链接',
      clickToCopy: '点击复制', copyPrevious: '复制上一组验证码', copyNext: '复制下一组验证码',
      privacyTitle: '本地处理', privacyText: '密钥与站点历史仅保存在当前浏览器会话中，会话结束后清除。配置链接包含密钥。',
      configuration: '设置', settings: '验证码参数', collapse: '收起', expand: '展开', secretKey: '密钥', clear: '清空',
      secretPlaceholder: '输入 Base32 密钥', hideSecret: '隐藏密钥', showSecret: '显示密钥', invalidSecret: '仅支持 Base32 字符：A–Z 和 2–7。',
      secretHelp: '空格会被自动移除。', advancedSettings: '高级参数', digitUnit: '位', algorithm: '算法', digits: '位数', period: '刷新周期', quickImport: '导入配置',
      importQR: '使用二维码', optional: '可选', scanCamera: '摄像头扫描', aimAtQR: '对准二维码即可识别', chooseQR: '选择图片', pasteQR: '也可以粘贴截图', exportQR: '生成导入二维码',
      liveScan: '实时扫描', cameraTitle: '扫描二维码', closeCamera: '关闭摄像头', startingCamera: '正在启动摄像头…', cameraHelp: '将二维码保持在取景框内，识别成功后会自动导入。',
      issuer: '发行方', account: '账户', generateQR: '生成二维码', generatedQRAlt: '生成的身份验证器二维码', copyUri: '复制设置 URI', qrReady: '导入码已生成', scanToImport: '使用身份验证器扫描，即可导入此账户。', tokenHistory: '生成历史', tokenHistoryHint: '点击已保存的 Secret 后，再加载并生成当前验证码。', historyCount: '已保存 {count} 条', clearHistory: '清除历史', confirmClearHistory: '再次点击确认', historyEmpty: '输入第一个有效 Secret 后，会自动保存在这里。', activateToken: '使用已保存的 Secret', historyActivated: '已加载历史 Secret', historyCleared: '生成历史已清除',
      tokenCopied: '验证码已复制', previousCopied: '上一组验证码已复制', nextCopied: '下一组验证码已复制', linkCopied: '配置链接已复制（包含密钥）', uriCopied: '设置 URI 已复制',
      copyFailed: '复制失败，请重试。', noQRFound: '图片中没有识别到有效二维码。', qrImported: '二维码已导入', cameraUnavailable: '摄像头扫描需要通过 HTTPS 或 localhost 访问。', cameraDenied: '未获得摄像头使用权限。',
      fillAllFields: '请先填写有效密钥、发行方和账户。', qrGenerated: '二维码已生成'
    }
  },
  t(key, values) {
    var language = this.isChinese ? 'zh' : 'en';
    var text = this.texts[language][key] || key;
    Object.keys(values || {}).forEach(function (name) {
      text = text.replace('{' + name + '}', values[name]);
    });
    return text;
  }
};

const app = Vue.createApp({
  data() {
    return {
      i18n: i18n,
      theme: initialTheme,
      secret_key: '', digits: 6, period: 30, algorithm: 'SHA1',
      updatingIn: 30, progressPercent: 100, token: '------', prevToken: '------', nextToken: '------',
      showSecret: false, showConfig: false, copyMessage: '', expiresAt: new Date(), intervalHandle: null,
      issuer: '', username: '', showQRResult: false, generatedQRUrl: '', qrImageDataUrl: '',
      tokenHistory: [], tokenHistoryClearPending: false, tokenHistoryClearTimeout: null, tokenHistorySaveTimeout: null,
      cameraOpen: false, cameraStarting: false, cameraStream: null, cameraFrame: null, cameraLastScan: 0
    };
  },
  computed: {
    hasValidSecret() {
      return Boolean(stripSpaces(this.secret_key)) && this.isValidBase32(this.secret_key);
    },
    formattedToken() {
      return this.formatToken(this.token);
    },
    progressDegrees() {
      return Math.max(0, Math.min(360, this.progressPercent * 3.6));
    }
  },
  mounted() {
    this.applyDocumentPreferences();
    this.showConfig = window.matchMedia('(min-width: 900px)').matches;
    this.loadFromStorage();
    this.loadTokenHistory();
    this.getKeyFromUrl();
    this.getQueryParameters();
    this.update();
    this.scheduleTokenHistoryRecord();
    this.intervalHandle = setInterval(() => this.update(), 250);
  },
  unmounted() {
    clearInterval(this.intervalHandle);
    window.clearTimeout(this.tokenHistoryClearTimeout);
    window.clearTimeout(this.tokenHistorySaveTimeout);
    this.closeCamera();
  },
  methods: {
    applyDocumentPreferences() {
      document.documentElement.lang = i18n.isChinese ? 'zh-CN' : 'en';
      document.documentElement.dataset.theme = this.theme;
      document.title = i18n.t('appTitle');
      var description = document.querySelector('meta[name="description"]');
      var themeColor = document.querySelector('meta[name="theme-color"]');
      if (description) description.setAttribute('content', i18n.t('appDescription'));
      if (themeColor) themeColor.setAttribute('content', this.theme === 'dark' ? '#0b1120' : '#f3f5f9');
    },
    toggleLanguage() {
      this.i18n.isChinese = !this.i18n.isChinese;
      writePreference('totp_language', this.i18n.isChinese ? 'zh' : 'en');
      this.applyDocumentPreferences();
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      writePreference('totp_theme', this.theme);
      this.applyDocumentPreferences();
    },
    formatToken(value) {
      var code = String(value || '------');
      var midpoint = Math.ceil(code.length / 2);
      return code.slice(0, midpoint) + ' ' + code.slice(midpoint);
    },
    normalizeSecret() {
      this.secret_key = stripSpaces(this.secret_key);
      this.showQRResult = false;
    },
    isValidBase32(value) {
      var cleaned = stripSpaces(value).replace(/=+$/, '');
      return Boolean(cleaned) && /^[A-Z2-7]+$/.test(cleaned);
    },
    update() {
      var period = Number(this.period) > 0 ? Number(this.period) : 30;
      var digits = Number(this.digits) > 0 ? Number(this.digits) : 6;
      var now = Date.now();
      var periodStart = Math.floor(now / (period * 1000)) * period * 1000;
      var remaining = period * 1000 - (now - periodStart);
      this.updatingIn = Math.ceil(remaining / 1000);
      this.progressPercent = remaining / (period * 1000) * 100;
      this.expiresAt = new Date(periodStart + period * 1000);

      if (!this.hasValidSecret) {
        this.token = '-'.repeat(digits);
        this.prevToken = '-'.repeat(digits);
        this.nextToken = '-'.repeat(digits);
        return;
      }

      try {
        var secret = OTPAuth.Secret.fromBase32(stripSpaces(this.secret_key).replace(/=+$/, ''));
        var counter = Math.floor(now / 1000 / period);
        var options = { algorithm: this.algorithm, digits: digits, secret: secret };
        this.token = OTPAuth.HOTP.generate(Object.assign({}, options, { counter: counter }));
        this.prevToken = OTPAuth.HOTP.generate(Object.assign({}, options, { counter: counter - 1 }));
        this.nextToken = OTPAuth.HOTP.generate(Object.assign({}, options, { counter: counter + 1 }));
      } catch (error) {
        this.token = '-'.repeat(digits);
        this.prevToken = '-'.repeat(digits);
        this.nextToken = '-'.repeat(digits);
      }
    },
    async copyText(text, successMessage) {
      try {
        await navigator.clipboard.writeText(text);
        this.showMessage(successMessage);
      } catch (error) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        var copied = document.execCommand('copy');
        textarea.remove();
        this.showMessage(copied ? successMessage : i18n.t('copyFailed'));
      }
    },
    copyToken() {
      if (this.hasValidSecret) this.copyText(this.token, i18n.t('tokenCopied'));
    },
    copyAdjacent(type) {
      if (!this.hasValidSecret) return;
      var isPrevious = type === 'previous';
      this.copyText(isPrevious ? this.prevToken : this.nextToken, i18n.t(isPrevious ? 'previousCopied' : 'nextCopied'));
    },
    copyShareLink() {
      if (!this.hasValidSecret) return;
      var params = { k: stripSpaces(this.secret_key), d: Number(this.digits), p: Number(this.period), a: this.algorithm };
      var encoded = btoa(JSON.stringify(params));
      var pageUrl = location.href.split(/[?#]/)[0];
      this.copyText(pageUrl + '#' + encoded, i18n.t('linkCopied'));
    },
    showMessage(message) {
      this.copyMessage = message;
      window.clearTimeout(this.messageTimeout);
      this.messageTimeout = window.setTimeout(() => { this.copyMessage = ''; }, 2600);
    },
    clearSecret() {
      this.secret_key = '';
      this.showQRResult = false;
      document.getElementById('secret').focus();
    },
    parseShareLink(encoded) {
      try {
        var params = JSON.parse(atob(encoded));
        if (params.k) this.secret_key = stripSpaces(params.k);
        if (params.d) this.digits = Number(params.d);
        if (params.p) this.period = Number(params.p);
        if (params.a) this.algorithm = params.a;
      } catch (error) {
        if (encoded) this.secret_key = stripSpaces(encoded);
      }
    },
    getKeyFromUrl() {
      var hash = document.location.hash.replace(/[#/]+/, '');
      if (hash) {
        this.parseShareLink(hash);
        history.replaceState(null, document.title, location.href.split(/[?#]/)[0]);
      }
    },
    getQueryParameters() {
      var params = parseURLSearch(window.location.search);
      if (params.key) this.secret_key = stripSpaces(params.key);
      if (params.digits) this.digits = Number(params.digits);
      if (params.period) this.period = Number(params.period);
      if (params.algorithm) this.algorithm = String(params.algorithm).toUpperCase();
      if (window.location.search) history.replaceState(null, document.title, location.href.split(/[?#]/)[0]);
    },
    parseOtpauth(uri) {
      try {
        var url = new URL(uri);
        if (url.protocol !== 'otpauth:') return null;
        var params = url.searchParams;
        var label = '';
        try { label = decodeURIComponent(url.pathname.replace(/^\/+/, '')); } catch (error) { label = url.pathname.replace(/^\/+/, ''); }
        var separator = label.indexOf(':');
        var labelIssuer = separator >= 0 ? label.slice(0, separator) : '';
        var labelAccount = separator >= 0 ? label.slice(separator + 1) : label;
        return {
          secret_key: stripSpaces(params.get('secret')),
          digits: Number(params.get('digits')) || 6,
          period: Number(params.get('period')) || 30,
          algorithm: (params.get('algorithm') || 'SHA1').toUpperCase(),
          issuer: params.get('issuer') || labelIssuer,
          username: labelAccount
        };
      } catch (error) {
        return null;
      }
    },
    importFromQR(data) {
      var config = this.parseOtpauth(data);
      if (config && config.secret_key) {
        Object.assign(this, config);
        this.showMessage(i18n.t('qrImported'));
        return true;
      }
      if (this.isValidBase32(data)) {
        this.secret_key = stripSpaces(data);
        this.showMessage(i18n.t('qrImported'));
        return true;
      }
      return false;
    },
    handlePaste(event) {
      var items = (event.clipboardData && event.clipboardData.items) || [];
      for (var index = 0; index < items.length; index += 1) {
        if (items[index].type.indexOf('image') !== -1) {
          this.scanQRFromImage(items[index].getAsFile());
          return;
        }
      }
    },
    handleFileSelect(event) {
      var file = event.target.files && event.target.files[0];
      if (file) this.scanQRFromImage(file);
      event.target.value = '';
    },
    async openCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.showMessage(i18n.t('cameraUnavailable'));
        return;
      }

      this.cameraOpen = true;
      this.cameraStarting = true;
      this.cameraLastScan = 0;
      await this.$nextTick();
      this.$refs.cameraModal.focus();

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (!this.cameraOpen) {
          this.cameraStream.getTracks().forEach(function (track) { track.stop(); });
          this.cameraStream = null;
          return;
        }
        this.$refs.cameraVideo.srcObject = this.cameraStream;
        await this.$refs.cameraVideo.play();
        this.cameraStarting = false;
        this.scanCameraFrame();
      } catch (error) {
        var denied = error && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
        this.closeCamera();
        this.showMessage(i18n.t(denied ? 'cameraDenied' : 'cameraUnavailable'));
      }
    },
    scanCameraFrame() {
      if (!this.cameraOpen || !this.cameraStream) return;
      var video = this.$refs.cameraVideo;
      var canvas = this.$refs.cameraCanvas;
      var now = Date.now();

      if (now - this.cameraLastScan >= 120 && video && canvas && video.readyState >= 2 && video.videoWidth > 0) {
        this.cameraLastScan = now;
        var scale = Math.min(1, 900 / video.videoWidth);
        canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
        canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
        var context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        var code = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
        if (code && this.importFromQR(code.data)) {
          this.closeCamera();
          return;
        }
      }

      this.cameraFrame = window.requestAnimationFrame(() => this.scanCameraFrame());
    },
    closeCamera() {
      if (this.cameraFrame) {
        window.cancelAnimationFrame(this.cameraFrame);
        this.cameraFrame = null;
      }
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(function (track) { track.stop(); });
        this.cameraStream = null;
      }
      var video = this.$refs && this.$refs.cameraVideo;
      if (video) video.srcObject = null;
      this.cameraStarting = false;
      this.cameraLastScan = 0;
      this.cameraOpen = false;
    },
    scanQRFromImage(file) {
      if (!file || file.size > 5 * 1024 * 1024) {
        this.showMessage(i18n.t('noQRFound'));
        return;
      }
      var reader = new FileReader();
      reader.onload = (event) => {
        var image = new Image();
        image.onload = () => {
          var maxDimension = 2000;
          var scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
          var canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          var context = canvas.getContext('2d', { willReadFrequently: true });
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          var pixels = context.getImageData(0, 0, canvas.width, canvas.height);
          var code = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: 'attemptBoth' });
          if (!code || !this.importFromQR(code.data)) this.showMessage(i18n.t('noQRFound'));
        };
        image.onerror = () => this.showMessage(i18n.t('noQRFound'));
        image.src = event.target.result;
      };
      reader.readAsDataURL(file);
    },
    loadFromStorage() {
      var saved = sessionStorage.getItem('totp_config');
      if (!saved) return;
      try {
        var config = JSON.parse(saved);
        this.secret_key = stripSpaces(config.secret_key);
        this.digits = Number(config.digits) || 6;
        this.period = Number(config.period) || 30;
        this.algorithm = config.algorithm || 'SHA1';
      } catch (error) { /* Ignore invalid local data. */ }
    },
    saveToStorage() {
      sessionStorage.setItem('totp_config', JSON.stringify({
        secret_key: stripSpaces(this.secret_key), digits: Number(this.digits), period: Number(this.period), algorithm: this.algorithm
      }));
    },
    loadTokenHistory() {
      var saved = sessionStorage.getItem('totp_token_history');
      if (!saved) return;
      try {
        var historyItems = JSON.parse(saved);
        if (!Array.isArray(historyItems)) return;
        this.tokenHistory = historyItems.filter(function (item) {
          return item && typeof item.secret_key === 'string' && /^[A-Z2-7]+$/.test(item.secret_key) && Number(item.digits) > 0 && Number(item.period) > 0;
        }).map(function (item) {
          return Object.assign({}, item, { createdAt: item.createdAt || new Date().toISOString() });
        }).slice(0, 10);
      } catch (error) { /* Ignore invalid local history. */ }
    },
    saveTokenHistory() {
      sessionStorage.setItem('totp_token_history', JSON.stringify(this.tokenHistory));
    },
    scheduleTokenHistoryRecord() {
      window.clearTimeout(this.tokenHistorySaveTimeout);
      this.tokenHistorySaveTimeout = window.setTimeout(() => this.recordCurrentToken(), 650);
    },
    recordCurrentToken() {
      if (!this.hasValidSecret) return;
      var secret = stripSpaces(this.secret_key).replace(/=+$/, '');
      var existing = this.tokenHistory.find(function (item) { return item.secret_key === secret; });
      var entry = {
        id: existing ? existing.id : String(Date.now()),
        secret_key: secret,
        algorithm: this.algorithm,
        digits: Number(this.digits),
        period: Number(this.period),
        createdAt: existing ? existing.createdAt : new Date().toISOString()
      };
      if (existing) {
        this.tokenHistory = this.tokenHistory.map(function (item) { return item.secret_key === secret ? entry : item; });
      } else {
        this.tokenHistory = [entry].concat(this.tokenHistory).slice(0, 10);
      }
      this.saveTokenHistory();
    },
    maskedHistorySecret(secret) {
      return '•••• •••• ' + String(secret || '').slice(-4);
    },
    formatHistoryTime(value) {
      var date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      return new Intl.DateTimeFormat(i18n.isChinese ? 'zh-CN' : 'en', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
      }).format(date);
    },
    isCurrentHistory(item) {
      return stripSpaces(this.secret_key).replace(/=+$/, '') === item.secret_key;
    },
    activateTokenHistory(item) {
      this.secret_key = item.secret_key;
      this.algorithm = item.algorithm || 'SHA1';
      this.digits = Number(item.digits) || 6;
      this.period = Number(item.period) || 30;
      this.issuer = '';
      this.username = '';
      this.showQRResult = false;
      this.tokenHistoryClearPending = false;
      this.update();
      this.showMessage(i18n.t('historyActivated'));
    },
    requestClearTokenHistory() {
      if (!this.tokenHistoryClearPending) {
        this.tokenHistoryClearPending = true;
        window.clearTimeout(this.tokenHistoryClearTimeout);
        this.tokenHistoryClearTimeout = window.setTimeout(() => { this.tokenHistoryClearPending = false; }, 3000);
        return;
      }
      window.clearTimeout(this.tokenHistoryClearTimeout);
      window.clearTimeout(this.tokenHistorySaveTimeout);
      this.tokenHistory = [];
      this.tokenHistoryClearPending = false;
      sessionStorage.removeItem('totp_token_history');
      this.showMessage(i18n.t('historyCleared'));
    },
    renderQRCode(uri) {
      this.generatedQRUrl = uri;
      var qr = qrcode(0, 'M');
      qr.addData(uri);
      qr.make();
      this.qrImageDataUrl = qr.createDataURL(6, 12);
    },
    generateQRCode() {
      if (!this.hasValidSecret || !this.issuer.trim() || !this.username.trim()) {
        this.showMessage(i18n.t('fillAllFields'));
        return;
      }
      var issuer = this.issuer.trim();
      var account = this.username.trim();
      var uri = 'otpauth://totp/' + encodeURIComponent(issuer + ':' + account) + '?secret=' + encodeURIComponent(stripSpaces(this.secret_key)) +
        '&issuer=' + encodeURIComponent(issuer) + '&algorithm=' + encodeURIComponent(this.algorithm) + '&digits=' + Number(this.digits) + '&period=' + Number(this.period);
      this.renderQRCode(uri);
      this.showQRResult = true;
      this.showMessage(i18n.t('qrGenerated'));
    },
    copyQRUri() {
      if (this.generatedQRUrl) this.copyText(this.generatedQRUrl, i18n.t('uriCopied'));
    }
  },
  watch: {
    secret_key() { this.saveToStorage(); this.scheduleTokenHistoryRecord(); },
    digits() { this.saveToStorage(); this.showQRResult = false; this.scheduleTokenHistoryRecord(); },
    period() { this.saveToStorage(); this.showQRResult = false; this.scheduleTokenHistoryRecord(); },
    algorithm() { this.saveToStorage(); this.showQRResult = false; this.scheduleTokenHistoryRecord(); }
  }
});

app.mount('#app');
