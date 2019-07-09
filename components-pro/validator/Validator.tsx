import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import isEqual from 'lodash/isEqual';
import Validity from './Validity';
import ValidationResult from './ValidationResult';
import Record from '../data-set/Record';
import Form from '../form/Form';
import validationRules, { methodReturn, ValidatorProps } from './rules';
import valueMissing from './rules/valueMissing';

export type CustomValidator = (value: any, name: string, record: Record | Form) => Promise<boolean | string | undefined>

export interface ValidationMessages {
  badInput?: string;
  patternMismatch?: string;
  rangeOverflow?: string;
  rangeUnderflow?: string;
  stepMismatch?: string;
  tooLong?: string;
  tooShort?: string;
  typeMismatch?: string;
  valueMissing?: string;
  uniqueError?: string;
  unknown?: string;
}

export default class Validator {

  @observable fieldProps: ValidatorProps;
  @observable controlProps: ValidatorProps;

  validity: Validity = new Validity();

  validedValue: any;

  injectionOptions: object = {};

  validationMessage?: string = '';

  @observable validationErrorValues: ValidationResult[];

  @computed
  get props() {
    return {
      ...this.fieldProps,
      ...this.controlProps,
    }
  }

  constructor() {
    runInAction(() => {
      this.validationErrorValues = [];
    });
  }

  @action
  setProps(props) {
    this.fieldProps = props;
  }

  @action
  setControlProps(props) {
    this.controlProps = props;
  }

  reset() {
    this.validedValue = void 0;
    this.validationMessage = '';
    this.validity.reset();
  }

  @action
  report(ret: methodReturn) {
    if (ret instanceof ValidationResult) {
      const { ruleName, validationMessage, injectionOptions } = ret;
      this.validity[ruleName] = true;
      this.validationMessage = validationMessage;
      this.injectionOptions = injectionOptions || {};
    }
    if (process.env.NODE_ENV !== 'production' && !this.validity.valid && typeof console !== 'undefined') {
      const { name, dataSet, record } = this.props;
      const reportMessage: any[] = ['validation:', JSON.stringify(this.validationMessage)];
      if (dataSet) {
        const { name: dsName, id } = dataSet;
        if (dsName || id) {
          reportMessage.push(`
[dataSet<${dsName || id}>]:`, dataSet);
        } else {
          reportMessage.push('\n[dataSet]:', dataSet);
        }
      }
      if (record) {
        if (dataSet) {
          reportMessage.push(`
[record<${dataSet.indexOf(record)}>]:`, record);
        } else {
          reportMessage.push(`\n[record]:`, record);
        }
        reportMessage.push(`
[field<${name}>]:`, record.getField(name));
      } else {
        reportMessage.push('[field]:', name);
      }
      reportMessage.push('\n[value]:', this.validedValue);
      console.warn(...reportMessage);
    }
  }

  @action
  clearErrors() {
    this.validationErrorValues = [];
  }

  @action
  addError(result: ValidationResult) {
    this.validationErrorValues.push(result);
  }

  async checkValidity(value: any = null): Promise<boolean> {
    if (!isEqual(this.validedValue, value)) {
      const { props } = this;
      this.validedValue = value;
      const valueMiss: methodReturn = valueMissing(value, props);
      this.clearErrors();
      if (valueMiss !== true) {
        this.report(valueMiss);
      } else {
        if (isArrayLike(value)) {
          value = value.slice();
        } else {
          value = [value];
        }
        for (const method of validationRules) {
          const results: methodReturn[] = await Promise.all<methodReturn>(value.map(item => method(item, props)));
          let ret: methodReturn = true;
          results.forEach(result => {
            if (result instanceof ValidationResult) {
              ret = result;
              this.addError(result);
              const index = value.indexOf(result.value);
              if (index !== -1) {
                value.splice(index, 1);
              }
            }
          });
          if (ret !== true) {
            this.report(ret);
          }
          if (!value.length) {
            break;
          }
        }
      }
    }
    return this.validity.valid;
  }
}
