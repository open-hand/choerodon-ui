import React, {
  FunctionComponent,
  JSXElementConstructor,
  Key,
  MouseEvent,
  UIEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { observable } from 'mobx';
import classnames from 'classnames';
import ModalProvider from 'choerodon-ui/pro/lib/modal-provider';
import { iteratorSome } from 'choerodon-ui/pro/lib/_util/iteratorUtils';
import getReactNodeText from 'choerodon-ui/pro/lib/_util/getReactNodeText';
import { TabsPosition, TabsType } from './enum';
import { getDataAttr, getDefaultActiveKey, getDefaultActiveKeyInGroup, getDefaultGroupKey, getHeader, isVertical, normalizePanes } from './utils';
import { Size } from '../_util/enum';
import warning from '../_util/warning';
import TabBar, { TabBarProps } from './TabBar';
import TabContent, { TabContentProps } from './TabContent';
import isFlexSupported from '../_util/isFlexSupported';
import { Animated, GroupPanelMap, TabsCustomized, TabsProps } from './Tabs';
import { TabPaneProps } from './TabPane';
import TabsContext, { TabsContextValue } from './TabsContext';
import ConfigContext from '../config-provider/ConfigContext';

function handleScroll(e: UIEvent<HTMLDivElement>) {
  const { currentTarget } = e;
  const { ownerDocument } = currentTarget;
  if (ownerDocument) {
    const { defaultView } = ownerDocument;
    if (defaultView) {
      const computedStyle = defaultView.getComputedStyle(currentTarget);
      if (computedStyle.overflowX === 'hidden') {
        currentTarget.scrollLeft = 0;
      }
      if (computedStyle.overflowY === 'hidden') {
        currentTarget.scrollTop = 0;
      }
    }
  }
}

function isAnimated(animated?: boolean | Animated): animated is Animated {
  return typeof animated === 'object';
}

export interface TabsWithContextProps extends TabsProps {
  customized: TabsCustomized | undefined | null;
  setCustomized: (customized: TabsCustomized | undefined | null) => void;
}

const TabsWithContext: FunctionComponent<TabsWithContextProps> = function TabsWithContext(props) {
  const { getConfig, getPrefixCls } = useContext(ConfigContext);
  const {
    tabPosition,
    className,
    destroyInactiveTabPane,
    style,
    size,
    type,
    showMore,
    tabBarStyle,
    inkBarStyle = getConfig('tabsInkBarStyle'),
    hideAdd,
    animated = true,
    tabBarGutter,
    onEdit,
    tabBarExtraContent,
    hideOnlyGroup,
    customizedCode, customizable, children, defaultActiveKey: propDefaultActiveKey, setCustomized, customized,
    prefixCls: customizePrefixCls, activeKey: propActiveKey, onChange, onTabClick, onPrevClick, onNextClick, keyboard,
    defaultChangeable,
    tabDraggable,
    tabTitleEditable,
    tabCountHideable,
    rippleDisabled,
    ...restProps
  } = props;
  const hasPropActiveKey = 'activeKey' in props;
  const prefixCls = getPrefixCls('tabs', customizePrefixCls);
  const saveCustomized = useCallback((newCustomized: TabsCustomized) => {
    if (customizable) {
      setCustomized(newCustomized);
      if (customizedCode) {
        const customizedSave = getConfig('customizedSave');
        customizedSave(customizedCode, newCustomized, 'Tabs');
      }
    }
  }, [customizable, customizedCode]);
  const [totalPanelsMap, groupedPanelsMap]: [
    Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>,
    Map<string, GroupPanelMap>
  ] = useMemo(() => normalizePanes(children, customized, {
    tabDraggable,
    tabTitleEditable,
    tabCountHideable,
  }), [children, customized, tabDraggable, tabTitleEditable, tabCountHideable]);

  const defaultActiveKey = useMemo((): string | undefined => {
    const option: { activeKey?: string | undefined; defaultActiveKey?: string | undefined } = {
      activeKey: propActiveKey,
      defaultActiveKey: propDefaultActiveKey,
    };
    return getDefaultActiveKey(totalPanelsMap, groupedPanelsMap, option);
  }, []);
  const actuallyDefaultActiveKey = useMemo((): string | undefined => {
    if (defaultChangeable && customized) {
      const $defaultActiveKey = customized.defaultActiveKey;
      if ($defaultActiveKey !== undefined) {
        if (onChange && $defaultActiveKey !== defaultActiveKey) {
          onChange($defaultActiveKey);
        }
        return $defaultActiveKey;
      }
    }
    return defaultActiveKey;
  }, [defaultActiveKey, defaultChangeable]);
  const [activeKey, setActiveKey] = useState<string | undefined>(actuallyDefaultActiveKey);
  const activeGroupKey = useMemo((): string | undefined => {
    if (groupedPanelsMap.size) {
      if (activeKey) {
        let groupKey: string | undefined;
        iteratorSome(groupedPanelsMap.entries(), ([key, { panelsMap }]) => {
          const found = iteratorSome(panelsMap.keys(), panelKey => panelKey === activeKey);
          if (found) {
            groupKey = key;
          }
          return found;
        });
        if (groupKey !== undefined) {
          return groupKey;
        }
      }
      return getDefaultGroupKey(groupedPanelsMap);
    }
  }, [groupedPanelsMap, activeKey]);
  const currentGroup = activeGroupKey ? groupedPanelsMap.get(activeGroupKey) : undefined;
  const currentPanelMap = currentGroup ? currentGroup.panelsMap : totalPanelsMap;
  const refCurrent = {
    activeGroupKey,
    currentGroup,
    currentPanelMap,
  };
  const ref = useRef<{
    activeGroupKey: string | undefined,
    currentGroup: GroupPanelMap | undefined,
    currentPanelMap: Map<string, TabPaneProps & { type: string | JSXElementConstructor<any> }>,
  }>(refCurrent);
  ref.current = refCurrent;
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
  const validationMap = useMemo(() => observable.map(), []);
  const value: TabsContextValue = {
    defaultActiveKey: propDefaultActiveKey,
    actuallyDefaultActiveKey,
    propActiveKey,
    prefixCls,
    keyboard,
    tabBarPosition: tabPosition,
    hideOnlyGroup,
    customizable,
    customized,
    saveCustomized,
    activeKey,
    activeGroupKey,
    changeActiveKey,
    groupedPanelsMap,
    currentPanelMap,
    totalPanelsMap,
    validationMap,
    onTabClick,
    onPrevClick,
    onNextClick,
    children,
    tabDraggable,
    tabTitleEditable,
    tabCountHideable,
    defaultChangeable,
    rippleDisabled,
  };
  const inkBarAnimated = isAnimated(animated) ? animated.inkBar : animated;
  let tabPaneAnimated = isAnimated(animated) ? animated.tabPane : animated;
  const onTabsChange = getConfig('onTabsChange');
  // card tabs should not have animation
  if (type !== TabsType.line) {
    tabPaneAnimated = 'animated' in props ? tabPaneAnimated : false;
  }

  const isCard = type === TabsType.card || type === TabsType['editable-card'];

  warning(
    !(isCard && (size === Size.small || size === Size.large)),
    'Tabs[type=card|editable-card] doesn\'t have small or large size, it\'s by designed.',
  );


  const removeTab = useCallback((targetKey: Key | null, e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    if (!targetKey) {
      return;
    }
    if (onEdit) {
      onEdit(targetKey, 'remove');
    }
  }, [onEdit]);

  useEffect(() => {
    if (hasPropActiveKey) {
      if (propActiveKey !== activeKey) {
        setActiveKey(propActiveKey);
      }
    } else if (activeKey === undefined || !totalPanelsMap.has(activeKey)) {
      setActiveKey(getDefaultActiveKeyInGroup(currentPanelMap));
    }
  }, [hasPropActiveKey, propActiveKey, activeKey, totalPanelsMap, currentPanelMap]);
  useEffect(() => {
    if (onTabsChange && activeKey) {
      const { current } = ref;
      const currentPanel = current.currentPanelMap.get(activeKey);
      if (currentPanel) {
        const { currentGroup: $currentGroup, activeGroupKey: $activeGroupKey } = current;
        const groupTab = $currentGroup ? $currentGroup.group.tab : undefined;
        const title = getHeader(currentPanel);
        const promises: (string | Promise<string>)[] = [getReactNodeText(title)];
        if (groupTab) {
          promises.push(getReactNodeText(groupTab));
        }
        Promise.all(promises).then(([title, groupTitle]) => {
          onTabsChange({
            activeKey,
            activeGroupKey: $activeGroupKey,
            title,
            groupTitle,
            code: customizedCode,
          });
        });
      }
    }
  }, [activeKey, onTabsChange, customizedCode]);

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

  const extraContent = !hideAdd && type === TabsType['editable-card'] ? (
    // Add new tab handler
    <div key="tabBarExtraContent" className={`${prefixCls}-extra-bar`}>
      {tabBarExtraContent}
    </div>
  ) : tabBarExtraContent;

  const tabBarProps: TabBarProps = {
    inkBarAnimated,
    extraContent,
    style: tabBarStyle,
    tabBarGutter,
    type,
    showMore,
    onRemoveTab: removeTab,
    onEdit,
    inkBarStyle,
    hideAdd,
  };
  const tabContentProps: TabContentProps = {
    animatedWithMargin: true,
    animated: tabPaneAnimated,
    destroyInactiveTabPane,
  };

  const contents = [
    <TabBar key="tabBar" {...tabBarProps} />,
    <TabContent key="tabContent" {...tabContentProps} />,
  ];
  if (tabPosition === TabsPosition.bottom) {
    contents.reverse();
  }

  const tabs = (
    <div className={cls} style={style} onScrollCapture={tabPaneAnimated ? handleScroll : undefined} {...getDataAttr(restProps)}>
      {contents}
    </div>
  );
  return (
    <TabsContext.Provider value={value}>
      {
        customizable ? (
          <ModalProvider>
            {tabs}
          </ModalProvider>
        ) : tabs
      }
    </TabsContext.Provider>
  );
};

TabsWithContext.displayName = 'TabsWithContext';

export default TabsWithContext;
