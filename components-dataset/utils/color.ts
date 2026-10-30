import { TinyColor, names } from '@ctrl/tinycolor';

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface Gradient {
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  stops: GradientStop[];
  repeating?: boolean;
  position?: string;
  stopUnit?: string;
}

const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
const lengthUnitPattern = /^(?:px|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|q|in|pt|pc)$/i;

function parseChannel(value: string, maximum: number): number | undefined {
  const percentage = value.endsWith('%');
  const number = percentage ? value.slice(0, -1) : value;
  if (!numberPattern.test(number)) {
    return undefined;
  }
  const result = Number(number);
  if (!Number.isFinite(result) || result < 0 || result > (percentage ? 100 : maximum)) {
    return undefined;
  }
  return percentage ? result * maximum / 100 : result;
}

export function parseColor(value: unknown): Color | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const input = value.trim();
  const hex = /^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec(input);
  if (hex) {
    const digits = hex[1].length <= 4 ? hex[1].split('').map(char => char + char).join('') : hex[1];
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    };
  }
  const rgb = /^(rgb|rgba)\(([^()]*)\)$/i.exec(input);
  if (!rgb) {
    return undefined;
  }
  const body = rgb[2].trim();
  let channels: string[];
  if (body.includes(',')) {
    channels = body.split(',').map(channel => channel.trim());
    if (channels.length !== (rgb[1].toLowerCase() === 'rgba' ? 4 : 3)) {
      return undefined;
    }
  } else {
    const parts = body.split('/');
    if (parts.length > 2) {
      return undefined;
    }
    channels = parts[0].trim().split(/\s+/);
    if (channels.length !== 3) {
      return undefined;
    }
    if (parts.length === 2) {
      channels.push(parts[1].trim());
    }
  }
  const r = parseChannel(channels[0], 255);
  const g = parseChannel(channels[1], 255);
  const b = parseChannel(channels[2], 255);
  const a = channels.length === 4 ? parseChannel(channels[3], 1) : 1;
  if (r === undefined || g === undefined || b === undefined || a === undefined) {
    return undefined;
  }
  return { r, g, b, a };
}

function formatColor(color: Color): string {
  const value = new TinyColor(color);
  return color.a === 1 ? value.toHexString() : value.toHex8String();
}

function splitGradient(value: string): string[] | undefined {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth < 0) {
        return undefined;
      }
    } else if (char === ',' && depth === 0) {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return depth === 0 && parts.every(part => part.length > 0) ? parts : undefined;
}

export function isColorExpression(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const input = value.trim();
  if (parseColor(input) || input.toLowerCase() === 'transparent' ||
    Object.prototype.hasOwnProperty.call(names, input.toLowerCase())) {
    return true;
  }
  const oklch = /^oklch\(([^()]*)\)$/i.exec(input);
  if (oklch) {
    const parts = oklch[1].split('/');
    const channels = parts[0].trim().split(/\s+/);
    const validChannel = (channel: string) => channel.toLowerCase() === 'none' ||
      (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%?$/i.test(channel) &&
        Number.isFinite(Number(channel.replace(/%$/, ''))));
    const hue = channels[2];
    return parts.length <= 2 && channels.length === 3 && channels.slice(0, 2).every(validChannel) &&
      (hue.toLowerCase() === 'none' ||
        (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?(?:deg|grad|rad|turn)?$/i.test(hue) &&
          Number.isFinite(Number(hue.replace(/(?:deg|grad|rad|turn)$/i, ''))))) &&
      (parts.length === 1 || validChannel(parts[1].trim()));
  }
  const p3 = /^color\(\s*display-p3\s+([^()]*)\)$/i.exec(input);
  if (p3) {
    const parts = p3[1].split('/');
    const channels = parts[0].trim().split(/\s+/);
    const validChannel = (channel: string) =>
      /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?%?$/i.test(channel) &&
      Number.isFinite(Number(channel.replace(/%$/, '')));
    return parts.length <= 2 && channels.length === 3 && channels.every(validChannel) &&
      (parts.length === 1 || validChannel(parts[1].trim()));
  }
  const variable = /^var\(([\s\S]*)\)$/i.exec(input);
  if (variable) {
    const parts = splitGradient(variable[1]);
    return !!parts && parts.length <= 2 && /^--[\w\u0080-\uFFFF-]+$/.test(parts[0]) &&
      (parts.length === 1 || isColorExpression(parts[1]));
  }
  return false;
}

function splitGradientStop(value: string): [string, string] | undefined {
  let depth = 0;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char === '(') {
      depth += 1;
    } else if (char === ')') {
      depth -= 1;
      if (depth < 0) {
        return undefined;
      }
    } else if (/\s/.test(char) && depth === 0) {
      return [value.slice(0, index), value.slice(index).trim()];
    }
  }
  return depth === 0 ? [value, ''] : undefined;
}

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function parseAngleValue(value: string): number | undefined {
  const match = /^(.*?)(deg|grad|rad|turn)$/i.exec(value);
  if (!match || !numberPattern.test(match[1])) {
    return undefined;
  }
  const factors = { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };
  const angle = Number(match[1]) * factors[match[2].toLowerCase()];
  return Number.isFinite(angle) ? angle : undefined;
}

function parseGradientPosition(value: string): string | undefined {
  const parts = value.toLowerCase().trim().split(/\s+/);
  if (parts.length < 1 || parts.length > 2 || !parts.every(part =>
    /^(?:center|left|right|top|bottom)$/.test(part) ||
    (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:%|px|em|rem|vh|vw)$/.test(part) && Number.isFinite(parseFloat(part))) || part === '0')) {
    return undefined;
  }
  if (parts.length === 2 && (/^(?:left|right)$/.test(parts[0]) && /^(?:left|right)$/.test(parts[1]) ||
    /^(?:top|bottom)$/.test(parts[0]) && /^(?:top|bottom)$/.test(parts[1]) ||
    /^(?:top|bottom)$/.test(parts[0]) && !/^(?:left|right|center)$/.test(parts[1]) ||
    !/^(?:top|bottom|center)$/.test(parts[0]) && /^(?:left|right)$/.test(parts[1]))) {
    return undefined;
  }
  return parts.join(' ');
}

function parseAngle(value: string): number | undefined {
  const angle = parseAngleValue(value);
  if (angle !== undefined) {
    return normalizeAngle(angle);
  }
  const direction = /^to\s+(top|bottom|left|right)(?:\s+(top|bottom|left|right))?$/i.exec(value);
  if (!direction) {
    return undefined;
  }
  const first = direction[1].toLowerCase();
  const second = direction[2] && direction[2].toLowerCase();
  const angles = { top: 0, right: 90, bottom: 180, left: 270 };
  if (!second) {
    return angles[first];
  }
  if ((first === 'top' || first === 'bottom') === (second === 'top' || second === 'bottom')) {
    return undefined;
  }
  const vertical = first === 'top' || second === 'top' ? 'top' : 'bottom';
  const horizontal = first === 'right' || second === 'right' ? 'right' : 'left';
  return vertical === 'top' ? (horizontal === 'right' ? 45 : 315) : (horizontal === 'right' ? 135 : 225);
}

export function parseGradient(value: unknown): Gradient | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const match = /^(repeating-)?(linear|radial|conic)-gradient\(([\s\S]*)\)$/i.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const parts = splitGradient(match[3]);
  if (!parts) {
    return undefined;
  }
  const type = match[2].toLowerCase() as Gradient['type'];
  let angle = type === 'linear' ? 180 : 0;
  let position: string | undefined;
  if (type === 'linear') {
    const parsedAngle = parseAngle(parts[0]);
    if (parsedAngle !== undefined) {
      angle = parsedAngle;
      parts.shift();
    }
  } else if (type === 'conic') {
    const direction = /^(?:from\s+(\S+)(?:\s+at\s+([\s\S]+))?|at\s+([\s\S]+))$/i.exec(parts[0]);
    if (direction) {
      if (direction[1]) {
        const parsedAngle = parseAngleValue(direction[1]);
        if (parsedAngle === undefined) {
          return undefined;
        }
        angle = normalizeAngle(parsedAngle);
      }
      const center = direction[2] || direction[3];
      if (center) {
        position = parseGradientPosition(center);
        if (position === undefined) {
          return undefined;
        }
      }
      parts.shift();
    }
  } else if (/^(?:(?:circle|ellipse)(?:\s+at\s+(?:center|center\s+center|50%\s+50%))?|at\s+(?:center|center\s+center|50%\s+50%))$/i.test(parts[0])) {
    parts.shift();
  }
  if (parts.length < 2) {
    return undefined;
  }
  const stops: { color: string; position?: number }[] = [];
  let stopUnit: string | undefined;
  for (const part of parts) {
    const stopMatch = splitGradientStop(part);
    if (!stopMatch) {
      return undefined;
    }
    const inputColor = stopMatch[0];
    const colorName = inputColor.toLowerCase();
    const color = colorName === 'transparent' ? '#00000000' :
      Object.prototype.hasOwnProperty.call(names, colorName) ? new TinyColor(inputColor).toHexString() : inputColor;
    const positions = stopMatch[1] ? stopMatch[1].split(/\s+/) : [];
    if (positions.length > (type === 'conic' ? 2 : 1)) {
      return undefined;
    }
    if (!isColorExpression(color)) {
      return undefined;
    }
    if (positions.length) {
      for (const token of positions) {
        const length = type !== 'conic' && /^([+-]?(?:\d+(?:\.\d*)?|\.\d+))([a-z]+)$/i.exec(token);
        const degrees = type === 'conic' && !token.endsWith('%') ? parseAngleValue(token) : undefined;
        const unit = length ? length[2].toLowerCase() : '%';
        const stopPosition = length ? Number(length[1]) : degrees === undefined ? parseChannel(token, 100) : degrees / 360 * 100;
        if (stopPosition === undefined || !Number.isFinite(stopPosition) || stopPosition < 0 ||
          (length ? !lengthUnitPattern.test(unit) : stopPosition > 100 ||
            (!token.endsWith('%') && degrees === undefined && token !== '0'))) {
          return undefined;
        }
        if (token !== '0') {
          if (stopUnit !== undefined && stopUnit !== unit) {
            return undefined;
          }
          stopUnit = unit;
        }
        stops.push({ color, position: stopPosition });
      }
    } else {
      stops.push({ color });
    }
  }
  if (stops[0].position === undefined) {
    stops[0].position = 0;
  }
  if (stops[stops.length - 1].position === undefined) {
    if (stopUnit && stopUnit !== '%') {
      return undefined;
    }
    stops[stops.length - 1].position = 100;
  }
  let anchor = 0;
  for (let index = 1; index < stops.length; index += 1) {
    const position = stops[index].position;
    if (position !== undefined) {
      const previous = stops[anchor].position as number;
      const end = Math.max(previous, position);
      stops[index].position = end;
      for (let offset = anchor + 1; offset < index; offset += 1) {
        stops[offset].position = previous + (end - previous) * (offset - anchor) / (index - anchor);
      }
      anchor = index;
    }
  }
  const gradient: Gradient = { type, angle, stops: stops as GradientStop[] };
  if (stopUnit && stopUnit !== '%') {
    gradient.stopUnit = stopUnit;
  }
  if (match[1]) {
    gradient.repeating = true;
  }
  if (position !== undefined) {
    gradient.position = position;
  }
  return gradient;
}

export function serializeGradient(value: Gradient): string | undefined {
  if (!value || (value.type !== 'linear' && value.type !== 'radial' && value.type !== 'conic') ||
    !Number.isFinite(value.angle) || !Array.isArray(value.stops) || value.stops.length < 2 ||
    (value.repeating !== undefined && typeof value.repeating !== 'boolean')) {
    return undefined;
  }
  let position: string | undefined;
  if (value.position !== undefined) {
    if (value.type !== 'conic' || typeof value.position !== 'string') {
      return undefined;
    }
    position = parseGradientPosition(value.position);
    if (position === undefined) {
      return undefined;
    }
  }
  const stopUnit = value.stopUnit === undefined ? '%' : value.stopUnit;
  if (typeof stopUnit !== 'string' || (stopUnit !== '%' &&
    (value.type === 'conic' || !lengthUnitPattern.test(stopUnit)))) {
    return undefined;
  }
  let previous = 0;
  const stops: string[] = [];
  for (const stop of value.stops) {
    const color = stop && parseColor(stop.color);
    if (!stop || (!color && !isColorExpression(stop.color)) || !Number.isFinite(stop.position) || stop.position < previous ||
      (stopUnit === '%' && stop.position > 100)) {
      return undefined;
    }
    previous = stop.position;
    const outputColor = color ? formatColor(color) : /^(?:color|var)\(/i.test(stop.color.trim())
      ? stop.color.trim() : formatColor(new TinyColor(stop.color).toRgb());
    stops.push(`${outputColor} ${Number(stop.position.toFixed(2))}${stopUnit.toLowerCase()}`);
  }
  let direction = 'at center';
  if (value.type === 'linear') {
    direction = `${normalizeAngle(value.angle)}deg`;
  } else if (value.type === 'conic') {
    direction = `from ${normalizeAngle(value.angle)}deg${position ? ` at ${position}` : ''}`;
  }
  return `${value.repeating ? 'repeating-' : ''}${value.type}-gradient(${direction}, ${stops.join(', ')})`;
}

export function mixWithWhite(value: unknown, amount = 0.5): string | undefined {
  const color = parseColor(value);
  if (!color || !Number.isFinite(amount) || amount < 0 || amount > 1) {
    return undefined;
  }
  const channels = [color.r, color.g, color.b].map(channel => Math.round(channel + (255 - channel) * amount));
  return formatColor({ ...color, r: channels[0], g: channels[1], b: channels[2] });
}

export function isColorValue(value: unknown): value is string {
  return parseColor(value) !== undefined || parseGradient(value) !== undefined;
}
