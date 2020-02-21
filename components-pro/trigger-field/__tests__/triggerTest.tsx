import React, { CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { computed } from 'mobx';
import TriggerField, { TriggerFieldProps } from '../TriggerField';
import autobind from '../../_util/autobind';
import { FieldType } from '../../data-set/enum';
import { ValidationMessages } from '../../validator/Validator';
import { $l } from '../../locale-context';

export interface TriggerTestProps extends TriggerFieldProps {}

@observer
export default class TriggerTest extends TriggerField<TriggerTestProps> {
  static displayName = 'TriggerTest';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'trigger-test',
  };

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('TriggerField', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
      typeMismatch: $l('TriggerField', 'type_mismatch'),
    };
  }

  syncValueOnBlur(value) {
    if (value[0] !== '#' && !value.startsWith('rgb') && !value.startsWith('hls')) {
      value = `#${value}`;
    }
    super.syncValueOnBlur(value);
  }

  getFieldType(): FieldType {
    return FieldType.color;
  }

  getValue() {
    return super.getValue();
  }

  getPrefix(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-prefix`}>
        <span className={`${prefixCls}-color`} style={{ backgroundColor: this.getValue() }} />
      </div>
    );
  }

  getPopupFooter() {
    const { prefixCls } = this;
    return <div className={`${prefixCls}-popup-footer`}>trigger-test</div>;
  }

  getPopupContent() {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-popup-view`}>
        <div className={`${prefixCls}-popup-body`} style={{ backgroundColor: this.getValue() }}>
          test
        </div>
        {this.getPopupFooter()}
      </div>
    );
  }

  @autobind
  handlePopupAnimateAppear() {}

  handlePopupAnimateEnd() {}

  getPopupStyleFromAlign(): CSSProperties | undefined {
    return undefined;
  }

  getTriggerIconFont() {
    return 'palette';
  }
}
