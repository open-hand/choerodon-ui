import React, { Children, Component, ReactChildren, ReactElement, ReactNode } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import shallowEqual from 'lodash/isEqual';
import Radio from './radio';
import { RadioChangeEvent, RadioGroupProps, RadioGroupState } from './interface';
import { getPrefixCls } from '../configure';

function getCheckedValue(children: ReactNode) {
  let value = null;
  let matched = false;
  Children.forEach(children, (radio: any) => {
    if (radio && radio.props && radio.props.checked) {
      value = radio.props.value;
      matched = true;
    }
  });
  return matched ? { value } : undefined;
}

export default class RadioGroup extends Component<RadioGroupProps, RadioGroupState> {
  static displayName = 'RadioGroup';
  static defaultProps = {
    disabled: false,
  };

  static childContextTypes = {
    radioGroup: PropTypes.any,
  };

  constructor(props: RadioGroupProps) {
    super(props);
    let value;
    if ('value' in props) {
      value = props.value;
    } else if ('defaultValue' in props) {
      value = props.defaultValue;
    } else {
      const checkedValue = getCheckedValue(props.children);
      value = checkedValue && checkedValue.value;
    }
    this.state = {
      value,
    };
  }

  getChildContext() {
    return {
      radioGroup: {
        onChange: this.onRadioChange,
        value: this.state.value,
        disabled: this.props.disabled,
        name: this.props.name,
      },
    };
  }

  componentWillReceiveProps(nextProps: RadioGroupProps) {
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
      });
    } else {
      const checkedValue = getCheckedValue(nextProps.children);
      if (checkedValue) {
        this.setState({
          value: checkedValue.value,
        });
      }
    }
  }

  shouldComponentUpdate(nextProps: RadioGroupProps, nextState: RadioGroupState) {
    return !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState);
  }

  onRadioChange = (ev: RadioChangeEvent) => {
    const lastValue = this.state.value;
    const { value } = ev.target;
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }

    const onChange = this.props.onChange;
    if (onChange && value !== lastValue) {
      onChange(ev);
    }
  };

  render() {
    const props = this.props;
    const { prefixCls: customizePrefixCls, className = '', options } = props;
    const prefixCls = getPrefixCls('radio-group', customizePrefixCls);
    const classString = classNames(prefixCls, {
      [`${prefixCls}-${props.size}`]: props.size,
    }, className);
    const wrapperClassString = classNames({
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-has-label`]: props.label,
    });
    const labelClassString = classNames(`${prefixCls}-label`, {
      'label-disabled': props.disabled,
    });
    let children: ReactChildren[] | ReactElement<any>[] | ReactNode = props.children;

    // 如果存在 options, 优先使用
    if (options && options.length > 0) {
      children = options.map((option, index) => {
        if (typeof option === 'string') { // 此处类型自动推导为 string
          return (
            <Radio
              key={index}
              disabled={this.props.disabled}
              value={option}
              onChange={this.onRadioChange}
              checked={this.state.value === option}
            >
              {option}
            </Radio>
          );
        } else { // 此处类型自动推导为 { label: string value: string }
          return (
            <Radio
              key={index}
              disabled={option.disabled || this.props.disabled}
              value={option.value}
              onChange={this.onRadioChange}
              checked={this.state.value === option.value}
            >
              {option.label}
            </Radio>
          );
        }
      });
    }

    return (
      <div className={wrapperClassString}>
        {props.label ? (<span className={labelClassString}>{props.label}</span>) : null}
        <div
          className={classString}
          style={props.style}
          onMouseEnter={props.onMouseEnter}
          onMouseLeave={props.onMouseLeave}
          id={props.id}
        >
          {children}
        </div>
      </div>
    );
  }
}
