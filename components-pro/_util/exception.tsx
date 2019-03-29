import isString from 'lodash/isString';

export default (e?: string | Error | { message }, defaultMessage?: string): string | undefined => {
  if (isString(e)) {
    defaultMessage = e;
  } else if (e instanceof Error) {
    defaultMessage = e.message;
  } else if (e && e.message) {
    defaultMessage = e.message;
  }
  if (typeof console !== 'undefined') {
    console.error(e);
  }
  return defaultMessage;
};
