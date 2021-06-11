import { observer } from 'mobx-react';
import { getConfig } from 'choerodon-ui/lib/configure';
import isNumber from 'lodash/isNumber';
import { FormatNumberFuncOptions, NumberField, NumberFieldProps } from '../number-field/NumberField';
import { FieldType } from '../data-set/enum';
import formatCurrency from '../formatter/formatCurrency';

export interface CurrencyProps extends NumberFieldProps {
  currency?: string;
}

@observer
export default class Currency extends NumberField<CurrencyProps> {
  static displayName = 'Currency';

  static format = formatCurrency;

  getFieldType(): FieldType {
    return FieldType.currency;
  }

  getFormatter() {
    const formatter = this.getProp('formatter');
    if (formatter !== undefined) {
      return formatter;
    }
    const currencyFormatter = getConfig('currencyFormatter');
    if (currencyFormatter !== undefined) {
      return currencyFormatter;
    }
    return formatCurrency;
  }

  getFormatOptions(): FormatNumberFuncOptions {
    const { precision } = this;
    const formatterOptions: FormatNumberFuncOptions = this.getProp('formatterOptions') || {};
    const currencyFormatterOptions: FormatNumberFuncOptions = getConfig('currencyFormatterOptions') || {};
    const lang = formatterOptions.lang || currencyFormatterOptions.lang || this.lang;
    const options: Intl.NumberFormatOptions = {};
    if (isNumber(precision)) {
      options.minimumFractionDigits = precision;
      options.maximumFractionDigits = precision;
    }
    Object.assign(options, currencyFormatterOptions.options, formatterOptions.options);

    const numberGrouping = this.getProp('numberGrouping');
    const currency = this.getProp('currency');
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
}
