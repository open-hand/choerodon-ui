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
