import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import defaultTo from 'lodash/defaultTo';
import { getConfig } from 'choerodon-ui/lib/configure';
import { FormField, FormFieldProps, RenderProps } from '../field/FormField';
import autobind from '../_util/autobind';
import { BooleanValue, FieldType, RecordStatus } from '../data-set/enum';
import { Tooltip as TextTooltip } from '../core/enum';
import ObserverCheckBox from '../check-box/CheckBox';
import { findBindFields, processFieldValue } from '../data-set/utils';
import isEmpty from '../_util/isEmpty';
import Field from '../data-set/Field';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isOverflow from '../overflow-tip/util';
import { show } from '../tooltip/singleton';
import MultiLine from './MultiLine';

export interface OutputProps extends FormFieldProps {
}

@observer
export default class Output extends FormField<OutputProps> {
  static displayName = 'Output';

  static defaultProps = {
    ...FormField.defaultProps,
    suffixCls: 'output',
  };

  isEditable(): boolean {
    return false;
  }

  useFocusedClassName() {
    return false;
  }

  @autobind
  handleChange() {
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'name',
    ]);
  }

  getValueKey(value) {
    if (isArrayLike(value)) {
      return value.map(this.getValueKey, this).join(',');
    }
    return this.processValue(value);
  }

  processValue(value: any): ReactNode {
    if (!isNil(value)) {
      const text = isPlainObject(value) ? value : super.processValue(value);
      const { field, lang } = this;
      if (field) {
        return processFieldValue(text, field, lang, true);
      }
      return text;
    }
    return '';
  }

  @autobind
  defaultRenderer({ value, text, repeat, maxTagTextLength }: RenderProps): ReactNode {
    const { field } = this;
    if (field && field.type === FieldType.boolean) {
      return <ObserverCheckBox disabled checked={value === field.get(BooleanValue.trueValue)} />;
    }
    const result = super.defaultRenderer({ text, repeat, maxTagTextLength });
    return isEmpty(result) ? getConfig('renderEmpty')('Output') : result;
  }

  /**
   * 多行单元格渲染
   * @param readOnly
   */
  renderMultiLine(readOnly?: boolean): ReactNode {
    const {
      name,
      record,
      field,
      dataSet,
      prefixCls,
      props: { renderer },
    } = this;
    if (record) {
      const multiLineFields = findBindFields(field as Field, record.fields);
      if (renderer) {
        return renderer({
          multiLineFields,
          record,
          dataSet,
          name,
        });
      }
      if (readOnly) {
        if (multiLineFields.length) {
          this.multipleValidateMessageLength = 0;
          return (
            multiLineFields.map(fieldItem => {
              if (fieldItem) {
                const { validationResults } = this.multiLineValidator(fieldItem);
                const required = defaultTo(fieldItem.get('required'), this.props.required);
                const fieldName = fieldItem.get('name');
                const value = record.get(fieldName);
                const validationResult = validationResults.find(error => error.value === value);
                const validationMessage =
                  validationResult && this.renderValidationMessage(validationResult);
                const validationHidden = this.isValidationMessageHidden(validationMessage);
                let processValue = '';
                if (fieldItem.get('lovCode')) {
                  const fieldValue = fieldItem.getValue();
                  if (isPlainObject(fieldValue)) {
                    processValue = ObjectChainValue.get(fieldValue, fieldItem.get('textField') || Field.defaultProps.textField);
                  }
                }
                const notEmpty = !isEmpty(value);
                // 值集中不存在 再去取直接返回的值
                const text = this.processText(processValue || this.getText(value));
                this.multipleValidateMessageLength++;
                const validationInner = notEmpty ? text :
                  validationHidden ? record.status === RecordStatus.add ? '' :
                    <span className={`${prefixCls}-multi-value-invalid`}>{text}</span> : validationMessage;
                const label = fieldItem.get('label');
                return (
                  <MultiLine
                    key={`${record!.index}-multi-${fieldName}`}
                    prefixCls={prefixCls}
                    label={label}
                    required={required}
                    validationMessage={validationMessage}
                    validationHidden={validationHidden}
                    tooltip={this.props.tooltip}
                    labelTooltip={this.props.labelTooltip}
                  >
                    {validationInner}
                  </MultiLine>
                );
              }
              return null;
            })
          );
        }
      }
    }
  }

  getRenderedValue(): ReactNode {
    const { multiple, range, multiLine, currency } = this;
    if (multiple) {
      return this.renderMultipleValues(true);
    }
    if (range) {
      return this.renderRangeValue(true);
    }
    /**
     * 多行单元格渲染
     */
    if (multiLine) {
      return this.renderMultiLine(true);
    }
    /**
     * 货币渲染
     */
    if (currency) {
      return this.renderCurrency(true);
    }
    const textNode = this.getTextNode();
    return textNode === '' ? getConfig('tableDefaultRenderer') : textNode;
  }

  showTooltip(e): boolean {
    if (super.showTooltip(e)) {
      return true;
    }
    const { tooltip } = this.props;
    const { element } = this;
    if (element && !this.multiLine && (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(element)))) {
      const title = this.getRenderedValue();
      if (title) {
        show(element, {
          title,
          placement: 'right',
        });
        return true;
      }
    }
    return false;
  }

  renderWrapper(): ReactNode {
    return <span {...this.getMergedProps()}>{this.getRenderedValue()}</span>;
  }
}
