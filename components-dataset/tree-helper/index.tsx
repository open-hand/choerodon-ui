export function treeReduce<U, T>(
  nodes: T[],
  fn: (previousValue: U, node: T, index: number, parentNode?: T) => U,
  initialValue: U,
  childName = 'children',
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

export function treeMap<T>(
  nodes: T[],
  fn: (node: T, index: number, parentNode?: T) => T,
  sortFn?: (a: T, b: T) => number,
  childName = 'children',
  parentNode?: T,
): T[] {
  const newNodes: T[] = nodes.map((node, index) => {
    const newNode = fn(node, index, parentNode);
    const children = node[childName];
    if (children && children.length) {
      newNode[childName] = treeMap<T>(children, fn, sortFn, childName, node);
    }
    return newNode;
  });
  if (sortFn) {
    newNodes.sort(sortFn);
  }
  return newNodes;
}

export function treeForEach<T>(
  nodes: T[],
  fn: (node: T, index: number, parentNode?: T) => void,
  childName = 'children',
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
  childName = 'children',
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
  childName = 'children',
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

export default {
  treeReduce,
  treeForEach,
  treeFind,
  treeSome,
  treeMap,
};
