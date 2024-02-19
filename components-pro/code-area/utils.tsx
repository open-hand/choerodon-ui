/**
 * 去除字符串中所有不可打印字符并返回结果
 *
 * @param {string} text 可能含有不可打印字符的字符串
 * @returns {string} 不含不可打印字符的字符串
 */
export function removeUnprintableChar(text: string): string {
  return text.replace(/\s*\n\s*/g, '');
}

/**
 * 判断 target 的祖先中是否有指定类名的元素
 * @param targetElement 
 * @param ancestorClassName 祖先元素类名
 * @returns 
 */
export function hasAncestorWithClassName(targetElement: HTMLElement, ancestorClassName: string) {
  let parent = targetElement.parentElement;
  while (parent) {
    if (parent.classList && parent.classList.contains(ancestorClassName)) {
      return true;
    }
    parent = parent.parentElement;
  }
  return false;
}
