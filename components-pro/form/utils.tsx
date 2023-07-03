import { CSSProperties } from 'react';
import { isArrayLike } from 'mobx';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import isObject from 'lodash/isObject';
import { pxToRem } from 'choerodon-ui/lib/_util/UnitConvertor';
import DataSet from '../data-set/DataSet';
import Record from '../data-set/Record';
import { LabelLayout, RequiredMarkAlign, SpacingType } from './enum';
import { LabelWidth, SeparateSpacing, SpacingTypeMap } from './Form';

export const defaultLabelWidth = 100;

export const defaultLabelLayout: LabelLayout = LabelLayout.horizontal;

export const defaultColumns = 1;

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

  const field = dataSet && dataSet.getField(name);

  if (field) {
    const fieldProperty = field.get(key, record);
    if (fieldProperty) {
      return fieldProperty;
    }
  }
}

/**
 * 有ds时，仅以ds field属性为准；无ds则以组件属性为准
 * @param props 
 * @param key 
 * @param dataSet 
 * @param record 
 * @returns 
 */
export function getPropertyDSFirst(props: any, key: string, dataSet?: DataSet, record?: Record): any {
  const { name } = props;
  const field = dataSet && dataSet.getField(name);

  if (field) {
    const fieldProperty = field.get(key, record);
    if (fieldProperty) {
      return fieldProperty;
    }
  }
  else if (props[key]) {
    return props[key];
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

export function normalizeSeparateSpacing(separateSpacing: number | [number, number] | SeparateSpacing): SeparateSpacing {
  if (isNumber(separateSpacing)) {
    return {
      width: separateSpacing,
      height: separateSpacing,
    };
  }
  if (isArrayLike(separateSpacing)) {
    return {
      width: separateSpacing[0] || 0,
      height: separateSpacing[1] || 0,
    };
  }
  return separateSpacing;
}

const defaultSpacingType = SpacingType.between;

export function normalizeSpacingType(spacingType: SpacingType | [SpacingType, SpacingType] | SpacingTypeMap | undefined): SpacingTypeMap {
  if (isString(spacingType) && [SpacingType.around, SpacingType.evenly, SpacingType.between].includes(spacingType)) {
    return {
      width: spacingType,
      height: spacingType,
    };
  }
  if (isArrayLike(spacingType)) {
    return {
      width: spacingType[0] || defaultSpacingType,
      height: spacingType[1] || defaultSpacingType,
    };
  }
  if (isObject(spacingType)) {
    return spacingType;
  }
  return {
    width: defaultSpacingType,
    height: defaultSpacingType,
  };
}

export type SpacingProperties = {
  paddingHorizontal: number;
  paddingVertical: number;
  marginHorizontal: number;
  marginVertical: number;
  style: CSSProperties;
};

export function getSpacingProperties(separateSpacing: SeparateSpacing, spacingType: SpacingTypeMap, isHorizontal: boolean): SpacingProperties {
  const properties: SpacingProperties = {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginHorizontal: 0,
    marginVertical: 0,
    style: {},
  };
  const { style } = properties;
  const { width, height } = separateSpacing;
  const { width: spacingTypeH, height: spacingTypeV } = spacingType;
  const borderSpacing: number[] = [];
  const spacingWidth = width / 2;
  const spacingHeight = height / 2;
  switch (spacingTypeH) {
    case SpacingType.evenly: {
      if (isHorizontal) {
        properties.paddingHorizontal = spacingWidth;
        properties.marginHorizontal = spacingWidth;
      } else {
        borderSpacing[0] = width;
      }
      break;
    }
    case SpacingType.around:
      properties.paddingHorizontal = spacingWidth;
      break;
    default:
      properties.paddingHorizontal = spacingWidth;
      properties.marginHorizontal = -spacingWidth;
      break;
  }
  switch (spacingTypeV) {
    case SpacingType.evenly:
      borderSpacing[1] = height;
      break;
    case SpacingType.around:
      properties.paddingVertical = spacingHeight;
      break;
    default:
      properties.paddingVertical = spacingHeight;
      properties.marginVertical = -spacingHeight;
      break;
  }
  if (borderSpacing.length) {
    style.borderCollapse = 'separate';
    style.borderSpacing = `${pxToRem(borderSpacing[0] || 0)} ${pxToRem(borderSpacing[1] || 0)}`;
  }
  const { marginHorizontal } = properties;
  if (marginHorizontal < 0) {
    style.marginRight = pxToRem(marginHorizontal)!;
    style.marginLeft = pxToRem(marginHorizontal)!;
    style.width = `calc(100% + ${pxToRem(-marginHorizontal * 2)})`;
  } else if (marginHorizontal > 0) {
    style.paddingRight = pxToRem(marginHorizontal)!;
    style.paddingLeft = pxToRem(marginHorizontal)!;
  }
  return properties;
}

export function getSpacingLabelStyle(
  properties: SpacingProperties | undefined,
  isHorizontal: boolean,
  rowIndex: number,
): CSSProperties | undefined {
  if (properties) {
    const { paddingHorizontal, paddingVertical, marginVertical } = properties;
    const style: CSSProperties = {};
    if (paddingHorizontal) {
      style.paddingLeft = pxToRem(paddingHorizontal)!;
      if (!isHorizontal) {
        style.paddingRight = pxToRem(paddingHorizontal)!;
      }
    }
    if (paddingVertical) {
      if (marginVertical && marginVertical === -paddingVertical) {
        if (rowIndex !== 0) {
          style.paddingTop = pxToRem(paddingVertical * 2)!;
        }
      } else {
        style.paddingTop = pxToRem(paddingVertical)!;
        style.paddingBottom = pxToRem(paddingVertical)!;
      }
    }
    return style;
  }
}

export function getSpacingFieldStyle(
  properties: SpacingProperties | undefined,
  isHorizontal: boolean,
  rowIndex: number,
): CSSProperties | undefined {
  if (properties) {
    const { paddingHorizontal, paddingVertical, marginVertical } = properties;
    const style: CSSProperties = {};
    if (paddingHorizontal) {
      style.paddingRight = pxToRem(paddingHorizontal)!;
      if (!isHorizontal) {
        style.paddingLeft = pxToRem(paddingHorizontal)!;
      }
    }
    if (paddingVertical) {
      if (marginVertical && marginVertical === -paddingVertical) {
        if (rowIndex !== 0) {
          style.paddingTop = pxToRem(paddingVertical * 2)!;
        }
      } else {
        style.paddingTop = pxToRem(paddingVertical)!;
        style.paddingBottom = pxToRem(paddingVertical)!;
      }
    }
    return style;
  }
}

export function getRequiredMarkAlign(align) {
  if ([RequiredMarkAlign.left, RequiredMarkAlign.right].includes(align)) {
    return align;
  }
  return RequiredMarkAlign.left;
}
