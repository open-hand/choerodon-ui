import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { configure } from 'mobx';
import ColorPicker from '..';
import { parseColor, parseGradient } from '../../../components-dataset/utils/color';
import localeContext from '../../locale-context/LocaleContext';
import zh from '../../locale-context/zh_CN';

describe('ColorPicker actual Alpha input drafts', () => {
  let wrapper;
  let container;

  beforeAll(() => configure({ enforceActions: 'always' }));

  beforeEach(() => {
    localeContext.setLocale(zh);
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    wrapper.unmount();
    container.remove();
    localStorage.clear();
  });

  afterAll(() => configure({ enforceActions: 'never' }));

  function open(props = {}) {
    wrapper = mount(<ColorPicker preset={false} defaultValue="rgba(18, 52, 86, 0.5)" {...props} />, { attachTo: container });
    const picker = wrapper.instance();
    act(() => picker.setPopup(true));
    wrapper.update();
    return picker;
  }

  function input(selector, value, expected = value) {
    const node = wrapper.find(selector).getDOMNode();
    act(() => {
      node.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });
    wrapper.update();
    expect(wrapper.find(selector).getDOMNode().value).toBe(expected);
  }

  function blur(selector) {
    act(() => wrapper.find(selector).getDOMNode().blur());
    wrapper.update();
  }

  it.each(['#123456', 'rgba(18, 52, 86, 0.5)'])('updates HEX immediately after Alpha edits from %s without refocusing', defaultValue => {
    const picker = open({ defaultValue });
    [['0.5', '12345680'], ['0', '12345600'], ['1', '123456']].forEach(([alpha, hex]) => {
      input('input[name="a"]', alpha);
      expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe(hex);
      expect(document.activeElement).toBe(wrapper.find('input[name="a"]').getDOMNode());
      expect(picker.footerHex).toBeUndefined();
      expect(picker.footerHexOriginal).toBeUndefined();
    });
    blur('input[name="a"]');
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('123456');
    act(() => {
      picker.setPopup(false);
      picker.setPopup(true);
    });
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('123456');
  });

  it.each(['single', 'gradient'])('keeps footer deletion and decimal drafts in %s mode despite HEX quantization', mode => {
    const picker = open(mode === 'gradient' ? { gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, rgba(18, 52, 86, 0.5) 0%, #fff 100%)' } : {});
    const selector = 'input[name="a"]';
    ['0.12', '0.1', '0.', '0', ''].forEach(value => {
      input(selector, value);
      expect(picker.RGBA.a).toBe(Number(value));
      expect(picker.HSV.a).toBe(Number(value));
    });
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(0);
    ['.', '.1', '.12'].forEach(value => input(selector, value));
    input(selector, '0.123', '0.12');
    input(selector, '01', '1');
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(1);
    input(selector, '0.5');
    expect(picker.RGBA.a).toBe(0.5);
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('12345680');
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(128 / 255);
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.5');
    input(selector, '0.10');
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.1');
    const committed = picker.getValue();
    input(selector, '');
    expect(picker.getValue()).toBe(committed);
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('1');
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(1);
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('123456');
  });

  it.each([false, true])('keeps independent stop drafts and normalizes on blur with preset %s', preset => {
    const picker = open({ preset, gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, rgba(18, 52, 86, 0.5) 0%, rgba(255, 255, 255, 0.5) 100%)' });
    const first = 'input[aria-label="Color stop 1 alpha"]';
    const second = 'input[aria-label="Color stop 2 alpha"]';
    ['0.12', '0.1', '0.', '0', ''].forEach(value => {
      input(first, value);
      expect(parseColor(picker.sortedStops[0].color).a).toBe(Number(value));
      expect(parseColor(picker.sortedStops[1].color).a).toBe(0.5);
    });
    ['.', '.1', '.12'].forEach(value => input(first, value));
    input(first, '0.123', '0.12');
    expect(parseColor(picker.sortedStops[0].color).a).toBe(0.12);
    expect(parseColor(picker.sortedStops[1].color).a).toBe(0.5);
    input(first, '01', '1');
    expect(parseColor(picker.sortedStops[0].color).a).toBe(1);
    input(first, '0.10');
    input(second, '0.');
    expect(wrapper.find(first).getDOMNode().value).toBe('0.1');
    input(second, '0.2');
    blur(second);
    expect(wrapper.find(second).getDOMNode().value).toBe('0.2');
    const committed = picker.getValue();
    input(first, '');
    expect(picker.getValue()).toBe(committed);
    blur(first);
    expect(wrapper.find(first).getDOMNode().value).toBe('1');
    expect(parseColor(parseGradient(picker.getValue()).stops[0].color).a).toBe(1);
    expect(parseColor(picker.sortedStops[1].color).a).toBe(0.2);
  });

  it.each([
    ['single footer', false, false, 'input[name="a"]'],
    ['gradient footer', true, false, 'input[name="a"]'],
    ['gradient stop', true, false, 'input[aria-label="Color stop 1 alpha"]'],
    ['preset gradient stop', true, true, 'input[aria-label="Color stop 1 alpha"]'],
  ])('rounds long alpha without padding or restoring long decimals on %s blur', (source, gradient, preset, selector) => {
    const onChange = jest.fn();
    const picker = open({
      preset,
      gradientMode: gradient ? 'gradient' : undefined,
      defaultValue: gradient ? 'linear-gradient(90deg, rgba(18, 52, 86, 0.123456) 0%, #fff 100%)' : 'rgba(18, 52, 86, 0.123456)',
      onChange,
    });
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.12');
    act(() => wrapper.find(selector).getDOMNode().focus());
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.12');
    expect(parseColor(gradient ? picker.currentStopColor : picker.getValue()).a).toBe(0.123456);
    expect(onChange).not.toHaveBeenCalled();
    input(selector, '0.375', '0.38');
    const committed = picker.getValue();
    const changes = onChange.mock.calls.length;
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.38');
    expect(picker.getValue()).toBe(committed);
    expect(onChange).toHaveBeenCalledTimes(changes);
    input(selector, '0.5');
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0.5');
  });

  it.each(['single', 'gradient'])('keeps preset opacity numeric semantics and empty drafts in %s mode', mode => {
    const picker = open({ preset: true, ...(mode === 'gradient' ? { gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, rgba(18, 52, 86, 0.5) 0%, #fff 100%)' } : {}) });
    const selector = 'input[aria-label="Opacity"]';
    input(selector, '0.5');
    input(selector, '0.375', '0.38');
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(0.375);
    const committed = picker.getValue();
    input(selector, '');
    expect(picker.getValue()).toBe(committed);
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('1');
    expect(parseColor(mode === 'gradient' ? picker.currentStopColor : picker.getValue()).a).toBe(1);
    if (mode === 'gradient') {
      expect(picker.sortedStops.map(stop => parseColor(stop.color).a)).toEqual([1, 1]);
    }
  });

  it.each([
    ['single footer', false, false, 'input[name="a"]'],
    ['gradient footer', true, false, 'input[name="a"]'],
    ['gradient stop', true, false, 'input[aria-label="Color stop 1 alpha"]'],
    ['preset gradient stop', true, true, 'input[aria-label="Color stop 1 alpha"]'],
    ['preset single opacity', false, true, 'input[aria-label="Opacity"]'],
    ['preset gradient opacity', true, true, 'input[aria-label="Opacity"]'],
  ])('defaults deleted %s to one only on real blur and preserves explicit zero', (source, gradient, preset, selector) => {
    const onChange = jest.fn();
    const picker = open({
      preset,
      gradientMode: gradient ? 'gradient' : undefined,
      defaultValue: gradient ? 'linear-gradient(90deg, rgba(18, 52, 86, 0.5) 0%, #fff 100%)' : 'rgba(18, 52, 86, 0.5)',
      onChange,
    });
    const committed = picker.getValue();
    input(selector, '');
    expect(picker.getValue()).toBe(committed);
    expect(onChange).not.toHaveBeenCalled();
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('1');
    expect(parseColor(gradient ? picker.currentStopColor : picker.getValue()).a).toBe(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    input(selector, '0');
    const zero = picker.getValue();
    const changes = onChange.mock.calls.length;
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('0');
    expect(parseColor(gradient ? picker.currentStopColor : picker.getValue()).a).toBe(0);
    expect(picker.getValue()).toBe(zero);
    expect(onChange).toHaveBeenCalledTimes(changes);
    if (gradient && !selector.includes('Opacity')) {
      expect(parseColor(picker.sortedStops[1].color).a).toBe(1);
    }
  });

  it.each([
    ['single footer', false, false, 'input[name="a"]'],
    ['gradient footer', true, false, 'input[name="a"]'],
    ['gradient stop', true, false, 'input[aria-label="Color stop 1 alpha"]'],
    ['preset gradient stop', true, true, 'input[aria-label="Color stop 1 alpha"]'],
    ['preset single opacity', false, true, 'input[aria-label="Opacity"]'],
    ['preset gradient opacity', true, true, 'input[aria-label="Opacity"]'],
  ])('does not generate a color through real %s input after clearing', (source, gradient, preset, selector) => {
    const onChange = jest.fn();
    const picker = open({
      preset,
      gradientMode: gradient ? 'gradient' : undefined,
      defaultValue: gradient ? 'linear-gradient(90deg, #12345680 0%, #fff 100%)' : '#12345680',
      onChange,
    });
    act(() => picker.clear());
    wrapper.update();
    onChange.mockClear();
    ['', '0', '0.5', ''].forEach(value => {
      input(selector, value, selector.includes('Opacity') ? '' : value);
      expect(picker.getValue()).toBeUndefined();
    });
    blur(selector);
    expect(wrapper.find(selector).getDOMNode().value).toBe('');
    expect(picker.getValue()).toBeUndefined();
    expect(picker.sortedStops.map(stop => stop.color)).toEqual(['', '']);
    expect(onChange).not.toHaveBeenCalled();
  });
});
