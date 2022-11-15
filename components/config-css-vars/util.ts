import { TinyColor } from '@ctrl/tinycolor';
import defaultTo from 'lodash/defaultTo';
import {
  ColorConvertMode,
  ColorGradationStep,
  ColorCssVarsMap,
} from '../style/interface';
import { defaultColorCssVarsMap } from '../style/color-vars-map';
import generateColorGradation from '../_util/generateColorGradation';

/**
 * 根据变量名获取变量值
 * @param value 变量名字符串或数组字符串
 * @returns 变量键值对
 */
export const getValueByCssVars = (value: string | string[]): Record<string, any> => {
  const resRecord: Record<string, any> = {};
  const cssStyleDeclaration = getComputedStyle(document.documentElement);
  if (typeof value === 'string') {
    const resValue = cssStyleDeclaration.getPropertyValue(`--${value}`).trim();
    resRecord[value] = resValue;
    return resRecord;
  }
  value.forEach((str) => {
    const itemValue = cssStyleDeclaration.getPropertyValue(`--${str}`).trim();
    resRecord[str] = itemValue;
  });
  return resRecord;
};

const findColorCssVarsNodeByName = (
  name: string,
  colorVarsMap: ColorCssVarsMap[],
): ColorCssVarsMap | undefined => {
  let node: ColorCssVarsMap | undefined;
  for (const nowNode of colorVarsMap) {
    const { name: nowName, children } = nowNode;
    if (name === nowName) {
      node = nowNode;
      break;
    }
    if (children) {
      node = findColorCssVarsNodeByName(name, children);
      if (node) {
        break;
      }
    }
  }
  return node;
};

/**
 * 获取颜色变量关系中有子级的父节点名
 * @param colorVarsMap 颜色变量关系
 * @param defaultParentNames 
 * @returns 
 */
export const findColorCssVarsParentNames = (
  colorVarsMap: ColorCssVarsMap[],
  defaultParentNames: string[] = [],
): string[] => {
  const parentNames = defaultParentNames;
  for (const nowNode of colorVarsMap) {
    const { name, children } = nowNode;
    if (children && children.length > 0) {
      parentNames.push(name);
      findColorCssVarsParentNames(children, parentNames);
    }
  }
  return parentNames;
};

/**
 * 根据 css 变量对象生成子级变量，包含自己
 * @param varsData css 变量对象(不加--前缀)
 * @param colorVarsMap 颜色 css vars 级联关系, 默认值为组件库内部变量关系
 * @returns 
 */
export const getAllCssVars = (
  varsData: Record<string, any>,
  colorVarsMap: ColorCssVarsMap[] = defaultColorCssVarsMap,
): Record<string, any> => {
  const allParentNames = findColorCssVarsParentNames(colorVarsMap);
  const allCssVarsData = Object.keys(varsData).reduce((allVarsData, current) => {
    return {
      ...allVarsData,
      [current]: varsData[current],
      ...(allParentNames.includes(current)
        ? generateChildrenColor(current, varsData[current], colorVarsMap)
        : {}),
    };
  }, {});
  return allCssVarsData;
};

/**
 * 根据颜色变量关系，生成子级颜色，包含自己
 * @param parentVarName 当前变量名
 * @param color 当前变量对应颜色
 * @param colorVarsMap 颜色 css vars 级联关系, 默认值为组件库内部变量关系
 * @returns
 */
export const generateChildrenColor = (
  parentVarName: string,
  color: string,
  colorVarsMap: ColorCssVarsMap[] = defaultColorCssVarsMap,
): Record<string, any> => {
  const node = findColorCssVarsNodeByName(parentVarName, colorVarsMap);
  const cssVarsObj: { [key: string]: any } = { [parentVarName]: color };
  const generateColor = (node: ColorCssVarsMap | undefined, parentColor: string) => {
    const parentTinyColor = new TinyColor(parentColor);
    if (!node || !parentTinyColor.isValid) return;

    const { name, convertMode, convertArg, children } = node;
    switch (convertMode) {
      case ColorConvertMode.colorPalette: {
        const gradationArr = generateColorGradation(parentColor);
        const gradation = gradationArr.reduce((pre, current, index) => {
          pre[`step${index + 1}`] = current;
          return pre;
        }, {});
        cssVarsObj[name] = gradation[defaultTo(convertArg, 'step1') as ColorGradationStep];
        break;
      }
      case ColorConvertMode.fade:
        cssVarsObj[name] = parentTinyColor
          .setAlpha(defaultTo(convertArg, 1) as number)
          .toRgbString();
        break;
      case ColorConvertMode.tint:
        cssVarsObj[name] = parentTinyColor.tint(defaultTo(convertArg, 0) as number).toRgbString();
        break;
      case ColorConvertMode.shade:
        cssVarsObj[name] = parentTinyColor.shade(defaultTo(convertArg, 0) as number).toRgbString();
        break;
      default:
        cssVarsObj[name] = parentColor;
        break;
    }
    if (children) {
      children.forEach((child) => generateColor(child, cssVarsObj[name]));
    }
  };
  if (node && node.children) {
    node.children.forEach((child) => generateColor(child, color));
  }
  return cssVarsObj;
};
