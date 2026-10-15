import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { configure, isAction } from 'mobx';
import ColorPicker from '..';
import DataSet from '../../data-set';
import { parseColor, parseGradient } from '../../../components-dataset/utils/color';

describe('ColorPicker footer HEX draft', () => {
  let wrapper;
  let container;
  let outside;

  beforeAll(() => {
    configure({ enforceActions: 'always' });
  });

  beforeEach(() => {
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

  afterAll(() => {
    configure({ enforceActions: 'never' });
  });

  function open(props = {}) {
    wrapper = mount(<ColorPicker defaultValue="#123456" {...props} />, { attachTo: container });
    const picker = wrapper.instance();
    picker.setPopup(true);
    wrapper.update();
    act(() => { wrapper.find('input[name="Hex"]').getDOMNode().focus(); });
    wrapper.update();
    return picker;
  }

  function input(value, event = 'input') {
    const node = wrapper.find('input[name="Hex"]').getDOMNode();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
      node.dispatchEvent(new Event(event, { bubbles: true }));
    });
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe(value);
  }

  function blur() {
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
    });
    wrapper.update();
  }

  it('replaces an old HEX draft on controlled value updates without footer focus', () => {
    const onChange = jest.fn();
    const picker = open({ value: '#123456', onChange });
    input('12');
    wrapper.setProps({ value: '#abcdef80' });
    wrapper.update();
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('abcdef80');
    expect(picker.RGBA).toMatchObject({ r: 171, g: 205, b: 239, a: 128 / 255 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps every deletion draft unchanged and restores the original color on partial blur', () => {
    const onChange = jest.fn();
    const picker = open({ onChange });
    expect(isAction(ColorPicker.prototype.handleFooterInput)).toBe(true);
    expect(isAction(ColorPicker.prototype.handleFooterFocus)).toBe(true);
    expect(isAction(ColorPicker.prototype.handleFooterBlur)).toBe(true);
    expect(picker.footerHexOriginal).toBe('#123456');
    ['12345', '1234', '123', '12', '1'].forEach(value => {
      input(value);
      expect(picker.getValue()).toBe('#123456');
    });
    blur();
    expect(picker.getValue()).toBe('#123456');
    expect(picker.RGBA).toMatchObject({ r: 18, g: 52, b: 86, a: 1 });
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
    expect(onChange).not.toHaveBeenCalled();
    picker.setPopup(true);
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').prop('value')).toBe('123456');
  });

  it('clears the DataSet field without a hash after deleting the entire draft and blurring', () => {
    const dataSet = new DataSet({
      fields: [{ name: 'color', type: 'color' }],
      data: [{ color: '#123456' }],
    });
    const picker = open({ dataSet, name: 'color' });
    ['12345', '1234', '123', '12', '1', ''].forEach(value => input(value));
    expect(dataSet.current.get('color')).toBe('#123456');
    blur();
    expect(dataSet.current.get('color')).toBeNull();
    expect(picker.getValue()).toBeUndefined();
    expect(wrapper.find('input.c7n-pro-color-picker').prop('value')).toBe('');
    picker.setPopup(true);
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').prop('value')).toBe('');
    expect(wrapper.find('.c7n-pro-color-picker-popup-footer-input-rgba input').map(node => node.prop('value'))).toEqual(['', '', '', '']);
  });

  it.each(['abc', 'abcdef', 'abcdef80'])('commits valid new HEX %s and its alpha once on blur', value => {
    const onChange = jest.fn();
    const picker = open({ onChange });
    input(value);
    input(value, 'change');
    expect(picker.getValue()).toBe('#123456');
    blur();
    expect(picker.getValue()).toBe(`#${value}`);
    expect(parseColor(picker.getValue())).toEqual(parseColor(`#${value}`));
    const committed = picker.getValue();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
    picker.setPopup(true);
    expect(picker.getValue()).toBe(committed);
  });

  it.each([
    ['#12345680', 'abc'], ['#12345680', 'abc0'], ['#12345680', 'abcdef'], ['#12345680', 'abcdef00'],
    ['rgba(18, 52, 86, 0.375)', 'abc'], ['rgba(18, 52, 86, 0.375)', 'abc0'],
    ['rgba(18, 52, 86, 0.375)', 'abcdef'], ['rgba(18, 52, 86, 0.375)', 'abcdef80'],
    ['#12345600', 'abc'], ['#12345600', 'abcf'], ['#12345600', 'abcdef'], ['#12345600', 'abcdefff'],
  ])('previews HEX alpha from %s and commits %s in HEX format on blur', (original, value) => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: original, onChange });
    expect(document.activeElement).toBe(wrapper.find('input[name="Hex"]').getDOMNode());
    input('');
    for (let length = 1; length <= value.length; length += 1) {
      const draft = value.slice(0, length);
      input(draft);
      expect(picker.getValue()).toBe(original);
      const parsed = parseColor(`#${draft}`);
      if (parsed) {
        expect(picker.RGBA).toMatchObject(parsed);
        expect(picker.HSV).toMatchObject(picker.rgbToHSV(parsed.r / 255, parsed.g / 255, parsed.b / 255, parsed.a));
      }
    }
    expect(onChange).not.toHaveBeenCalled();
    blur();
    const expected = value.length === 4 ? parseColor(original) : parseColor(`#${value}`);
    expect(parseColor(picker.getValue())).toEqual(expected);
    expect(picker.getValue()).toBe(value.length === 4 ? original : `#${value}`);
    expect(picker.RGBA.a).toBe(expected.a);
    expect(picker.HSV.a).toBe(expected.a);
    expect(onChange).toHaveBeenCalledTimes(value.length === 4 ? 0 : 1);
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
    const committed = picker.getValue();
    picker.setPopup(true);
    wrapper.update();
    expect(picker.getValue()).toBe(committed);
    expect(picker.RGBA.a).toBe(expected.a);
    expect(picker.HSV.a).toBe(expected.a);
  });

  it.each(['#12345680', '#12345600'])('removes the alpha suffix from %s without restoring it or changing output format', original => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: original, onChange });
    input(original.slice(1, -1));
    expect(picker.getValue()).toBe(original);
    input(original.slice(1, -2));
    expect(picker.RGBA.a).toBe(1);
    expect(picker.HSV.a).toBe(1);
    expect(picker.getValue()).toBe(original);
    blur();
    expect(picker.getValue()).toBe('#123456');
    expect(wrapper.find('input.c7n-pro-color-picker').getDOMNode().value).toBe('#123456');
    expect(onChange).toHaveBeenCalledTimes(1);
    picker.setPopup(true);
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').getDOMNode().value).toBe('123456');
    expect(wrapper.find('input[name="a"]').getDOMNode().value).toBe('1');
    expect(picker.getValue()).toBe('#123456');
  });

  it.each(['abc', 'abc0', 'abcdef', 'abcdef80'])('uses parsed alpha on the first %s edit of an empty field', value => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: undefined, onChange });
    expect(picker.footerHexOriginal).toBeUndefined();
    for (let length = 1; length <= value.length; length += 1) {
      const draft = value.slice(0, length);
      input(draft);
      const parsed = parseColor(`#${draft}`);
      if (parsed) {
        expect(picker.RGBA).toMatchObject(parsed);
        expect(picker.HSV.a).toBe(parsed.a);
      }
      expect(picker.getValue()).toBeUndefined();
    }
    blur();
    if (value.length === 4) {
      expect(picker.getValue()).toBeUndefined();
      expect(onChange).not.toHaveBeenCalled();
      return;
    }
    expect(picker.getValue()).toBe(`#${value}`);
    expect(picker.RGBA.a).toBe(parseColor(`#${value}`).a);
    expect(picker.HSV.a).toBe(parseColor(`#${value}`).a);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('restores the original RGB and alpha after an invalid draft blur', () => {
    const original = 'rgba(18, 52, 86, 0.375)';
    const onChange = jest.fn();
    const picker = open({ defaultValue: original, onChange });
    ['abc', 'abc0', 'abcde', 'abcdef', 'abcdef00', 'invalid'].forEach(value => input(value));
    blur();
    expect(picker.getValue()).toBe(original);
    expect(picker.RGBA).toMatchObject(parseColor(original));
    expect(picker.HSV.a).toBe(0.375);
    expect(onChange).not.toHaveBeenCalled();
    expect(picker.footerHex).toBeUndefined();
    expect(picker.footerHexOriginal).toBeUndefined();
  });

  it('preserves immediate gradient HEX commits and ignores empty footer blur', () => {
    const onChange = jest.fn();
    const picker = open({ gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, #123456 0%, #abcdef 100%)', onChange });
    wrapper.find('input[name="Hex"]').simulate('input', { target: { name: 'Hex', value: '00ff00' } });
    const committed = picker.getValue();
    expect(parseGradient(committed).stops[0].color).toBe('#00ff00');
    input('');
    blur();
    expect(picker.getValue()).toBe(committed);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it.each(['abcdef00', 'abcdef80'])('preserves immediate gradient %s alpha changes through real input and blur', value => {
    const onChange = jest.fn();
    const picker = open({ gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, #123456 0%, #abcdef 100%)', onChange });
    input(value);
    const committed = picker.getValue();
    expect(parseGradient(committed).stops[0].color).toBe(`#${value}`);
    expect(picker.RGBA.a).toBe(parseColor(`#${value}`).a);
    expect(picker.HSV.a).toBe(parseColor(`#${value}`).a);
    blur();
    expect(picker.getValue()).toBe(committed);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
