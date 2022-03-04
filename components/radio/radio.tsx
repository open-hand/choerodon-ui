import React, { Component } from 'react';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import RadioGroup from './group';
import RadioButton from './radioButton';
import { RadioChangeEvent, RadioProps } from './interface';
import RcCheckbox from '../rc-components/checkbox';
import RadioContext, { RadioGroupContext } from './RadioContext';

export default class Radio extends Component<RadioProps, {}> {
  static displayName = 'Radio';

  static Group: typeof RadioGroup;

  static Button: typeof RadioButton;

  static defaultProps = {
    type: 'radio',
  };

  static get contextType(): typeof RadioContext {
    return RadioContext;
  }

  private rcCheckbox: any;

  shouldComponentUpdate(nextProps: RadioProps, nextState: {}, nextContext: RadioGroupContext) {
    const { radioGroup, getPrefixCls } = this.context;
    return (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState) ||
      !shallowEqual(radioGroup, nextContext.radioGroup) || getPrefixCls !== nextContext.getPrefixCls
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
    const { radioGroup, getPrefixCls } = context;
    const prefixCls = getPrefixCls('radio', customizePrefixCls);
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
