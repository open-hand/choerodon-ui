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
import { LabelLayout } from '../form/enum';

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
    mode: PropTypes.oneOf([ViewMode.button, ViewMode.box]),
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
      valueMissing: $l('Radio', label ? 'value_missing_with_label' : 'value_missing', { label }),
    };
  }

  get checkedValue() {
    const { value = 'on' } = this.props;
    return value;
  }

  get isControlled() {
    return this.props.checked !== undefined;
  }

  getOtherProps() {
    const otherProps = omit(super.getOtherProps(), ['value', 'readOnly', 'mode']);
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
        {this.getTextNode()}
        {this.renderFloatLabel()}
      </label>
    );
  }

  renderInner(): ReactNode {
    return <span className={`${this.prefixCls}-inner`} />;
  }

  /**
   * 当使用label代替children时，不需要展示float label
   *
   * @readonly
   * @memberof Radio
   */
  get hasFloatLabel() {
    return this.getLabelChildren() ? false : super.hasFloatLabel;
  }

  /**
   * 没有children时，使用label替代children
   *
   * @returns {ReactNode} label
   * @memberof Radio
   */
  getLabelChildren(): ReactNode {
    const { labelLayout } = this;
    return (
      labelLayout &&
      ![LabelLayout.horizontal, LabelLayout.vertical, LabelLayout.none].includes(labelLayout) &&
      this.getLabel()
    );
  }

  getChildrenText() {
    return this.props.children;
  }

  getTextNode() {
    const { prefixCls } = this;
    const text = this.getChildrenText() || this.getLabelChildren();
    if (text) {
      return <span className={`${prefixCls}-label`}>{text}</span>;
    }
  }

  getWrapperClassNames(...args) {
    const {
      prefixCls,
      props: { mode },
    } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-button`]: mode === ViewMode.button,
      },
      ...args,
    );
  }

  isChecked() {
    const { checked } = this.props;
    const { name, dataSet, checkedValue } = this;
    if (dataSet && name) {
      return this.getDataSetValue() === checkedValue;
    }
    return checked;
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
    return this.isChecked() ? this.checkedValue : undefined;
  }
}

@observer
export default class ObserverRadio extends Radio<RadioProps> {
  static defaultProps = Radio.defaultProps;
}
