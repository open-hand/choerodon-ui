import React, { cloneElement, isValidElement, ReactNode } from 'react';
import isObject from 'lodash/isObject';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import defaultTo from 'lodash/defaultTo';
import isPlainObject from 'lodash/isPlainObject';
import noop from 'lodash/noop';
import { get, isArrayLike, isObservableObject, runInAction } from 'mobx';
import classNames from 'classnames';
import { isMoment } from 'moment';
import { BigNumber } from 'bignumber.js';
import { math, Utils } from 'choerodon-ui/dataset';
import { getConfig as getConfigDefault, getProPrefixCls as getProPrefixClsDefault } from 'choerodon-ui/lib/configure/utils';
import { TooltipPlacement, TooltipTheme } from 'choerodon-ui/lib/tooltip';
import { FieldType, RecordStatus, NumberRoundMode } from '../data-set/enum';
import { stopEvent } from '../_util/EventManager';
import formatCurrency from '../formatter/formatCurrency';
import formatNumber from '../formatter/formatNumber';
import { FormatNumberFuncOptions } from '../number-field/NumberField';
import isEmpty from '../_util/isEmpty';
import CloseButton from './CloseButton';
import { hide, show } from '../tooltip/singleton';
import { TooltipProps } from '../tooltip/Tooltip';
import ValidationResult from '../validator/ValidationResult';
import Icon from '../icon';
import { $l } from '../locale-context';
import isReactChildren from '../_util/isReactChildren';
import { findBindFields } from '../data-set/utils';
import { defaultTextField } from '../data-set/constant';
import ObjectChainValue from '../_util/ObjectChainValue';
import MultiLine from '../output/MultiLine';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import Field, { HighlightProps } from '../data-set/Field';
import { Renderer, RenderProps, TagRendererProps } from './FormField';
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

export function getCurrencyFormatOptions(
  getProp: (name) => any,
  getDisplayProp: (name) => any,
  controlLang?: string,
  getConfig = getConfigDefault,
): FormatNumberFuncOptions {
  const precision = getProp('precision');
  const formatterOptions: FormatNumberFuncOptions = getDisplayProp('formatterOptions') || {};
  const currencyFormatterOptions: FormatNumberFuncOptions = getConfig('currencyFormatterOptions') || { options: {} };
  const lang = formatterOptions.lang || currencyFormatterOptions.lang || controlLang;
  const options: Intl.NumberFormatOptions = {};
  if (isNumber(precision)) {
    options.minimumFractionDigits = precision;
    options.maximumFractionDigits = precision;
  }
  Object.assign(options, currencyFormatterOptions.options, formatterOptions.options);

  const numberGrouping = getDisplayProp('numberGrouping');
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

export function getNumberFormatOptions(
  getProp: (name) => any,
  getDisplayProp: (name) => any,
  getValue?: () => number | BigNumber | undefined,
  value?: number | BigNumber,
  controlLang?: string,
  getConfig = getConfigDefault,
): FormatNumberFuncOptions {
  const precision = getProp('precision');
  const useZeroFilledDecimal = precision > 0 && getConfig('useZeroFilledDecimal');
  const v: number | BigNumber | undefined = isNil(value) ? getValue && getValue() : value;
  const precisionInValue = isNumber(precision) ? precision : math.dp(v || 0);
  const formatterOptions: FormatNumberFuncOptions = getDisplayProp('formatterOptions') || {};
  const numberFieldFormatterOptions: FormatNumberFuncOptions = getConfig('numberFieldFormatterOptions') || { options: {} };
  const lang = formatterOptions.lang || numberFieldFormatterOptions.lang || controlLang;
  const options: Intl.NumberFormatOptions = {
    maximumFractionDigits: precisionInValue,
    minimumFractionDigits: useZeroFilledDecimal ? precisionInValue : undefined,
    ...numberFieldFormatterOptions.options,
    ...formatterOptions.options,
  };
  const numberGrouping = getDisplayProp('numberGrouping');
  if (!isNil(numberGrouping)) {
    options.useGrouping = numberGrouping;
  }
  return {
    lang,
    options,
  };
}

export function processFieldValue(
  value,
  field: Field | undefined,
  options: {
    getProp(name: string): any;
    getValue?(): any;
    lang?: string;
    /**
     * 显示类属性值获取（组件属性优先级高于 DataSet Field 属性优先级）
     * @param name
     */
    getDisplayProp?(name: string): any;
  },
  showValueIfNotFound?: boolean,
  record?: Record,
  getConfig = getConfigDefault,
) {
  const { getProp, getValue, lang, getDisplayProp = getProp } = options;
  const type = getProp('type');
  const currency = getProp('currency');
  if (currency || type === FieldType.currency) {
    const formatOptions = getCurrencyFormatOptions(getProp, getDisplayProp, lang, getConfig);
    const formatter = getProp('formatter');
    return (formatter || getCurrencyFormatter(getConfig))(value, formatOptions.lang, formatOptions.options);
  }
  if (type === FieldType.number || type === FieldType.bigNumber) {
    const formatOptions = getNumberFormatOptions(getProp, getDisplayProp, getValue, value, lang, getConfig);
    const formatter = getProp('formatter');
    return (formatter || getNumberFormatter(getConfig))(value, formatOptions.lang, formatOptions.options);
  }
  if (field) {
    return field.getText(value, showValueIfNotFound, record);
  }
  return value;
}

export type ProcessValueOptions = {
  dateFormat?: string;
  showInvalidDate?: boolean;
  isNumber?: boolean;
  precision?: number;
  useZeroFilledDecimal?: boolean;
  numberRoundMode?: NumberRoundMode;
}

export function processValue(value: any, options: ProcessValueOptions = {}) {
  if (!isNil(value)) {
    if (isMoment(value)) {
      if (value.isValid()) {
        return value.format(options.dateFormat);
      }
      if (options.showInvalidDate) {
        return $l('DatePicker', 'invalid_date') as string;
      }
      return '';
    }
    if (isReactChildren(value)) {
      // For Select's Option and TreeSelect's TreeNode which type may be ReactElement
      return value;
    }
    if (options.isNumber && math.isValidNumber(value)) {
      return options.precision && options.useZeroFilledDecimal
        ? math.toFixed(value, options.precision, options.numberRoundMode)
        : math.toString(value);
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
  tagRenderer?: (props: TagRendererProps) => ReactNode;
  isMultipleBlockDisabled?(v: any): boolean;
  processRenderer(v: any, repeat?: number): ReactNode;
  renderValidationResult(result: ValidationResult): ReactNode;
  handleMultipleValueRemove?(e, value: any, index: number): void;
  isValidationMessageHidden(message?: ReactNode): boolean | undefined;
  showValidationMessage(e, message?: ReactNode, tooltipTheme?: TooltipTheme, tooltipPlacement?: TooltipPlacement): void;
  getKey?(v: any): string;
  rangeSeparator?: string;
  inputBoxIsFocus?: boolean;
}

export type RangeRenderOption = {
  repeat?: number | undefined;
  processRenderer(v: any, repeat?: number): ReactNode;
  rangeSeparator?: string;
}

export type MultiLineRenderOption = {
  prefixCls?: string | undefined;
  field: Field;
  record?: Record;
  dataSet?: DataSet;
  renderer?: Renderer;
  name?: string;
  tooltip?: Tooltip;
  labelTooltip?: Tooltip | [Tooltip, TooltipProps];
  renderValidationResult(result: ValidationResult): ReactNode;
  isValidationMessageHidden(message?: ReactNode): boolean | undefined;
  processValue(value): ReactNode;
}

export function renderRangeValue(value, option: RangeRenderOption) {
  const { repeat, processRenderer, rangeSeparator = getConfigDefault('rangeSeparator') } = option;
  const rangeValue = (value || []).map((item) => processRenderer(item, repeat), []) as [any, any];
  if (rangeValue.some(v => !isEmpty(v))) {
    return (
      <>
        {rangeValue[0]}{rangeSeparator}{rangeValue[1]}
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

export function renderMultipleValues(value, option: MultipleRenderOption): { tags: ReactNode; multipleValidateMessageLength: number, isOverflowMaxTagCount: boolean, } {
  const {
    range,
    maxTagPlaceholder,
    prefixCls,
    validationResults,
    disabled,
    readOnly,
    tagRenderer,
    isMultipleBlockDisabled,
    processRenderer,
    renderValidationResult,
    handleMultipleValueRemove = noop,
    getKey = getValueKey,
    isValidationMessageHidden,
    showValidationMessage: selfShowValidationMessage,
    tooltipTheme,
    rangeSeparator = getConfigDefault('rangeSeparator'),
    inputBoxIsFocus,
  } = option;
  const values = toMultipleValue(value, range);
  const valueLength = values.length;
  const { maxTagCount = getConfigDefault('fieldMaxTagCount') } = option;
  const repeats: Map<any, number> = new Map<any, number>();

  let multipleValidateMessageLength = 0;
  const tags = values.slice(0, maxTagCount).map((v, index) => {
    const key = getKey(v);
    const repeat = repeats.get(key) || 0;
    const text = range ? renderRangeValue(v, { repeat, processRenderer, rangeSeparator }) : processRenderer(v, repeat);
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
        <CloseButton onClose={handleMultipleValueRemove} value={v} index={repeat} onMouseDown={inputBoxIsFocus ? noop : undefined} />
      );
      let inner;
      runInAction(() => {
        if (typeof tagRenderer === 'function') {
          const onClose = e => {
            stopEvent(e);
            handleMultipleValueRemove(e, v, repeat);
          }
          inner = tagRenderer({
            value: v,
            text,
            key: String(index), 
            invalid: !!validationResult,
            disabled: blockDisabled,
            readOnly,
            className,
            onClose,
            inputBoxIsFocus,
          });
        } else {
          inner = readOnly ? (
            <span key={String(index)} className={className}>{text}</span>
          ) : (
            <li key={String(index)} className={className}>
              <div>{text}</div>
              {closeBtn}
            </li>
          );
        }
      });
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
  const isOverflowMaxTagCount: boolean = !!maxTagCount && valueLength > maxTagCount;
  if (maxTagCount && isOverflowMaxTagCount) {
    const blockClassName = classNames(
      {
        [`${prefixCls}-multiple-block-disabled`]: disabled,
      },
      `${prefixCls}-multiple-block`,
      `${prefixCls}-multiple-block-more`,
    );
    let content: ReactNode = `+ ${valueLength - maxTagCount} ...`;
    if (maxTagPlaceholder) {
      const omittedValues = values.slice(maxTagCount, valueLength);
      content =
        typeof maxTagPlaceholder === 'function'
          ? maxTagPlaceholder(omittedValues)
          : maxTagPlaceholder;
    }
    let moreBlock;
    if (typeof tagRenderer === 'function') {
      moreBlock = tagRenderer({
        value: "maxTagPlaceholder",
        text: content,
        key: "maxTagPlaceholder",
        disabled,
        readOnly,
        className: blockClassName,
        inputBoxIsFocus,
      });
    } else {
      moreBlock = (
        <li key="maxTagPlaceholder" className={blockClassName}>
          <div>{content}</div>
        </li>
      );
    }
    tags.push(moreBlock);
  }

  return { tags, multipleValidateMessageLength, isOverflowMaxTagCount };
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
