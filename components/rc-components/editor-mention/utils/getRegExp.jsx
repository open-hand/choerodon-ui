
export default function getRegExp(prefix) {
  const prefixArray = Array.isArray(prefix) ? prefix : [prefix];
  let prefixToken = prefixArray.join('').replace(/(\$|\^)/g, '\\$1');

  if (prefixArray.length > 1) {
    prefixToken = `[${prefixToken}]`;
  }

  return new RegExp(`(\\s|^)(${prefixToken})[^\\s]*`, 'g');
}
