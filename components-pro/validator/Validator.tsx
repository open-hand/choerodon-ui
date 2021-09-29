import React, { ReactNode } from 'react';
import { action, computed, isArrayLike, observable, runInAction } from 'mobx';
import isString from 'lodash/isString';
import omitBy from 'lodash/omitBy';
import isUndefined from 'lodash/isUndefined';
import { getConfig } from 'choerodon-ui/lib/configure';
import Validity from './Validity';
import ValidationResult from './ValidationResult';
import Record from '../data-set/Record';
import Form from '../form/Form';
import validationRules, { methodReturn, validationRule, ValidatorProps } from './rules';
import valueMissing from './rules/valueMissing';
import getReactNodeText from '../_util/getReactNodeText';
import Field from '../data-set/Field';
import { FormField } from '../field/FormField';
import { getIf } from '../data-set/utils';

export type CustomValidator = (
  value: any,
  name?: string,
  record?: Record | Form,
) => Promise<boolean | string | undefined>;

export interface ValidationMessages {
  badInput?: ReactNode;
  patternMismatch?: ReactNode;
  rangeOverflow?: ReactNode;
  rangeUnderflow?: ReactNode;
  stepMismatch?: ReactNode;
  stepMismatchBetween?: ReactNode;
  tooLong?: ReactNode;
  tooShort?: ReactNode;
  typeMismatch?: ReactNode;
  valueMissing?: ReactNode;
  valueMissingNoLabel?: ReactNode;
  customError?: ReactNode;
  uniqueError?: ReactNode;
  unknown?: ReactNode;
}

export default class Validator {

  @observable private field?: Field;

  @observable private control?: FormField<any>;

  @observable private innerValidationResults?: ValidationResult[] | undefined;

  @computed
  get props(): ValidatorProps {
    const { control, field } = this;
    const controlProps = control && omitBy(control.getValidatorProps(), isUndefined);
    const fieldProps = field && field.getValidatorProps();
    return {
      ...fieldProps,
      ...controlProps,
      defaultValidationMessages: {
        ...(controlProps && controlProps.defaultValidationMessages),
        ...getConfig('defaultValidationMessages'),
        ...(fieldProps && fieldProps.defaultValidationMessages),
      },
    };
  }

  private get uniqueRefFields(): Field[] {
    const { name, unique, record } = this.props;
    if (record && isString(unique)) {
      return [...record.dataSet.fields.values()].filter(
        field =>
          field.name !== name &&
          field.get('unique', record) === unique &&
          !field.get('multiple', record) &&
          !field.get('range', record),
      );
    }
    return [];
  }

  @computed
  private get uniqueRefValidationResult(): ValidationResult | undefined {
    let validationResult: ValidationResult | undefined;
    const { uniqueRefFields, innerValidationResults } = this;
    if (
      uniqueRefFields.length &&
      (!innerValidationResults || innerValidationResults.every(result => result.ruleName !== 'uniqueError'))
    ) {
      uniqueRefFields.some(uniqueRefField => {
        const { validator } = uniqueRefField;
        if (validator) {
          const validatorInnerValidationResults = validator.innerValidationResults;
          validationResult = validatorInnerValidationResults && validatorInnerValidationResults.find(
            result => result.ruleName === 'uniqueError',
          );
        }
        return !!validationResult;
      });
    }
    return validationResult;
  }

  get validationResults(): ValidationResult[] {
    const { uniqueRefValidationResult } = this;
    if (uniqueRefValidationResult) {
      return [uniqueRefValidationResult];
    }
    const { innerValidationResults } = this;
    if (innerValidationResults && innerValidationResults.length) {
      return innerValidationResults;
    }
    // const { bindingFieldWithValidationResult } = this;
    // if (bindingFieldWithValidationResult) {
    //   return bindingFieldWithValidationResult.getValidationErrorValues();
    // }
    return [];
  }

  get currentValidationResult(): ValidationResult | undefined {
    const { validationResults } = this;
    return validationResults.length ? validationResults[0] : undefined;
  }

  @computed
  get validity(): Validity {
    const { currentValidationResult } = this;
    return new Validity(
      currentValidationResult ? { [currentValidationResult.ruleName]: true } : undefined,
    );
  }

  get injectionOptions(): object {
    const { currentValidationResult } = this;
    return (currentValidationResult && currentValidationResult.injectionOptions) || {};
  }

  get validationMessage(): ReactNode {
    const { currentValidationResult } = this;
    return currentValidationResult && currentValidationResult.validationMessage;
  }

  constructor(field?: Field, control?: FormField<any>) {
    runInAction(() => {
      this.field = field;
      this.control = control;
    });
  }

  @action
  reset() {
    this.clearErrors();
    const { uniqueRefFields } = this;
    if (uniqueRefFields.length) {
      uniqueRefFields.forEach(uniqueRefField => {
        const { validator } = uniqueRefField;
        if (validator) {
          validator.clearErrors();
        }
      });
    }
  }

  @action
  async report(ret: ValidationResult) {
    const { name, dataSet, record } = this.props;
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
      const { validationMessage, value } = ret;
      const reportMessage: any[] = [
        'validation:',
        isString(validationMessage)
          ? validationMessage
          : await getReactNodeText(<span>{validationMessage}</span>),
      ];
      if (dataSet) {
        const { name: dsName, id } = dataSet;
        if (dsName || id) {
          reportMessage.push(
            `
[dataSet<${dsName || id}>]:`,
            dataSet,
          );
        } else {
          reportMessage.push('\n[dataSet]:', dataSet);
        }
      }
      if (record) {
        if (dataSet) {
          reportMessage.push(
            `
[record<${dataSet.indexOf(record)}>]:`,
            record,
          );
        } else {
          reportMessage.push(`\n[record]:`, record);
        }
        reportMessage.push(
          `
[field<${name}>]:`,
          this.field,
        );
      } else {
        reportMessage.push('[field]:', name);
      }
      reportMessage.push('\n[value]:', value);
      console.warn(...reportMessage);
    }
  }

  @action
  clearErrors() {
    this.innerValidationResults = undefined;
  }

  @action
  addError(result: ValidationResult) {
    const innerValidationResults = getIf<Validator, ValidationResult[]>(this, 'innerValidationResults', []);
    innerValidationResults.push(result);
    this.report(result);
  }

  async execute(rules: validationRule[], value: any[]): Promise<any> {
    const { props } = this;
    const method = rules.shift();
    if (method) {
      const results: methodReturn[] = await Promise.all<methodReturn>(
        value.map(item => method(item, props)),
      );
      results.forEach(result => {
        if (result instanceof ValidationResult) {
          this.addError(result);
          const index = value.indexOf(result.value);
          if (index !== -1) {
            value.splice(index, 1);
          }
        }
      });
      if (value.length) {
        await this.execute(rules, value);
      }
    }
  }

  async checkValidity(value: any = null): Promise<boolean> {
    const valueMiss: methodReturn = valueMissing(value, this.props);
    this.clearErrors();
    if (valueMiss !== true) {
      this.addError(valueMiss);
    } else {
      const { multiple } = this.props;
      await this.execute(
        validationRules.slice(),
        multiple && isArrayLike(value) ? value.slice() : [value],
      );
    }
    return this.validity.valid;
  }
}
