import React, { HTMLAttributes } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

const stringOrNumber = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
const objectOrNumber = PropTypes.oneOfType([PropTypes.object, PropTypes.number]);

export interface ColSize {
  span?: number;
  order?: number;
  offset?: number;
  push?: number;
  pull?: number;
}

export interface ColProps extends HTMLAttributes<HTMLDivElement> {
  span?: number;
  order?: number;
  offset?: number;
  push?: number;
  pull?: number;
  xs?: number | ColSize;
  sm?: number | ColSize;
  md?: number | ColSize;
  lg?: number | ColSize;
  xl?: number | ColSize;
  xxl?: number | ColSize;
  prefixCls?: string;
}

export default function Col(props: ColProps) {
  const {
    span,
    order,
    offset,
    push,
    pull,
    className,
    children,
    prefixCls: customizePrefixCls,
    ...others
  } = props;
  const prefixCls = getPrefixCls('col', customizePrefixCls);
  let sizeClassObj = {};
  ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach(size => {
    let sizeProps: ColSize = {};
    if (typeof props[size] === 'number') {
      sizeProps.span = props[size];
    } else if (typeof props[size] === 'object') {
      sizeProps = props[size] || {};
    }

    delete others[size];

    sizeClassObj = {
      ...sizeClassObj,
      [`${prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
      [`${prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
      [`${prefixCls}-${size}-offset-${sizeProps.offset}`]:
        sizeProps.offset || sizeProps.offset === 0,
      [`${prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
      [`${prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
    };
  });
  const classes = classNames(
    {
      [`${prefixCls}-${span}`]: span !== undefined,
      [`${prefixCls}-order-${order}`]: order,
      [`${prefixCls}-offset-${offset}`]: offset,
      [`${prefixCls}-push-${push}`]: push,
      [`${prefixCls}-pull-${pull}`]: pull,
    },
    className,
    sizeClassObj,
  );

  return (
    <div {...others} className={classes}>
      {children}
    </div>
  );
}

Col.displayName = 'Col';

Col.propTypes = {
  span: stringOrNumber,
  order: stringOrNumber,
  offset: stringOrNumber,
  push: stringOrNumber,
  pull: stringOrNumber,
  className: PropTypes.string,
  children: PropTypes.node,
  xs: objectOrNumber,
  sm: objectOrNumber,
  md: objectOrNumber,
  lg: objectOrNumber,
  xl: objectOrNumber,
  xxl: objectOrNumber,
};
