import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shallowEqual from 'lodash/isEqual';
import RadioGroup from './group';
import RadioButton from './radioButton';
import { RadioChangeEvent, RadioGroupContext, RadioProps } from './interface';
import RcCheckbox from '../rc-components/checkbox';
import { getPrefixCls } from '../configure';

export default class Radio extends Component<RadioProps, {}> {
  static displayName = 'Radio';

  static Group: typeof RadioGroup;

  static Button: typeof RadioButton;

  static defaultProps = {
    type: 'radio',
  };

  static contextTypes = {
    radioGroup: PropTypes.any,
  };

  private rcCheckbox: any;

  shouldComponentUpdate(nextProps: RadioProps, nextState: {}, nextContext: RadioGroupContext) {
    const { radioGroup } = this.context;
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState) ||
      !shallowEqual(radioGroup, nextContext.radioGroup)
    );
  }

  saveCheckbox = (node: any) => {
    this.rcCheckbox = node;
  };

  onChange = (e: RadioChangeEvent) => {
    const { onChange } = this.props;
    const { radioGroup } = this.context;
    if (onChange) {
      onChange(e);
    }
    if (radioGroup && radioGroup.onChange) {
      radioGroup.onChange(e);
    }
  };

  focus() {
    this.rcCheckbox.focus();
  }

  blur() {
    this.rcCheckbox.blur();
  }

  render() {
    const { props, context } = this;
    const { prefixCls: customizePrefixCls, className, children, style, ...restProps } = props;
    const prefixCls = getPrefixCls('radio', customizePrefixCls);
    const { radioGroup } = context;
    const radioProps: RadioProps = { ...restProps };
    if (radioGroup) {
      radioProps.name = radioGroup.name;
      radioProps.onChange = this.onChange;
      radioProps.checked = props.value === radioGroup.value;
      radioProps.disabled = props.disabled || radioGroup.disabled;
    }
    const wrapperClassString = classNames(className, {
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: radioProps.checked,
      [`${prefixCls}-wrapper-disabled`]: radioProps.disabled,
    });

    return (
      <label
        className={wrapperClassString}
        style={style}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
      >
        <RcCheckbox {...radioProps} prefixCls={prefixCls} ref={this.saveCheckbox} />
        {children !== undefined ? <span>{children}</span> : null}
      </label>
    );
  }
}
