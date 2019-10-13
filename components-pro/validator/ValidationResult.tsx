import { ReactNode } from 'react';
import { ValidationMessages } from './Validator';

export default class ValidationResult {
  validationMessage?: ReactNode;

  injectionOptions?: object;

  value?: any;

  ruleName: keyof ValidationMessages;

  constructor(props: ValidationResult) {
    Object.assign(this, props);
  }
}
