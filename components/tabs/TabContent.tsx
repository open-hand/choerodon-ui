import React, {
  CSSProperties,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  ReactElement,
  RefAttributes,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import classnames from 'classnames';
import { getActiveIndex, getMarginStyle, getTransformByIndex, getTransformPropValue } from './utils';
import TabPane, { TabPaneProps } from './TabPane';
import TabsContext from './TabsContext';

export interface TabContentProps {
  animated?: boolean | undefined;
  animatedWithMargin?: boolean;
  destroyInactiveTabPane?: boolean | undefined;
  style?: CSSProperties | undefined;
}

const TabContent: ForwardRefExoticComponent<PropsWithoutRef<TabContentProps> & RefAttributes<HTMLDivElement>> = forwardRef(function TabContent(props: TabContentProps, ref) {
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
    return [...totalPanelsMap.entries()].map(([key, child]) => (
      <TabPane
        {...child}
        key={key}
        active={activeKey === key}
        destroyInactiveTabPane={destroyInactiveTabPane}
        rootPrefixCls={prefixCls}
      />
    ));
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
