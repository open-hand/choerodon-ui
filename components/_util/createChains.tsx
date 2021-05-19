export default function createChains(newProps, oldProps) {
  const chains = {};
  Object.keys(newProps).forEach((key) => {
    const value = newProps[key];
    const oldValue = oldProps[key];
    if (typeof value === 'function' && typeof oldValue === 'function') {
      chains[key] = (...args) => {
        value(...args);
        return oldValue(...args);
      };
    }
  });
  return {
    ...newProps,
    ...chains,
  };
}
