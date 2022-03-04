import React, { Children, Component, ReactNode } from 'react';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import Radio from './radio';
import { RadioChangeEvent, RadioGroupButtonStyle, RadioGroupProps, RadioGroupState } from './interface';
import ConfigContext, { ConfigContextValue } from '../config-provider/ConfigContext';
import { RadioContextProvider } from './RadioContext';

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

  static get contextType(): typeof ConfigContext {
    return ConfigContext;
  }

  static defaultProps = {
    disabled: false,
    buttonStyle: 'outline' as RadioGroupButtonStyle,
  };

  context: ConfigContextValue;

  constructor(props: RadioGroupProps, context: ConfigContextValue) {
    super(props, context);
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

  getContextValue() {
    const { disabled, name } = this.props;
    const { value } = this.state;
    return {
      radioGroup: {
        onChange: this.onRadioChange,
        value,
        disabled,
        name,
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
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }

  onRadioChange = (ev: RadioChangeEvent) => {
    const { value: lastValue } = this.state;
    const { value } = ev.target;
    if (!('value' in this.props)) {
      this.setState({
        value,
      });
    }

    const { onChange } = this.props;
    if (onChange && value !== lastValue) {
      onChange(ev);
    }
  };

  render() {
    const { props } = this;
    const { prefixCls: customizePrefixCls, className = '', options, buttonStyle, size, label, disabled } = props;
    const { value } = this.state;
    const { getPrefixCls } = this.context;
    const prefixCls = getPrefixCls('radio', customizePrefixCls);
    const groupPrefixCls = `${prefixCls}-group`;
    const classString = classNames(
      groupPrefixCls,
      `${groupPrefixCls}-${buttonStyle}`,
      {
        [`${groupPrefixCls}-${size}`]: size,
      },
      className,
    );

    let { children } = props;

    // 如果存在 options, 优先使用
    if (options && options.length > 0) {
      children = options.map((option, index) => {
        if (typeof option === 'string') {
          // 此处类型自动推导为 string
          return (
            <Radio
              key={String(index)}
              prefixCls={prefixCls}
              disabled={disabled}
              value={option}
              onChange={this.onRadioChange}
              checked={value === option}
            >
              {option}
            </Radio>
          );
        }
        // 此处类型自动推导为 { label: string value: string }
        return (
          <Radio
            key={String(index)}
            prefixCls={prefixCls}
            disabled={option.disabled || disabled}
            value={option.value}
            onChange={this.onRadioChange}
            checked={value === option.value}
          >
            {option.label}
          </Radio>
        );
      });
    }

    const group = (
      <div
        className={classString}
        style={props.style}
        onMouseEnter={props.onMouseEnter}
        onMouseLeave={props.onMouseLeave}
        id={props.id}
      >
        <RadioContextProvider {...this.getContextValue()} getPrefixCls={getPrefixCls}>
          {children}
        </RadioContextProvider>
      </div>
    );
    if (label) {
      const wrapperClassString = classNames({
        [`${groupPrefixCls}-wrapper`]: true,
        [`${groupPrefixCls}-has-label`]: label,
      });
      const labelClassString = classNames(`${groupPrefixCls}-label`, {
        'label-disabled': disabled,
      });
      return (
        <div className={wrapperClassString}>
          <span className={labelClassString}>{label}</span>
          {group}
        </div>
      );
    }
    return group;
  }
}
