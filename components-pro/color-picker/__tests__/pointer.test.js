import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { configure } from 'mobx';
import ColorPicker from '..';

describe('ColorPicker measured pointer synchronization', () => {
  let wrapper;
  let rect;
  let measurable;
  let frame;
  let cancelFrame;
  let container;
  let frames;
  let nextFrame;

  beforeAll(() => configure({ enforceActions: 'always' }));

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    frames = new Map();
    nextFrame = 0;
    frame = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      nextFrame += 1;
      frames.set(nextFrame, callback);
      return nextFrame;
    });
    cancelFrame = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(id => frames.delete(id));
    measurable = true;
    rect = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function measure() {
      const panel = this.closest('.c7n-pro-color-picker-custom-panel');
      const hidden = panel && (panel.style.display === 'none' || !measurable);
      let width = 0;
      let height = 0;
      if (!hidden) {
        if (this.classList.contains('c7n-pro-color-picker-popup-body-gradient')) {
          width = 240;
          height = 160;
        } else if (this.classList.contains('c7n-pro-color-picker-popup-body-selector')) {
          width = 12;
          height = 12;
        } else if (this.classList.contains('c7n-pro-color-picker-popup-footer-slider')) {
          width = 180;
          height = 8;
        } else if (this.classList.contains('c7n-pro-color-picker-popup-footer-slider-pointer')) {
          width = 10;
          height = 10;
        }
      }
      return { left: 0, top: 0, right: width, bottom: height, width, height };
    });
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    container.remove();
    rect.mockRestore();
    frame.mockRestore();
    cancelFrame.mockRestore();
    jest.useRealTimers();
    localStorage.clear();
  });

  afterAll(() => configure({ enforceActions: 'never' }));

  function open(props = {}) {
    wrapper = mount(<ColorPicker preset gradientMode={['single', 'gradient']} {...props} />, { attachTo: container });
    const picker = wrapper.instance();
    act(() => {
      picker.setPopup(true);
    });
    wrapper.update();
    return picker;
  }

  function flush() {
    const pending = Array.from(frames.values());
    frames.clear();
    act(() => pending.forEach(callback => callback()));
    wrapper.update();
  }

  function expectPointers(picker, color) {
    const { r, g, b, a } = color;
    const { h, s, v } = picker.rgbToHSV(r / 255, g / 255, b / 255, a);
    expect(picker.gradient.getBoundingClientRect().width).toBe(240);
    expect(picker.gradientHidden).toBe(false);
    expect(picker.popup).toBe(true);
    expect(picker.RGBA).toEqual(color);
    expect(parseFloat(picker.selectPointer.style.left)).toBeCloseTo(s * 240 - 6);
    expect(parseFloat(picker.selectPointer.style.top)).toBeCloseTo((1 - v) * 160 - 6);
    expect(parseFloat(picker.huePointer.style.left)).toBeCloseTo(h / 360 * 180 - 5);
    expect(parseFloat(picker.opacityPointer.style.left)).toBeCloseTo(a * 180 - 5);
    expect(parseFloat(picker.presetOpacityPointer.style.left)).toBeCloseTo(a * 180 - 5);
  }

  it.each(['single', 'gradient'])('measures the first custom expansion after choosing a preset in %s mode', mode => {
    const onChange = jest.fn();
    const picker = open({ gradientMode: mode, onChange });
    act(() => picker.handlePreset('#33669980'));
    flush();
    expect(picker.gradientHidden).toBe(true);
    expect(picker.selectPointer.style.left).toBe('');
    const value = picker.getValue();
    onChange.mockClear();
    measurable = false;
    act(() => picker.onExpandChange({ stopPropagation: jest.fn() }));
    wrapper.update();
    expect(picker.selectPointer.style.left).toBe('');
    measurable = true;
    flush();
    expectPointers(picker, { r: 51, g: 102, b: 153, a: 128 / 255 });
    expect(picker.getValue()).toBe(value);
    expect(onChange).not.toHaveBeenCalled();
    act(() => picker.onExpandChange({ stopPropagation: jest.fn() }));
    act(() => picker.onExpandChange({ stopPropagation: jest.fn() }));
    flush();
    expectPointers(picker, { r: 51, g: 102, b: 153, a: 128 / 255 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('synchronizes newly mounted tab refs and selects the sorted starting stop on gradient entry', () => {
    const onChange = jest.fn();
    const picker = open({ onChange });
    act(() => picker.handlePreset('#33669980'));
    act(() => picker.onExpandChange({ stopPropagation: jest.fn() }));
    flush();
    const singlePointer = picker.selectPointer;
    onChange.mockClear();
    act(() => picker.handleModeChange('gradient'));
    flush();
    expect(picker.selectPointer).not.toBe(singlePointer);
    expectPointers(picker, { r: 51, g: 102, b: 153, a: 128 / 255 });
    expect(onChange).toHaveBeenCalledTimes(1);
    const start = picker.stops[1].id;
    act(() => {
      picker.updateStopColor(start, 'rgba(102, 51, 153, 0.25)');
      picker.updateStopAlpha(start, 0.25);
      picker.updateStopPosition(0, start);
      picker.updateStopPosition(80, picker.stops[0].id);
      picker.selectStop(picker.stops[0].id);
    });
    act(() => picker.handleModeChange('single'));
    flush();
    expectPointers(picker, { r: 51, g: 102, b: 153, a: 128 / 255 });
    onChange.mockClear();
    act(() => picker.handleModeChange('gradient'));
    flush();
    expect(picker.selectedStop).toBe(start);
    expectPointers(picker, { r: 102, g: 51, b: 153, a: 0.25 });
    expect(onChange).toHaveBeenCalledTimes(1);
    const commit = jest.spyOn(picker, 'prepareSetValue');
    const setColor = jest.spyOn(picker, 'setColor');
    picker.getPopupContent();
    picker.syncPointers();
    flush();
    expect(setColor).not.toHaveBeenCalled();
    expect(commit).not.toHaveBeenCalled();
    setColor.mockRestore();
    commit.mockRestore();
  });

  it('coalesces pending measurements and cancels them on close and unmount', () => {
    const picker = open();
    const sync = jest.spyOn(picker, 'setSliderPointer');
    picker.schedulePointerSync();
    const frame = picker.pointerSyncFrame;
    picker.schedulePointerSync();
    expect(picker.pointerSyncFrame).toBe(frame);
    act(() => picker.setPopup(false));
    expect(picker.pointerSyncFrame).toBeUndefined();
    sync.mockClear();
    flush();
    expect(sync).not.toHaveBeenCalled();
    act(() => picker.setPopup(true));
    expect(picker.pointerSyncFrame).toBeDefined();
    wrapper.unmount();
    wrapper = undefined;
    expect(picker.pointerSyncFrame).toBeUndefined();
    sync.mockRestore();
  });
});
