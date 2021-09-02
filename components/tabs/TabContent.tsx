import React, {
  cloneElement,
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
  useLayoutEffect,
  useState,
} from 'react';
import classnames from 'classnames';
import { getActiveIndex, getMarginStyle, getTransformByIndex, getTransformPropValue } from './utils';
import { TabsPosition } from './enum';
import { TabPaneProps } from './TabPane';

export interface TabContentProps {
  animated?: boolean | undefined;
  animatedWithMargin?: boolean;
  destroyInactiveTabPane?: boolean | undefined;
  prefixCls?: string | undefined;
  panelsMap: Map<string, ReactElement<TabPaneProps>>;
  activeKey?: string | undefined;
  style?: CSSProperties | undefined;
  tabBarPosition?: TabsPosition | undefined;
}

const TabContent: ForwardRefExoticComponent<PropsWithoutRef<TabContentProps> & RefAttributes<HTMLDivElement>> = forwardRef(function TabContent(props: TabContentProps, ref) {
  const {
    prefixCls, panelsMap, activeKey, destroyInactiveTabPane,
    tabBarPosition, animated, animatedWithMargin, style,
  } = props;
  const [mergedStyle, setMergedStyle] = useState(() => animated ? ({
    ...style,
    display: 'none',
  }) : style);
  const classes = classnames(`${prefixCls}-content`, animated ? `${prefixCls}-content-animated` : `${prefixCls}-content-no-animated`);
  useLayoutEffect(() => {
    if (animated) {
      const activeIndex = getActiveIndex(panelsMap, activeKey);
      if (activeIndex !== -1) {
        const animatedStyle = animatedWithMargin ?
          getMarginStyle(activeIndex, tabBarPosition) :
          getTransformPropValue(getTransformByIndex(activeIndex, tabBarPosition));
        setMergedStyle({
          ...style,
          ...animatedStyle,
        });
      } else {
        setMergedStyle({
          ...style,
          display: 'none',
        });
      }
    } else {
      setMergedStyle(style);
    }
  }, [animated, panelsMap, activeKey, tabBarPosition, style]);
  const getTabPanes = () => {
    return [...panelsMap.entries()].map(([key, child]) => cloneElement<TabPaneProps>(child, {
      key,
      active: activeKey === key,
      destroyInactiveTabPane,
      rootPrefixCls: prefixCls,
    } as TabPaneProps));
  };
  return (
    <div
      className={classes}
      style={mergedStyle}
      ref={ref}
    >
      {getTabPanes()}
    </div>
  );
});

TabContent.defaultProps = {
  animated: true,
};

TabContent.displayName = 'TabContent';

export default TabContent;
