import React, { Component } from 'react';
import classNames from 'classnames';
import { getPrefixCls } from '../configure';

export interface CheckableTagProps {
  prefixCls?: string;
  className?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export default class CheckableTag extends Component<CheckableTagProps> {
  static displayName = 'CheckableTag';
  handleClick = () => {
    const { checked, onChange } = this.props;
    if (onChange) {
      onChange(!checked);
    }
  };

  render() {
    const { prefixCls: customizePrefixCls, className, checked, ...restProps } = this.props;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const cls = classNames(prefixCls, {
      [`${prefixCls}-checkable`]: true,
      [`${prefixCls}-checkable-checked`]: checked,
    }, className);

    delete (restProps as any).onChange; // TypeScript cannot check delete now.
    return <div {...restProps as any} className={cls} onClick={this.handleClick} />;
  }
}
