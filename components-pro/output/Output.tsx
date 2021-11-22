import React, { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { isArrayLike } from 'mobx';
import isPlainObject from 'lodash/isPlainObject';
import isNil from 'lodash/isNil';
import { FormField, FormFieldProps, RenderProps } from '../field/FormField';
import autobind from '../_util/autobind';
import { Tooltip as TextTooltip } from '../core/enum';
import { processFieldValue, renderMultiLine, toRangeValue } from '../field/utils';
import isEmpty from '../_util/isEmpty';
import isOverflow from '../overflow-tip/util';
import { show } from '../tooltip/singleton';
import { CurrencyProps } from '../currency/Currency';
import Field from '../data-set/Field';
import { defaultOutputRenderer } from './utils';

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
    // noop
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'name',
      'renderEmpty',
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

  @autobind
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
      return processFieldValue(text, field, {
        getProp: (name) => this.getProp(name),
        getValue: () => this.getValue(),
        lang: this.lang,
      }, true, this.record);
    }
    return '';
  }

  @autobind
  defaultRenderer(renderProps: RenderProps): ReactNode {
    return defaultOutputRenderer(renderProps);
  }

  /**
   * 多行单元格渲染
   */
  renderMultiLine(field: Field): ReactNode {
    const {
      name,
      record,
      dataSet,
      prefixCls,
      props: { renderer },
    } = this;
    const { lines, multipleValidateMessageLength } = renderMultiLine({
      name,
      field,
      record,
      dataSet,
      prefixCls,
      renderer,
      renderValidationResult: this.renderValidationResult,
      isValidationMessageHidden: this.isValidationMessageHidden,
      processValue: this.processValue.bind(this),
      tooltip: this.props.tooltip,
      labelTooltip: this.labelTooltip,
    });
    this.multipleValidateMessageLength = multipleValidateMessageLength;
    return lines;
  }

  getRenderedValue(): ReactNode {
    if (this.multiple) {
      return this.renderMultipleValues(true);
    }
    if (this.range) {
      return this.renderRangeValue(toRangeValue(this.getValue(), this.range));
    }
    /**
     * 多行单元格渲染
     */
    const { field } = this;
    if (field && field.get('multiLine', this.record)) {
      return this.renderMultiLine(field);
    }
    return this.processRenderer(this.getValue());
  }

  showTooltip(e): boolean {
    if (super.showTooltip(e)) {
      return true;
    }
    const { getTooltip, getTooltipTheme, getTooltipPlacement } = this.context;
    const { tooltip = getTooltip('output') } = this.props;
    const { element, field } = this;
    if (element && !(field && field.get('multiLine', this.record)) && (tooltip === TextTooltip.always || (tooltip === TextTooltip.overflow && isOverflow(element)))) {
      const title = this.getRenderedValue();
      if (title) {
        show(element, {
          title,
          placement: getTooltipPlacement('output') || 'right',
          theme: getTooltipTheme('output'),
        });
        return true;
      }
    }
    return false;
  }

  renderWrapper(): ReactNode {
    const result = this.getRenderedValue();
    const { renderEmpty } = this.props;
    const text = isEmpty(result) || (isArrayLike(result) && !result.length) ? renderEmpty ? renderEmpty() : this.getContextConfig('renderEmpty')('Output') : result;
    return <span {...this.getMergedProps()}>{text}</span>;
  }
}
