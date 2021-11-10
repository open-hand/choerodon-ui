import { ValidationMessages } from './Validator';
import { ValidatorProps } from './rules';
import { getGlobalConfig } from '../utils';

export default class ValidationResult {
  private $validationMessage?: string;

  get validationMessage(): any {
    const { $validationMessage, injectionOptions } = this;
    if ($validationMessage && injectionOptions) {
      const { name, dataSet } = this.validationProps;
      return getGlobalConfig('validationMessageFormatter', dataSet && dataSet.getField(name))($validationMessage, injectionOptions);
    }
    return $validationMessage;
  }

  set validationMessage(validationMessage: any) {
    this.$validationMessage = validationMessage;
  }

  injectionOptions?: object;

  value?: any;

  ruleName: keyof ValidationMessages;

  validationProps: Partial<ValidatorProps>;

  constructor(props: ValidationResult) {
    Object.assign(this, props);
  }
}
