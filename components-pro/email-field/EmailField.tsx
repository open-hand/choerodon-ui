import { observer } from 'mobx-react';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';

export type EmailFieldProps = TextFieldProps

@observer
export default class EmailField extends TextField<EmailFieldProps> {
  static displayName = 'EmailField';

  type = 'email';

  get range(): boolean {
    return false;
  }

  getFieldType(): FieldType {
    return FieldType.email;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('EmailField', label ? 'value_missing' : 'value_missing_no_label', { label }),
      typeMismatch: $l('EmailField', 'type_mismatch'),
    };
  }
}
