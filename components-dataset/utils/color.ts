import { TinyColor } from '@ctrl/tinycolor';

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
  type: 'linear' | 'radial';
  angle: number;
  stops: GradientStop[];
}

const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;

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

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function parseAngle(value: string): number | undefined {
  const degrees = /^(.*)deg$/i.exec(value);
  if (degrees && numberPattern.test(degrees[1])) {
    const angle = Number(degrees[1]);
    return Number.isFinite(angle) ? normalizeAngle(angle) : undefined;
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
  const match = /^(linear|radial)-gradient\(([\s\S]*)\)$/i.exec(value.trim());
  if (!match) {
    return undefined;
  }
  const parts = splitGradient(match[2]);
  if (!parts) {
    return undefined;
  }
  const type = match[1].toLowerCase() as Gradient['type'];
  let angle = type === 'linear' ? 180 : 0;
  if (type === 'linear') {
    const parsedAngle = parseAngle(parts[0]);
    if (parsedAngle !== undefined) {
      angle = parsedAngle;
      parts.shift();
    }
  } else if (/^(?:(?:circle|ellipse)(?:\s+at\s+(?:center|center\s+center|50%\s+50%))?|at\s+(?:center|center\s+center|50%\s+50%))$/i.test(parts[0])) {
    parts.shift();
  }
  if (parts.length < 2) {
    return undefined;
  }
  const stops: { color: string; position?: number }[] = [];
  for (const part of parts) {
    const positionMatch = /\s+([^\s]+)%$/.exec(part);
    const color = positionMatch ? part.slice(0, positionMatch.index).trim() : part;
    const position = positionMatch ? parseChannel(`${positionMatch[1]}%`, 100) : undefined;
    if (!parseColor(color) || (positionMatch && position === undefined)) {
      return undefined;
    }
    stops.push({ color, position });
  }
  if (stops[0].position === undefined) {
    stops[0].position = 0;
  }
  if (stops[stops.length - 1].position === undefined) {
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
  return { type, angle, stops: stops as GradientStop[] };
}

export function serializeGradient(value: Gradient): string | undefined {
  if (!value || (value.type !== 'linear' && value.type !== 'radial') || !Number.isFinite(value.angle) ||
    !Array.isArray(value.stops) || value.stops.length < 2) {
    return undefined;
  }
  let previous = 0;
  const stops: string[] = [];
  for (const stop of value.stops) {
    const color = stop && parseColor(stop.color);
    if (!color || !Number.isFinite(stop.position) || stop.position < previous || stop.position > 100) {
      return undefined;
    }
    previous = stop.position;
    stops.push(`${formatColor(color)} ${stop.position}%`);
  }
  const direction = value.type === 'linear' ? `${normalizeAngle(value.angle)}deg` : 'at center';
  return `${value.type}-gradient(${direction}, ${stops.join(', ')})`;
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
