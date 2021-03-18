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
) {
  nodes.forEach((node, index) => {
    fn(node, index, parentNode);
    const children = node[childName];
    if (children && children.length) {
      treeForEach(children, fn, childName, node);
    }
  });
}
