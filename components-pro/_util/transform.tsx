import isEmpty from './isEmpty';

export function toTransformValue(value: { [key: string]: string | number | undefined | null }): string {
  return Object.keys(value).reduce<string[]>((values, key) => {
    const v = value[key];
    if (!isEmpty(v)) {
      values.push(`${key}(${v})`);
    }
    return values;
  }, []).join(' ');
}

export default function transform(value: string, style?: CSSStyleDeclaration): string | undefined {
  if (style) {
    style.transform = value;
    style.webkitTransform = value;
    return;
  }
  return ['-webkit-', '-ms-', ''].map(prefix => `${prefix}transform:${value}`).join(';');
}
