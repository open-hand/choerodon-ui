export default function findFirstFocusableElement(node: HTMLElement): HTMLElement | undefined {
  if (node.children) {
    let found: HTMLElement | undefined;
    [...(node.children as HTMLCollectionOf<HTMLElement>)].some(child => {
      if (child.offsetParent) {
        if (child.tabIndex > -1) {
          found = child;
        } else {
          found = findFirstFocusableElement(child);
        }
      }
      return !!found;
    });
    return found;
  }
}
