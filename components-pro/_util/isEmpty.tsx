export default function isEmpty(value: any, allowBlank: boolean = false): boolean {
  return value === null || value === void 0 || (allowBlank ? false : value === '');
}
