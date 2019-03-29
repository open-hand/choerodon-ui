import { observer } from 'mobx-react';
import { computed } from 'mobx';
import { TextField, TextFieldProps } from '../text-field/TextField';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { FieldType } from '../data-set/enum';

export interface UrlFieldProps extends TextFieldProps {
}

@observer
export default class UrlField extends TextField<UrlFieldProps> {
  static displayName = 'UrlField';

  type: string = 'url';

  @computed
  get defaultValidationMessages(): ValidationMessages | null {
    return {
      valueMissing: $l('UrlField', 'value_missing'),
      typeMismatch: $l('UrlField', 'type_mismatch'),
    };
  }

  getFieldType(): FieldType {
    return FieldType.url;
  }

}
