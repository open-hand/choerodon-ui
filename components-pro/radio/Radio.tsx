import React, { ReactNode } from 'react';
import { action, toJS } from 'mobx';
import { observer } from 'mobx-react';
import noop from 'lodash/noop';
import { FormField, FormFieldProps } from '../field/FormField';
import { ShowHelp } from '../field/enum';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import { ViewMode } from './enum';
import { $l } from '../locale-context';
import { LabelLayout } from '../form/enum';
import { Tooltip as TextTooltip } from '../core/enum';
import isOverflow from '../overflow-tip/util';
import { show } from '../tooltip/singleton';

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

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'radio',
  };

  // eslint-disable-next-line camelcase
  static __PRO_RADIO = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  type = 'radio';

  labelRef: HTMLSpanElement | null;

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('Radio', label ? 'value_missing' : 'value_missing_no_label', { label }),
    };
  }

  get checkedValue() {
    const { value = 'on' } = this.props;
    return value;
  }

  @autobind
  saveLabelRef(node) {
    this.labelRef = node;
  }

  getControlled(props) {
    return props.checked !== undefined;
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'value',
      'readOnly',
      'mode',
    ]);
  }

  getObservablePropsExcludeOutput(props, context): object | undefined {
    return {
      readOnly: context.readOnly || props.readOnly,
    };
  }

  getOtherProps() {
    const otherProps = super.getOtherProps();
    otherProps.type = this.type;
    otherProps.onMouseDown = this.handleMouseDown;
    otherProps.onClick = otherProps.onChange;
    otherProps.onChange = noop;
    return otherProps;
  }

  showTooltip(e): boolean {
    if (super.showTooltip(e)) {
      return true;
    }
    const { labelTooltip, labelRef } = this;
    if (labelRef && (labelTooltip === TextTooltip.always || (labelTooltip === TextTooltip.overflow && isOverflow(labelRef)))) {
      const labelText = this.getLabelText();
      if (labelText) {
        const { getTooltipTheme, getTooltipPlacement } = this.context;
        show(labelRef, {
          title: labelText,
          theme: getTooltipTheme('label'),
          placement: getTooltipPlacement('label'),
        });
        return true;
      }
    }
    return false;
  }

  renderWrapper(): ReactNode {
    const checked = this.isChecked();
    const floatLabel = super.hasFloatLabel ? this.renderSwitchFloatLabel() : undefined;
    const tooltipHelp = this.showHelp === ShowHelp.tooltip ? this.renderTooltipHelp() : undefined;
    return (
      <>
        <label key="wrapper" {...this.getWrapperProps()}>
          <input {...this.getOtherProps()} checked={checked} value={this.checkedValue} />
          {this.renderInner()}
          {this.getTextNode(!!tooltipHelp)}
          {tooltipHelp}
          {this.renderFloatLabel()}
        </label>
        {floatLabel}
      </>
    );
  }

  /**
   * 解决form 在float的时候没有表头的问题
   * 也可以在需要不在组件内部展现label的时候使用
   */
  renderSwitchFloatLabel(): ReactNode | undefined {
    return undefined;
  }

  renderInner(): ReactNode {
    return <span className={`${this.prefixCls}-inner`} />;
  }

  renderTooltipHelp(): ReactNode {
    return undefined;
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
    return toJS(this.props.children);
  }

  getLabelText() {
    return this.getChildrenText() || this.getLabelChildren();
  }

  getTextNode(hasTooltipHelp) {
    const { prefixCls } = this;
    const text = this.getLabelText();
    if (text) {
      return <span ref={this.saveLabelRef} className={`${prefixCls}-label`} style={hasTooltipHelp ? { flex: 'none' } : {}}>{text}</span>;
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
        [`${prefixCls}-checked`]: this.isChecked(),
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

  // eslint-disable-next-line camelcase
  static __PRO_RADIO = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;
}
