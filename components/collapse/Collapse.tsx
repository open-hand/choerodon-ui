import React, { Component, CSSProperties } from 'react';
import classNames from 'classnames';
import animation from '../_util/openAnimation';
import CollapsePanel from './CollapsePanel';
import RcCollapse from '../rc-components/collapse';
import { getPrefixCls } from '../configure';

export interface CollapseProps {
  activeKey?: Array<string> | string;
  defaultActiveKey?: Array<string>;
  /** 手风琴效果 */
  accordion?: boolean;
  onChange?: (key: string | string[]) => void;
  style?: CSSProperties;
  className?: string;
  bordered?: boolean;
  prefixCls?: string;
}

export default class Collapse extends Component<CollapseProps, any> {
  static displayName = 'Collapse';

  static Panel = CollapsePanel;

  static defaultProps = {
    bordered: true,
    openAnimation: {
      ...animation,
      appear() {},
    },
  };

  render() {
    const { prefixCls: customizePrefixCls, className = '', bordered } = this.props;
    const prefixCls = getPrefixCls('collapse', customizePrefixCls);
    const collapseClassName = classNames(
      {
        [`${prefixCls}-borderless`]: !bordered,
      },
      className,
    );
    return <RcCollapse {...this.props} prefixCls={prefixCls} className={collapseClassName} />;
  }
}
