import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';

export interface EmailFieldProps extends TextFieldProps {
}

@observer
export default class EmailField extends TextField<EmailFieldProps> {
  static displayName = 'EmailField';

  type: string = 'email';

  getFieldType(): FieldType {
    return FieldType.email;
  }

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    return {
      valueMissing: $l('EmailField', 'value_missing'),
      typeMismatch: $l('EmailField', 'type_mismatch'),
    };
  }
}
