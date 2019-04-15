import React, { Component, CSSProperties, FocusEventHandler, MouseEventHandler } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { categories, icons } from 'choerodon-ui-font';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  onClick?: MouseEventHandler<any>;
  onFocus?: FocusEventHandler<any>;
  onMouseDown?: MouseEventHandler<any>;
  onMouseUp?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  style?: CSSProperties;
  tabIndex?: number;
}

export default class Icon extends Component<IconProps, {}> {
  static displayName = 'Icon';
  static icons = icons;
  static categories = categories;

  render() {
    const { type, className = '' } = this.props;
    const classString = classNames('icon', `icon-${type}`, className);
    return <i {...omit(this.props, ['type', 'spin'])} className={classString} />;
  }
}
