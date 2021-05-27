import React, { CSSProperties, ReactNode } from 'react';
import { observer } from 'mobx-react';
import { action, computed, observable } from 'mobx';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import EventManager from '../_util/EventManager';
import { FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';

function getNodeRect(node): ClientRect {
  return node.getBoundingClientRect();
}

export interface ColorPickerProps extends TriggerFieldProps {
}

@observer
export default class ColorPicker extends TriggerField<ColorPickerProps> {
  static displayName = 'ColorPicker';

  static defaultProps = {
    ...TriggerField.defaultProps,
    suffixCls: 'color-picker',
    clearButton: false,
  };

  gradient: HTMLDivElement | null;

  selectPointer: HTMLDivElement | null;

  eventManager: EventManager = new EventManager(typeof window === 'undefined' ? undefined : document);

  hue: HTMLDivElement | null;

  huePointer: HTMLDivElement | null;

  opacity: HTMLDivElement | null;

  opacityPointer: HTMLDivElement | null;

  HSV = {
    h: 0,
    s: 1,
    v: 1,
    a: 1,
  };

  @observable hueColor?: string;

  @computed
  get defaultValidationMessages(): ValidationMessages {
    const label = this.getProp('label');
    return {
      valueMissing: $l('ColorPicker', label ? 'value_missing' : 'value_missing_no_label', {
        label,
      }),
      typeMismatch: $l('ColorPicker', 'type_mismatch'),
    };
  }

  saveGradientRef = node => (this.gradient = node);

  saveSelectPointerRef = node => (this.selectPointer = node);

  saveHuePointerRef = node => (this.huePointer = node);

  saveHueRef = node => (this.hue = node);

  saveOpacityRef = node => (this.opacity = node);

  saveOpacityPointerRef = node => (this.opacityPointer = node);

  componentDidUpdate() {
    const { popup } = this;
    if (popup) {
      const { h, s, v } = this.HSV;
      const { huePointer, selectPointer, hue, gradient } = this;
      if (huePointer && hue) {
        const { width } = getNodeRect(hue);
        this.setHuePointer((width * h) / 360, huePointer, hue, false);
      }
      if (selectPointer && gradient) {
        const { width, height } = getNodeRect(gradient);
        const left = s * width;
        const top = height - v * height;
        this.setGradientPointer(left, top, selectPointer, gradient, false);
      }
    }
  }

  syncValueOnBlur(value) {
    if (value[0] !== '#' && !value.startsWith('rgb') && !value.startsWith('hls')) {
      value = `#${value}`;
    }
    super.syncValueOnBlur(value);
  }

  getFieldType(): FieldType {
    return FieldType.color;
  }


  getPrefix(): ReactNode {
    const { prefixCls } = this;
    return (
      <div className={`${prefixCls}-prefix`}>
        <span className={`${prefixCls}-color`} style={{ backgroundColor: this.getValue() }} />
      </div>
    );
  }

  getPopupFooter() {
    const { prefixCls } = this;
    const huePointerProps = {
      onMouseDown: this.handleHPMouseDown,
      ref: this.saveHuePointerRef,
      className: `${prefixCls}-popup-footer-slider-pointer`,
    };
    return (
      <div className={`${prefixCls}-popup-footer`}>
        <div ref={this.saveHueRef} className={`${prefixCls}-popup-footer-slider`}>
          <div onClick={this.handleHueClick} className="hue" />
          <div {...huePointerProps} />
        </div>
        <div ref={this.saveOpacityRef} className={`${prefixCls}-popup-footer-slider opacity`}>
          <div
            ref={this.saveOpacityPointerRef}
            className={`${prefixCls}-popup-footer-slider-pointer`}
          />
        </div>
      </div>
    );
  }

  getPopupContent() {
    const { prefixCls } = this;
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
    return (
      <div className={`${prefixCls}-popup-view`}>
        <div className={`${prefixCls}-popup-body`} style={{ backgroundColor: this.getValue() }}>
          <div {...gradientProps} />
          <div {...gradientPointerProps} />
        </div>
        {this.getPopupFooter()}
      </div>
    );
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

  @action
  setHueColor(color) {
    if (color !== this.hueColor) {
      this.hueColor = color;
    }
  }

  @autobind
  setColor(color) {
    if (color !== undefined && color.slice(0, 1) === '#' && color.length > 3) {
      const { gradient, selectPointer, hue, huePointer } = this;
      const { r, g, b, a } = this.hexToRGB(color);
      const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
      this.setHSV(h, s, v, a);
      const { r: hr, g: hg, b: hb, a: ha } = this.hsvToRGB(h, 1, 1, 1);
      const hueColor = this.rgbToHEX(hr, hg, hb, ha);
      this.setHueColor(hueColor);
      const { height, width } = getNodeRect(gradient);
      const left = s * width;
      const top = height - v * height;
      const { width: hueWidth } = getNodeRect(hue);
      const hueLeft = (h / 360) * hueWidth;
      this.setHuePointer(hueLeft, huePointer, hue, false);
      this.setGradientPointer(left, top, selectPointer, gradient, false);
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
      const hexNum = num.toString(16);
      return hexNum.length === 1 ? `0${hexNum}` : hexNum;
    }

    if (a !== 1) {
      return `#${hex(r)}${hex(g)}${hex(b)}${hex((a * 255) / 10)}`;
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
    results = results.slice(0, 6);
    const result = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(results);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
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
      const { left, top } = setGradientPointer(e.clientX, e.clientY, selectPointer, gradient, true);
      const { height, width } = getNodeRect(gradient);
      const { h, s, v, a: opacity } = positionToHSV(left, top, width, height);
      this.setHSV(undefined, s, v, undefined);
      const { r, g, b, a } = hsvToRGB(h, s, v, opacity);
      const hexColor = rgbToHEX(r, g, b, a);
      this.prepareSetValue(hexColor);
    }
  }

  @autobind
  setHuePointer(x, pointer, wrap, isClient) {
    const { left: wrapX, width: wrapW } = getNodeRect(wrap);
    const { width: pointerW } = getNodeRect(pointer);
    let left;
    if (isClient) {
      left = x - wrapX < 0 ? 0 : x - wrapX > wrapW ? wrapW : x - wrapX;
    } else {
      left = x;
    }
    pointer.style.left = `${left - pointerW / 2}px`;
    if (left === wrapW) {
      return { left: 0, wrapW };
    }
    return { left, wrapW };
  }

  @autobind
  handleHueClick(e) {
    const { hue, huePointer, setHuePointer, hsvToRGB, rgbToHEX } = this;
    if (hue && huePointer) {
      const { left, wrapW } = setHuePointer(e.clientX, huePointer, hue, true);
      const h = Math.floor((left / wrapW) * 360);
      const { s, v, a: opacity } = this.HSV;
      this.setHSV(h, undefined, undefined, undefined);
      const { r, g, b, a } = hsvToRGB(h, 1, 1, 1);
      const { r: valueR, g: valueG, b: valueB, a: valueA } = hsvToRGB(h, s, v, opacity);
      const hueColor = rgbToHEX(r, g, b, a);
      const valueColor = rgbToHEX(valueR, valueG, valueB, valueA);
      this.setHueColor(hueColor);
      this.prepareSetValue(valueColor);
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
  onHPMouseUp() {
    this.eventManager
      .removeEventListener('mousemove', this.handleHueClick)
      .removeEventListener('mouseup', this.onHPMouseUp);
  }

  @autobind
  handlePopupAnimateAppear() {
    this.setColor(this.getValue());
  }

  handlePopupAnimateEnd() {
  }

  getPopupStyleFromAlign(): CSSProperties | undefined {
    return undefined;
  }

  getTriggerIconFont() {
    return 'palette';
  }
}
