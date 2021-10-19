import React, { ReactNode } from 'react';
import { action, isArrayLike, observable, toJS } from 'mobx';
import isPromise from 'is-promise';
import isString from 'lodash/isString';
import noop from 'lodash/noop';
import { getConfig } from 'choerodon-ui/lib/configure';
import ValidationResult from './ValidationResult';
import Record from '../data-set/Record';
import Form from '../form/Form';
import validationRules, { methodReturn, validationRule, ValidatorProps } from './rules';
import valueMissing from './rules/valueMissing';
import getReactNodeText from '../_util/getReactNodeText';
import { ValidationErrors } from '../data-set/DataSet';

export type CustomValidator = (
  value: any,
  name?: string,
  record?: Record | Form,
) => PromiseLike<boolean | string | undefined> | boolean | string | undefined;

export type ValidationReport = {
  valid: boolean,
  validationResults: ValidationResult[];
  validatorProps: ValidatorProps;
}

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

  @observable validationResults?: ValidationResult[] | undefined;

  @action
  private static addError(result: ValidationResult, props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, validationResults: ValidationResult[]) {
    const { record, name, unique } = props;
    if (record && name) {
      validationResults.push(result);
      if (isString(unique)) {
        record.dataSet.fields.forEach((field, fieldName) => {
          if (
            fieldName !== name &&
            field.get('unique', record) === unique &&
            !field.get('multiple', record) &&
            !field.get('range', record)
          ) {
            record.setValidationError(fieldName, [result]);
          }
        });
      }
    } else {
      validationResults.push(result);
    }
  }

  static reportAll(errors: ValidationErrors[]) {
    const { length } = errors;
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && length > 0) {
      console.warn('validations:', toJS(errors));
    }
  }

  static async report(results: ValidationResult[], props: ValidatorProps) {
    if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' && results.length) {
      const { name, dataSet, record } = props;
      const reportMessage: any[] = [];
      const promises: (PromiseLike<any> | any)[] = [];
      results.forEach(({ validationMessage, value }) => {
        promises.push(
          'validation:',
          isString(validationMessage)
            ? validationMessage
            : getReactNodeText(<span>{validationMessage}</span>),
        );
        promises.push('\n[value]:', value);
      });
      reportMessage.push(...await Promise.all(promises));
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
      }

      if (name) {
        const field = (record && record.ownerFields.get(name)) || (dataSet && dataSet.getField(name));
        if (field) {
          reportMessage.push(
            `
[field<${name}>]:`,
            field,
          );
        } else {
          reportMessage.push('[field]:', name);
        }
      }
      console.warn(...reportMessage);
    }
  }

  private static async execute(rules: validationRule[], value: any[], props: ValidatorProps & { defaultValidationMessages: ValidationMessages }, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T], validationResults: ValidationResult[]): Promise<any> {
    const method = rules.shift();
    if (method) {
      const results: methodReturn[] = [];
      const promises: PromiseLike<methodReturn>[] = [];
      value.forEach(item => {
        const result = method(item, props, getProp);
        if (isPromise(result)) {
          promises.push(result.then((re) => {
            results.push(re);
            return re;
          }));
        } else {
          results.push(result);
        }
      });
      if (promises.length) {
        await Promise.all<methodReturn>(promises);
      }
      results.forEach(result => {
        if (result instanceof ValidationResult) {
          this.addError(result, props, validationResults);
          const index = value.indexOf(result.value);
          if (index !== -1) {
            value.splice(index, 1);
          }
        }
      });
      if (value.length) {
        await this.execute(rules, value, props, getProp, validationResults);
      }
    }
  }

  @action
  static async checkValidity(value: unknown = null, props?: Partial<ValidatorProps> | undefined, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T] = noop): Promise<ValidationReport> {
    const validatorProps: ValidatorProps & { defaultValidationMessages: ValidationMessages } = {
      ...props,
      defaultValidationMessages: {
        ...getConfig('defaultValidationMessages'),
        ...props && props.defaultValidationMessages,
      },
    };
    // this.reset(validatorProps);
    const validationResults: ValidationResult[] = [];
    const valueMiss: methodReturn = valueMissing(value, validatorProps, getProp);
    if (valueMiss !== true) {
      this.addError(valueMiss, validatorProps, validationResults);
    } else {
      const multiple = getProp('multiple');
      await this.execute(
        validationRules.slice(),
        multiple && isArrayLike(value) ? value.slice() : [value],
        validatorProps,
        getProp,
        validationResults,
      );
    }
    return {
      valid: !validationResults.length,
      validationResults,
      validatorProps,
    };
  }
}
