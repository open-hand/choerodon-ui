import { observer } from 'mobx-react';
import { NumberField, NumberFieldProps, FormatNumberFuncOptions } from '../number-field/NumberField';
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
    return {
      options: {
        currency: this.getProp('currency'),
      },
    };
  }
}
