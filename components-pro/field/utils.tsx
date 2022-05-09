import React, { cloneElement, isValidElement, ReactNode } from 'react';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import isPlainObject from 'lodash/isPlainObject';
import { get, isArrayLike, isObservableObject } from 'mobx';
import classNames from 'classnames';
import { isMoment } from 'moment';
import { BigNumber } from 'bignumber.js';
import { Utils, math } from 'choerodon-ui/dataset';
import { getConfig as getConfigDefault, getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import { TooltipTheme, TooltipPlacement } from 'choerodon-ui/lib/tooltip';
import { FieldType, RecordStatus } from '../data-set/enum';
import formatCurrency from '../formatter/formatCurrency';
import formatNumber from '../formatter/formatNumber';
import { FormatNumberFuncOptions } from '../number-field/NumberField';
import isEmpty from '../_util/isEmpty';
import CloseButton from './CloseButton';
import { hide, show } from '../tooltip/singleton';
import ValidationResult from '../validator/ValidationResult';
import Icon from '../icon';
import { $l } from '../locale-context';
import isReactChildren from '../_util/isReactChildren';
import { defaultTextField, findBindFields } from '../data-set/utils';
import ObjectChainValue from '../_util/ObjectChainValue';
import MultiLine from '../output/MultiLine';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field, { HighlightProps } from '../data-set/Field';
import { Renderer, RenderProps } from './FormField';
import { Tooltip } from '../core/enum';

const toRangeValue: typeof Utils.toRangeValue = Utils.toRangeValue;
const getDateFormatByFieldType: typeof Utils.getDateFormatByFieldType = Utils.getDateFormatByFieldType;
const getDateFormatByField: typeof Utils.getDateFormatByField = Utils.getDateFormatByField;

export {
  toRangeValue,
  getDateFormatByFieldType,
  getDateFormatByField,
};

export function fromRangeValue(value: any[], range?: boolean | [string, string]): any {
  if (isArrayLike(range)) {
    const [start, end] = range;
    return {
      [start]: value[0],
      [end]: value[1],
    };
  }
  return value;
}

export function toMultipleValue(value: any, range?: boolean | [string, string]) {
  if (!isNil(value)) {
    const multipleValue = isArrayLike(value) ? value.slice() : [value];
    if (range) {
      return multipleValue.map(item => toRangeValue(item, range));
    }
    return multipleValue;
  }
  return [];
}

export function transformHighlightProps(highlight: true | ReactNode | HighlightProps, props: HighlightProps): HighlightProps {
  if (isValidElement(highlight) || isString(highlight)) {
    return {
      ...props,
      content: highlight,
    };
  }
  if (isObject(highlight)) {
    return {
      ...props,
      ...highlight,
    };
  }
  return props;
}

export function getCurrencyFormatter(getConfig = getConfigDefault) {
  const currencyFormatter = getConfig('currencyFormatter');
  if (currencyFormatter !== undefined) {
    return currencyFormatter;
  }
  return formatCurrency;
}

export function getNumberFormatter(getConfig = getConfigDefault) {
  const numberFieldFormatter = getConfig('numberFieldFormatter');
  if (numberFieldFormatter !== undefined) {
    return numberFieldFormatter;
  }
  return formatNumber;
}

export function getCurrencyFormatOptions(getProp: (name) => any, controlLang?: string, getConfig = getConfigDefault): FormatNumberFuncOptions {
  const precision = getProp('precision');
  const formatterOptions: FormatNumberFuncOptions = getProp('formatterOptions') || {};
  const currencyFormatterOptions: FormatNumberFuncOptions = getConfig('currencyFormatterOptions') || { options: {} };
  const lang = formatterOptions.lang || currencyFormatterOptions.lang || controlLang;
  const options: Intl.NumberFormatOptions = {};
  if (isNumber(precision)) {
    options.minimumFractionDigits = precision;
    options.maximumFractionDigits = precision;
  }
  Object.assign(options, currencyFormatterOptions.options, formatterOptions.options);

  const numberGrouping = getProp('numberGrouping');
  const currency = getProp('currency');
  if (currency) {
    options.currency = currency;
  }
  if (numberGrouping === false) {
    options.useGrouping = false;
  }
  return {
    lang,
    options,
  };
}

export function getNumberFormatOptions(getProp: (name) => any, getValue?: () => number | BigNumber | undefined, value?: number | BigNumber, controlLang?: string, getConfig = getConfigDefault): FormatNumberFuncOptions {
  const precision = getProp('precision');
  const v: number | BigNumber | undefined = isNil(value) ? getValue && getValue() : value;
  const precisionInValue = isNumber(precision) ? precision : math.dp(v || 0);
  const formatterOptions: FormatNumberFuncOptions = getProp('formatterOptions') || {};
  const numberFieldFormatterOptions: FormatNumberFuncOptions = getConfig('numberFieldFormatterOptions') || { options: {} };
  const lang = formatterOptions.lang || numberFieldFormatterOptions.lang || controlLang;
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: precisionInValue,
    ...numberFieldFormatterOptions.options,
    ...formatterOptions.options,
  };
  const numberGrouping = getProp('numberGrouping');
  if (numberGrouping === false) {
    options.useGrouping = false;
  }
  return {
    lang,
    options,
  };
}

export function processFieldValue(value, field: Field | undefined, options: { getProp(name: string): any; getValue?(): any; lang?: string }, showValueIfNotFound?: boolean, record?: Record, getConfig = getConfigDefault) {
  const { getProp, getValue, lang } = options;
  const type = getProp('type');
  const currency = getProp('currency');
  if (currency || type === FieldType.currency) {
    const formatOptions = getCurrencyFormatOptions(getProp, lang, getConfig);
    const formatter = getProp('formatter');
    return (formatter || getCurrencyFormatter(getConfig))(value, formatOptions.lang, formatOptions.options);
  }
  if (type === FieldType.number || type === FieldType.bigNumber) {
    const formatOptions = getNumberFormatOptions(getProp, getValue, value, lang, getConfig);
    const formatter = getProp('formatter');
    return (formatter || getNumberFormatter(getConfig))(value, formatOptions.lang, formatOptions.options);
  }
  if (field) {
    return field.getText(value, showValueIfNotFound, record);
  }
  return value;
}

export function processValue(value: any, format?: string, showInvalidDate?: boolean) {
  if (!isNil(value)) {
    if (isMoment(value)) {
      if (value.isValid()) {
        return value.format(format);
      }
      if (showInvalidDate) {
        return $l('DatePicker', 'invalid_date') as string;
      }
      return '';
    }
    if (isReactChildren(value)) {
      // For Select's Option and TreeSelect's TreeNode which type may be ReactElement
      return value;
    }
    return value.toString();
  }
  return '';
}

export function isFieldValueEmpty(value: any, range?: boolean | [string, string], multiple?: boolean, valueField?: string, textField?: string) {
  if (isEmpty(value)) {
    return true;
  }
  if (multiple) {
    return !isArrayLike(value) || value.length === 0;
  }
  if (range === true) {
    return isArrayLike(value) && value.every(v => isEmpty(v));
  }
  if (isArrayLike(range)) {
    return value && Object.values(value).every(v => isEmpty(v));
  }
  const isObjectEmpty = (v): boolean => {
    if (valueField && textField) {
      if (isObservableObject(v)) {
        return isEmpty(get(v, valueField)) && isEmpty(get(v, textField));
      }
      if (isObject(v)) {
        return isEmpty(v[valueField]) && isEmpty(v[textField]);
      }
    }
    return false;
  };
  if (isArrayLike(value)) {
    return value.length ? value.every(v => {
      if (isEmpty(v)) {
        return true;
      }
      return isObjectEmpty(v);
    }) : true;
  }
  return isObjectEmpty(value);
}

export type MultipleRenderOption = {
  range?: boolean | [string, string] | undefined;
  maxTagCount?: number | undefined;
  maxTagPlaceholder?: ReactNode | ((omittedValues: any[]) => ReactNode);
  prefixCls?: string | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  validationResults?: ValidationResult[] | undefined;
  tooltipTheme?: TooltipTheme;
  isMultipleBlockDisabled?(v: any): boolean;
  processRenderer(v: any, repeat?: number): ReactNode;
  renderValidationResult(result: ValidationResult): ReactNode;
  handleMultipleValueRemove?(e, value: any, index: number): void;
  isValidationMessageHidden(message?: ReactNode): boolean | undefined;
  showValidationMessage(e, message?: ReactNode, tooltipTheme?: TooltipTheme, tooltipPlacement?: TooltipPlacement): void;
  getKey?(v: any): string;
}

export type RangeRenderOption = {
  repeat?: number | undefined;
  processRenderer(v: any, repeat?: number): ReactNode;
}

export type MultiLineRenderOption = {
  prefixCls?: string | undefined;
  field: Field;
  record?: Record;
  dataSet?: DataSet;
  renderer?: Renderer;
  name?: string;
  tooltip?: Tooltip;
  labelTooltip?: Tooltip;
  renderValidationResult(result: ValidationResult): ReactNode;
  isValidationMessageHidden(message?: ReactNode): boolean | undefined;
  processValue(value): ReactNode;
}

export function renderRangeValue(value, option: RangeRenderOption) {
  const { repeat, processRenderer } = option;
  const rangeValue = (value || []).map((item) => processRenderer(item, repeat), []) as [any, any];
  if (rangeValue.some(v => !isEmpty(v))) {
    return (
      <>
        {rangeValue[0]}~{rangeValue[1]}
      </>
    );
  }
}

export function getValueKey(v: any) {
  if (isArrayLike(v)) {
    return v.join(',');
  }
  return v;
}

export function renderMultipleValues(value, option: MultipleRenderOption): { tags: ReactNode; multipleValidateMessageLength: number } {
  const {
    range, maxTagPlaceholder, prefixCls, validationResults, disabled, readOnly, isMultipleBlockDisabled, processRenderer,
    renderValidationResult, handleMultipleValueRemove, getKey = getValueKey, isValidationMessageHidden, showValidationMessage: selfShowValidationMessage,
    tooltipTheme,
  } = option;
  const values = toMultipleValue(value, range);
  const valueLength = values.length;
  const { maxTagCount = valueLength } = option;
  const repeats: Map<any, number> = new Map<any, number>();
  const blockClassName = classNames(
    {
      [`${prefixCls}-multiple-block-disabled`]: disabled,
    },
    `${prefixCls}-multiple-block`,
  );
  let multipleValidateMessageLength = 0;
  const tags = values.slice(0, maxTagCount).map((v, index) => {
    const key = getKey(v);
    const repeat = repeats.get(key) || 0;
    const text = range ? renderRangeValue(v, { repeat, processRenderer }) : processRenderer(v, repeat);
    repeats.set(key, repeat + 1);
    if (!isEmpty(text)) {
      const validationResult: ValidationResult | undefined = validationResults && validationResults.find(error => error.value === v);
      const blockDisabled = isMultipleBlockDisabled ? isMultipleBlockDisabled(v) : disabled;
      const className = classNames(
        {
          [`${prefixCls}-multiple-block-invalid`]: validationResult,
          [`${prefixCls}-multiple-block-disabled`]: blockDisabled,
        },
        `${prefixCls}-multiple-block`,
      );
      const validationMessage =
        validationResult && renderValidationResult(validationResult);
      if (validationMessage) {
        multipleValidateMessageLength++;
      }
      const closeBtn = !blockDisabled && !readOnly && (
        <CloseButton onClose={handleMultipleValueRemove} value={v} index={repeat} />
      );
      const inner = readOnly ? (
        <span key={String(index)} className={className}>{text}</span>
      ) : (
        <li key={String(index)} className={className}>
          <div>{text}</div>
          {closeBtn}
        </li>
      );
      if (!isValidationMessageHidden(validationMessage)) {
        return cloneElement(inner, {
          onMouseEnter: (e) => selfShowValidationMessage(e, validationMessage, tooltipTheme),
          onMouseLeave: () => hide(),
        });
      }

      return inner;
    }
    return undefined;
  });

  if (valueLength > maxTagCount) {
    let content: ReactNode = `+ ${valueLength - maxTagCount} ...`;
    if (maxTagPlaceholder) {
      const omittedValues = values.slice(maxTagCount, valueLength);
      content =
        typeof maxTagPlaceholder === 'function'
          ? maxTagPlaceholder(omittedValues)
          : maxTagPlaceholder;
    }
    tags.push(
      <li key="maxTagPlaceholder" className={blockClassName}>
        <div>{content}</div>
      </li>,
    );
  }

  return { tags, multipleValidateMessageLength };
}

export function renderMultiLine(options: MultiLineRenderOption): { lines?: ReactNode; multipleValidateMessageLength: number } {
  const {
    field, record, dataSet, name, prefixCls, renderer, renderValidationResult, isValidationMessageHidden,
    processValue: selfProcessValue, labelTooltip, tooltip,
  } = options;
  let multipleValidateMessageLength = 0;
  if (record) {
    const multiLineFields = findBindFields(field, record.dataSet.fields, false, record);
    if (renderer) {
      return {
        lines: renderer({
          multiLineFields,
          record,
          dataSet,
          name,
        }),
        multipleValidateMessageLength,
      };
    }
    if (multiLineFields.length) {
      const lines = (
        multiLineFields.map(fieldItem => {
          if (fieldItem) {
            const required = defaultTo(fieldItem.get('required', record), field.get('required', record));
            const fieldName = fieldItem.name;
            const value = record.get(fieldName);
            const validationResults = record.getValidationError(fieldName);
            const validationResult = validationResults && validationResults.find(error => error.value === value);
            const validationMessage =
              validationResult && renderValidationResult(validationResult);
            const validationHidden = isValidationMessageHidden(validationMessage);
            let processedValue = '';
            if (fieldItem.get('lovCode', record)) {
              const fieldValue = fieldItem.getValue(record);
              if (isPlainObject(fieldValue)) {
                processedValue = ObjectChainValue.get(fieldValue, fieldItem.get('textField', record) || defaultTextField);
              }
            }
            const notEmpty = !isEmpty(value);
            // 值集中不存在 再去取直接返回的值
            const text = processedValue || selfProcessValue(value);
            multipleValidateMessageLength++;
            const validationInner = notEmpty ? text :
              validationHidden ? record.status === RecordStatus.add ? '' :
                <span className={`${prefixCls}-multi-value-invalid`}>{text}</span> : validationMessage;
            const label = fieldItem.get('label', record);
            return (
              <MultiLine
                key={`${record!.index}-multi-${fieldName}`}
                prefixCls={prefixCls}
                label={label}
                required={required}
                validationMessage={validationMessage}
                validationHidden={validationHidden}
                tooltip={tooltip}
                labelTooltip={labelTooltip}
              >
                {validationInner}
              </MultiLine>
            );
          }
          return null;
        })
      );
      return {
        lines,
        multipleValidateMessageLength,
      };
    }
  }
  return { multipleValidateMessageLength };
}

export function renderValidationMessage(validationMessage: ReactNode, showIcon?: boolean, getProPrefixCls = getProPrefixClsDefault): ReactNode {
  if (validationMessage) {
    return (
      <div className={getProPrefixCls('validation-message')}>
        {showIcon && <Icon type="error" />}
        <span>{validationMessage}</span>
      </div>
    );
  }
}

export function defaultRenderer(renderOption: RenderProps) {
  const { text, repeat, maxTagTextLength } = renderOption;
  return repeat !== undefined &&
  maxTagTextLength &&
  isString(text) &&
  text.length > maxTagTextLength
    ? `${text.slice(0, maxTagTextLength)}...`
    : text;
}

export function showValidationMessage(e, message?: ReactNode, tooltipTheme?: TooltipTheme, tooltipPlacement?: TooltipPlacement, getConfig = getConfigDefault): void {
  show(e.currentTarget, {
    suffixCls: `form-tooltip ${getConfig('proPrefixCls')}-tooltip`,
    title: message,
    theme: tooltipTheme,
    placement: tooltipPlacement || 'bottomLeft',
  });
}
