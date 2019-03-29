declare module 'css-animation';

declare module 'array-tree-filter';

declare module 'react-lazy-load';

declare module 'dom-closest';

declare module 'lodash/noop' {
  const noop: (...args: any[]) => any;
  export default noop;
}

declare module '*.json' {
  const value: any;
  export const version: string;
  export default value;
}
