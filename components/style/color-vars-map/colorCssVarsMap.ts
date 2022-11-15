import {
  ColorConvertMode,
  ColorGradationStep,
  ColorCssVarsMap,
} from '../interface';

/**
 * 默认颜色 css vars 级联关系。
 * 根据 themes/css-vars.less 的 基础 less 变量 计算关系设置
 */
export const defaultColorCssVarsMap: ColorCssVarsMap[] = [
  {
    name: 'primary-color',
    children: [
      { name: 'primary-1', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
      { name: 'primary-2', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step2 },
      { name: 'primary-3', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
      { name: 'primary-4', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step4 },
      { name: 'primary-5', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step5 },
      { name: 'primary-6', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step6 },
      { name: 'primary-7', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step7 },
      { name: 'primary-8', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step8 },
      { name: 'primary-9', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step9 },
      { name: 'primary-10', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step10 },
      { name: 'primary-fade-1', convertMode: ColorConvertMode.fade, convertArg: 0.1 },
      { name: 'primary-fade-2', convertMode: ColorConvertMode.fade, convertArg: 0.2 },
      { name: 'primary-fade-3', convertMode: ColorConvertMode.fade, convertArg: 0.3 },
      { name: 'primary-fade-4', convertMode: ColorConvertMode.fade, convertArg: 0.4 },
      { name: 'primary-fade-5', convertMode: ColorConvertMode.fade, convertArg: 0.5 },
      { name: 'primary-fade-6', convertMode: ColorConvertMode.fade, convertArg: 0.6 },
      { name: 'primary-fade-7', convertMode: ColorConvertMode.fade, convertArg: 0.7 },
      { name: 'primary-fade-8', convertMode: ColorConvertMode.fade, convertArg: 0.8 },
      { name: 'primary-fade-9', convertMode: ColorConvertMode.fade, convertArg: 0.9 },
      { name: 'primary-fade-10', convertMode: ColorConvertMode.fade, convertArg: 1 },
      { name: 'primary-tint-1', convertMode: ColorConvertMode.tint, convertArg: 10 },
      { name: 'primary-tint-2', convertMode: ColorConvertMode.tint, convertArg: 20 },
      { name: 'primary-tint-3', convertMode: ColorConvertMode.tint, convertArg: 30 },
      { name: 'primary-tint-4', convertMode: ColorConvertMode.tint, convertArg: 40 },
      { name: 'primary-tint-5', convertMode: ColorConvertMode.tint, convertArg: 50 },
      { name: 'primary-tint-6', convertMode: ColorConvertMode.tint, convertArg: 60 },
      { name: 'primary-tint-7', convertMode: ColorConvertMode.tint, convertArg: 70 },
      { name: 'primary-tint-8', convertMode: ColorConvertMode.tint, convertArg: 80 },
      { name: 'primary-tint-9', convertMode: ColorConvertMode.tint, convertArg: 90 },
      { name: 'primary-tint-10', convertMode: ColorConvertMode.tint, convertArg: 100 },
      {
        // LINK
        name: 'link-color',
        children: [
          { name: 'link-hover-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step5 },
          { name: 'link-active-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step7 },
        ],
      },
      {
        // button primary
        name: 'btn-primary-bg',
        children: [
          { name: 'btn-primary-focus-bg', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step7 },
        ],
      },
      {
        // Checkbox
        name: 'checkbox-color',
        children: [
          { name: 'checkbox-shadow-color', convertMode: ColorConvertMode.fade, convertArg: 0.2 },
        ],
      },
      {
        // DatePicker
        name: 'date-primary-color',
        children: [
          { name: 'date-primary-hover-color', convertMode: ColorConvertMode.fade, convertArg: 0.7 },
        ],
      },
      {
        // Radio
        name: 'radio-color',
        children: [
          { name: 'radio-shadow-color', convertMode: ColorConvertMode.fade, convertArg: 0.2 },
          // Radio buttons
          { name: 'radio-button-hover-color', convertMode: ColorConvertMode.fade, convertArg: 0.5 },
          { name: 'radio-button-active-color', convertMode: ColorConvertMode.fade, convertArg: 0.7 },
        ],
      },
      {
        // Input
        name: 'input-primary-color',
        children: [
          { name: 'input-focus-border-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
          { name: 'input-hover-border-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step5 },
        ],
      },
      {
        // Tree
        name: 'tree-primary-color',
        children: [
          { name: 'tree-node-selected-bg', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step2 },
          { name: 'tree-focus-bg', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
        ],
      },
      {
        // Tabs
        name: 'tab-primary-color',
        children: [
          { name: 'tab-hover-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step5 },
          { name: 'tab-active-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step7 },
        ],
      },
      {
        // Switch
        name: 'switch-checked-color',
        children: [
          {
            name: 'switch-color', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3,
            children: [
              { name: 'switch-box-shadow-color', convertMode: ColorConvertMode.fade, convertArg: 0.2 },
            ],
          },
        ],
      },
      {
        // Anchor
        name: 'anchor-primary-color',
        children: [
          { name: 'anchor-primary-hover-color', convertMode: ColorConvertMode.fade, convertArg: 0.7 },
        ],
      },
    ],
  },
  {
    name: 'info-color',
    children: [
      { name: 'info-1', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
      { name: 'info-3', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
    ],
  },
  {
    name: 'success-color',
    children: [
      { name: 'success-1', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
      { name: 'success-3', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
    ],
  },
  {
    name: 'error-color',
    children: [
      { name: 'error-1', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
      { name: 'error-3', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
    ],
  },
  {
    name: 'warning-color',
    children: [
      { name: 'warning-1', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step1 },
      { name: 'warning-3', convertMode: ColorConvertMode.colorPalette, convertArg: ColorGradationStep.step3 },
    ],
  },
  {
    name: 'text-color',
    children: [
      { name: 'input-info-color', convertMode: ColorConvertMode.fade, convertArg: 0.54 },
    ],
  },
  {
    name: 'layout-header-background',
    children: [
      { name: 'layout-sider-background-tint-1', convertMode: ColorConvertMode.tint, convertArg: 10 },
    ],
  },
  {
    name: 'skeleton-color',
    children: [
      { name: 'skeleton-to-color', convertMode: ColorConvertMode.shade, convertArg: 5 },
    ],
  },
];
