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
import OverflowTip from '../overflow-tip';
import Field from '../data-set/Field';
import * as ObjectChainValue from '../_util/ObjectChainValue';
import Tooltip from '../tooltip';
import Row from '../row';
import Col from '../col';

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
      props: { renderer, tooltip },
    } = this;
    const multiLineFields = findBindFields(field as Field, record!.fields);
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
          <>
            {multiLineFields.map(fieldItem => {
              if (fieldItem) {
                const { validationResults } = this.multiLineValidator(fieldItem);
                const required = defaultTo(fieldItem && fieldItem.get('required'), this.props.required);
                const repeats: Map<any, number> = new Map<any, number>();
                const validationResult = validationResults.find(error => error.value === record?.get(fieldItem.get('name')));
                const validationMessage =
                  validationResult && this.renderValidationMessage(validationResult);
                const key = this.getValueKey(record?.get(fieldItem.get('name')));
                const repeat = repeats.get(key) || 0;
                const validationHidden = this.isValidationMessageHidden(validationMessage);
                let processValue = '';
                if (fieldItem && fieldItem.get('lovCode')) {
                  if (!isNil(fieldItem.getValue())) {
                    if (isPlainObject(fieldItem.getValue())) {
                      processValue = ObjectChainValue.get(fieldItem.getValue(), fieldItem.get('textField') || 'meaning');
                    }
                  }
                }
                const value = record?.get(fieldItem.get('name'));
                const notEmpty = !isEmpty(value);
                // 值集中不存在 再去取直接返回的值
                const text = this.processText(processValue || this.getText(value));
                this.multipleValidateMessageLength++;
                const inner = record?.status === RecordStatus.add ? '' :
                  <span className={`${prefixCls}-multi-value-invalid`}>{text}</span>;
                const validationInner = validationHidden ? inner : (
                  <Tooltip
                    suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
                    key={`${key}-${repeat}`}
                    title={validationMessage}
                    theme="light"
                    placement="bottomLeft"
                    hidden={validationHidden}
                  >
                    {validationMessage}
                  </Tooltip>
                );
                const label = fieldItem.get('label');
                const useTooltip = [TextTooltip.always, TextTooltip.overflow].includes(tooltip!);
                const labelCol = label && (
                  <Col
                    span={8}
                    className={required ? `${prefixCls}-multi-label ${prefixCls}-multi-label-required` : `${prefixCls}-multi-label`}
                  >
                    {fieldItem.get('label')}
                  </Col>
                );
                const fieldCol = (
                  <Col
                    span={label ? 16 : 24}
                    className={
                      validationHidden ?
                        `${prefixCls}-multi-value` :
                        `${prefixCls}-multi-value ${prefixCls}-multi-value-invalid`
                    }
                  >
                    {
                      notEmpty ? (
                        <Tooltip
                          suffixCls={`form-tooltip ${getConfig('proPrefixCls')}-tooltip`}
                          key={`${key}-${repeat}`}
                          title={validationMessage}
                          theme="light"
                          placement="bottomLeft"
                          hidden={validationHidden}
                        >
                          {text}
                        </Tooltip>
                      ) : validationInner
                    }
                  </Col>
                );
                return (
                  <Row key={`${record?.index}-multi-${fieldItem.get('name')}`} className={`${prefixCls}-multi`}>
                    {
                      labelCol && useTooltip ? (
                        <OverflowTip title={label} placement="right" strict={tooltip === TextTooltip.always}>
                          {labelCol}
                        </OverflowTip>
                      ) : labelCol
                    }
                    {
                      useTooltip ? (
                        <OverflowTip title={notEmpty ? text : validationMessage} placement="right" strict={tooltip === TextTooltip.always}>
                          {fieldCol}
                        </OverflowTip>
                      ) : fieldCol
                    }
                  </Row>
                );
              }
              return null;
            })}
          </>
        );
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

  @autobind
  getOverflowContainer() {
    return this.element;
  }

  renderWrapper(): ReactNode {
    const { tooltip } = this.props;
    const renderedValue = this.getRenderedValue();
    const wrapper = <span {...this.getMergedProps()}>{renderedValue}</span>;
    return [TextTooltip.always, TextTooltip.overflow].includes(tooltip!) && !this.multiLine ? (
      <OverflowTip
        key="tooltip"
        placement="right"
        strict={tooltip === TextTooltip.always}
        getOverflowContainer={this.getOverflowContainer}
        title={renderedValue}
      >
        {wrapper}
      </OverflowTip>
    ) : (
      wrapper
    );
  }
}
