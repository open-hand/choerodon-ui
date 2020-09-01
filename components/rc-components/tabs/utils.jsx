import { Children } from 'react';
import isNil from 'lodash/isNil';

export function toArray (children) {
  const c = [];
  Children.forEach(children, child => {
    if (child) {
      c.push(child);
    }
  });
  return c;
}

export function generateKey (key, index) {
  return String(isNil(key) ? index : key);
}

export function getActiveIndex (children, activeKey) {
  const c = toArray(children);
  return c.findIndex((child, index) => generateKey(child.key, index) === activeKey);
}

export function getActiveKey (children, index) {
  const c = toArray(children);
  return generateKey(c[index].key, index);
}

export function setTransform (style, v) {
  style.transform = v;
  style.webkitTransform = v;
  style.mozTransform = v;
}

export function isTransformSupported (style) {
  return 'transform' in style ||
    'webkitTransform' in style ||
    'MozTransform' in style;
}

export function setTransition (style, v) {
  style.transition = v;
  style.webkitTransition = v;
  style.MozTransition = v;
}

export function getTransformPropValue (v) {
  return {
    transform: v,
    WebkitTransform: v,
    MozTransform: v,
  };
}

export function isVertical (tabBarPosition) {
  return tabBarPosition === 'left' || tabBarPosition === 'right';
}

export function getTransformByIndex (index, tabBarPosition) {
  const translate = isVertical(tabBarPosition) ? 'translateY' : 'translateX';
  return `${translate}(${-index * 100}%) translateZ(0)`;
}

export function getMarginStyle (index, tabBarPosition) {
  const marginDirection = isVertical(tabBarPosition) ? 'marginTop' : 'marginLeft';
  return {
    [marginDirection]: `${-index * 100}%`,
  };
}

export function getStyle (el, property) {
  return +getComputedStyle(el).getPropertyValue(property).replace('px', '');
}

export function setPxStyle (el, value, vertical) {
  value = vertical ? `0px, ${value}px, 0px` : `${value}px, 0px, 0px`;
  setTransform(el.style, `translate3d(${value})`);
}

export function getDataAttr (props) {
  return Object.keys(props).reduce((prev, key) => {
    if (key.substr(0, 5) === 'aria-' || key.substr(0, 5) === 'data-' || key === 'role') {
      prev[key] = props[key];
    }
    return prev;
  }, {});
}

function toNum (style, property) {
  return +style.getPropertyValue(property).replace('px', '');
}

function getTypeValue (start, current, end, tabNode, wrapperNode) {
  let total = getStyle(wrapperNode, `padding-${start}`);
  const { childNodes } = tabNode.parentNode;
  Array.prototype.some.call(childNodes, (node) => {
    if (node !== tabNode) {
      // 此处对代码进行了修改 取自rc-tabs@9.4.2 这版本进行了计算方式的调整,避免了在类似modal等有动画的内容中使用的时候，计算出现错误的问题，因为在动画过程中的计算，会有一次Height width为0的情况
      // 在 9.4.2版本中 因为前几个版本的修改 refactor: rm mixin and react-create-class 
      // 对dom结构进行了调整 bar不与item在一个父元素中,因此有如下代码，在c7n中暂时不进行dom结构调整
      if (node.className.includes('ink-bar')) {
        return false;
      }
      const style = getComputedStyle(node);
      total += toNum(style, `margin-${start}`);
      total += toNum(style, `margin-${end}`);
      total += toNum(style, current);

      if (style.boxSizing === 'content-box') {
        total += toNum(style, `border-${start}-width`) + toNum(style, `padding-${start}`) +
          toNum(style, `border-${end}-width`) + toNum(style, `padding-${end}`);
      }
      return false;
    }
    return true;
  });

  return total;
}

export function getLeft (tabNode, wrapperNode) {
  return getTypeValue('left', 'width', 'right', tabNode, wrapperNode);
}

export function getTop (tabNode, wrapperNode) {
  const top = getTypeValue('top', 'height', 'bottom', tabNode, wrapperNode);
  const height = getStyle(tabNode.parentNode, 'height');
  return top - height;
}
