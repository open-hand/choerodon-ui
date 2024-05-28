import { ReactNode } from 'react';
import { Moment } from 'moment';
import badInput from './badInput';
import patternMismatch from './patternMismatch';
import rangeOverflow from './rangeOverflow';
import rangeUnderflow from './rangeUnderflow';
import rangeOverflowExcl from './rangeOverflowExcl';
import rangeUnderflowExcl from './rangeUnderflowExcl';
import stepMismatch from './stepMismatch';
import tooLong from './tooLong';
import tooShort from './tooShort';
import typeMismatch from './typeMismatch';
import customError from './customError';
import uniqueError from './uniqueError';
import ValidationResult from '../ValidationResult';
import { FieldType } from '../../data-set/enum';
import DataSet from '../../data-set/DataSet';
import Record from '../../data-set/Record';
import { Form, TimeStep } from '../../interface';
import { CustomValidator, ValidationMessages } from '../Validator';

export type methodReturn = ValidationResult | true;

export type validationRule = (value: any, props: ValidatorProps, getProp: <T extends keyof ValidatorProps>(key: T) => ValidatorProps[T]) => methodReturn | PromiseLike<methodReturn>;

const validationRules: validationRule[] = [
  badInput,
  patternMismatch,
  rangeOverflow,
  rangeUnderflow,
  rangeOverflowExcl,
  rangeUnderflowExcl,
  stepMismatch,
  tooLong,
  tooShort,
  typeMismatch,
  customError,
  uniqueError,
];

export default validationRules;

export interface ValidatorBaseProps {
  dataSet?: DataSet | undefined;
  record?: Record | undefined;
  name?: string | undefined;
  form?: Form | undefined;
}

export interface ValidatorProps extends ValidatorBaseProps {
  type?: FieldType | undefined;
  required?: boolean | undefined;
  pattern?: string | RegExp | undefined;
  min?: number | Moment | null | undefined;
  max?: number | Moment | null | undefined;
  minExcl?: number | Moment | null | undefined;
  maxExcl?: number | Moment | null | undefined;
  step?: number | TimeStep | undefined;
  nonStrictStep?: boolean | undefined;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  unique?: boolean | string | undefined;
  label?: ReactNode;
  customValidator?: CustomValidator | undefined;
  multiple?: boolean | undefined;
  range?: boolean | [string, string] | undefined;
  format?: string | undefined;
  attachmentCount?: number | undefined;
  defaultValidationMessages?: ValidationMessages | undefined;
  stringMode?: boolean;
}
