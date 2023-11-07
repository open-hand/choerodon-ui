import { Children, isValidElement, JSXElementConstructor, Key, ReactElement, ReactNode } from 'react';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import isFragment from 'choerodon-ui/pro/lib/_util/isFragment';
import { iteratorFindIndex, iteratorSome } from 'choerodon-ui/pro/lib/_util/iteratorUtils';
import { TabsPosition } from './enum';
import { isTabGroup, TabGroupProps } from './TabGroup';
import { TabPaneProps } from './TabPane';
import { GroupPanelMap, TabsCustomized } from './Tabs';

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

export function getDefaultActiveKeyInGroup(panelMap: Map<string, TabPaneProps>): string | undefined {
  let activeKey: string | undefined;
  iteratorSome(panelMap.entries(), ([key, panel]) => {
    if (!panel.disabled) {
      activeKey = key;
      return true;
    }
    return false;
  });
  return activeKey;
}

export function getDefaultActiveKey(totalPanelsMap: Map<string, TabPaneProps>, groupedPanelsMap: Map<string, GroupPanelMap>, option: { activeKey?: string | undefined; defaultActiveKey?: string | undefined }): string | undefined {
  const { activeKey, defaultActiveKey } = option;
  if (activeKey !== undefined) {
    return activeKey;
  }
  if (defaultActiveKey !== undefined) {
    return defaultActiveKey;
  }
  const { value } = groupedPanelsMap.values().next();
  if (value) {
    const { group: { defaultActiveKey: groupDefaultActiveKey } } = value;
    if (groupDefaultActiveKey !== undefined) {
      return groupDefaultActiveKey;
    }
  }
  return getDefaultActiveKeyInGroup(totalPanelsMap);
}

export function getDefaultGroupKey(groupedPanelsMap: Map<string, GroupPanelMap>): string | undefined {
  let groupKey: string | undefined;
  iteratorSome(groupedPanelsMap.entries(), ([key, { panelsMap }]) => (
    iteratorSome(panelsMap.values(), (panel) => {
      if (!panel.disabled) {
        groupKey = key;
        return true;
      }
      return false;
    })
  ));
  return groupKey;
}

export function getActiveKeyByGroupKey(groupedPanelsMap: Map<string, GroupPanelMap>, key: string): string | undefined {
  const map = groupedPanelsMap.get(key);
  if (map) {
    const { group, panelsMap, lastActiveKey } = map;
    if (lastActiveKey) {
      return lastActiveKey;
    }
    if ('defaultActiveKey' in group) {
      return group.defaultActiveKey;
    }
    return getDefaultActiveKeyInGroup(panelsMap);
  }
}

export function generateKey(key: Key | undefined | null, index: number): string {
  return String(isNil(key) ? index : key);
}

export function getActiveIndex(map: Map<string, TabPaneProps>, activeKey: string | undefined): number {
  return activeKey === undefined ? -1 : iteratorFindIndex(map.keys(), key => key === activeKey);
}

export function setTransform(style: CSSStyleDeclaration, v = '') {
  style.transform = v;
  style.webkitTransform = v;
}

export function isTransformSupported(style: CSSStyleDeclaration): boolean {
  return 'transform' in style || 'webkitTransform' in style;
}

export function setTransition(style: CSSStyleDeclaration, v = '') {
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

export function getHeader(props: TabPaneProps): ReactNode {
  const { tab, title } = props;
  if (typeof tab === 'function') {
    return tab(title);
  }
  if (title !== undefined) {
    return title;
  }
  if (tab !== undefined) {
    return tab;
  }
}

function sorter(item1: [string, TabPaneProps], item2: [string, TabPaneProps]) {
  const { sort = 0 } = item1[1];
  const { sort: sort2 = 0 } = item2[1];
  return sort - sort2;
}

interface normalizeOptions {
  tabDraggable?: boolean | undefined;
  tabTitleEditable?: boolean | undefined;
  tabCountHideable?: boolean | undefined;
}

export function normalizePanes(children: ReactNode, customized?: TabsCustomized | undefined | null, options?: normalizeOptions): [
  Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>,
  Map<string, GroupPanelMap>
] {
  const groups = toGroups(children);
  const groupedPanels = new Map<string, GroupPanelMap>();
  const panelList: [string, TabPaneProps & { type: string | JSXElementConstructor<any> }][] = [];
  const panes = customized && customized.panes;
  const omitKeys: string[] = [];
  if (options) {
    const { tabDraggable, tabTitleEditable, tabCountHideable } = options;
    if (!tabDraggable) {
      omitKeys.push('sort');
    }
    if (!tabTitleEditable) {
      omitKeys.push('title');
    }
    if (!tabCountHideable) {
      omitKeys.push('showCount');
    }
  }
  const { length } = omitKeys;
  const getCustomizedPane = (key: string) => {
    if (panes) {
      const pane = panes[key];
      if (pane && !pane.hidden) {
        if (length) {
          return omit(pane, omitKeys);
        }
        return pane;
      }
    }
  };
  if (groups.length) {
    let index = 0;
    groups.forEach((group, i) => {
      if (!group.props.hidden) {
        const groupPanelList: [string, TabPaneProps & { type: string | JSXElementConstructor<any> }][] = [];
        toArray(group.props.children).forEach((child, j) => {
          if (!child.props.hidden) {
            const panelKey = generateKey(child.key, index);
            index += 1;
            groupPanelList.push([panelKey, { type: child.type, sort: j, ...child.props, ...getCustomizedPane(panelKey) }]);
          }
        });
        groupPanelList.sort(sorter);
        panelList.push(...groupPanelList);
        const groupKey = generateKey(group.key, i);
        groupedPanels.set(groupKey, {
          group: { ...group.props },
          panelsMap: new Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>(groupPanelList),
        });
      }
    });
  } else {
    toArray(children).forEach((child, index) => {
      if (!child.props.hidden) {
        const key = generateKey(child.key, index);
        panelList.push([key, { type: child.type, sort: index, ...child.props, ...getCustomizedPane(key) }]);
      }
    });
    panelList.sort(sorter);
  }
  return [new Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>(panelList), groupedPanels];
}

export function getTextHeight(text, font = '') {
  // 创建一个隐藏的div元素
  const container = document.createElement('div');
  container.style.visibility = 'hidden';
  container.style.position = 'absolute';
  document.body.appendChild(container);

  // 创建一个span元素来容纳文本
  const span = document.createElement('span');
  span.style.font = font;
  span.textContent = text;
  container.appendChild(span);

  // 获取字符串的高度
  const height = span.offsetHeight;

  // 移除临时元素
  document.body.removeChild(container);

  return height;
}
