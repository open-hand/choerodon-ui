import isNumber from 'lodash/isNumber';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelLayout } from './enum';
import { LabelWidth } from './Form';

export const defaultLabelWidth: number = 100;

export const defaultLabelLayout: LabelLayout = LabelLayout.horizontal;

export const defaultColumns: number = 1;

export const FIELD_SUFFIX = 'field';

export function normalizeLabelWidth(labelWidth: LabelWidth, columns: number): (number | 'auto')[] {
  if (isNumber(labelWidth) || labelWidth === 'auto') {
    return new Array(columns).fill(labelWidth);
  }
  const labelWidths = new Array(columns).fill(defaultLabelWidth);
  labelWidth.slice(0, columns).forEach((width, index) => (labelWidths[index] = width));
  return labelWidths;
}

export function getProperty(props: any, key: string, dataSet?: DataSet, record?: Record): any {
  if (props[key]) {
    return props[key];
  }
  const { name } = props;

  const field = record ? record.getField(name) : dataSet && dataSet.getField(name);

  if (field) {
    const fieldProperty = field.get(key);
    if (fieldProperty) {
      return fieldProperty;
    }
  }
}

export const defaultExcludeUseColonTag: string[] = ['div', 'button', 'Button'];

export function hasParentElement(parentElement: HTMLElement | null, tagName: string): boolean {
  while (parentElement) {
    if (parentElement.tagName.toLowerCase() === tagName) {
      return true;
    }
    parentElement = parentElement.parentElement;
  }
  return false;
}
