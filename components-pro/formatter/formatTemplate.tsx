const nargs = /\{([0-9a-zA-Z_]+)\}/g;


export default function formatTemplate(string: string, args: object | any[], lazy?: boolean) {

  return string.replace(nargs, (match, i, index) => {
    if (string[index - 1] === '{' &&
      string[index + match.length] === '}') {
      return i;
    }
    const has = Object.hasOwnProperty.call(args, i);
    if (has) {
      const result = has ? args[i] : null;
      if (result === null || result === undefined) {
        return '';
      }

      return result;
    }
    return lazy ? `{${i}}` : '';
  });
}
