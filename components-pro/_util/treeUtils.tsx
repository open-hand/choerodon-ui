export function treeReduce<U, T>(
  nodes: T[],
  fn: (previousValue: U, node: T, index: number, parentNode?: T) => U,
  initialValue: U,
  childName: string = 'children',
  parentNode?: T,
): U {
  return nodes.reduce<U>((previousValue, node, index) => {
    const newValue = fn(previousValue, node, index, parentNode);
    const children = node[childName];
    if (children && children.length) {
      return treeReduce(children, fn, newValue, childName, node);
    }
    return newValue;
  }, initialValue);
}

export function treeForEach<T>(
  nodes: T[],
  fn: (node: T, index: number, parentNode?: T) => void,
  childName: string = 'children',
  parentNode?: T,
): void {
  nodes.forEach((node, index) => {
    fn(node, index, parentNode);
    const children = node[childName];
    if (children && children.length) {
      treeForEach(children, fn, childName, node);
    }
  });
}

export function treeSome<T>(
  nodes: T[],
  fn: (node: T, index: number, parentNode?: T) => boolean,
  childName: string = 'children',
  parentNode?: T,
): boolean {
  return nodes.some((node, index) => {
    if (!fn(node, index, parentNode)) {
      const children = node[childName];
      if (children && children.length) {
        return treeSome<T>(children, fn, childName, node);
      }
    }
    return true;
  });
}

export function treeFind<T>(
  nodes: T[],
  fn: (node: T, index: number, parentNode?: T) => unknown,
  childName: string = 'children',
  parentNode?: T,
): T | undefined {
  let result: T | undefined;
  nodes.some((node, index) => {
    const found = fn(node, index, parentNode);
    if (found) {
      result = node;
      return true;
    }
    const children = node[childName];
    if (children && children.length) {
      const foundChild = treeFind<T>(children, fn, childName, node);
      if (foundChild) {
        result = foundChild;
        return true;
      }
    }
    return false;
  });
  return result;
}
