import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ColorPicker from '..';
import { parseGradient } from '../../../components-dataset/utils/color';
import localeContext from '../../locale-context/LocaleContext';
import zh from '../../locale-context/zh_CN';

describe('ColorPicker blur source', () => {
  let wrapper;
  let container;
  let outside;

  beforeEach(() => {
    localeContext.setLocale(zh);
    jest.useFakeTimers();
    container = document.createElement('div');
    outside = document.createElement('button');
    document.body.appendChild(container);
    document.body.appendChild(outside);
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = undefined;
    }
    container.remove();
    outside.remove();
    jest.useRealTimers();
    localStorage.clear();
  });

  function open(props = {}) {
    wrapper = mount(<ColorPicker gradientMode={['single', 'gradient']} {...props} />, { attachTo: container });
    const picker = wrapper.instance();
    const input = wrapper.find('input.c7n-pro-color-picker').getDOMNode();
    expect(picker.element).toBe(input);
    expect(input).toBeInstanceOf(HTMLInputElement);
    Object.defineProperty(picker.trigger.domNode, 'offsetWidth', { configurable: true, value: 160 });
    Object.defineProperty(picker.trigger.domNode, 'offsetHeight', { configurable: true, value: 32 });
    act(() => {
      input.focus();
      jest.advanceTimersByTime(150);
    });
    wrapper.update();
    expect(picker.popup).toBe(true);
    return picker;
  }

  it('only synchronizes blur from the real main input', () => {
    const picker = open({ defaultValue: '#123456' });
    const popupInput = wrapper.find('.c7n-pro-color-picker-popup input').at(0).getDOMNode();
    const mainInput = picker.element;
    const value = picker.getValue();
    picker.syncValueOnBlur('abcdef', { target: popupInput });
    expect(picker.getValue()).toBe(value);
    picker.syncValueOnBlur('abcdef', { target: mainInput });
    expect(picker.getValue()).toBe('#abcdef');
  });

  it('keeps actual focus changes inside the popup and closes after leaving it', () => {
    const blurTargets = [];
    const picker = open({ defaultValue: '#12345680', onBlur: event => blurTargets.push(event.target) });
    const mainInput = picker.element;
    const popupInput = wrapper.find('.c7n-pro-color-picker-popup input').at(0).getDOMNode();
    popupInput.focus();
    expect(document.activeElement).toBe(popupInput);
    expect(picker.trigger.focusTarget).toBe(mainInput);
    expect(picker.popup).toBe(true);
    mainInput.focus();
    expect(document.activeElement).toBe(mainInput);
    expect(picker.trigger.focusTarget).toBeNull();
    expect(picker.popup).toBe(true);
    expect(blurTargets).toEqual([]);
    popupInput.focus();
    outside.focus();
    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(picker.popup).toBe(false);
    expect(blurTargets).toEqual([popupInput]);
    mainInput.focus();
    act(() => {
      jest.advanceTimersByTime(150);
    });
    expect(picker.popup).toBe(true);
    expect(picker.getValue()).toBe('#12345680');
  });

  it.each([
    ['single', 'gradient', '#12345680', '渐变'],
    ['gradient', 'single', 'linear-gradient(90deg, #12345680 0%, #abcdef 100%)', '单色'],
  ])('preserves %s to %s commits through actual Trigger blur and reopening', (initialMode, nextMode, value, tabText) => {
    const blurTargets = [];
    const onChange = jest.fn();
    const picker = open({ defaultValue: value, onChange, onBlur: event => blurTargets.push(event.target) });
    expect(picker.activeMode).toBe(initialMode);
    const tabBar = wrapper.find('.c7n-pro-color-picker-mode-tabs [role="tablist"]').getDOMNode();
    tabBar.focus();
    expect(document.activeElement).toBe(tabBar);
    expect(picker.trigger.focusTarget).toBe(picker.element);
    expect(picker.trigger.activeElement).toBe(tabBar);
    wrapper.find('.c7n-pro-color-picker-mode-tabs [role="tab"]').hostNodes().filterWhere(tab => tab.text() === tabText).simulate('click');
    const committed = picker.getValue();
    expect(committed).toBeDefined();
    expect(committed).not.toBe(value);
    expect(Boolean(parseGradient(committed))).toBe(nextMode === 'gradient');
    expect(picker.footerEditFlag).toBe(false);
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
    });
    expect(blurTargets).toEqual([tabBar]);
    expect(picker.popup).toBe(false);
    expect(picker.getValue()).toBe(committed);
    expect(onChange).toHaveBeenCalledTimes(1);
    act(() => {
      picker.element.focus();
      jest.advanceTimersByTime(150);
    });
    wrapper.update();
    expect(picker.popup).toBe(true);
    expect(picker.getValue()).toBe(committed);
    expect(picker.activeMode).toBe(nextMode);
    expect(wrapper.find('Tabs').prop('activeKey')).toBe(nextMode);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('preserves the committed value when switching modes and reopening', () => {
    const picker = open({ defaultValue: '#12345680', onChange: jest.fn() });
    picker.handleModeChange('gradient');
    const gradient = picker.getValue();
    expect(parseGradient(gradient)).toBeDefined();
    picker.handleModeChange('single');
    expect(picker.getValue()).toBe('#12345680');
    picker.setPopup(false);
    expect(picker.popup).toBe(false);
    picker.setPopup(true);
    expect(picker.getValue()).toBe('#12345680');
    expect(picker.activeMode).toBe('single');
    picker.handleModeChange('gradient');
    expect(picker.getValue()).toBe(gradient);
  });

  it.each(['#abcdef80', 'rgba(171, 205, 239, 0.5)'])('refreshes HEX after main input %s is committed without footer focus', text => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: '#123456', onChange });
    act(() => wrapper.find('input[name="a"]').getDOMNode().focus());
    act(() => picker.element.focus());
    wrapper.find('input.c7n-pro-color-picker').simulate('change', { target: { value: text } });
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
      picker.setPopup(true);
    });
    wrapper.update();
    expect(picker.getValue()).toBe(text);
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('abcdef80');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['', undefined],
    ['abcdef', '#abcdef'],
    ['#abcdef80', '#abcdef80'],
  ])('synchronizes real main input blur for %s', (text, expected) => {
    const picker = open({ defaultValue: '#123456' });
    wrapper.find('input.c7n-pro-color-picker').simulate('change', { target: { value: text } });
    expect(picker.getValue()).toBe(text ? '#123456' : undefined);
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
    });
    expect(picker.getValue()).toBe(expected);
    picker.setPopup(false);
    picker.setPopup(true);
    expect(picker.getValue()).toBe(expected);
  });
});
