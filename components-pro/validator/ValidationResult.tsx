import { ReactNode } from 'react';
import { ValidationMessages } from './Validator';
import { ValidatorProps } from './rules';

export default class ValidationResult {
  validationMessage?: ReactNode;

  injectionOptions?: object;

  value?: any;

  ruleName: keyof ValidationMessages;

  validationProps: Partial<ValidatorProps>;

  constructor(props: ValidationResult) {
    Object.assign(this, props);
  }
}
