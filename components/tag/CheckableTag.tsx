import React, { Component } from 'react';
import classNames from 'classnames';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface CheckableTagProps {
  prefixCls?: string;
  className?: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}

export default class CheckableTag extends Component<CheckableTagProps> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'CheckableTag';

  context: ConfigContextValue;

  handleClick = () => {
    const { checked, onChange } = this.props;
    if (onChange) {
      onChange(!checked);
    }
  };

  render() {
    const { prefixCls: customizePrefixCls, className, checked, ...restProps } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const cls = classNames(
      prefixCls,
      {
        [`${prefixCls}-checkable`]: true,
        [`${prefixCls}-checkable-checked`]: checked,
      },
      className,
    );

    delete (restProps as any).onChange; // TypeScript cannot check delete now.
    return <div {...(restProps as any)} className={cls} onClick={this.handleClick} />;
  }
}
