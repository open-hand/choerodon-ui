import React, { CSSProperties, FunctionComponent, ReactNode, useEffect, useState } from 'react';
import classnames from 'classnames';
import { getDataAttr } from './utils';

export interface TabPaneProps {
  /** 选项卡头显示文字 */
  tab?: ReactNode | string;
  style?: CSSProperties;
  active?: boolean;
  closable?: boolean;
  className?: string;
  rootPrefixCls?: string;
  disabled?: boolean;
  forceRender?: boolean;
  destroyInactiveTabPane?: boolean;
  count?: number;
  overflowCount?: number;
  placeholder?: ReactNode;
}

const TabPane: FunctionComponent<TabPaneProps> = function TabPane(props) {
  const {
    className,
    destroyInactiveTabPane,
    active,
    forceRender,
    rootPrefixCls,
    style,
    children,
    placeholder,
    ...restProps
  } = props;
  const [rendered, setRendered] = useState(active);
  const prefixCls = `${rootPrefixCls}-tabpane`;
  const cls = classnames(prefixCls, active ? `${prefixCls}-active` : `${prefixCls}-inactive`, className);
  useEffect(() => {
    if (!destroyInactiveTabPane && active) {
      setRendered(true);
    }
  }, [destroyInactiveTabPane, active]);
  return (
    <div
      style={style}
      role="tabpanel"
      aria-hidden={active ? 'false' : 'true'}
      className={cls}
      {...getDataAttr(restProps)}
    >
      {forceRender || (destroyInactiveTabPane ? active : rendered) ? children : placeholder}
    </div>
  );
};

TabPane.displayName = 'TabPane';

TabPane.defaultProps = {
  overflowCount: 99,
};

export default TabPane;
