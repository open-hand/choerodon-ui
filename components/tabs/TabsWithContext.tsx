import React, {
  FunctionComponent,
  JSXElementConstructor,
  Key,
  MouseEvent,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import classnames from 'classnames';
import ModalProvider from 'choerodon-ui/pro/lib/modal-provider';
import { TabsPosition, TabsType } from './enum';
import { getDataAttr, getDefaultActiveKey, getDefaultActiveKeyInGroup, getDefaultGroupKey, isVertical, normalizePanes } from './utils';
import { Size } from '../_util/enum';
import { getConfig, getPrefixCls } from '../configure';
import warning from '../_util/warning';
import TabBar, { TabBarProps } from './TabBar';
import Icon from '../icon';
import TabContent, { TabContentProps } from './TabContent';
import isFlexSupported from '../_util/isFlexSupported';
import { Animated, GroupPanelMap, TabsCustomized, TabsProps } from './Tabs';
import { TabPaneProps } from './TabPane';
import TabsContext, { TabsContextValue } from './TabsContext';

function isAnimated(animated?: boolean | Animated): animated is Animated {
  return typeof animated === 'object';
}

export interface TabsWithContextProps extends TabsProps {
  customized: TabsCustomized | undefined | null;
  setCustomized: (customized: TabsCustomized | undefined | null) => void;
}

const TabsWithContext: FunctionComponent<TabsWithContextProps> = function TabsWithContext(props) {
  const {
    tabPosition,
    className,
    destroyInactiveTabPane,
    style,
    size,
    type,
    tabBarStyle,
    inkBarStyle = getConfig('tabsInkBarStyle'),
    hideAdd,
    animated = true,
    tabBarGutter,
    onEdit,
    tabBarExtraContent,
    hideOnlyGroup,
    customizedCode, customizable, children, defaultActiveKey, setCustomized, customized,
    prefixCls: customizePrefixCls, activeKey: propActiveKey, onChange, onTabClick, onPrevClick, onNextClick, keyboard,
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
  ] = useMemo(() => normalizePanes(children, customized), [children, customized]);
  const actuallyDefaultActiveKey = useMemo((): string | undefined => {
    if (customized && customized.defaultActiveKey !== undefined) {
      return customized.defaultActiveKey;
    }
    const option: { activeKey?: string | undefined, defaultActiveKey?: string | undefined } = {
      activeKey: propActiveKey,
      defaultActiveKey,
    };
    return getDefaultActiveKey(totalPanelsMap, groupedPanelsMap, option);
  }, []);
  const [activeKey, setActiveKey] = useState<string | undefined>(actuallyDefaultActiveKey);
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
  const value: TabsContextValue = {
    defaultActiveKey,
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
    onTabClick,
    onPrevClick,
    onNextClick,
    children,
  };
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

  useEffect(() => {
    if (hasPropActiveKey) {
      if (propActiveKey !== activeKey) {
        setActiveKey(propActiveKey);
      }
    } else if (activeKey === undefined || !totalPanelsMap.has(activeKey)) {
      setActiveKey(getDefaultActiveKeyInGroup(currentPanelMap));
    }
  }, [hasPropActiveKey, propActiveKey, activeKey, totalPanelsMap, currentPanelMap]);

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
    <span key="tabBarExtraContent">
      <Icon type="add" className={`${prefixCls}-new-tab`} onClick={createNewTab} />
      {tabBarExtraContent}
    </span>
  ) : tabBarExtraContent;

  const tabBarProps: TabBarProps = {
    inkBarAnimated,
    extraContent,
    style: tabBarStyle,
    tabBarGutter,
    type,
    onRemoveTab: removeTab,
    inkBarStyle,
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
    <div className={cls} style={style} {...getDataAttr(restProps)}>
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
