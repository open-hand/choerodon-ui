import React, { Component, CSSProperties, KeyboardEventHandler, MouseEventHandler, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shallowEqual from 'lodash/isEqual';
import CheckboxGroup, { CheckboxGroupContext } from './Group';
import RcCheckbox from '../rc-components/checkbox';
import { getPrefixCls } from '../configure';

export interface AbstractCheckboxProps<T> {
  prefixCls?: string;
  className?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  style?: CSSProperties;
  disabled?: boolean;
  onChange?: (e: T) => void;
  onMouseEnter?: MouseEventHandler<any>;
  onMouseLeave?: MouseEventHandler<any>;
  onKeyPress?: KeyboardEventHandler<any>;
  onKeyDown?: KeyboardEventHandler<any>;
  value?: any;
  tabIndex?: number;
  name?: string;
  children?: ReactNode;
}

export interface CheckboxProps extends AbstractCheckboxProps<CheckboxChangeEvent> {
  indeterminate?: boolean;
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: MouseEvent;
}

export default class Checkbox extends Component<CheckboxProps, {}> {
  static displayName = 'Checkbox';
  static Group: typeof CheckboxGroup;
  static defaultProps = {
    indeterminate: false,
  };

  static contextTypes = {
    checkboxGroup: PropTypes.any,
  };

  private rcCheckbox: any;

  shouldComponentUpdate(nextProps: CheckboxProps, nextState: {}, nextContext: CheckboxGroupContext) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState) ||
      !shallowEqual(this.context.checkboxGroup, nextContext.checkboxGroup);
  }

  focus() {
    this.rcCheckbox.focus();
  }

  blur() {
    this.rcCheckbox.blur();
  }

  saveCheckbox = (node: any) => {
    this.rcCheckbox = node;
  };

  render() {
    const { props, context } = this;
    const {
      prefixCls: customizePrefixCls,
      className,
      children,
      indeterminate,
      style,
      onMouseEnter,
      onMouseLeave,
      ...restProps,
    } = props;
    const prefixCls = getPrefixCls('checkbox', customizePrefixCls);
    const { checkboxGroup } = context;
    let checkboxProps: CheckboxProps = { ...restProps };
    if (checkboxGroup) {
      checkboxProps.onChange = () => checkboxGroup.toggleOption({ label: children, value: props.value });
      checkboxProps.checked = checkboxGroup.value.indexOf(props.value) !== -1;
      checkboxProps.disabled = props.disabled || checkboxGroup.disabled;
    }
    const classString = classNames(className, {
      [`${prefixCls}-wrapper`]: true,
    });
    const checkboxClass = classNames({
      [`${prefixCls}-indeterminate`]: indeterminate,
    });
    return (
      <label
        className={classString}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <RcCheckbox
          {...checkboxProps}
          prefixCls={prefixCls}
          className={checkboxClass}
          ref={this.saveCheckbox}
        />
        {children !== undefined ? <span>{children}</span> : null}
      </label>
    );
  }
}
