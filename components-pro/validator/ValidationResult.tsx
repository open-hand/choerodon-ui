export default class ValidationResult {
  validationMessage?: string;
  injectionOptions?: object;
  value?: any;
  ruleName: string;

  constructor(props: ValidationResult) {
    Object.assign(this, props);
  }
}
