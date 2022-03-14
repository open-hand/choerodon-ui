import React, { createElement, CSSProperties, FunctionComponent, ReactElement, useContext, useLayoutEffect, useState } from 'react';
import classnames from 'classnames';
import { getActiveIndex, getMarginStyle, getTransformByIndex, getTransformPropValue } from './utils';
import { TabPaneProps } from './TabPane';
import TabsContext from './TabsContext';

export interface TabContentProps {
  animated?: boolean | undefined;
  animatedWithMargin?: boolean;
  destroyInactiveTabPane?: boolean | undefined;
  style?: CSSProperties | undefined;
}

const TabContent: FunctionComponent<TabContentProps> = function TabContent(props) {
  const { destroyInactiveTabPane, animated, animatedWithMargin, style } = props;
  const { prefixCls, totalPanelsMap, activeKey, tabBarPosition } = useContext(TabsContext);
  const [mergedStyle, setMergedStyle] = useState(() => animated ? ({
    ...style,
    display: 'none',
  }) : style);
  const classes = classnames(`${prefixCls}-content`, animated ? `${prefixCls}-content-animated` : `${prefixCls}-content-no-animated`);
  useLayoutEffect(() => {
    if (animated) {
      const activeIndex = getActiveIndex(totalPanelsMap, activeKey);
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
  }, [animated, totalPanelsMap, activeKey, tabBarPosition, style]);

  const getTabPanes = (): ReactElement<TabPaneProps>[] => {
    const ret: ReactElement<TabPaneProps>[] = [];
    totalPanelsMap.forEach(({ type, ...child }, key) => {
      ret.push(createElement<TabPaneProps>(
        type,
        {
          ...child,
          key,
          eventKey: key,
          active: activeKey === key,
          destroyInactiveTabPane,
          rootPrefixCls: prefixCls,
        },
      ));
    });
    return ret;
  };
  return (
    <div
      className={classes}
      style={mergedStyle}
    >
      {getTabPanes()}
    </div>
  );
};

TabContent.defaultProps = {
  animated: true,
};

TabContent.displayName = 'TabContent';

export default TabContent;
