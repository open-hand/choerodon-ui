import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { action, computed } from 'mobx';
import { observer } from 'mobx-react';
import omit from 'lodash/omit';
import noop from 'lodash/noop';
import { FormField, FormFieldProps } from '../field/FormField';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import { ViewMode } from './enum';
import { $l } from '../locale-context';
import formatReactTemplate from '../_util/formatReactTemplate';

export interface RadioProps extends FormFieldProps {
  /**
   * <受控>是否选中
   */
  checked?: boolean;
  /**
   * 初始是否选中
   */
  defaultChecked?: boolean;
  /**
   * 显示模式
   * 可选值： button | box
   * @default box
   */
  mode?: ViewMode;
}

export class Radio<T extends RadioProps> extends FormField<T & RadioProps> {
  static displayName = 'Radio';

  static propTypes = {
    /**
     * <受控>是否选中
     */
    checked: PropTypes.bool,
    /**
     * 初始是否选中
     */
    defaultChecked: PropTypes.bool,
    /**
     * 显示模式
     * 可选值： button | box
     * @default box
     */
    mode: PropTypes.oneOf([
      ViewMode.button,
      ViewMode.box,
    ]),
    ...FormField.propTypes,
  };

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'radio',
  };

  type: string = 'radio';

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    const label = this.getProp('label');
    return {
      valueMissing: formatReactTemplate($l('Radio', label ? 'value_missing_with_label' : 'value_missing'), { label }),
    };
  }

  get checkedValue() {
    const { value = 'on' } = this.props;
    return value;
  }

  get isControlled() {
    return this.props.checked !== void 0;
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), [
      'value',
      'readOnly',
      'mode',
    ]);
    otherProps.type = this.type;
    // if (this.isReadOnly()) {
    //   otherProps.disabled = true;
    // }
    otherProps.onMouseDown = this.handleMouseDown;
    otherProps.onClick = otherProps.onChange;
    otherProps.onChange = noop;
    return otherProps;
  }

  renderWrapper(): ReactNode {
    const checked = this.isChecked();
    return (
      <label key="wrapper" {...this.getWrapperProps()}>
        <input {...this.getOtherProps()} checked={checked} value={this.checkedValue} />
        {this.renderInner()}
        {this.getText()}
        {this.renderFloatLabel()}
      </label>
    );
  }

  renderInner(): ReactNode {
    return <span className={`${this.prefixCls}-inner`} />;
  }

  getText() {
    const { props: { children }, prefixCls } = this;
    if (children) {
      return <span className={`${prefixCls}-label`}>{children}</span>;
    }
  }

  getWrapperClassNames(...args) {
    const { prefixCls, props: { mode } } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-button`]: mode === ViewMode.button,
    }, ...args);
  }

  isChecked() {
    const { checked } = this.props;
    const { name, dataSet, checkedValue } = this;
    if (dataSet && name) {
      return this.getDataSetValue() === checkedValue;
    } else {
      return checked;
    }
  }

  @autobind
  handleMouseDown(e) {
    // e.stopPropagation();
    const { onMouseDown } = this.props;
    if (typeof onMouseDown === 'function') {
      onMouseDown(e);
    }
  }

  @autobind
  handleChange(e) {
    const { onClick = noop } = this.props;
    const { checked } = e.target;
    onClick(e);
    this.setChecked(checked);
  }

  @action
  setChecked(checked: boolean) {
    if (checked) {
      this.setValue(this.checkedValue);
    }
  }

  getOldValue(): any {
    return this.isChecked() ? this.checkedValue : void 0;
  }
}

@observer
export default class ObserverRadio extends Radio<RadioProps> {
  static defaultProps = Radio.defaultProps;
}
