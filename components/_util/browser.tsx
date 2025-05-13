declare global {
  interface Window {
    ActiveXObject: any;
  }
}

export function isIE(): boolean {
  if (window && !!window.ActiveXObject || 'ActiveXObject' in window) {
    return true;
  }
  return false;
}

export function isChrome(): boolean {
  if (typeof window !== 'undefined') {
    const win: any = window;
    return !!win.chrome; // && !!win.chrome.webstore;
  }
  return false;
}

export function isSafari(): boolean {
  return /Safari/i.test(navigator.userAgent);
}

export function isWeChat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

/**
 * 只需要判断是不是 ie 11 以下 所以不处理其他的浏览器
 * 获取ie的版本信息 如果返回 -1 则不是ie浏览器
 */
export function getIeVersion(): number {
  const { userAgent } = navigator; // 取得浏览器的userAgent字符串
  if (userAgent.match(/rv:([\d.]+)\) like Gecko/)) {
    return 11;
  }
  const match = userAgent.match(/MSIE ([\d.]+)/);
  if (match && match[1]) {
    return +match[1];
  }
  return -1;
}

let browserInfoCache: { browser?: string; majorVersion?: number } | null = null;

/**
 * 获取浏览器名称和主版本号
 * @returns 
 */
export function getBrowserInfo(): { browser?: string; majorVersion?: number } {
  if (typeof navigator === 'undefined') return {};
  if (browserInfoCache) return browserInfoCache;
  const ua = navigator.userAgent;
  let browser;
  let majorVersion;

  const browsers = [
    { name: 'Edge', regex: /Edg\/([\d.]+)/ },
    { name: 'Chrome', regex: /Chrome\/([\d.]+)/ },
    { name: 'Firefox', regex: /Firefox\/([\d.]+)/ },
    { name: 'Safari', regex: /Version\/([\d.]+).*Safari/ },
    { name: 'IE', regex: /MSIE ([\d.]+)/ },
    { name: 'IE', regex: /Trident\/.*rv:(\d+\.\d+)/ },
  ];

  for (const { name, regex } of browsers) {
    const match = ua.match(regex);
    if (match) {
      browser = name;
      majorVersion = parseInt(match[1].split('.')[0], 10);
      break;
    }
  }
  browserInfoCache = { browser, majorVersion };
  return browserInfoCache;
}
