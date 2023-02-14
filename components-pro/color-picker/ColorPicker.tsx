import React, { CSSProperties, ReactNode } from 'react';
import { colorHexReg } from 'choerodon-ui/dataset/validator/rules/typeMismatch';
import Icon from 'choerodon-ui/lib/icon';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import defaultTo from 'lodash/defaultTo';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import round from 'lodash/round';
import pull from 'lodash/pull';
import concat from 'lodash/concat';
import classNames from 'classnames';
import { transformZoomData } from 'choerodon-ui/shared/util';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import EventManager from '../_util/EventManager';
import { FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { ViewMode, ColorUnit } from './enum';
import { defaultColorMap, commonColorMap } from './presetColorMap';
import { Action } from '../trigger/enum';

const FILL_COLOR = '#FFFFFF';
const COLOR_LINE_LENGTH = 9;
const COLOR_STORAGE_ITEM = 'color.picker.customized.used';

// 相对亮度计算公式：L = 0.2126 * R + 0.7152 * G + 0.0722 * B
// 最高亮度：L = (0.2126 * 255 + 0.7152 * 255 + 0.0722 * 255) - 1.05
const COLOR_MAX_LIGHT = 253.95;

function getNodeRect(node): ClientRect {
  return node.getBoundingClientRect();
}

export interface ColorPickerProps extends TriggerFieldProps {
  mode?: ViewMode;
  preset?: boolean;
}

@observer
export default class ColorPicker extends TriggerField<ColorPickerProps> {
  static displayName = 'ColorPicker';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'color-picker',
    clearButton: false,
    mode: ViewMode.default,
  };

  gradient: HTMLDivElement | null;

  selectPointer: HTMLDivElement | null;

  eventManager: EventManager = new EventManager(typeof window === 'undefined' ? undefined : document);

  hue: HTMLDivElement | null;

  huePointer: HTMLDivElement | null;

  opacity: HTMLDivElement | null;

  opacityPointer: HTMLDivElement | null;

  footerInputRef: HTMLInputElement | null = null;

  HSV = {
    h: 0,
    s: 1,
    v: 1,
    a: 1,
  };

  RGBA = {
    r: 255,
    g: 0,
    b: 0,
    a: 1,
  };

  @observable hueColor?: string;

  @observable footerEditFlag?: boolean;

  @observable gradientHidden?: boolean;

  @observable gradienLeft?: number;

  @observable gradienTop?: number;

  popupView: HTMLElement | null;

  get multiple(): boolean {
    return false;
  }

  get range(): boolean {
    return false;
  }

  get preset(): boolean {
    const { preset } = this.props;
    if (isBoolean(preset)) {
      return preset;
    }
    return this.getContextConfig('colorPreset');
  }

  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('ColorPicker', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
      typeMismatch: $l('ColorPicker', 'type_mismatch'),
    };
  }

  get colorPickUsed(): string[] {
    const list = JSON.parse(localStorage.getItem(COLOR_STORAGE_ITEM) || '[]');
    if (list.length < COLOR_LINE_LENGTH) {
      return concat(list, Array(COLOR_LINE_LENGTH - list.length).fill(FILL_COLOR));
    }
    return list;
  }

  saveGradientRef = node => (this.gradient = node);

  saveSelectPointerRef = node => (this.selectPointer = node);

  saveHuePointerRef = node => (this.huePointer = node);

  saveHueRef = node => (this.hue = node);

  saveOpacityRef = node => (this.opacity = node);

  saveOpacityPointerRef = node => (this.opacityPointer = node);

  saveFooterAlphaRef = node => (this.footerInputRef = node);

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'mode',
      'preset',
    ]);
  }

  getDefaultAction(): Action[] {
    return this.getContextConfig('selectTrigger') || super.getDefaultAction();
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.gradientHidden = true;
    });
    this.popupView = null;
  }

  componentDidUpdate() {
    const { popup } = this;
    if (popup) {
      const { h, s, v, a } = this.HSV;
      const { huePointer, opacityPointer, selectPointer, hue, opacity, gradient } = this;
      const { a: Alpha } = this.hsvToRGB(h, s, v, a);
      if (huePointer && hue) {
        const { width } = getNodeRect(hue);
        this.setSliderPointer((width * h) / 360, huePointer, hue, false);
      }
      if (opacityPointer && opacity) {
        const { width } = getNodeRect(opacity);
        this.setSliderPointer(width * Alpha, opacityPointer, opacity, false);
      }
      if (selectPointer && gradient) {
        const { width, height } = getNodeRect(gradient);
        const left = s * width;
        const top = height - v * height;
        this.setGradientPointer(left, top, selectPointer, gradient, false);
      }
    }
    if (!this.gradientHidden && this.popupView) {
      const { offsetTop } = this.popupView;
      const { left, top, width, height } = this.popupView.getBoundingClientRect();
      const { innerWidth, innerHeight } = window;

      runInAction(() => {
        if (left + width > innerWidth && left > width) {
          this.gradienLeft = - width;
        }
        if (top + height > innerHeight) {
          this.gradienTop = offsetTop - (top + height - innerHeight);
        }
      });
    }
  }

  getValue(): any {
    const value = super.getValue();
    return typeof value === 'string' ? value : undefined;
  }

  getBorder(r = 255, g = 0, b = 0): boolean {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > COLOR_MAX_LIGHT;
  }

  syncValueOnBlur(value) {
    const { footerEditFlag, gradientHidden, preset } = this;
    if (!footerEditFlag) {
      if (value !== '' && value[0] !== '#' && !value.startsWith('rgb') && !value.startsWith('hls')) {
        value = `#${value}`;
      }
      super.syncValueOnBlur(value);
    }
    if (preset && !gradientHidden) {
      this.setGradientHidden(true);
    }
  }

  getFieldType(): FieldType {
    return FieldType.color;
  }

  getPrefix(): ReactNode {
    const { prefixCls, props: { mode, renderer } } = this;
    const backgroundColor = this.getValue();
    const isButtonMode = mode === ViewMode.button;
    if (isButtonMode && renderer) {
      return this.processRenderer(backgroundColor);
    }

    const { r, g, b } = backgroundColor && this.hexToRGB ? this.hexToRGB(backgroundColor) : this.RGBA;
    const className = classNames(
      {
        [`${prefixCls}-color`]: !isButtonMode,
        [`${prefixCls}-button-color`]: isButtonMode,
        [`${prefixCls}-prefix-border`]: !isButtonMode && this.getBorder(r, g, b),
      });
    return (
      <div className={`${prefixCls}-prefix`}>
        <span className={className} style={{ backgroundColor }} />
      </div>
    );
  }

  getPopupFooter() {
    const { prefixCls, RGBA } = this;
    const className = `${prefixCls}-popup-footer-slider-pointer`;
    const huePointerProps = {
      onMouseDown: this.handleHPMouseDown,
      ref: this.saveHuePointerRef,
      className,
    };
    const opacityPointerProps = {
      onMouseDown: this.handleOpacityMouseDown,
      ref: this.saveOpacityPointerRef,
      className,
    };
    const inputProps = {
      onInput: this.handleFooterInput,
      onFocus: this.handleFooterFocus,
    };
    const { r, g, b, a } = RGBA;
    const value = (this.getEditorTextInfo().text || '').replace('#', '');
    return (
      <div className={`${prefixCls}-popup-footer`}>
        <div className={`${prefixCls}-popup-footer-slide-bar`}>
          <div>
            <div ref={this.saveHueRef} className={`${prefixCls}-popup-footer-slider`}>
              <div onClick={this.handleHueClick} className="hue" />
              <div {...huePointerProps} />
            </div>
            <div ref={this.saveOpacityRef} className={`${prefixCls}-popup-footer-slider`}>
              <div onClick={this.handleOpacityClick} className="opacity" style={{ background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgb(${r}, ${g}, ${b}))` }} />
              <div {...opacityPointerProps} />
            </div>
          </div>
          <span className={`${prefixCls}-popup-footer-color`} style={{ background: `rgba(${r}, ${g}, ${b}, ${a})` }} />
        </div>
        <div className={`${prefixCls}-popup-footer-input`}>
          <div className={`${prefixCls}-popup-footer-input-color`} >
            <input
              name={ColorUnit.hex}
              value={value}
              autoComplete="off"
              {...inputProps}
            />
            <span>{ColorUnit.hex}</span>
          </div>
          {
            Object.keys(RGBA).map(item => {
              return (
                <div className={`${prefixCls}-popup-footer-input-color`} key={item}>
                  <input
                    name={item}
                    value={value ? this.RGBA[item] : ''}
                    autoComplete="off"
                    ref={item === 'a' ? this.saveFooterAlphaRef : undefined}
                    {...inputProps}
                  />
                  <span>{ColorUnit[item]}</span>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }

  getGradientPopupContent() {
    const { gradientHidden, prefixCls, preset } = this;
    const gradientProps = {
      className: `${prefixCls}-popup-body-gradient`,
      onClick: this.handleGPClick,
      ref: this.saveGradientRef,
    };
    const gradientPointerProps = {
      onMouseDown: this.handleGPMouseDown,
      ref: this.saveSelectPointerRef,
      className: `${prefixCls}-popup-body-selector`,
    };
    if (isEmpty(this.hueColor)) {
      this.setColor(this.getValue());
    }
    return (
      <div ref={dom => { this.popupView = dom }} className={`${prefixCls}-popup-view`} style={{ display: preset && !gradientHidden || !preset ? 'block' : 'none', top: this.gradienTop, left: this.gradienLeft }}>
        <div className={`${prefixCls}-popup-view-picker-name`}>{$l('ColorPicker', 'pick_color_view')}</div>
        <div className={`${prefixCls}-popup-body`} style={{ backgroundColor: defaultTo(this.hueColor, '#ff0000') }}>
          <div {...gradientProps} />
          <div {...gradientPointerProps} />
        </div>
        {this.getPopupFooter()}
      </div>
    );
  }

  getPresetData(list: string[], value?: string) {
    const { prefixCls, hexToRGB, getBorder } = this;
    const className = `${prefixCls}-popup-view-palettes`;
    const valueRgba = value ? hexToRGB(value) : { r: undefined, g: undefined, b: undefined, a: undefined };
    return (
      <div className={className}>
        {
          [...list].map((item, index) => {
            const { r, g, b, a } = hexToRGB(item);
            const border = getBorder(r, g, b);
            const { r: vr, g: vg, b: vb, a: va } = valueRgba;
            const active = r === vr && g === vg && b === vb && a === va;
            const key = `${item}_${index}`;
            return (
              <div
                className={classNames(
                  `${className}-block`,
                  {
                    [`${className}-block-border`]: border,
                    [`${className}-block-active`]: active,
                  })}
                style={{ backgroundColor: item }}
                key={key}
                onClick={() => this.handlePreset(item)}
              >
                {active && <Icon type="check" />}
              </div>)
          })
        }
      </div>
    )
  }

  getPopupContent() {
    const { prefixCls, preset } = this;
    if (preset) {
      const value = this.getValue();
      return (<div className={`${prefixCls}-popup-view-preset`}>
        <div onClick={() => this.setGradientHidden(true)}>
          {this.getPresetData(commonColorMap, value)}
          {this.getPresetData(defaultColorMap, value)}
          <div className={`${prefixCls}-popup-picker-name`}>{$l('ColorPicker', 'used_view')}</div>
          {this.getPresetData(this.colorPickUsed)}
        </div>
        <div className={`${prefixCls}-popup-view-gradient`}>
          <div className={`${prefixCls}-popup-picker-name`} onClick={this.onExpandChange}>
            <div>
              <Icon type="color_lens-o" />
              <span>{$l('ColorPicker', 'custom_view')}</span>
            </div>
            <Icon type="navigate_next" />
          </div>
          {this.getGradientPopupContent()}
        </div>
      </div>);
    }

    return this.getGradientPopupContent();
  }

  setHSV(h, s, v, a) {
    const { HSV } = this;
    if (h !== undefined && h !== HSV.h) {
      HSV.h = h;
    }
    if (v !== undefined && v !== HSV.v) {
      HSV.v = v;
    }
    if (s !== undefined && s !== HSV.s) {
      HSV.s = s;
    }
    if (a !== undefined && a !== HSV.a) {
      HSV.a = a;
    }
  }

  setRGBA(r, g, b, a) {
    const { RGBA } = this;
    if (isNil(r) || r > 255) r = 255;
    if (isNil(g) || g > 255) g = 255;
    if (isNil(b) || b > 255) b = 255;
    if (isNil(a) || a > 1) a = 1;

    if (r !== RGBA.r) {
      RGBA.r = round(r);
    }
    if (g !== RGBA.g) {
      RGBA.g = round(g);
    }
    if (b !== RGBA.b) {
      RGBA.b = round(b);
    }
    if (a !== RGBA.a) {
      RGBA.a = a;
    }
  }

  @action
  setHueColor(color: string) {
    if (color !== this.hueColor) {
      this.hueColor = color;
    }
  }

  @action
  setFooterEditFlag(footerEditFlag: boolean) {
    if (footerEditFlag !== this.footerEditFlag) {
      this.footerEditFlag = footerEditFlag;
    }
  }

  @action
  setGradientHidden(gradientHidden: boolean) {
    if (gradientHidden !== this.gradientHidden) {
      this.gradientHidden = gradientHidden;
    }
  }

  @autobind
  setColor(color: string) {
    if (!isNil(color) && color.slice(0, 1) === '#' && color.length > 3) {
      const { gradient, selectPointer, hue, huePointer, opacity, opacityPointer } = this;
      const { r, g, b, a } = this.hexToRGB(color);
      const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
      this.setHSV(h, s, v, a);
      this.setRGBA(r, g, b, a);
      const { r: hr, g: hg, b: hb, a: ha } = this.hsvToRGB(h, 1, 1, 1);
      const hueColor = this.rgbToHEX(hr, hg, hb, ha);
      this.setHueColor(hueColor);
      if (gradient && selectPointer && hue && huePointer) {
        const { height, width } = getNodeRect(gradient);
        const left = s * width;
        const top = height - v * height;
        const { width: hueWidth } = getNodeRect(hue);
        const { width: opacityWidth } = getNodeRect(opacity);
        const hueLeft = (h / 360) * hueWidth;
        const opacityLeft = a * opacityWidth;
        this.setSliderPointer(hueLeft, huePointer, hue, false);
        this.setSliderPointer(opacityLeft, opacityPointer, opacity, false);
        this.setGradientPointer(left, top, selectPointer, gradient, false);
      }
      if (this.getValue() !== color) {
        this.prepareSetValue(color);
      }
    }
  }

  @autobind
  positionToHSV(left, top, width, height) {
    const { h, a } = this.HSV;
    if (width < 0) {
      width = 0;
    }
    const s = left / width;
    const v = 1 - top / height;
    return { h, s, v, a };
  }

  rgbToHEX(r, g, b, a) {
    function hex(num) {
      const hexNum = Number(num).toString(16);
      return hexNum.length === 1 ? `0${hexNum}` : hexNum[1] === '.' ? `0${hexNum[0]}` : hexNum;
    }

    if (a !== 1) {
      return `#${hex(r)}${hex(g)}${hex(b)}${hex(round(a * 255))}`;
    }
    return `#${hex(r)}${hex(g)}${hex(b)}`;
  }

  @action
  hexToRGB(hex) {
    hex = hex.split('#')[1] || hex.split('#')[0];
    const length = hex.length;
    let results = '';
    const hexArray = hex.split('');
    if (length === 3 || length === 4) {
      for (let i = 0; i < length; i++) {
        results = `${results}${hexArray[i]}${hexArray[i]}`;
      }
    } else if (length === 5) {
      results = `${hex}${hexArray[length - 1]}`;
    } else {
      results = hex;
    }
    const hasAlpha = results.length === 8;
    results = results.slice(0, hasAlpha ? 8 : 6);
    const result = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?$/i.exec(results);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: hasAlpha ? round(parseInt(result[4], 16) / 255, 2) : 1,
      }
      : {
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      };
  }

  rgbToHSV(r, g, b, a) {
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const v = max;
    let s;
    let h;
    if (v === 0) {
      s = 0;
    } else {
      s = (max - min) / max;
    }
    if (max === min) {
      h = 0;
    } else {
      const d = r === min ? g - b : b === min ? r - g : b - r;
      const m = r === min ? 3 : b === min ? 1 : 5;
      h = 60 * (m - d / (max - min));
    }
    if (h < 0) {
      h += 360;
    }
    return { h, s, v, a };
  }

  hsvToRGB(h, s, v, a) {
    h /= 60;
    const h1 = Math.floor(h);
    const f = h - h1;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let rgb;
    switch (h1) {
      case 0:
        rgb = { r: v, g: t, b: p, a };
        break;
      case 1:
        rgb = { r: q, g: v, b: p, a };
        break;
      case 2:
        rgb = { r: p, g: v, b: t, a };
        break;
      case 3:
        rgb = { r: p, g: q, b: v, a };
        break;
      case 4:
        rgb = { r: t, g: p, b: v, a };
        break;
      default:
        rgb = { r: v, g: p, b: q, a };
        break;
    }
    rgb.r = Math.floor(rgb.r * 255);
    rgb.g = Math.floor(rgb.g * 255);
    rgb.b = Math.floor(rgb.b * 255);
    return rgb;
  }

  @autobind
  setGradientPointer(x, y, pointer, wrap, isClient: boolean) {
    const { left: wrapX, top: wrapY, width: wrapW, height: wrapH } = getNodeRect(wrap);
    const { height: pointerH, width: pointerW } = getNodeRect(pointer);
    let left;
    let top;
    if (isClient) {
      left = x - wrapX < 0 ? 0 : x - wrapX > wrapW ? wrapW : x - wrapX;
      top = y - wrapY < 0 ? 0 : y - wrapY > wrapH ? wrapH : y - wrapY;
    } else {
      left = x;
      top = y;
    }
    pointer.style.left = `${left - pointerH / 2}px`;
    pointer.style.top = `${top - pointerW / 2}px`;
    return { left, top };
  }

  @autobind
  handleGPClick(e) {
    const { gradient, selectPointer, setGradientPointer } = this;
    if (gradient && selectPointer) {
      const { positionToHSV, rgbToHEX, hsvToRGB } = this;
      const { left, top } = setGradientPointer(transformZoomData(e.clientX), transformZoomData(e.clientY), selectPointer, gradient, true);
      const { height, width } = getNodeRect(gradient);
      const { h, s, v, a: ha } = positionToHSV(left, top, width, height);
      this.setHSV(undefined, s, v, undefined);
      const { r, g, b, a } = hsvToRGB(h, s, v, ha);
      const hexColor = rgbToHEX(r, g, b, a);
      this.setRGBA(r, g, b, round(a, 2));
      this.prepareSetValue(hexColor);
    }
  }

  @autobind
  setSliderPointer(x, pointer, wrap, isClient) {
    const { left: wrapX, width: wrapW } = getNodeRect(wrap);
    const { width: pointerW } = getNodeRect(pointer);
    let left;
    if (isClient) {
      left = x - wrapX < 0 ? 0 : x - wrapX > wrapW ? wrapW : x - wrapX;
    } else {
      left = x;
    }
    pointer.style.left = `${left - pointerW / 2}px`;
    return { left, wrapW };
  }

  @autobind
  handleHueClick(e) {
    const { hue, huePointer, setSliderPointer, hsvToRGB, rgbToHEX } = this;
    if (hue && huePointer) {
      const { left, wrapW } = setSliderPointer(transformZoomData(e.clientX), huePointer, hue, true);
      const h = Math.floor((left / wrapW) * 360);
      const { s, v, a: ha } = this.HSV;
      this.setHSV(h, undefined, undefined, undefined);
      const { r, g, b, a } = hsvToRGB(h, 1, 1, 1);
      const { r: valueR, g: valueG, b: valueB, a: valueA } = hsvToRGB(h, s, v, ha);
      const hueColor = rgbToHEX(r, g, b, a);
      const valueColor = rgbToHEX(valueR, valueG, valueB, valueA);
      this.setRGBA(valueR, valueG, valueB, valueA);
      this.setHueColor(hueColor);
      this.prepareSetValue(valueColor);
    }
  }

  @autobind
  handleOpacityClick(e) {
    const { opacity, opacityPointer, setSliderPointer, hsvToRGB, rgbToHEX } = this;
    if (opacity && opacityPointer) {
      const { left, wrapW } = setSliderPointer(transformZoomData(e.clientX), opacityPointer, opacity, true);
      const a = round(left / wrapW, 2);
      const { h, s, v } = this.HSV;
      const { r, g, b } = hsvToRGB(h, s, v, a);
      this.setHSV(h, s, v, a);
      this.setRGBA(r, g, b, a);
      this.prepareSetValue(rgbToHEX(r, g, b, a));
    }
  }

  @autobind
  handleFooterInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { target, target: { name } }: { target: any } = e;
    let { value } = target;

    const rgba = this.RGBA;
    if (name === ColorUnit.hex) {
      value = `#${value}`;
      this.prepareSetValue(value);
      if (colorHexReg.test(value)) {
        const { r, g, b, a } = this.hexToRGB(value);
        const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
        const { r: hr, g: hg, b: hb, a: ha } = this.hsvToRGB(h, 1, 1, 1);
        this.setRGBA(r, g, b, a);
        this.setHSV(h, s, v, a);
        this.setHueColor(this.rgbToHEX(hr, hg, hb, ha));
      }
    } else {
      let valueToNumber = Number(value);
      if (!isNaN(valueToNumber) || name === 'a') {
        if (name === 'a') {
          if (valueToNumber >= 1) {
            valueToNumber = 1;
          } else if (value && value.slice(-1) === '.') {
            const timer = setTimeout(() => {
              clearTimeout(timer);
              if (this.footerInputRef) {
                this.footerInputRef.value = value;
              }
            }, 0);
            return;
          }
        } else if (value > 255) {
          valueToNumber = 255;
        }
        rgba[name] = valueToNumber;
        const { r, g, b, a } = rgba;
        const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
        this.setRGBA(r, g, b, a);
        this.setHSV(h, s, v, a);
        this.prepareSetValue(this.rgbToHEX(r, g, b, a));
      }
    }
  }

  @autobind
  handleGPMouseDown() {
    this.eventManager
      .addEventListener('mousemove', this.handleGPClick)
      .addEventListener('mouseup', this.onGPMouseUp);
  }

  @autobind
  onGPMouseUp() {
    this.eventManager
      .removeEventListener('mousemove', this.handleGPClick)
      .removeEventListener('mouseup', this.onGPMouseUp);
  }

  @autobind
  handleHPMouseDown() {
    this.eventManager
      .addEventListener('mousemove', this.handleHueClick)
      .addEventListener('mouseup', this.onHPMouseUp);
  }

  @autobind
  handleOpacityMouseDown() {
    this.eventManager
      .addEventListener('mousemove', this.handleOpacityClick)
      .addEventListener('mouseup', this.onOpacityMouseUp);
  }

  @autobind
  onHPMouseUp() {
    this.eventManager
      .removeEventListener('mousemove', this.handleHueClick)
      .removeEventListener('mouseup', this.onHPMouseUp);
  }

  @autobind
  onOpacityMouseUp() {
    this.eventManager
      .removeEventListener('mousemove', this.handleOpacityClick)
      .removeEventListener('mouseup', this.onOpacityMouseUp);
  }

  @autobind
  onExpandChange(e) {
    e.stopPropagation();
    this.setGradientHidden(!this.gradientHidden);
    this.forceUpdate();
  }

  @autobind
  handleFocus(e) {
    this.setFooterEditFlag(false);
    super.handleFocus(e);
  }

  @autobind
  handleFooterFocus() {
    this.setFooterEditFlag(true);
  }

  @action
  setPopup(statePopup: boolean) {
    super.setPopup(statePopup);
    const value = this.getValue();
    if (value && statePopup) {
      this.setColor(value);
    } else if (value && colorHexReg.test(value)) {
      let { colorPickUsed } = this;
      const valueIndex = colorPickUsed.indexOf(value);
      if (valueIndex === -1) {
        colorPickUsed = [...new Set([value, ...colorPickUsed])].slice(0, COLOR_LINE_LENGTH);
      } else {
        colorPickUsed = [...new Set([value, ...pull(colorPickUsed, value)])];
      }
      localStorage.setItem(COLOR_STORAGE_ITEM, JSON.stringify(colorPickUsed));
    }
  }

  @autobind
  handlePreset(color: string) {
    this.setColor(color);
    this.setPopup(false);
  }

  @autobind
  handlePopupAnimateAppear() {
    this.setColor(this.getValue());
  }

  handlePopupAnimateEnd() {
    // noop
  }

  getPopupStyleFromAlign(): CSSProperties | undefined {
    return undefined;
  }

  getTriggerIconFont() {
    const { mode } = this.props;
    if (mode !== ViewMode.button) {
      return 'palette';
    }
    return '';
  }

  getWrapperClassNames() {
    const { prefixCls } = this;
    return super.getWrapperClassNames({
      [`${prefixCls}-button`]: this.props.mode === ViewMode.button,
    });
  }

  renderLengthInfo(): ReactNode {
    return undefined;
  }
}
