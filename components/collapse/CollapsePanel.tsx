import React, { CSSProperties, FunctionComponent, ReactNode } from 'react';
import classNames from 'classnames';
import RcCollapse from '../rc-components/collapse';

export interface CollapsePanelProps {
  key: string;
  header: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  showArrow?: boolean;
  prefixCls?: string;
  forceRender?: boolean;
  id?: string;
  extra?: ReactNode;
}

const CollapsePanel: FunctionComponent<CollapsePanelProps> = function CollapsePanel(props: CollapsePanelProps) {
  const { prefixCls, className = '', showArrow = true } = props;
  const collapsePanelClassName = classNames(
    {
      [`${prefixCls}-no-arrow`]: !showArrow,
    },
    className,
  );
  return <RcCollapse.Panel {...props} className={collapsePanelClassName} />;
};

CollapsePanel.displayName = 'CollapsePanel';

export default CollapsePanel;
