import { CSSProperties } from 'react';

let _context: CanvasRenderingContext2D;
const FONT_KEYS = [
  'fontWeight',
  'fontStyle',
  // 'fontVariant',
  'fontSize',
  'fontFamily',
];
const TEXT_STYLE_KEYS = [
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'fontVariantCaps',
  'fontKerning',
  'fontStretch',
  'textRendering',
];

const fontStretchValues = {
  '100%': 'normal',
  '50%': 'ultra-condensed',
  '62.5%': 'extra-condensed',
  '75%': 'condensed',
  '87.5%': 'semi-condensed',
  '112.5%': 'semi-expanded',
  '125%': 'expanded',
  '150%': 'extra-expanded',
  '200%': 'ultra-expanded',
};

const textRenderingValues = {
  optimizespeed: 'optimizeSpeed',
  optimizelegibility: 'optimizeLegibility',
  geometricprecision: 'geometricPrecision',
}

function getCanvasContext() {
  if (!_context) {
    _context = document.createElement('canvas').getContext('2d')!;
  }
  return _context;
}

function getCanvasTextStyle(style: CSSProperties | CSSStyleDeclaration = getComputedStyle(document.body)) {
  let font = '';
  const textStyle = {};
  FONT_KEYS.forEach((k: string) => {
    font += ` ${style[k]}`;
  });
  TEXT_STYLE_KEYS.forEach((k: string) => {
    const styleKey = style[k];
    if (k === 'fontStretch') {
      textStyle[k] = fontStretchValues[styleKey] || styleKey;
    } else if (k === 'textRendering') {
      textStyle[k] = textRenderingValues[styleKey] || styleKey;
    } else {
      textStyle[k] = styleKey;
    }
  });
  return { ...textStyle, font: font.trim() };
}

export default function measureTextWidth(text: string, style?: CSSProperties | CSSStyleDeclaration) {
  if (isFirefox()) {
    // firefox 使用 canvas 测量文本宽度不准确, 使用原始方法测量
    return measureTextWidthFirefox(text, style);
  }
  let width = 0;
  if (typeof window !== undefined) {
    const { tabSize = 8 } = style || getComputedStyle(document.body);
    const tabSpace = ' '.repeat(Number(tabSize));
    const ctx = getCanvasContext();
    Object.assign(ctx, getCanvasTextStyle(style));
    width = ctx.measureText(text.replace(/\t/g, tabSpace)).width;
  }
  return width;
}

function isFirefox() {
  return typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') !== -1;
}

function measureTextWidthFirefox(text: string, style?: CSSProperties | CSSStyleDeclaration) {
  if (typeof window !== 'undefined') {
    const span = document.createElement('span');
    span.style.cssText = 'position: absolute;top: -9999px;display: inline-block';
    span.innerHTML = text.replace(/\s/g, '&nbsp;');
    if (style) {
      ['font', 'fontSize', 'letterSpacing', 'wordSpacing', 'textTransform'].forEach((property) => {
        if (property in style) {
          span.style[property] = style[property];
        }
      });
    }
    document.body.appendChild(span);
    const { width } = getComputedStyle(span);
    const contentWidth = style && style.width && style.width !== 'auto' ? parseFloat(width) : span.offsetWidth;
    document.body.removeChild(span);
    return contentWidth;
  }
  return 0;
}
