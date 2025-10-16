export default function contains(root, n) {
  if (root) {
    let node = n;
    while (node) {
      if (node === root || (root.contains && root.contains(node))) {
        return true;
      }
      node = node.parentNode;
    }
  }
  return false;
}
