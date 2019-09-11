export default function isEmpty(value: any, allowBlank: boolean = false): boolean {
  return value === null || value === undefined || (allowBlank ? false : value === '');
}
