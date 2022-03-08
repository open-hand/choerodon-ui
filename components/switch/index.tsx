import React, { Component, ReactNode } from 'react';
import classNames from 'classnames';
import omit from 'lodash/omit';
import RcSwitch from '../rc-components/switch';
import { Size } from '../_util/enum';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';

export interface SwitchProps {
  prefixCls?: string;
  size?: Size;
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => any;
  checkedChildren?: ReactNode;
  unCheckedChildren?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default class Switch extends Component<SwitchProps, {}> {
  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static displayName = 'Switch';

  context: ConfigContextValue;

  private rcSwitch: any;

  focus() {
    if (this.rcSwitch) {
      this.rcSwitch.focus();
    }
  }

  blur() {
    if (this.rcSwitch) {
      this.rcSwitch.blur();
    }
  }

  saveSwitch = (node: RcSwitch | null) => {
    this.rcSwitch = node;
  };

  render() {
    const { prefixCls: customizePrefixCls, size, loading, className = '' } = this.props;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('switch', customizePrefixCls);
    const classes = classNames(className, {
      [`${prefixCls}-small`]: size === Size.small,
      [`${prefixCls}-loading`]: loading,
    });
    return (
      <RcSwitch
        {...omit(this.props, ['loading'])}
        prefixCls={prefixCls}
        className={classes}
        ref={this.saveSwitch}
      />
    );
  }
}
