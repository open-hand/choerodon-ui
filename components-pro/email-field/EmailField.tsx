import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';

export interface EmailFieldProps extends TextFieldProps {}

@observer
export default class EmailField extends TextField<EmailFieldProps> {
  static displayName = 'EmailField';

  type: string = 'email';

  getFieldType(): FieldType {
    return FieldType.email;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('EmailField', label ? 'value_missing' : 'value_missing_no_label', { label }),
      typeMismatch: $l('EmailField', 'type_mismatch'),
    };
  }
}
