import * as React from 'react';
import classNames from 'classnames';
import omit from 'omit.js';

export interface IconProps {
  type: string;
  className?: string;
  title?: string;
  onClick?: React.MouseEventHandler<any>;
  style?: React.CSSProperties;
}

const Icon = (props: IconProps) => {
  const { type, className = '' } = props;
  const classString = classNames({
    'icon': true,
    [`icon-${type}`]: true,
  }, className);
  return <i {...omit(props, ['type', 'spin'])} className={classString} />;
};

export default Icon;
