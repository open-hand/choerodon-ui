export const matchMediaPolifill = (mediaQuery: string) => {
  // console.warn('`matchMedia` is not supported!');
  return {
    media: mediaQuery,
    matches: false,
    addListener() {},
    removeListener() {},
  }
};
