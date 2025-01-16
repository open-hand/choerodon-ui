import React, { ReactNode } from 'react';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { ShowHelp } from '../field/enum';
import { Radio, RadioProps } from '../radio/Radio';
import Icon from '../icon';
import { hide, show } from '../tooltip/singleton';
import { BooleanValue } from '../data-set/enum';
import { equalTrueValue, getFirstValue } from '../data-set/utils';
import autobind from '../_util/autobind';

export interface CheckBoxProps extends RadioProps {
  /**
   * 中间状态
   */
  indeterminate?: boolean;
  /**
   * 未选中时的值
   */
  unCheckedValue?: any;
  /**
   * 非选中时的内容
   */
  unCheckedChildren?: ReactNode;
  defaultChecked?: boolean;
}

export class CheckBox<T extends CheckBoxProps> extends Radio<T & CheckBoxProps> {
  static displayName = 'CheckBox';

  /**
   * tooltip disable sign
   */
  // eslint-disable-next-line camelcase
  static __PRO_CHECKBOX = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;

  static defaultProps = {
    ...Radio.defaultProps,
    suffixCls: 'checkbox',
    indeterminate: false,
  };

  type = 'checkbox';

  get unCheckedValue() {
    const { unCheckedValue } = this.props;
    if (unCheckedValue !== undefined) {
      return unCheckedValue;
    }
    const { field } = this;
    if (field) {
      return field.get(BooleanValue.falseValue);
    }
    return false;
  }

  get checkedValue() {
    const { value } = this.props;
    if (value !== undefined) {
      return value;
    }
    const { field } = this;
    if (field) {
      return field.get(BooleanValue.trueValue);
    }
    return true;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.value = getFirstValue(this.props.defaultChecked ? this.checkedValue : this.unCheckedValue);
    });
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (this.showHelp === ShowHelp.tooltip) {
      hide();
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'defaultChecked',
      'unCheckedValue',
      'unCheckedChildren',
      'indeterminate',
    ]);
  }


  @autobind
  handleHelpMouseEnter(e) {
    const { getTooltipTheme, getTooltipPlacement } = this.context;
    const { helpTooltipProps } = this;
    let helpTooltipCls = `${this.getContextConfig('proPrefixCls')}-tooltip-popup-help`;
    if (helpTooltipProps && helpTooltipProps.popupClassName) {
      helpTooltipCls = helpTooltipCls.concat(' ', helpTooltipProps.popupClassName)
    }
    show(e.currentTarget, {
      title: this.getDisplayProp('help'),
      theme: getTooltipTheme('help'),
      placement: getTooltipPlacement('help'),
      ...helpTooltipProps,
      popupClassName: helpTooltipCls,
    });
  }

  handleHelpMouseLeave() {
    hide();
  }

  renderTooltipHelp(): ReactNode {
    const help = this.getDisplayProp('help');
    if (help) {
      return (
        <Icon
          type="help"
          onMouseEnter={this.handleHelpMouseEnter}
          onMouseLeave={this.handleHelpMouseLeave}
        />
      );
    }
  }

  renderInner(): ReactNode {
    return <i className={`${this.prefixCls}-inner`} />;
  }

  getChildrenText() {
    const { children, unCheckedChildren } = this.props;
    return this.isChecked() ? children : unCheckedChildren || children;
  }

  getWrapperClassNames(...args) {
    const {
      prefixCls,
      props: { indeterminate },
    } = this;
    return super.getWrapperClassNames(
      {
        [`${prefixCls}-indeterminate`]: indeterminate,
      },
      ...args,
    );
  }

  isChecked() {
    const { checked, indeterminate } = this.props;
    if (indeterminate) {
      return false;
    }
    const { name, dataSet, checkedValue } = this;
    if (!this.isControlled && dataSet && name) {
      return this.getValues().findIndex(value => equalTrueValue(checkedValue, value)) !== -1;
    }
    if (checked !== undefined) {
      return checked;
    }
    return equalTrueValue(checkedValue, this.value);
  }

  getDataSetValues(): any[] {
    const values = this.getDataSetValue();
    if (values === undefined) {
      return [];
    }
    return [].concat(values);
  }

  @action
  setValue(value: any, noVaidate?: boolean): void {
    const { record, checkedValue, multiple } = this;
    if (record) {
      let values;
      if (multiple) {
        values = this.getValues();
        if (equalTrueValue(checkedValue, value)) {
          values.push(value);
        } else {
          const index = values.findIndex(value => equalTrueValue(checkedValue, value));
          if (index !== -1) {
            values.splice(index, 1);
          }
        }
      } else {
        values = value;
      }
      super.setValue(values, noVaidate);
    } else {
      super.setValue(value, noVaidate);
    }
  }

  @action
  setChecked(checked) {
    this.setValue(getFirstValue(checked ? this.checkedValue : this.unCheckedValue));
  }

  getOldValue() {
    return getFirstValue(this.isChecked() ? this.checkedValue : this.unCheckedValue);
  }
}

@observer
export default class ObserverCheckBox extends CheckBox<CheckBoxProps> {
  static defaultProps = CheckBox.defaultProps;

  // eslint-disable-next-line camelcase
  static __PRO_CHECKBOX = true;

  // eslint-disable-next-line camelcase
  static __IS_IN_CELL_EDITOR = true;
}
