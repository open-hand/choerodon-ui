import React, { ReactNode } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { action, computed, isArrayLike } from 'mobx';
import omit from 'lodash/omit';
import { Select, SelectProps } from '../select/Select';
import Radio from '../radio/Radio';
import CheckBox from '../check-box/CheckBox';
import autobind from '../_util/autobind';
import { ValidationMessages } from '../validator/Validator';
import Option from '../option/Option';
import OptGroup from '../option/OptGroup';
import { ViewMode } from '../radio/enum';
import { $l } from '../locale-context';
import { LabelLayout } from '../form/enum';
import formatReactTemplate from '../_util/formatReactTemplate';

const GroupIdGen = function* (id) {
  while (true) {
    yield `__group-${id++}__`;
  }
}(1);

export interface SelectBoxProps extends SelectProps {
  /**
   * 是否垂直显示
   */
  vertical?: boolean;
  mode?: ViewMode;
}

@observer
export default class SelectBox extends Select<SelectBoxProps> {
  static displayName = 'SelectBox';

  static propTypes = {
    /**
     * 是否垂直显示
     */
    vertical: PropTypes.bool,
    ...Select.propTypes,
  };

  static defaultProps = {
    ...Select.defaultProps,
    suffixCls: 'select-box',
    vertical: false,
  };

  static Option = Option;

  static OptGroup = OptGroup;

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    const label = this.getProp('label');
    return {
      valueMissing: formatReactTemplate($l('SelectBox', label ? 'value_missing_with_label' : 'value_missing'), { label }),
    };
  }

  @action
  setName(name) {
    super.setName(name || this.name || GroupIdGen.next().value);
  }

  getOtherProps() {
    return omit(super.getOtherProps(), ['vertical']);
  }

  getClassName() {
    const { prefixCls, props: { vertical } } = this;
    return super.getClassName({
      [`${prefixCls}-vertical`]: vertical,
    });
  }

  isEmpty() {
    return false;
  }

  renderWrapper(): ReactNode {
    const { options, textField, valueField } = this;
    const { autoFocus, mode } = this.props;
    const items = options.data.map((record, index) => (
      this.renderItem({
        key: index,
        dataSet: null,
        value: record.get(valueField),
        checked: this.isChecked(this.getValue(), record.get(valueField)),
        name: this.name,
        onChange: this.handleItemChange,
        children: record.get(textField),
        autoFocus: autoFocus && index === 0,
        readOnly: this.isReadOnly(),
        disabled: this.isDisabled(),
        mode,
        noValidate: true,
        labelLayout: LabelLayout.none,
      })
    ));
    const { className } = this.getOtherProps();
    const Element = this.context.formNode ? 'div' : 'form';
    return (
      <span key="wrapper" {...this.getWrapperProps()}>
        <Element className={className}>{items}</Element>
        {this.renderFloatLabel()}
      </span>
    );
  }

  @autobind
  handleItemChange(value, oldValue) {
    if (this.multiple) {
      const values = this.getValues();
      if (!value) {
        values.splice(values.indexOf(oldValue), 1);
      } else {
        values.push(value);
      }
      this.setValue(values);
    } else {
      this.setValue(value);
    }
  }

  isChecked(value, checkedValue) {
    if (isArrayLike(value)) {
      return value.indexOf(checkedValue) !== -1;
    } else {
      return value === checkedValue;
    }
  }

  renderItem(props) {
    if (this.multiple) {
      return <CheckBox {...props} />;
    } else {
      return <Radio {...props} />;
    }
  }
}
