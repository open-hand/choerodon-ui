declare module 'component-classes';

declare module 'css-animation';

declare module 'css-unit-converter';

declare module 'array-tree-filter';

declare module 'react-lazy-load';

declare module 'dom-closest';

declare module 'rc-motion';

declare module 'shallowequal' {
  export default function (obj1: object | null | undefined, obj2: object | null | undefined): boolean;
}

declare module 'dom-lib';

declare module 'dom-lib/lib/transition/translateDOMPositionXY';

declare module 'lodash/noop' {
  export default function (...args: any[]): any;
}

declare module '*.json' {
  const value: any;
  export const version: string;
  export default value;
}
