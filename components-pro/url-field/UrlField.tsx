import { observer } from 'mobx-react';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';

export type UrlFieldProps = TextFieldProps

@observer
export default class UrlField extends TextField<UrlFieldProps> {
  static displayName = 'UrlField';

  type = 'url';

  get range(): boolean {
    return false;
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('UrlField', label ? 'value_missing' : 'value_missing_no_label', { label }),
      typeMismatch: $l('UrlField', 'type_mismatch'),
    };
  }

  getFieldType(): FieldType {
    return FieldType.url;
  }
}
