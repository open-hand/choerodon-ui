import React from 'react';
import isString from 'lodash/isString';
import classNames from 'classnames';

const RenderIcon = function RenderIcon(props) {
  const {
    prefixCls,
    progressDot,
    stepNumber,
    status,
  } = props;
  if (progressDot) {
    const iconDot = <span className={`${prefixCls}-icon-dot`} />;
    if (typeof progressDot === 'function') {
      const { title, description } = props;
      return (
        <span className={`${prefixCls}-icon`}>
          {progressDot(iconDot, { index: stepNumber - 1, status, title, description })}
        </span>
      );
    }
    return <span className={`${prefixCls}-icon`}>{iconDot}</span>;
  }
  const { icon } = props;
  if (icon && !isString(icon)) {
    return <span className={`${prefixCls}-icon`}>{icon}</span>;
  }
  if (icon || status === 'finish' || status === 'error') {
    const { iconPrefix } = props;
    const iconClassName = classNames(`${prefixCls}-icon`, `${iconPrefix}`, {
      [`${iconPrefix}-${icon}`]: icon && isString(icon),
      [`${iconPrefix}-check`]: !icon && status === 'finish',
      [`${iconPrefix}-close`]: !icon && status === 'error',
    });
    return <span className={iconClassName} />;
  }
  return <span className={`${prefixCls}-icon`}>{stepNumber}</span>;
};

RenderIcon.displayName = 'RcRenderIcon';

export default RenderIcon;
