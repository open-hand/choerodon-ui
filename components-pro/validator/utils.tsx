export function inject(msg?: string, injectionOptions?: object): string | undefined {
  if (msg && injectionOptions) {
    msg = (msg as string).replace(/\{([^{]+)\}/g, (matches) => injectionOptions[matches.slice(1, matches.length - 1)]);
  }
  return msg;
}
