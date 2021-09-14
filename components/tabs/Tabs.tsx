import React, {
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  Key,
  MouseEvent,
  MouseEventHandler,
  PropsWithoutRef,
  ReactElement,
  ReactNode,
  Ref,
  RefAttributes,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import classnames from 'classnames';
import { TabsPosition, TabsType } from './enum';
import KeyCode from '../_util/KeyCode';
import TabPane, { TabPaneProps } from './TabPane';
import TabGroup, { TabGroupProps } from './TabGroup';
import { generateKey, getActiveKeyByGroupKey, getDataAttr, getDefaultActiveKey, getDefaultGroupKey, isVertical, toArray, toGroups } from './utils';
import { Size } from '../_util/enum';
import { getPrefixCls, getConfig } from '../configure';
import warning from '../_util/warning';
import TabBar, { TabBarProps } from './TabBar';
import Icon from '../icon';
import TabContent, { TabContentProps } from './TabContent';
import isFlexSupported from '../_util/isFlexSupported';
import { SelectParam } from '../menu';

export type Animated = { inkBar: boolean; tabPane: boolean };

export interface TabsProps {
  activeKey?: string;
  defaultActiveKey?: string;
  hideAdd?: boolean;
  onChange?: (activeKey: string) => void;
  onTabClick?: (key: string) => void;
  onPrevClick?: MouseEventHandler<any>;
  onNextClick?: MouseEventHandler<any>;
  tabBarExtraContent?: ReactNode | null;
  tabBarStyle?: CSSProperties;
  inkBarStyle?: CSSProperties;
  tabBarGutter?: number;
  type?: TabsType;
  tabPosition?: TabsPosition;
  onEdit?: (targetKey: Key | MouseEvent<HTMLElement>, action: 'add' | 'remove') => void;
  size?: Size;
  style?: CSSProperties;
  prefixCls?: string;
  className?: string;
  animated?: boolean | Animated;
  closeShortcut?: boolean;
  keyboard?: boolean;
  destroyInactiveTabPane?: boolean;
  children?: ReactNode;
}

function isAnimated(animated?: boolean | Animated): animated is Animated {
  return typeof animated === 'object';
}

export interface TabsRef {
  createNewTab: MouseEventHandler<HTMLElement>;

  removeTab(targetKey: string, e: MouseEvent<HTMLElement>);
}

export type GroupPanelMap = { group: ReactElement<TabGroupProps>; panelsMap: Map<string, ReactElement<TabPaneProps>>; lastActiveKey?: string; }

function Tabs(props: TabsProps, ref: Ref<TabsRef>) {
  const {
    activeKey: propActiveKey,
    prefixCls: customizePrefixCls,
    tabPosition,
    className,
    destroyInactiveTabPane,
    keyboard,
    style,
    onChange,
    size,
    type,
    tabBarStyle,
    inkBarStyle = getConfig('tabsInkBarStyle'),
    hideAdd,
    onTabClick,
    onPrevClick,
    onNextClick,
    animated = true,
    tabBarGutter,
    onEdit,
    children,
    tabBarExtraContent,
    ...restProps
  } = props;
  const prefixCls = getPrefixCls('tabs', customizePrefixCls);
  const inkBarAnimated = isAnimated(animated) ? animated.inkBar : animated;
  let tabPaneAnimated = isAnimated(animated) ? animated.tabPane : animated;

  // card tabs should not have animation
  if (type !== TabsType.line) {
    tabPaneAnimated = 'animated' in props ? tabPaneAnimated : false;
  }

  const isCard = type === TabsType.card || type === TabsType['editable-card'];

  warning(
    !(isCard && (size === Size.small || size === Size.large)),
    'Tabs[type=card|editable-card] doesn\'t have small or large size, it\'s by designed.',
  );

  const hasPropActiveKey = 'activeKey' in props;

  const createNewTab: MouseEventHandler<HTMLElement> = useCallback((e: MouseEvent<HTMLElement>) => {
    if (onEdit) {
      onEdit(e, 'add');
    }
  }, [onEdit]);

  const removeTab = useCallback((targetKey: Key | null, e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!targetKey) {
      return;
    }
    if (onEdit) {
      onEdit(targetKey, 'remove');
    }
  }, [onEdit]);
  // only card type tabs can be added and closed
  const [totalPanelsMap, groupedPanelsMap]: [
    Map<string, ReactElement<TabPaneProps>>,
    Map<string, GroupPanelMap>
  ] = useMemo(() => {
    const groups = toGroups(children);
    const groupedPanels = new Map<string, GroupPanelMap>();
    const panelMap = new Map<string, ReactElement<TabPaneProps>>();
    if (groups.length) {
      let index = 0;
      groups.forEach((group, i) => {
        const groupPanelMap = new Map<string, ReactElement<TabPaneProps>>();
        toArray(group.props.children).forEach((child) => {
          const panelKey = generateKey(child.key, index);
          index += 1;
          groupPanelMap.set(panelKey, child);
          panelMap.set(panelKey, child);
        });
        const groupKey = generateKey(group.key, i);
        groupedPanels.set(groupKey, {
          group,
          panelsMap: groupPanelMap,
        });
      });
    } else {
      toArray(children).forEach((child, index) => {
        panelMap.set(generateKey(child.key, index), child);
      });
    }
    return [panelMap, groupedPanels];
  }, [children]);
  const [activeKey, setActiveKey] = useState((): string | undefined => {
    if (propActiveKey !== undefined) {
      return propActiveKey;
    }
    if ('defaultActiveKey' in props) {
      return props.defaultActiveKey;
    }
    const { value } = groupedPanelsMap.values().next();
    if (value) {
      const { group } = value;
      if ('defaultActiveKey' in group.props) {
        return group.props.defaultActiveKey;
      }
    }
    return getDefaultActiveKey(totalPanelsMap);
  });
  const activeGroupKey = useMemo((): string | undefined => {
    if (groupedPanelsMap.size) {
      if (activeKey) {
        for (const [groupKey, { panelsMap }] of groupedPanelsMap) {
          for (const [panelKey] of panelsMap) {
            if (panelKey === activeKey) {
              return groupKey;
            }
          }
        }
      }
      return getDefaultGroupKey(groupedPanelsMap);
    }
  }, [groupedPanelsMap, activeKey]);
  const currentGroup = activeGroupKey && groupedPanelsMap.get(activeGroupKey);
  const currentPanelMap = currentGroup ? currentGroup.panelsMap : totalPanelsMap;
  const cls = classnames(
    prefixCls,
    `${prefixCls}-${tabPosition}`,
    `${prefixCls}-${type}`,
    isVertical(tabPosition) ? `${prefixCls}-vertical` : `${prefixCls}-horizontal`,
    {
      [`${prefixCls}-${size}`]: !!size,
      [`${prefixCls}-card`]: isCard,
      [`${prefixCls}-no-animation`]: !tabPaneAnimated,
      'no-flex': !isFlexSupported(),
    },
    className,
  );
  const changeActiveKey = useCallback((key: string, byGroup?: boolean) => {
    if (activeKey !== key) {
      if (!byGroup && currentGroup) {
        currentGroup.lastActiveKey = key;
      }
      if (!hasPropActiveKey) {
        setActiveKey(key);
      }
      if (onChange) {
        onChange(key);
      }
    }
  }, [hasPropActiveKey, activeKey, onChange, currentGroup]);
  const handleTabClick = useCallback((key: string) => {
    if (onTabClick) {
      onTabClick(key);
    }
    changeActiveKey(key);
  }, [changeActiveKey, onTabClick]);
  const handleGroupSelect = useCallback((param: SelectParam) => {
    const { key } = param;
    if (activeGroupKey !== key) {
      const newActiveKey = getActiveKeyByGroupKey(groupedPanelsMap, key);
      if (newActiveKey) {
        changeActiveKey(newActiveKey, true);
      }
    }
  }, [changeActiveKey, activeGroupKey, groupedPanelsMap]);

  const getNextActiveKey = useCallback((next): string | undefined => {
    const list: string[] = [];
    currentPanelMap.forEach((c, key) => {
      if (!c.props.disabled) {
        if (next) {
          list.push(key);
        } else {
          list.unshift(key);
        }
      }
    });
    const { length } = list;
    if (activeKey && length) {
      const i = list.indexOf(activeKey);
      const itemIndex = i === length - 1 ? 0 : i + 1;
      return list[itemIndex] || list[0];
    }
    return undefined;
  }, [activeKey, currentPanelMap]);

  const onKeyDown = useCallback(e => {
    if (keyboard === false) {
      return noop;
    }
    const { keyCode } = e;
    if (keyCode === KeyCode.RIGHT || keyCode === KeyCode.DOWN) {
      e.preventDefault();
      const nextKey = getNextActiveKey(true);
      if (nextKey) {
        handleTabClick(nextKey);
      }
    } else if (keyCode === KeyCode.LEFT || keyCode === KeyCode.UP) {
      e.preventDefault();
      const previousKey = getNextActiveKey(false);
      if (previousKey) {
        handleTabClick(previousKey);
      }
    }
  }, [keyboard, handleTabClick, getNextActiveKey]);

  useEffect(() => {
    if (hasPropActiveKey) {
      if (propActiveKey !== activeKey) {
        setActiveKey(propActiveKey);
      }
    } else if (activeKey === undefined || !totalPanelsMap.has(activeKey)) {
      setActiveKey(getDefaultActiveKey(currentPanelMap));
    }
  }, [hasPropActiveKey, propActiveKey, activeKey, totalPanelsMap, currentPanelMap]);

  useImperativeHandle(ref, () => ({
    createNewTab,
    removeTab,
  }), [createNewTab, removeTab]);

  const extraContent = !hideAdd && type === TabsType['editable-card'] ? (
    // Add new tab handler
    <span key="tabBarExtraContent">
      <Icon type="add" className={`${prefixCls}-new-tab`} onClick={createNewTab} />
      {tabBarExtraContent}
    </span>
  ) : tabBarExtraContent;

  const tabBarProps: TabBarProps = {
    inkBarAnimated,
    extraContent,
    onPrevClick,
    onNextClick,
    style: tabBarStyle,
    tabBarGutter,
    prefixCls,
    onKeyDown,
    tabBarPosition: tabPosition,
    onTabClick: handleTabClick,
    onGroupSelect: handleGroupSelect,
    groupsMap: groupedPanelsMap,
    panelsMap: currentPanelMap,
    activeGroupKey,
    activeKey,
    type,
    onRemoveTab: removeTab,
    inkBarStyle,
  };
  const tabContentProps: TabContentProps = {
    animatedWithMargin: true,
    animated: tabPaneAnimated,
    prefixCls,
    tabBarPosition: tabPosition,
    activeKey,
    destroyInactiveTabPane,
    panelsMap: totalPanelsMap,
  };

  const contents = [
    <TabBar key="tabBar" {...tabBarProps} />,
    <TabContent key="tabContent" {...tabContentProps} />,
  ];
  if (tabPosition === TabsPosition.bottom) {
    contents.reverse();
  }
  return (
    <div className={cls} style={style} {...getDataAttr(restProps)}>
      {contents}
    </div>
  );
}

const ForwardTabs: ForwardRefExoticComponent<PropsWithoutRef<TabsProps> & RefAttributes<TabsRef>> =
  forwardRef<TabsRef, TabsProps>(Tabs);

ForwardTabs.displayName = 'Tabs';

ForwardTabs.propTypes = {
  destroyInactiveTabPane: PropTypes.bool,
  onChange: PropTypes.func,
  children: PropTypes.any,
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  activeKey: PropTypes.string,
  defaultActiveKey: PropTypes.string,
  keyboard: PropTypes.bool,
  hideAdd: PropTypes.bool,
  tabPosition: PropTypes.oneOf<TabsPosition>([TabsPosition.top, TabsPosition.right, TabsPosition.bottom, TabsPosition.left]),
};

ForwardTabs.defaultProps = {
  hideAdd: false,
  destroyInactiveTabPane: false,
  onChange: noop,
  keyboard: true,
  tabPosition: TabsPosition.top,
  type: TabsType.line,
};
export type ForwardTabsType = typeof ForwardTabs & { TabPane: typeof TabPane, TabGroup: typeof TabGroup }
(ForwardTabs as ForwardTabsType).TabPane = TabPane;
(ForwardTabs as ForwardTabsType).TabGroup = TabGroup;

export default ForwardTabs as ForwardTabsType;
