const selector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable], audio[controls], video[controls], summary, [tabindex^="0"], [tabindex^="1"], [tabindex^="2"], [tabindex^="3"], [tabindex^="4"], [tabindex^="5"], [tabindex^="6"], [tabindex^="7"], [tabindex^="8"], [tabindex^="9"]';

export default function focusable(node: HTMLElement): boolean {
  return ['matches', 'msMatchesSelector', 'webkitMatchesSelector', 'mozMatchesSelector']
    .some(method => method in node && node[method](selector));
}

export function findFirstFocusableElement(node: HTMLElement): HTMLElement | null {
  return node.querySelector(selector);
}

export function findFocusableElements(node: HTMLElement): HTMLElement[] {
  return Array.from<HTMLElement>(node.querySelectorAll(selector));
}

export function findFocusableParent(node: Element, root?: HTMLElement | undefined | null): HTMLElement | null {
  const { parentElement } = node;
  if (parentElement) {
    if (focusable(parentElement)) {
      return parentElement;
    }
    if (root && parentElement === root) {
      return null;
    }
    return findFocusableParent(parentElement, root);
  }
  return null;
}
