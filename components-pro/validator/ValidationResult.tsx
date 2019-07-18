import { ReactNode } from 'react';

export default class ValidationResult {
  validationMessage?: ReactNode;
  injectionOptions?: object;
  value?: any;
  ruleName: string;

  constructor(props: ValidationResult) {
    Object.assign(this, props);
  }
}
