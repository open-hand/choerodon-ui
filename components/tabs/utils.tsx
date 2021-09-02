import { Children, isValidElement, Key, ReactElement, ReactNode } from 'react';
import { isFragment } from 'react-is';
import isNil from 'lodash/isNil';
import { TabsPosition } from './enum';
import { isTabGroup, TabGroupProps } from './TabGroup';
import { TabPaneProps } from './TabPane';
import { GroupPanelMap } from './Tabs';

export function toGroups(children: ReactNode): ReactElement<TabGroupProps>[] {
  const c: ReactElement<TabGroupProps>[] = [];
  Children.forEach<ReactNode>(children, child => {
    if (child) {
      if (isFragment(child)) {
        c.push(...toGroups(child.props.children));
      } else if (isTabGroup(child)) {
        c.push(child);
      }
    }
  });
  return c;
}

export function toArray(children: ReactNode): ReactElement<TabPaneProps>[] {
  const c: ReactElement<TabPaneProps>[] = [];
  Children.forEach(children, child => {
    if (child) {
      if (isFragment(child)) {
        c.push(...toArray(child.props.children));
      } else if (isValidElement<TabPaneProps>(child)) {
        c.push(child);
      }
    }
  });
  return c;
}

export function getDefaultActiveKey(panelMap: Map<string, ReactElement<TabPaneProps>>): string | undefined {
  for (const [key, panel] of panelMap) {
    if (!panel.props.disabled) {
      return key;
    }
  }
}

export function getDefaultGroupKey(groupedPanelsMap: Map<string, GroupPanelMap>): string | undefined {
  for (const [key, { panelsMap }] of groupedPanelsMap) {
    for (const [, panel] of panelsMap) {
      if (!panel.props.disabled) {
        return key;
      }
    }
  }
}

export function getActiveKeyByGroupKey(groupedPanelsMap: Map<string, GroupPanelMap>, key: string): string | undefined {
  const map = groupedPanelsMap.get(key);
  if (map) {
    const { group, panelsMap, lastActiveKey } = map;
    if (lastActiveKey) {
      return lastActiveKey;
    }
    if ('defaultActiveKey' in group.props) {
      return group.props.defaultActiveKey;
    }
    return getDefaultActiveKey(panelsMap);
  }
}

export function generateKey(key: Key | undefined | null, index: number): string {
  return String(isNil(key) ? index : key);
}

export function getActiveIndex(map: Map<string, ReactElement<TabPaneProps>>, activeKey: string | undefined): number {
  return activeKey === undefined ? -1 : [...map.keys()].findIndex(key => key === activeKey);
}

export function setTransform(style: CSSStyleDeclaration, v: string = '') {
  style.transform = v;
  style.webkitTransform = v;
}

export function isTransformSupported(style: CSSStyleDeclaration): boolean {
  return 'transform' in style || 'webkitTransform' in style;
}

export function setTransition(style: CSSStyleDeclaration, v: string = '') {
  style.transition = v;
  style.webkitTransition = v;
}

export function getTransformPropValue(v: string) {
  return {
    transform: v,
    WebkitTransform: v,
  };
}

export function isVertical(tabBarPosition: TabsPosition | undefined): boolean {
  return tabBarPosition === TabsPosition.left || tabBarPosition === TabsPosition.right;
}

export function getTransformByIndex(index: number, tabBarPosition: TabsPosition | undefined) {
  const translate = isVertical(tabBarPosition) ? 'translateY' : 'translateX';
  return `${translate}(${-index * 100}%) translateZ(0)`;
}

export function getMarginStyle(index: number, tabBarPosition: TabsPosition | undefined) {
  const marginDirection = isVertical(tabBarPosition) ? 'marginTop' : 'marginLeft';
  return {
    [marginDirection]: `${-index * 100}%`,
  };
}

export function getStyle(el: HTMLElement, property: string): number {
  return +getComputedStyle(el).getPropertyValue(property).replace('px', '');
}

export function setPxStyle(el: HTMLElement, value: string | number, vertical: boolean) {
  value = vertical ? `0px, ${value}px, 0px` : `${value}px, 0px, 0px`;
  setTransform(el.style, `translate3d(${value})`);
}

export function getDataAttr(props: object): object {
  return Object.keys(props).reduce((prev, key) => {
    if (key === 'role' || key.startsWith('aria-') || key.startsWith('data-')) {
      prev[key] = props[key];
    }
    return prev;
  }, {});
}

function toNum(style: CSSStyleDeclaration, property: string): number {
  return +style.getPropertyValue(property).replace('px', '');
}

function getTypeValue(start: string, current: string, end: string, tabNode: HTMLElement, wrapperNode: HTMLElement): number {
  let total = getStyle(wrapperNode, `padding-${start}`);
  const { parentNode } = tabNode;
  if (parentNode) {
    [...parentNode.childNodes].some((node: HTMLElement) => {
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
  }

  return total;
}

export function getLeft(tabNode: HTMLElement, wrapperNode: HTMLElement): number {
  return getTypeValue('left', 'width', 'right', tabNode, wrapperNode);
}

export function getTop(tabNode: HTMLElement, wrapperNode: HTMLElement): number {
  return getTypeValue('top', 'height', 'bottom', tabNode, wrapperNode);
}
