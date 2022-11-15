import {
  ColorCssVarsMap,
} from '../style/interface';
import { defaultColorCssVarsMap } from '../style/color-vars-map';
import { getAllCssVars } from './util';
import { canUseDom, updateCSS } from './dynamicCss';

/**
 * css 变量 注册到 style 标签中
 * @param allCssVarsData css 变量对象(不加--前缀)
 * @param cssVarsPriority css 变量优先级
 * @param styleFlagPrefix style 标签 标识前缀
 */
export const registerCssVars = (
  allCssVarsData: Record<string, any>,
  cssVarsPriority = 1,
  styleFlagPrefix = 'c7n-ui',
) => {
  // Convert to css variables
  const cssList = Object.keys(allCssVarsData).map((key) => `--${key}: ${allCssVarsData[key]};`);
  
  cssVarsPriority = Math.floor(cssVarsPriority);
  const selector = (':root').repeat(cssVarsPriority <= 1 || Number.isNaN(cssVarsPriority) ? 1 : cssVarsPriority);
  const cssStr = `
  ${selector} {
    ${cssList.join('\n')}
  }
  `.trim();

  if (canUseDom()) {
    updateCSS(cssStr, `${styleFlagPrefix}-dynamic-theme`);
  }
};

/**
 * 配置 css 变量
 * @param varsData css 变量对象(不加--前缀)
 * @param cssVarsPriority css 变量优先级
 * @param styleFlagPrefix style 标签 标识前缀
 * @param colorVarsMap 颜色 css vars 级联关系, 默认值为组件库内部变量关系
 */
const configCssVars = (
  varsData: Record<string, any>,
  cssVarsPriority = 1,
  styleFlagPrefix = 'c7n-ui',
  colorVarsMap: ColorCssVarsMap[] = defaultColorCssVarsMap,
) => {
  if (!varsData) return;
  const allCssVarsData = getAllCssVars(varsData, colorVarsMap);

  registerCssVars(allCssVarsData, cssVarsPriority, styleFlagPrefix);
}

export { configCssVars };
