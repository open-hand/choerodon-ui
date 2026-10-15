import React, { CSSProperties, ReactNode } from 'react';
import { colorHexReg } from 'choerodon-ui/dataset/validator/rules/typeMismatch';
import { Gradient, parseColor, parseGradient, serializeGradient, mixWithWhite } from 'choerodon-ui/dataset/utils/color';
import Icon from 'choerodon-ui/lib/icon';
import Tabs from 'choerodon-ui/lib/tabs';
import { TabsType } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import { action, observable, runInAction } from 'mobx';
import defaultTo from 'lodash/defaultTo';
import isBoolean from 'lodash/isBoolean';
import isNil from 'lodash/isNil';
import round from 'lodash/round';
import pull from 'lodash/pull';
import concat from 'lodash/concat';
import classNames from 'classnames';
import TriggerField, { TriggerFieldProps } from '../trigger-field/TriggerField';
import autobind from '../_util/autobind';
import EventManager from '../_util/EventManager';
import { transformZoomData } from '../_util/DocumentUtils';
import { FieldType } from '../data-set/enum';
import { ValidationMessages } from '../validator/Validator';
import { $l } from '../locale-context';
import { ViewMode, ColorUnit } from './enum';
import { defaultColorMap, commonColorMap } from './presetColorMap';
import { Action } from '../trigger/enum';
import TextArea from '../text-area';
import NoFillColor from './NoFillColor';

type ColorMode = 'single' | 'gradient';
interface PickerStop {
  id: number;
  color: string;
  position: number;
}

const FILL_COLOR = '#FFFFFF';
const COLOR_LINE_LENGTH = 9;
const COLOR_STORAGE_ITEM = 'color.picker.customized.used';
const CUSTOM_PANEL_GAP = 4;

// 相对亮度计算公式：L = 0.2126 * R + 0.7152 * G + 0.0722 * B
// 最高亮度：L = (0.2126 * 255 + 0.7152 * 255 + 0.0722 * 255) - 1.05
const COLOR_MAX_LIGHT = 253.95;

function getNodeRect(node): ClientRect {
  return node.getBoundingClientRect();
}

export interface ColorPickerProps extends TriggerFieldProps {
  mode?: ViewMode;
  preset?: boolean;
  gradientMode?: ColorMode | ColorMode[];
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

  footerEditFlag?: boolean;

  @observable gradientHidden?: boolean;

  @observable gradienLeft?: number;

  popupView: HTMLElement | null;

  @observable activeMode: ColorMode;

  @observable stops: PickerStop[];

  @observable selectedStop: number;

  @observable gradientType: Gradient['type'];

  @observable gradientAngle: number;

  @observable gradientText: string;

  @observable gradientError: boolean;

  stopId = 0;

  stopTrack: HTMLDivElement | null = null;

  presetOpacity: HTMLDivElement | null = null;

  presetOpacityPointer: HTMLDivElement | null = null;

  lastValue?: string;

  draggingStop = false;

  draggingColor = false;

  pointerSyncFrame?: number;

  pointerSyncDisposed = false;

  @observable footerHex?: string;

  footerHexOriginal?: string;

  @observable stopColorDrafts: { [id: number]: string };

  @observable footerAlphaDraft?: string;

  @observable stopAlphaDrafts: { [id: number]: string };

  get colorModes(): ColorMode[] {
    const { gradientMode } = this.props;
    const modes = Array.isArray(gradientMode) ? gradientMode : [gradientMode || 'single'];
    const available = [...new Set(modes.filter(mode => mode === 'single' || mode === 'gradient'))];
    return available.length ? available : ['single'];
  }

  get editingGradient(): boolean {
    const modes = this.colorModes;
    return modes.includes('gradient') && (this.activeMode === 'gradient' || !modes.includes('single'));
  }

  get gradientValue(): string {
    return serializeGradient({ type: this.gradientType, angle: this.gradientAngle, stops: this.sortedStops }) || '';
  }

  get sortedStops(): PickerStop[] {
    return this.stops.slice().sort((first, second) => first.position - second.position || first.id - second.id);
  }

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

  saveSelectPointerRef = node => {
    this.selectPointer = node;
    if (node) this.schedulePointerSync();
  };

  saveHuePointerRef = node => {
    this.huePointer = node;
    if (node) this.schedulePointerSync();
  };

  saveHueRef = node => (this.hue = node);

  saveOpacityRef = node => (this.opacity = node);

  saveOpacityPointerRef = node => {
    this.opacityPointer = node;
    if (node) this.schedulePointerSync();
  };

  schedulePointerSync() {
    if (!this.pointerSyncDisposed && this.popup && this.pointerSyncFrame === undefined) {
      this.pointerSyncFrame = requestAnimationFrame(() => {
        this.pointerSyncFrame = undefined;
        this.syncPointers();
      });
    }
  }

  cancelPointerSync() {
    if (this.pointerSyncFrame !== undefined) {
      cancelAnimationFrame(this.pointerSyncFrame);
      this.pointerSyncFrame = undefined;
    }
  }

  syncPointers() {
    if (this.pointerSyncDisposed || !this.popup) {
      return;
    }
    const { h, s, v, a } = this.HSV;
    const { huePointer, opacityPointer, selectPointer, hue, opacity, gradient, presetOpacity, presetOpacityPointer } = this;
    if (presetOpacity && presetOpacityPointer) {
      const { width } = getNodeRect(presetOpacity);
      if (Number.isFinite(width) && width > 0) {
        this.setSliderPointer(width * this.RGBA.a, presetOpacityPointer, presetOpacity, false);
      }
    }
    if (this.preset && this.gradientHidden) {
      return;
    }
    if (huePointer && hue) {
      const { width } = getNodeRect(hue);
      if (Number.isFinite(width) && width > 0) {
        this.setSliderPointer((width * h) / 360, huePointer, hue, false);
      }
    }
    if (opacityPointer && opacity) {
      const { width } = getNodeRect(opacity);
      if (Number.isFinite(width) && width > 0) {
        this.setSliderPointer(width * a, opacityPointer, opacity, false);
      }
    }
    if (selectPointer && gradient) {
      const { width, height } = getNodeRect(gradient);
      if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        this.setGradientPointer(s * width, (1 - v) * height, selectPointer, gradient, false);
      }
    }
  }

  getOmitPropsKeys(): string[] {
    return super.getOmitPropsKeys().concat([
      'mode',
      'preset',
      'gradientMode',
    ]);
  }

  getDefaultAction(): Action[] {
    return this.getContextConfig('selectTrigger') || super.getDefaultAction();
  }

  constructor(props, context) {
    super(props, context);
    runInAction(() => {
      this.gradientHidden = true;
      this.activeMode = 'single';
      this.stops = [];
      this.selectedStop = 0;
      this.gradientType = 'linear';
      this.gradientAngle = 135;
      this.gradientText = '';
      this.gradientError = false;
      this.stopColorDrafts = {};
      this.stopAlphaDrafts = {};
    });
    this.popupView = null;
  }

  componentDidUpdate() {
    super.componentDidUpdate();
    const { popup } = this;
    if (popup) {
      if (this.getValue() !== this.lastValue || !this.colorModes.includes(this.activeMode)) {
        this.syncPickerValue();
      }
      this.syncPointers();
      this.schedulePointerSync();
    }
    if (!this.gradientHidden && this.popupView) {
      const { left, width } = this.popupView.getBoundingClientRect();
      const { innerWidth } = window;

      runInAction(() => {
        if (left + width + CUSTOM_PANEL_GAP > innerWidth && left > width + CUSTOM_PANEL_GAP) {
          this.gradienLeft = -(width + CUSTOM_PANEL_GAP);
        }
      });
    }
  }

  componentWillUnmount() {
    this.pointerSyncDisposed = true;
    this.cancelPointerSync();
    this.eventManager.clear();
    super.componentWillUnmount();
  }

  getValue(): any {
    const value = super.getValue();
    return typeof value === 'string' ? value : undefined;
  }

  getBorder(r = 255, g = 0, b = 0): boolean {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > COLOR_MAX_LIGHT;
  }

  syncValueOnBlur(value, event?: React.FocusEvent<HTMLInputElement>) {
    const { footerEditFlag } = this;
    if (!footerEditFlag && (!event || event.target === this.element)) {
      if (value && /^[\da-f]+$/i.test(value)) {
        value = `#${value}`;
      }
      super.syncValueOnBlur(value);
    }
  }

  @autobind
  @action
  handleChange(e) {
    this.footerHex = undefined;
    this.footerHexOriginal = undefined;
    super.handleChange(e);
    if (!e.target.value.trim()) {
      this.clear();
    }
  }

  @action
  clear() {
    this.resetEmptyState();
    this.setText();
    this.lastValue = undefined;
    super.clear();
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

    const { r, g, b } = parseColor(backgroundColor) || this.RGBA;
    const className = classNames(
      {
        [`${prefixCls}-color`]: !isButtonMode,
        [`${prefixCls}-button-color`]: isButtonMode,
        [`${prefixCls}-prefix-border`]: !isButtonMode && this.getBorder(r, g, b) && backgroundColor !== undefined,
      });
    return (
      <div className={`${prefixCls}-prefix`}>
        <span className={className} style={{ background: backgroundColor }} />
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
      onChange: this.handleFooterInput,
      onFocus: this.handleFooterFocus,
    };
    const { r, g, b, a } = RGBA;
    const singleValue = this.getEditorTextInfo().text || '';
    const value = this.footerHex !== undefined
      ? this.footerHex
      : this.editingGradient
        ? this.currentStopColor ? this.rgbToHEX(r, g, b, a).replace('#', '') : ''
        : (singleValue && parseColor(singleValue) ? this.rgbToHEX(r, g, b, a) : singleValue).replace('#', '');
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
              onBlur={this.handleFooterBlur}
            />
            <span>{ColorUnit.hex}</span>
          </div>
          <div className={`${prefixCls}-popup-footer-input-rgba`}>
            {Object.keys(RGBA).map(item => (
              <div className={`${prefixCls}-popup-footer-input-color`} key={item}>
                <input
                  name={item}
                  value={item === 'a' && this.footerAlphaDraft !== undefined ? this.footerAlphaDraft : value ? item === 'a' ? this.formatAlpha(this.RGBA[item]) : this.RGBA[item] : ''}
                  autoComplete="off"
                  {...inputProps}
                  onBlur={item === 'a' ? this.handleFooterBlur : undefined}
                />
                <span>{ColorUnit[item]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  getGradientPopupContent() {
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
        <div className={`${prefixCls}-popup-body`} style={{ backgroundColor: defaultTo(this.hueColor, '#ff0000') }}>
          <div {...gradientProps} />
          <div {...gradientPointerProps} />
        </div>
        {this.getPopupFooter()}
      </div>
    );
  }

  getPresetData(list: string[], value?: string, showActive = true) {
    const { prefixCls, getBorder } = this;
    const className = `${prefixCls}-popup-view-palettes`;
    const valueRgba = showActive ? parseColor(value) : undefined;
    return (
      <div className={className}>
        {
          list.map((item, index) => {
            const { r, g, b, a } = parseColor(item) || this.RGBA;
            const border = getBorder(r, g, b);
            const active = !!valueRgba && r === valueRgba.r && g === valueRgba.g && b === valueRgba.b && a === valueRgba.a;
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
      const value = this.editingGradient ? this.currentStopColor : this.getValue();
      return <div className={`${prefixCls}-popup-view-preset`}>
        <div>
          <button type="button" className={`${prefixCls}-no-fill`} onClick={this.handleNoFill}><NoFillColor />{$l('ColorPicker', 'no_fill')}</button>
          {this.getPresetData(commonColorMap, value)}
          {this.getPresetData(defaultColorMap, value)}
          <div className={`${prefixCls}-popup-picker-name`}>{$l('ColorPicker', 'used_view')}</div>
          {this.getPresetData(this.colorPickUsed)}
          {this.getPresetOpacity()}
        </div>
        <div className={`${prefixCls}-popup-view-gradient`}>
          <div className={`${prefixCls}-popup-picker-name`} onClick={this.onExpandChange}>
            <div><Icon type="color_lens-o" /><span>{$l('ColorPicker', 'custom_view')}</span></div>
            <Icon type="navigate_next" />
          </div>
          {this.getCustomContent()}
        </div>
      </div>;
    }
    return this.getCustomContent();
  }

  getCustomContent() {
    const { prefixCls } = this;
    return <div ref={node => { this.popupView = node; }} className={`${prefixCls}-custom-panel`} style={{ display: this.preset && this.gradientHidden ? 'none' : 'block', left: this.gradienLeft, top: 'unset', bottom: -4 }}>
      {this.getModeTabs()}
    </div>;
  }

  getModeTabs() {
    const { prefixCls } = this;
    const modes = this.colorModes;
    const activeMode = this.editingGradient ? 'gradient' : 'single';
    const pickerTitle = <div className={`${prefixCls}-popup-view-picker-name`}>{$l('ColorPicker', 'pick_color_view')}</div>;
    if (modes.length > 1) {
      const { TabPane } = Tabs;
      return (
        <>
          {pickerTitle}
          <Tabs className={`${prefixCls}-mode-tabs`} type={TabsType['second-level']} activeKey={activeMode} onChange={this.handleModeChange}>
            {modes.map(mode => (
              <TabPane key={mode} tab={$l('ColorPicker', mode === 'single' ? 'mode_single' : 'mode_gradient')}>
                {mode === activeMode ? this.getModeContent() : null}
              </TabPane>
            ))}
          </Tabs>
        </>
      );
    }
    return <>{pickerTitle}{this.getModeContent()}</>;
  }

  getModeContent() {
    if (this.editingGradient) {
      return this.getGradientEditor();
    }
    return this.getGradientPopupContent();
  }

  get currentStopColor(): string {
    const stop = this.stops.find(item => item.id === this.selectedStop);
    return stop ? stop.color : '';
  }

  formatAlpha(alpha?: number): number | string {
    if (alpha === undefined) {
      return '';
    }
    return round(alpha, 2);
  }

  getAlphaInput(value: string): { draft: string; alpha?: number } {
    const number = Number(value);
    if (value === '' || !Number.isFinite(number)) {
      return { draft: value };
    }
    const alpha = round(Math.max(0, Math.min(1, number)), 2);
    const intermediate = /^(0?|[1-9]\d*)\.\d{0,2}$/.test(value) && number >= 0 && number <= 1;
    return { draft: intermediate ? value : String(alpha), alpha };
  }

  @action
  handleStopAlphaInput(id: number, value: string) {
    const { draft, alpha } = this.getAlphaInput(value);
    this.stopAlphaDrafts = { ...this.stopAlphaDrafts, [id]: draft };
    if (alpha !== undefined) {
      this.updateStopAlpha(id, alpha);
    }
  }

  @action
  handleStopAlphaBlur(id: number) {
    if (this.stopAlphaDrafts[id] === '') {
      this.updateStopAlpha(id, 1);
    }
    this.resetStopAlphaDraft(id);
  }

  @action
  resetStopAlphaDraft(id: number) {
    const drafts = { ...this.stopAlphaDrafts };
    delete drafts[id];
    this.stopAlphaDrafts = drafts;
  }

  getStopColorDisplay(stop: PickerStop): string {
    const draft = this.stopColorDrafts[stop.id];
    if (draft !== undefined) {
      return draft;
    }
    const color = parseColor(stop.color);
    return color ? this.rgbToHEX(color.r, color.g, color.b, 1) : stop.color;
  }

  getPresetOpacity() {
    const { prefixCls, RGBA: { r, g, b } } = this;
    return (
      <div className={`${prefixCls}-preset-opacity`}>
        <span>{$l('ColorPicker', 'opacity')}</span>
        <div ref={node => { this.presetOpacity = node; }} className={`${prefixCls}-popup-footer-slider`}>
          <div className="opacity" onClick={this.handlePresetOpacityClick} style={{ background: `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgb(${r}, ${g}, ${b}))` }} />
          <div ref={node => { this.presetOpacityPointer = node; }} className={`${prefixCls}-popup-footer-slider-pointer`} onMouseDown={this.handlePresetOpacityMouseDown} />
        </div>
        <input aria-label="Opacity" type="number" min={0} max={1} step={0.01} value={this.footerAlphaDraft ?? this.formatAlpha(parseColor(this.editingGradient ? this.currentStopColor : this.getValue())?.a)} onFocus={this.handleFooterFocus} onChange={this.handlePresetOpacityInput} onBlur={this.handlePresetOpacityBlur} />
      </div>
    );
  }

  getGradientEditor() {
    const { prefixCls, gradientType, gradientAngle, sortedStops } = this;
    return (
      <div className={`${prefixCls}-gradient-editor`}>
        {this.getGradientPopupContent()}
        <div className={`${prefixCls}-stop-track`} ref={node => { this.stopTrack = node; }} onClick={this.handleStopTrackClick}>
          <div className={`${prefixCls}-stop-track-color`} style={{ background: serializeGradient({ type: 'linear', angle: 90, stops: sortedStops }) }} />
          {sortedStops.map(stop => (
            <button type="button" key={stop.id} aria-label={`Color stop ${stop.position}%`} aria-pressed={stop.id === this.selectedStop} className={classNames(`${prefixCls}-stop`, { [`${prefixCls}-stop-active`]: stop.id === this.selectedStop })} style={{ left: `${stop.position}%`, background: stop.color }} onClick={e => { e.stopPropagation(); this.selectStop(stop.id); }} onMouseDown={e => this.handleStopMouseDown(e, stop.id)} />
          ))}
        </div>
        <div className={`${prefixCls}-stop-list-header`}>
          <span>{$l('ColorPicker', 'stop')}</span>
          <button type="button" aria-label="Add color stop" className={`${prefixCls}-stop-add`} onClick={() => this.addStop()}><Icon type="add" /></button>
        </div>
        <div className={`${prefixCls}-stop-list`}>
          {sortedStops.map((stop, index) => (
            <div key={stop.id} className={classNames(`${prefixCls}-stop-row`, { [`${prefixCls}-stop-row-active`]: stop.id === this.selectedStop })}>
              <div className={`${prefixCls}-stop-position`}>
                <input aria-label={`Color stop ${index + 1} position`} type="number" min={0} max={100} step="any" value={stop.position} onFocus={this.handleFooterFocus} onChange={e => this.updateStopPosition(Number(e.target.value), stop.id)} />
                <span aria-hidden="true">%</span>
              </div>
              <div className={`${prefixCls}-stop-color-alpha`}>
                <input className={`${prefixCls}-stop-color`} aria-label={`Color stop ${index + 1} color`} value={this.getStopColorDisplay(stop)} onFocus={this.handleFooterFocus} onChange={e => this.updateStopColor(stop.id, e.target.value)} onBlur={() => this.handleStopColorBlur(stop.id)} />
                <input className={`${prefixCls}-stop-alpha`} aria-label={`Color stop ${index + 1} alpha`} inputMode="decimal" value={this.stopAlphaDrafts[stop.id] ?? this.formatAlpha(parseColor(stop.color)?.a)} onFocus={this.handleFooterFocus} onChange={e => this.handleStopAlphaInput(stop.id, e.target.value)} onBlur={() => this.handleStopAlphaBlur(stop.id)} />
              </div>
              <button type="button" aria-label={`Remove color stop ${index + 1}`} aria-disabled={this.stops.length <= 2} onMouseDown={e => { if (this.stops.length <= 2) e.preventDefault(); }} onClick={() => this.removeStop(stop.id)}><Icon type="remove" /></button>
            </div>
          ))}
        </div>
        <div className={`${prefixCls}-gradient-direction`}>
          <span>{$l('ColorPicker', 'gradient_direction')}</span>
          <div className={`${prefixCls}-direction-options`}>
            {[135, 90, 225, 315, 180, 45].map(angle => (
              <div className={`${prefixCls}-direction-option`} key={angle}>
                <button type="button" aria-label={`Gradient direction ${angle} degrees`} aria-pressed={gradientType === 'linear' && gradientAngle === angle} style={{ background: serializeGradient({ type: 'linear', angle, stops: sortedStops }) }} onClick={() => this.handleDirectionChange({ target: { value: String(angle) } })}>
                  {gradientType === 'linear' && gradientAngle === angle && <Icon type="check" />}
                </button>
                <span>{angle >= 180 ? angle - 360 : angle}°</span>
              </div>
            ))}
            <div className={`${prefixCls}-direction-option`}>
              <button type="button" aria-label="Gradient direction radial" aria-pressed={gradientType === 'radial'} style={{ background: serializeGradient({ type: 'radial', angle: 0, stops: sortedStops }) }} onClick={() => this.handleDirectionChange({ target: { value: 'radial' } })}>
                {gradientType === 'radial' && <Icon type="check" />}
              </button>
              <span>{$l('ColorPicker', 'radial')}</span>
            </div>
          </div>
        </div>
        <div className={`${prefixCls}-gradient-style-title`}>{$l('ColorPicker', 'gradient_style_value')}</div>
        <TextArea className={`${prefixCls}-gradient-text`} value={this.gradientText} rows={3} onInput={this.handleGradientTextInput} onFocus={this.handleFooterFocus} onBlur={this.handleGradientTextBlur} aria-label="Gradient CSS" aria-invalid={this.gradientError} />
        {this.gradientError && <div className={`${prefixCls}-gradient-error`} role="alert">{$l('ColorPicker', 'invalid_gradient')}</div>}
      </div>
    );
  }

  @action
  syncPickerValue() {
    this.footerHex = undefined;
    this.footerHexOriginal = undefined;
    this.footerAlphaDraft = undefined;
    const value = this.getValue();
    this.lastValue = value;
    if (!value) {
      if (!this.colorModes.includes(this.activeMode)) {
        this.activeMode = this.colorModes[0];
      }
      if (this.editingGradient && !this.stops.length) {
        this.initializeGradient();
        return;
      }
      this.resetEmptyState();
      return;
    }
    const gradient = parseGradient(value);
    if (gradient && this.colorModes.includes('gradient')) {
      this.activeMode = 'gradient';
      this.gradientHidden = false;
      this.loadGradient(gradient);
    } else {
      this.activeMode = this.colorModes.includes('single') ? 'single' : 'gradient';
      this.setColor(parseColor(value) ? value : undefined, false);
      if (this.editingGradient) {
        if (!this.stops.length) {
          this.initializeGradient(value);
        } else {
          this.selectStop(this.selectedStop);
        }
      }
    }
  }

  @action
  loadGradient(gradient: Gradient) {
    this.gradientType = gradient.type;
    this.gradientAngle = gradient.angle;
    this.stopColorDrafts = {};
    this.stopAlphaDrafts = {};
    this.stops = gradient.stops.map(stop => ({ ...stop, id: ++this.stopId }));
    this.selectStop(this.sortedStops[0].id);
    this.gradientText = this.gradientValue;
    this.gradientError = false;
  }

  @action
  initializeGradient(seed = this.getValue()) {
    const color = parseColor(seed) ? seed as string : '#ff0000';
    this.loadGradient({ type: 'linear', angle: 135, stops: [{ color, position: 0 }, { color: mixWithWhite(color, 0.72) as string, position: 100 }] });
  }

  @action
  resetEmptyState() {
    this.footerHex = undefined;
    this.footerAlphaDraft = undefined;
    this.stopAlphaDrafts = {};
    this.gradientError = false;
    this.stopColorDrafts = {};
    this.stops = [
      { id: ++this.stopId, color: '', position: 0 },
      { id: ++this.stopId, color: '', position: 100 },
    ];
    this.selectedStop = this.stops[0].id;
    this.gradientText = '';
    this.resetEmptyColor();
  }

  @action
  resetEmptyColor() {
    this.hueColor = undefined;
    this.HSV = { h: 0, s: 1, v: 1, a: 1 };
    this.RGBA = { r: 0, g: 0, b: 0, a: 0 };
  }

  @autobind
  @action
  handleModeChange(mode: ColorMode) {
    if (!this.colorModes.includes(mode) || mode === this.activeMode) {
      return;
    }
    this.activeMode = mode;
    this.footerHex = undefined;
    this.footerAlphaDraft = undefined;
    this.stopAlphaDrafts = {};
    if (mode === 'gradient') {
      this.gradientHidden = false;
      if (!this.stops.length) {
        this.initializeGradient();
      } else {
        this.selectStop(this.sortedStops[0].id);
      }
      this.commitGradient();
    } else {
      this.setColor(this.currentStopColor);
    }
    this.schedulePointerSync();
  }

  @action
  commitGradient() {
    const value = this.gradientValue;
    if (value) {
      this.gradientText = value;
      this.gradientError = false;
      this.lastValue = value;
      this.prepareSetValue(value);
    }
  }

  @action
  selectStop(id: number) {
    const stop = this.stops.find(item => item.id === id);
    if (stop) {
      this.selectedStop = id;
      this.footerHex = undefined;
      this.footerAlphaDraft = undefined;
      this.setColor(stop.color, false);
    }
  }

  @action
  addStop(position?: number) {
    const stops = this.sortedStops;
    if (stops.length < 2) {
      return;
    }
    if (position === undefined) {
      let largestGap = -1;
      for (let index = 1; index < stops.length; index += 1) {
        const gap = stops[index].position - stops[index - 1].position;
        if (gap > largestGap) {
          largestGap = gap;
          position = (stops[index].position + stops[index - 1].position) / 2;
        }
      }
    }
    if (!Number.isFinite(position)) {
      return;
    }
    const stopPosition = round(Math.max(0, Math.min(100, position as number)), 2);
    const rightIndex = stops.findIndex(stop => stop.position > stopPosition);
    const left = stops[rightIndex === -1 ? stops.length - 1 : Math.max(0, rightIndex - 1)];
    const right = stops[rightIndex === -1 ? stops.length - 1 : rightIndex];
    const amount = left.position === right.position ? 0 : Math.max(0, (stopPosition - left.position) / (right.position - left.position));
    const first = parseColor(left.color);
    const second = parseColor(right.color);
    if (!first || !second) {
      return;
    }
    const channels = ['r', 'g', 'b'].map(channel => Math.round(first[channel] + (second[channel] - first[channel]) * amount));
    const alpha = round(first.a + (second.a - first.a) * amount, 6);
    const stop = { id: ++this.stopId, color: `rgba(${channels.join(', ')}, ${alpha})`, position: stopPosition };
    this.stops.push(stop);
    this.selectStop(stop.id);
    this.commitGradient();
  }

  @autobind
  @action
  removeStop(id = this.selectedStop) {
    if (this.stops.length <= 2) {
      return;
    }
    this.stops = this.stops.filter(stop => stop.id !== id);
    this.resetStopColorDraft(id);
    this.resetStopAlphaDraft(id);
    if (id === this.selectedStop) {
      this.selectStop(this.sortedStops[0].id);
    }
    this.commitGradient();
  }

  @action
  updateStopPosition(position: number, id = this.selectedStop) {
    if (!Number.isFinite(position)) {
      return;
    }
    this.stops = this.stops.map(stop => stop.id === id ? { ...stop, position: round(Math.max(0, Math.min(100, position)), 2) } : stop);
    this.commitGradient();
  }

  @action
  updateStopColor(id: number, color: string) {
    this.resetStopAlphaDraft(id);
    this.stopColorDrafts = { ...this.stopColorDrafts, [id]: color };
    const parsed = parseColor(color);
    const stop = this.stops.find(item => item.id === id);
    if (parsed && stop) {
      const alpha = parseColor(stop.color)?.a ?? parsed.a;
      if (alpha !== parsed.a) {
        color = `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${alpha})`;
      }
      this.stops = this.stops.map(stop => stop.id === id ? { ...stop, color } : stop);
      this.selectStop(id);
      this.commitGradient();
    }
  }

  @action
  updateStopAlpha(id: number, alpha: number) {
    const stop = this.stops.find(item => item.id === id);
    if (stop && Number.isFinite(alpha)) {
      const color = parseColor(stop.color);
      if (!color) {
        return;
      }
      const value = `rgba(${color.r}, ${color.g}, ${color.b}, ${Math.max(0, Math.min(1, alpha))})`;
      this.stops = this.stops.map(item => item.id === id ? { ...item, color: value } : item);
      this.resetStopColorDraft(id);
      this.selectStop(id);
      this.commitGradient();
    }
  }

  @action
  handleStopColorBlur(id: number) {
    const draft = this.stopColorDrafts[id]?.trim();
    if (draft && /^[\da-f]+$/i.test(draft)) {
      this.updateStopColor(id, `#${draft}`);
    }
    this.resetStopColorDraft(id);
  }

  @action
  resetStopColorDraft(id: number) {
    const drafts = { ...this.stopColorDrafts };
    delete drafts[id];
    this.stopColorDrafts = drafts;
  }

  getStopPosition(e): number | undefined {
    if (this.stopTrack) {
      const { left, width } = getNodeRect(this.stopTrack);
      if (width > 0) {
        return (transformZoomData(e.clientX) - left) / width * 100;
      }
    }
    return undefined;
  }

  @autobind
  handleStopTrackClick(e) {
    const position = this.getStopPosition(e);
    if (position !== undefined) {
      this.addStop(position);
    }
  }

  handleStopMouseDown(e, id: number) {
    if ((e.button !== undefined && e.button !== 0) || !this.stops.some(stop => stop.id === id)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.selectStop(id);
    this.draggingStop = true;
    this.eventManager.addEventListener('mousemove', this.handleStopMove).addEventListener('mouseup', this.handleStopMouseUp);
  }

  @autobind
  handleStopMove(e) {
    const position = this.getStopPosition(e);
    if (position !== undefined) {
      this.updateStopPosition(position);
    }
  }

  @autobind
  handleStopMouseUp() {
    this.draggingStop = false;
    this.eventManager.removeEventListener('mousemove', this.handleStopMove).removeEventListener('mouseup', this.handleStopMouseUp);
  }

  @autobind
  @action
  handleDirectionChange(e) {
    const { value } = e.target;
    if (value !== 'radial' && (value.trim() === '' || !Number.isFinite(Number(value)))) {
      return;
    }
    this.gradientType = value === 'radial' ? 'radial' : 'linear';
    if (value !== 'radial') {
      this.gradientAngle = Number(value);
    }
    this.commitGradient();
  }

  @autobind
  @action
  handleGradientTextInput(e) {
    this.gradientText = e.target.value;
    this.gradientError = false;
    if (!e.target.value.trim()) {
      this.clear();
    }
  }

  @autobind
  @action
  handleGradientTextBlur(e) {
    if (!e.target.value.trim()) {
      this.clear();
      return;
    }
    const gradient = parseGradient(e.target.value);
    if (gradient) {
      this.loadGradient(gradient);
      this.commitGradient();
    } else {
      this.gradientError = true;
    }
  }

  @autobind
  @action
  handleNoFill() {
    this.clear();
  }

  @autobind
  @action
  handlePresetOpacityInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (value === '') {
      this.footerAlphaDraft = '';
    } else {
      this.changeOpacity(Number(value));
    }
  }

  @autobind
  @action
  handlePresetOpacityBlur() {
    if (this.footerAlphaDraft === '') {
      this.changeOpacity(1);
    }
    this.footerAlphaDraft = undefined;
  }

  @action
  changeOpacity(alpha: number) {
    if (Number.isFinite(alpha)) {
      this.footerAlphaDraft = undefined;
      this.stopAlphaDrafts = {};
      const opacity = Math.max(0, Math.min(1, alpha));
      if (this.editingGradient) {
        this.stops = this.stops.map(stop => {
          const color = parseColor(stop.color);
          if (!color) {
            return stop;
          }
          return { ...stop, color: `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})` };
        });
        this.stopColorDrafts = {};
        this.selectStop(this.selectedStop);
        this.commitGradient();
        return;
      }
      const color = parseColor(this.getValue());
      if (!color) {
        return;
      }
      const { r, g, b } = color;
      this.setColor(`rgba(${r}, ${g}, ${b}, ${opacity})`);
    }
  }

  @autobind
  handlePresetOpacityClick(e) {
    if (this.presetOpacity && this.presetOpacityPointer) {
      const { left, wrapW } = this.setSliderPointer(transformZoomData(e.clientX), this.presetOpacityPointer, this.presetOpacity, true);
      if (wrapW > 0) {
        this.changeOpacity(round(left / wrapW, 2));
      }
    }
  }

  @autobind
  handlePresetOpacityMouseDown(e) {
    e.preventDefault();
    this.startColorDrag(this.handlePresetOpacityClick, this.handlePresetOpacityMouseUp);
  }

  @autobind
  handlePresetOpacityMouseUp() {
    this.endColorDrag(this.handlePresetOpacityClick, this.handlePresetOpacityMouseUp);
  }

  @action
  setEditingColor(color: string) {
    this.resetStopAlphaDraft(this.selectedStop);
    if (this.editingGradient) {
      if (parseColor(color)) {
        this.stops = this.stops.map(stop => stop.id === this.selectedStop ? { ...stop, color } : stop);
        this.resetStopColorDraft(this.selectedStop);
        this.footerHex = undefined;
        this.commitGradient();
      }
    } else {
      this.lastValue = color;
      this.prepareSetValue(color);
    }
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

  @autobind
  @action
  setColor(color: string | undefined, commit = true) {
    const parsed = parseColor(color);
    if (parsed) {
      const { r, g, b, a } = parsed;
      const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
      this.setHSV(h, s, v, a);
      this.setRGBA(r, g, b, a);
      this.hueColor = this.getHueColor(h);
      if (commit && color) {
        this.setEditingColor(color);
      }
    } else if (!color && !commit) {
      this.resetEmptyColor();
    }
    this.syncPointers();
    this.schedulePointerSync();
  }

  @autobind
  positionToHSV(left, top, width, height) {
    const { h, a } = this.HSV;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      return { h, s: this.HSV.s, v: this.HSV.v, a };
    }
    const s = Math.max(0, Math.min(1, left / width));
    const v = Math.max(0, Math.min(1, 1 - top / height));
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

  getHueColor(h: number): string {
    const { r, g, b, a } = this.hsvToRGB(h, 1, 1, 1);
    return this.rgbToHEX(r, g, b, a);
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
    const safeWidth = Number.isFinite(wrapW) && wrapW > 0 ? wrapW : 0;
    const safeHeight = Number.isFinite(wrapH) && wrapH > 0 ? wrapH : 0;
    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;
    let left;
    let top;
    if (isClient) {
      left = safeX - wrapX < 0 ? 0 : safeX - wrapX > safeWidth ? safeWidth : safeX - wrapX;
      top = safeY - wrapY < 0 ? 0 : safeY - wrapY > safeHeight ? safeHeight : safeY - wrapY;
    } else {
      left = Math.max(0, Math.min(safeWidth, safeX));
      top = Math.max(0, Math.min(safeHeight, safeY));
    }
    pointer.style.left = `${left - (Number.isFinite(pointerW) ? pointerW : 0) / 2}px`;
    pointer.style.top = `${top - (Number.isFinite(pointerH) ? pointerH : 0) / 2}px`;
    return { left, top };
  }

  @autobind
  handleGPClick(e) {
    const { gradient, selectPointer, setGradientPointer } = this;
    if (gradient && selectPointer) {
      const { positionToHSV, rgbToHEX, hsvToRGB } = this;
      const { height, width } = getNodeRect(gradient);
      if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return;
      }
      const { left, top } = setGradientPointer(transformZoomData(e.clientX), transformZoomData(e.clientY), selectPointer, gradient, true);
      const { h, s, v, a: ha } = positionToHSV(left, top, width, height);
      this.setHSV(undefined, s, v, undefined);
      const { r, g, b, a } = hsvToRGB(h, s, v, ha);
      const hexColor = rgbToHEX(r, g, b, a);
      this.setRGBA(r, g, b, round(a, 2));
      this.setEditingColor(hexColor);
    }
  }

  @autobind
  setSliderPointer(x, pointer, wrap, isClient) {
    const { left: wrapX, width: wrapW } = getNodeRect(wrap);
    const { width: pointerW } = getNodeRect(pointer);
    const safeWidth = Number.isFinite(wrapW) && wrapW > 0 ? wrapW : 0;
    const safeX = Number.isFinite(x) ? x : 0;
    let left;
    if (isClient) {
      left = safeX - wrapX < 0 ? 0 : safeX - wrapX > safeWidth ? safeWidth : safeX - wrapX;
    } else {
      left = Math.max(0, Math.min(safeWidth, safeX));
    }
    pointer.style.left = `${left - (Number.isFinite(pointerW) ? pointerW : 0) / 2}px`;
    return { left, wrapW: safeWidth };
  }

  @autobind
  @action
  handleHueClick(e) {
    const { hue, huePointer, setSliderPointer, hsvToRGB, rgbToHEX } = this;
    if (hue && huePointer) {
      const { left, wrapW } = setSliderPointer(transformZoomData(e.clientX), huePointer, hue, true);
      if (wrapW <= 0) {
        return;
      }
      const h = Math.floor((left / wrapW) * 360);
      const { s, v, a: ha } = this.HSV;
      this.setHSV(h, undefined, undefined, undefined);
      const hueColor = this.getHueColor(h);
      const { r: valueR, g: valueG, b: valueB, a: valueA } = hsvToRGB(h, s, v, ha);
      const valueColor = rgbToHEX(valueR, valueG, valueB, valueA);
      this.setRGBA(valueR, valueG, valueB, valueA);
      this.hueColor = hueColor;
      this.setEditingColor(valueColor);
    }
  }

  @autobind
  handleOpacityClick(e) {
    const { opacity, opacityPointer, setSliderPointer, hsvToRGB, rgbToHEX } = this;
    if (opacity && opacityPointer) {
      const { left, wrapW } = setSliderPointer(transformZoomData(e.clientX), opacityPointer, opacity, true);
      if (wrapW <= 0) {
        return;
      }
      const a = round(left / wrapW, 2);
      const { h, s, v } = this.HSV;
      const { r, g, b } = hsvToRGB(h, s, v, a);
      this.setHSV(h, s, v, a);
      this.setRGBA(r, g, b, a);
      this.setEditingColor(rgbToHEX(r, g, b, a));
    }
  }

  @autobind
  @action
  handleFooterInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { target, target: { name } }: { target: any } = e;
    let { value } = target;

    const rgba = this.RGBA;
    if (name === ColorUnit.hex) {
      this.footerAlphaDraft = undefined;
      this.footerHex = value;
      if (value) {
        value = `#${value}`;
      }
      if (this.editingGradient && colorHexReg.test(value)) {
        this.setEditingColor(value);
      }
      const parsed = parseColor(value);
      if (parsed) {
        const { r, g, b, a } = parsed;
        const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
        const hueColor = this.getHueColor(h);
        this.setRGBA(r, g, b, a);
        this.setHSV(h, s, v, a);
        this.hueColor = hueColor;
      }
    } else {
      let valueToNumber = Number(value);
      if (name === 'a') {
        const { draft, alpha } = this.getAlphaInput(value);
        this.footerAlphaDraft = draft;
        if (alpha === undefined || !parseColor(this.editingGradient ? this.currentStopColor : this.getValue())) {
          return;
        }
        valueToNumber = alpha;
      } else {
        this.footerAlphaDraft = undefined;
      }
      if (Number.isFinite(valueToNumber)) {
        this.footerHex = undefined;
        this.footerHexOriginal = undefined;
        if (name !== 'a') {
          if (!parseColor(this.editingGradient ? this.currentStopColor : this.getValue())) {
            rgba.a = 1;
          }
        }
        valueToNumber = Math.max(0, valueToNumber);
        if (name !== 'a' && value > 255) {
          valueToNumber = 255;
        }
        rgba[name] = valueToNumber;
        const { r, g, b, a } = rgba;
        const { h, s, v } = this.rgbToHSV(r / 255, g / 255, b / 255, a);
        this.setRGBA(r, g, b, a);
        this.setHSV(h, s, v, a);
        this.setEditingColor(this.rgbToHEX(r, g, b, a));
      }
    }
  }

  startColorDrag(onMouseMove: (e: MouseEvent) => void, onMouseUp: () => void) {
    this.draggingColor = true;
    this.eventManager
      .addEventListener('mousemove', onMouseMove)
      .addEventListener('mouseup', onMouseUp);
  }

  endColorDrag(onMouseMove: (e: MouseEvent) => void, onMouseUp: () => void) {
    this.draggingColor = false;
    this.eventManager
      .removeEventListener('mousemove', onMouseMove)
      .removeEventListener('mouseup', onMouseUp);
  }

  @autobind
  handleGPMouseDown() {
    this.startColorDrag(this.handleGPClick, this.onGPMouseUp);
  }

  @autobind
  onGPMouseUp() {
    this.endColorDrag(this.handleGPClick, this.onGPMouseUp);
  }

  @autobind
  handleHPMouseDown() {
    this.startColorDrag(this.handleHueClick, this.onHPMouseUp);
  }

  @autobind
  handleOpacityMouseDown() {
    this.startColorDrag(this.handleOpacityClick, this.onOpacityMouseUp);
  }

  @autobind
  onHPMouseUp() {
    this.endColorDrag(this.handleHueClick, this.onHPMouseUp);
  }

  @autobind
  onOpacityMouseUp() {
    this.endColorDrag(this.handleOpacityClick, this.onOpacityMouseUp);
  }

  @autobind
  @action
  onExpandChange(e) {
    e.stopPropagation();
    this.gradientHidden = !this.gradientHidden;
    this.schedulePointerSync();
  }

  @autobind
  @action
  handleFocus(e) {
    this.footerEditFlag = false;
    super.handleFocus(e);
  }

  @autobind
  @action
  handleFooterFocus() {
    this.footerEditFlag = true;
    this.footerHexOriginal = this.getValue();
    if (!this.editingGradient) {
      this.footerHex = this.getEditorTextInfo().text.replace('#', '');
    }
  }

  @autobind
  @action
  handleFooterBlur(e: React.FocusEvent<HTMLInputElement>) {
    if (e.target.name === 'a') {
      if (this.footerAlphaDraft === '' && parseColor(this.editingGradient ? this.currentStopColor : this.getValue())) {
        const { r, g, b } = this.RGBA;
        this.footerHex = undefined;
        this.setColor(this.rgbToHEX(r, g, b, 1));
      }
      this.footerAlphaDraft = undefined;
      return;
    }
    if (e.target.name !== ColorUnit.hex || this.editingGradient) {
      return;
    }
    if (this.footerHex === undefined) {
      this.footerHexOriginal = undefined;
      return;
    }
    if (!this.footerHex) {
      this.footerHex = undefined;
      this.footerHexOriginal = undefined;
      this.clear();
      return;
    }
    if (!colorHexReg.test(`#${this.footerHex}`)) {
      this.footerHex = undefined;
      this.setColor(this.footerHexOriginal, false);
      this.footerHexOriginal = undefined;
      return;
    }
    const color = `#${this.footerHex}`;
    this.setColor(color);
    this.footerHex = undefined;
    this.footerHexOriginal = undefined;
  }

  @action
  setPopup(statePopup: boolean) {
    if (!statePopup && (this.draggingStop || this.draggingColor)) {
      return;
    }
    if (statePopup === this.popup) {
      return;
    }
    super.setPopup(statePopup);
    if (!statePopup) {
      this.cancelPointerSync();
    }
    const value = this.getValue();
    if (statePopup) {
      this.syncPickerValue();
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
  @action
  handlePreset(color: string) {
    if (!parseColor(color)) {
      return;
    }
    this.stopColorDrafts = {};
    this.footerHex = undefined;
    this.footerAlphaDraft = undefined;
    this.stopAlphaDrafts = {};
    if (!this.editingGradient) {
      this.stops = [];
      this.selectedStop = 0;
      this.gradientText = '';
      this.gradientError = false;
      this.setColor(color);
    } else {
      this.initializeGradient(color);
      this.commitGradient();
    }
  }

  @autobind
  handlePopupAnimateAppear() {
    this.setColor(this.editingGradient ? this.currentStopColor : this.getValue(), false);
  }

  @autobind
  handlePopupAnimateEnd() {
    this.syncPointers();
    this.schedulePointerSync();
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
