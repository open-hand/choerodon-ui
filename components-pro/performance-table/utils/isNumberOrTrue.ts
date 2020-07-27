export default function isNumberOrTrue(value: number | boolean | undefined): boolean {
  return !!value || value === 0;
}
