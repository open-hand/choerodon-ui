import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import omit from 'lodash/omit';
import { action, runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { Radio, RadioProps } from '../radio/Radio';
import { BooleanValue } from '../data-set/enum';

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

  static propTypes = {
    /**
     * 中间状态
     */
    indeterminate: PropTypes.bool,
    /**
     * 未选中时的值
     */
    unCheckedValue: PropTypes.any,
    /**
     * 未选中时的内容
     */
    unCheckedChildren: PropTypes.node,
    defaultChecked: PropTypes.bool,
    ...Radio.propTypes,
  };

  static defaultProps = {
    ...Radio.defaultProps,
    suffixCls: 'checkbox',
    indeterminate: false,
  };

  type: string = 'checkbox';

  get unCheckedValue() {
    const { unCheckedValue } = this.props;
    if (unCheckedValue !== void 0) {
      return unCheckedValue;
    } else {
      const { field } = this;
      if (field) {
        return field.get(BooleanValue.falseValue);
      }
    }
    return false;
  }

  get checkedValue() {
    const { value } = this.props;
    if (value !== void 0) {
      return value;
    } else {
      const { field } = this;
      if (field) {
        return field.get(BooleanValue.trueValue);
      }
    }
    return true;
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.value = this.props.defaultChecked ? this.checkedValue : this.unCheckedValue;
    });
  }

  getOtherProps() {
    return omit(super.getOtherProps(), [
      'defaultChecked',
      'unCheckedValue',
      'unCheckedChildren',
      'indeterminate',
    ]);
  }

  renderInner(): ReactNode {
    return <i className={`${this.prefixCls}-inner`} />;
  }

  getChildrenText() {
    const { children, unCheckedChildren } = this.props;
    return this.isChecked() ? children : unCheckedChildren || children;
  }

  getWrapperClassNames() {
    const { prefixCls, props: { indeterminate } } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-indeterminate`]: indeterminate,
    });
  }

  isChecked() {
    const { checked, indeterminate } = this.props;
    if (indeterminate) {
      return false;
    }
    const { name, dataSet, checkedValue } = this;
    if (dataSet && name) {
      return this.getValues().indexOf(checkedValue) !== -1;
    } else if (checked !== void 0) {
      return checked;
    } else {
      return this.value === checkedValue;
    }
  }

  getDataSetValues(): any[] {
    const values = this.getDataSetValue();
    if (values === void 0) {
      return [];
    } else {
      return [].concat(values);
    }
  }

  @action
  setValue(value: any): void {
    const { record, checkedValue, multiple } = this;
    if (record) {
      let values;
      if (multiple) {
        values = this.getValues();
        if (value === checkedValue) {
          values.push(value);
        } else {
          const index = values.indexOf(checkedValue);
          if (index !== -1) {
            values.splice(index, 1);
          }
        }
      } else {
        values = value;
      }
      super.setValue(values);
    } else {
      super.setValue(value);
    }
  }

  @action
  setChecked(checked) {
    this.setValue(checked ? this.checkedValue : this.unCheckedValue);
  }

  getOldValue() {
    return this.isChecked() ? this.checkedValue : this.unCheckedValue;
  }
}

@observer
export default class ObserverCheckBox extends CheckBox<CheckBoxProps> {
  static defaultProps = CheckBox.defaultProps;
}
