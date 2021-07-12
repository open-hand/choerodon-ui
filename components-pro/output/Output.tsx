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
import { findBindFields } from '../data-set/utils';
import { processFieldValue } from '../field/utils';
import isEmpty from '../_util/isEmpty';
import Field from '../data-set/Field';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import isOverflow from '../overflow-tip/util';
import { show } from '../tooltip/singleton';
import MultiLine from './MultiLine';
import { CurrencyProps } from '../currency/Currency';

export interface OutputProps extends FormFieldProps<any>, CurrencyProps<any> {
  renderEmpty?: () => ReactNode;
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

  getOtherPropsExcludeOutput(otherProps) {
    return otherProps;
  }

  getWrapperClassNamesExcludeOutput() {
    return undefined;
  }

  getObservablePropsExcludeOutput() {
    return undefined;
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
      const { field } = this;
      return processFieldValue<OutputProps>(text, field, this, true);
    }
    return '';
  }

  @autobind
  defaultRenderer({ value, text, repeat, maxTagTextLength }: RenderProps): ReactNode {
    const { field } = this;
    if (field && field.type === FieldType.boolean) {
      return <ObserverCheckBox disabled checked={value === field.get(BooleanValue.trueValue)} />;
    }
    return super.defaultRenderer({ text, repeat, maxTagTextLength });
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
    if (this.multiple) {
      return this.renderMultipleValues(true);
    }
    if (this.range) {
      return this.renderRangeValue(true);
    }
    /**
     * 多行单元格渲染
     */
    if (this.multiLine) {
      return this.renderMultiLine(true);
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
    const result = this.getRenderedValue();
    const { renderEmpty } = this.props;
    const text = isEmpty(result) || (isArrayLike(result) && !result.length) ? renderEmpty ? renderEmpty() : getConfig('renderEmpty')('Output') : result;
    return <span {...this.getMergedProps()}>{text}</span>;
  }
}
