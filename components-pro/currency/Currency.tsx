import { observer } from 'mobx-react';
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
    return formatCurrency;
  }

  getFormatOptions(): FormatNumberFuncOptions {
    const formatterOptions: FormatNumberFuncOptions = this.getProp('formatterOptions') || {};
    const lang = formatterOptions.lang || this.lang;
    const options: Intl.NumberFormatOptions = {
      currency: this.getProp('currency'),
      ...formatterOptions.options,
    };

    const precision = this.getProp('precision');
    const numberGrouping = this.getProp('numberGrouping');
    if (isNumber(precision)) {
      options.minimumFractionDigits = precision;
      options.maximumFractionDigits = precision;
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
