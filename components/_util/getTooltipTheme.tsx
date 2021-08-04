import { getConfig, TooltipThemeType } from '../configure';

export default function getTooltipTheme(type?: TooltipThemeType) {
  const tooltipTheme = getConfig('tooltipTheme');
  if (typeof tooltipTheme === 'function') {
    return tooltipTheme(type);
  }
  if (type === 'validation') {
    const validationTooltipTheme = getConfig('validationTooltipTheme');
    if (validationTooltipTheme) {
      return validationTooltipTheme;
    }
  }
  return tooltipTheme;
}
