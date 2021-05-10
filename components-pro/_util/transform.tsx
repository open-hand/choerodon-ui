export default function transform(value: string, style?: CSSStyleDeclaration): string | undefined {
  if (style) {
    style.transform = value;
    style.webkitTransform = value;
    return;
  }
  return ['-webkit-', '-ms-', ''].map(prefix => `${prefix}transform:${value}`).join(';');
}
