import React, { Component, CSSProperties, ReactNode } from 'react';
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

export default class CollapsePanel extends Component<CollapsePanelProps, {}> {
  render() {
    const { prefixCls, className = '', showArrow = true } = this.props;
    const collapsePanelClassName = classNames({
      [`${prefixCls}-no-arrow`]: !showArrow,
    }, className);
    return <RcCollapse.Panel {...this.props} className={collapsePanelClassName} />;
  }
}
