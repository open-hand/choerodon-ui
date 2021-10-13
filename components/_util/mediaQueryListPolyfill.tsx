export const matchMediaPolifill = (mediaQuery: string): Partial<MediaQueryList> => {
  // console.warn('`matchMedia` is not supported!');
  return {
    media: mediaQuery,
    matches: false,
    addListener(): void {/* noop */},
    removeListener(): void {/* noop */},
  }
};
