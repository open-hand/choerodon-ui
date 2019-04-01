import React, { Component, CSSProperties, MouseEventHandler } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { icons, categories } from 'choerodon-ui-font';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  onClick?: MouseEventHandler<any>;
  onMouseDown?: MouseEventHandler<any>;
  onMouseUp?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  style?: CSSProperties;
  tabIndex?: number;
}

export default class Icon extends Component<IconProps, {}> {
  static icons = icons;
  static categories = categories;

  render() {
    const { type, className = '' } = this.props;
    const classString = classNames({
      'icon': true,
      [`icon-${type}`]: true,
    }, className);
    return <i {...omit(this.props, ['type', 'spin'])} className={classString} />;
  }
}
