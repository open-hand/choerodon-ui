import React, { CSSProperties, ReactNode } from 'react';
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
}

const CollapsePanel: React.FC<CollapsePanelProps> = (props: CollapsePanelProps) => {
  const { prefixCls, className = '', showArrow = true } = props;
  const collapsePanelClassName = classNames(
    {
      [`${prefixCls}-no-arrow`]: !showArrow,
    },
    className,
  );
  return <RcCollapse.Panel {...props} className={collapsePanelClassName} />;
};

export default CollapsePanel;
