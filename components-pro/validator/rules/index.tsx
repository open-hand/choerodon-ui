import { ReactNode } from 'react';
import badInput from './badInput';
import patternMismatch from './patternMismatch';
import rangeOverflow from './rangeOverflow';
import rangeUnderflow from './rangeUnderflow';
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
import Form from '../../form/Form';
import { CustomValidator, ValidationMessages } from '../Validator';

export type methodReturn = ValidationResult | true;

export type validationRule = (value, props) => methodReturn | PromiseLike<methodReturn>;

const validationRules: validationRule[] = [
  badInput,
  patternMismatch,
  rangeOverflow,
  rangeUnderflow,
  stepMismatch,
  tooLong,
  tooShort,
  typeMismatch,
  customError,
  uniqueError,
];

export default validationRules;

export interface ValidatorProps {
  type?: FieldType;
  required?: boolean;
  pattern?: string | RegExp;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  dataSet?: DataSet;
  record?: Record;
  name?: string;
  unique?: boolean | string;
  label?: ReactNode;
  customValidator?: CustomValidator;
  multiple?: boolean;
  range?: boolean | [string, string];
  form?: Form;
  defaultValidationMessages: ValidationMessages;
}
