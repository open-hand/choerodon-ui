import * as React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';
import { categories, icons } from 'choerodon-ui-font';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<any>;
  style?: React.CSSProperties;
}

class Icon extends React.Component<IconProps, {}> {
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

export default Icon;
