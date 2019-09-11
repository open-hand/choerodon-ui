import { Children, isValidElement, Key, ReactElement, ReactNode } from 'react';

export function toArrayChildren(children: ReactNode): ReactElement<any>[] {
  const ret: ReactElement<any>[] = [];
  Children.forEach(children, child => {
    if (isValidElement(child)) {
      ret.push(child);
    }
  });
  return ret;
}

export function findChildInChildrenByKey(
  children: ReactElement<any>[],
  key: Key | null,
): ReactElement<any> | undefined {
  if (children) {
    return children.find(child => child && child.key === key);
  }
}

export function findShownChildInChildrenByKey(
  children: ReactElement<any>[],
  key: Key | null,
  hiddenProp: string,
): ReactElement<any> | undefined {
  let ret: ReactElement<any> | undefined;
  if (children) {
    children.forEach(child => {
      if (child && child.key === key && !child.props[hiddenProp]) {
        if (ret) {
          throw new Error('two child with same key for animate children');
        }
        ret = child;
      }
    });
  }
  return ret;
}

// export function findHiddenChildInChildrenByKey(children, key, showProp):boolean {
//   let found = false;
//   if (children) {
//     children.forEach(function (child) {
//       if (found) {
//         return;
//       }
//       found = child && child.key === key && !child.props[showProp];
//     });
//   }
//   return found;
// }

export function isSameChildren(
  c1: ReactElement<any>[],
  c2: ReactElement<any>[],
  hiddenProp?: string,
): boolean {
  let same = c1.length === c2.length;
  if (same) {
    c1.forEach((child, index) => {
      const child2 = c2[index];
      if (child && child2) {
        if ((child && !child2) || (!child && child2)) {
          same = false;
        } else if (child.key !== child2.key) {
          same = false;
        } else if (hiddenProp && child.props[hiddenProp] !== child2.props[hiddenProp]) {
          same = false;
        }
      }
    });
  }
  return same;
}

export function mergeChildren(
  prev: ReactElement<any>[],
  next: ReactElement<any>[],
): ReactElement<any>[] {
  let ret: ReactElement<any>[] = [];
  const nextChildrenPending: { [key: string]: ReactElement<any>[] } = {};
  let pendingChildren: ReactElement<any>[] = [];
  prev.forEach(child => {
    if (child && child.key && findChildInChildrenByKey(next, child.key)) {
      if (pendingChildren.length) {
        nextChildrenPending[child.key] = pendingChildren;
        pendingChildren = [];
      }
    } else {
      pendingChildren.push(child);
    }
  });

  next.forEach(child => {
    if (child && child.key && {}.hasOwnProperty.call(nextChildrenPending, child.key)) {
      ret = ret.concat(nextChildrenPending[child.key]);
    }
    ret.push(child);
  });

  return ret.concat(pendingChildren);
}
