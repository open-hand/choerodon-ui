/**
 * 相对父级颜色转换方法
 */
enum ColorConvertMode {
  /**
   * generate Color Gradation, arg from step1 to step10
   */
  colorPalette = 'colorPalette',
  /**
   * arg from 0 to 1
   */
  fade = 'fade',
  /**
   * Mix the color with pure white, arg from 0 to 100.
   */
  tint = 'tint',
  /**
   * Mix the color with pure black, from 0 to 100.
   */
  shade = 'shade',
}

/**
 * 颜色色阶的索引
 */
enum ColorGradationStep {
  step1 = 'step1',
  step2 = 'step2',
  step3 = 'step3',
  step4 = 'step4',
  step5 = 'step5',
  step6 = 'step6',
  step7 = 'step7',
  step8 = 'step8',
  step9 = 'step9',
  step10 = 'step10',
}

/**
 * 颜色级联关系
 */
type ColorCssVarsMap = {
  name: string;
  /**
   * 相对父级颜色转换方法;
   * 如果不设置 convertMode , 则等于父级的值
   */
  convertMode?: ColorConvertMode;
  /**
   * convertMode = colorPalette 时，设置 ColorGradationStep;
   * convertMode = fade 时，设置 0 to 1;
   * convertMode = tint 时，设置 0 to 100;
   * convertMode = shade 时，设置 0 to 100;
   */
  convertArg?: ColorGradationStep | number;
  children?: ColorCssVarsMap[];
};

export {
  ColorConvertMode,
  ColorGradationStep,
  ColorCssVarsMap,
};
