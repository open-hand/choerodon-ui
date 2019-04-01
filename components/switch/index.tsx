import React, { Component, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import RcSwitch from '../rc-components/switch';
import { Size } from '../_util/enum';
import { getPrefixCls } from '../configure';

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
  static displayName = 'Switch';

  static propTypes = {
    prefixCls: PropTypes.string,

    // size=default and size=large are the same
    size: PropTypes.oneOf([Size.small, Size.default, Size.large]),
    className: PropTypes.string,
  };

  private rcSwitch: any;

  focus() {
    this.rcSwitch.focus();
  }

  blur() {
    this.rcSwitch.blur();
  }

  saveSwitch = (node: RcSwitch | null) => {
    this.rcSwitch = node;
  };

  render() {
    const { prefixCls: customizePrefixCls, size, loading, className = '' } = this.props;
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
