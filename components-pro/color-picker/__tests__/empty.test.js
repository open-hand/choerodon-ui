import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ColorPicker from '..';
import DataSet from '../../data-set';
import { parseColor, parseGradient } from '../../../components-dataset/utils/color';
import localeContext from '../../locale-context/LocaleContext';
import zh from '../../locale-context/zh_CN';

describe('ColorPicker empty gradient', () => {
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
    wrapper.unmount();
    container.remove();
    outside.remove();
    jest.useRealTimers();
    localStorage.clear();
  });

  function open(props) {
    wrapper = mount(<ColorPicker {...props} />, { attachTo: container });
    const picker = wrapper.instance();
    const mainInput = wrapper.find('input.c7n-pro-color-picker').getDOMNode();
    expect(picker.element).toBe(mainInput);
    expect(mainInput).toBeInstanceOf(HTMLInputElement);
    Object.defineProperty(picker.trigger.domNode, 'offsetWidth', { configurable: true, value: 160 });
    Object.defineProperty(picker.trigger.domNode, 'offsetHeight', { configurable: true, value: 32 });
    act(() => {
      mainInput.focus();
      jest.advanceTimersByTime(150);
    });
    wrapper.update();
    expect(document.activeElement).toBe(mainInput);
    expect(picker.popup).toBe(true);
    return picker;
  }

  it.each(['r', 'g', 'b'])('allows incremental %s input after focusing an empty single color', channel => {
    const picker = open({ preset: false });
    const selector = `input[name="${channel}"]`;
    act(() => wrapper.find(selector).getDOMNode().focus());
    wrapper.update();
    ['1', '12', '123'].forEach(value => {
      wrapper.find(selector).simulate('change', { target: { name: channel, value } });
      wrapper.update();
      expect(String(wrapper.find(selector).getDOMNode().value)).toBe(value);
      expect(picker.RGBA[channel]).toBe(Number(value));
      expect(picker.RGBA.a).toBe(1);
      expect(parseColor(picker.getValue()).a).toBe(1);
      expect(wrapper.find('input[name="a"]').getDOMNode().value).toBe('1');
    });
  });

  it.each([0, 0.5, 1])('preserves existing alpha %s when editing RGB', alpha => {
    const picker = open({ preset: false, defaultValue: `rgba(10, 20, 30, ${alpha})` });
    wrapper.find('input[name="r"]').simulate('change', { target: { name: 'r', value: '123' } });
    wrapper.update();
    expect(picker.RGBA.a).toBe(alpha);
    expect(parseColor(picker.getValue()).a).toBeCloseTo(alpha, 2);
  });

  it.each(['single', 'gradient'])('defaults alpha to one after clearing and entering RGB in %s mode', mode => {
    const picker = open({ preset: false, gradientMode: mode, defaultValue: mode === 'single' ? '#12345600' : 'linear-gradient(90deg, #12345600 0%, #abcdef 100%)' });
    wrapper.find('input.c7n-pro-color-picker').simulate('change', { target: { value: '' } });
    wrapper.update();
    expect(wrapper.find('input[name="a"]').getDOMNode().value).toBe('');
    act(() => wrapper.find('input[name="r"]').getDOMNode().focus());
    wrapper.find('input[name="r"]').simulate('change', { target: { name: 'r', value: '123' } });
    wrapper.update();
    expect(picker.RGBA.a).toBe(1);
    expect(wrapper.find('input[name="a"]').getDOMNode().value).toBe('1');
    expect(parseColor(mode === 'single' ? picker.getValue() : picker.currentStopColor).a).toBe(1);
  });

  it.each(['main', 'textarea'])('clears %s, preserves empty gradient stops after reopening and allows editing again', source => {
    const dataSet = new DataSet({
      fields: [{ name: 'color', type: 'color' }],
      data: [{ color: 'radial-gradient(at center, #12345680 0%, #abcdef 100%)' }],
    });
    const picker = open({ dataSet, name: 'color', gradientMode: ['single', 'gradient'], preset: true });
    if (source === 'textarea') {
      act(() => {
        wrapper.find('textarea').getDOMNode().focus();
      });
    }
    wrapper.find(source === 'main' ? 'input.c7n-pro-color-picker' : 'textarea').simulate(source === 'main' ? 'change' : 'input', { target: { value: '' } });
    wrapper.update();
    expect(dataSet.current.get('color')).toBeNull();
    expect(picker.getValue()).toBeUndefined();
    expect(picker.gradientText).toBe('');
    expect(picker.activeMode).toBe('gradient');
    expect(picker.editingGradient).toBe(true);
    expect(picker.gradientType).toBe('radial');
    expect(wrapper.find('input.c7n-pro-color-picker').prop('value')).toBe('');
    expect(wrapper.find('textarea').prop('value')).toBe('');
    expect(picker.sortedStops.map(stop => [stop.color, stop.position])).toEqual([['', 0], ['', 100]]);
    expect(wrapper.find('.c7n-pro-color-picker-stop-color-alpha input').map(input => input.prop('value'))).toEqual(['', '', '', '']);
    expect(wrapper.find('input[aria-label="Opacity"]').prop('value')).toBe('');
    expect(picker.gradientValue).toBe('');
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
    });
    wrapper.update();
    expect(picker.popup).toBe(false);
    act(() => {
      picker.element.focus();
      jest.advanceTimersByTime(150);
    });
    wrapper.update();
    expect(picker.popup).toBe(true);
    expect(dataSet.current.get('color')).toBeNull();
    expect(picker.getValue()).toBeUndefined();
    expect(picker.activeMode).toBe('gradient');
    expect(picker.editingGradient).toBe(true);
    expect(wrapper.find('Tabs').prop('activeKey')).toBe('gradient');
    expect(picker.gradientType).toBe('radial');
    expect(picker.sortedStops.map(stop => [stop.color, stop.position])).toEqual([['', 0], ['', 100]]);
    expect(wrapper.find('.c7n-pro-color-picker-stop-row')).toHaveLength(2);
    expect(wrapper.find('.c7n-pro-color-picker-stop-color-alpha input').map(input => input.prop('value'))).toEqual(['', '', '', '']);
    expect(wrapper.find('input.c7n-pro-color-picker').prop('value')).toBe('');
    expect(wrapper.find('textarea').prop('value')).toBe('');
    expect(wrapper.find('input[aria-label="Opacity"]').prop('value')).toBe('');
    expect(picker.gradientText).toBe('');
    expect(picker.gradientValue).toBe('');
    picker.addStop(50);
    picker.changeOpacity(0.5);
    picker.updateStopAlpha(picker.selectedStop, 0.5);
    expect(picker.stops).toHaveLength(2);
    expect(picker.getValue()).toBeUndefined();
    picker.stopTrack.getBoundingClientRect = () => ({ left: 0, width: 100 });
    picker.handleStopMouseDown({ preventDefault: jest.fn(), stopPropagation: jest.fn() }, picker.selectedStop);
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 25 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    expect(picker.sortedStops[0]).toMatchObject({ position: 25, color: '' });
    expect(picker.getValue()).toBeUndefined();
    const [first, second] = picker.sortedStops;
    picker.updateStopColor(first.id, '#ff0000');
    expect(picker.getValue()).toBeUndefined();
    picker.updateStopColor(second.id, '#0000ff');
    expect(parseGradient(dataSet.current.get('color')).stops).toEqual([
      { color: '#ff0000', position: 25 }, { color: '#0000ff', position: 100 },
    ]);
  });

  it.each([1, 2])('keeps actual popup focus and stops on disabled deletion %s, then closes on external blur', index => {
    const onChange = jest.fn();
    const blurTargets = [];
    const picker = open({ gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, #000 0%, #fff 100%)', onChange, onBlur: event => blurTargets.push(event.target) });
    const stops = picker.stops.map(stop => ({ ...stop }));
    const selectedStop = picker.selectedStop;
    const value = picker.getValue();
    const popupInput = wrapper.find(`input[aria-label="Color stop ${index} color"]`).getDOMNode();
    act(() => {
      popupInput.focus();
    });
    expect(document.activeElement).toBe(popupInput);
    expect(picker.trigger.focusTarget).toBe(picker.element);
    expect(picker.trigger.activeElement).toBe(popupInput);
    const button = wrapper.find(`button[aria-label="Remove color stop ${index}"]`);
    expect(button.prop('aria-disabled')).toBe(true);
    const mouseDown = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    act(() => {
      const node = button.getDOMNode();
      node.dispatchEvent(mouseDown);
      if (!mouseDown.defaultPrevented) {
        node.focus();
      }
      node.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      jest.advanceTimersByTime(50);
    });
    wrapper.update();
    expect(mouseDown.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(popupInput);
    expect(picker.popup).toBe(true);
    expect(picker.stops.slice()).toEqual(stops);
    expect(picker.selectedStop).toBe(selectedStop);
    expect(picker.getValue()).toBe(value);
    expect(blurTargets).toEqual([]);
    expect(onChange).not.toHaveBeenCalled();
    act(() => {
      outside.focus();
      jest.advanceTimersByTime(50);
    });
    wrapper.update();
    expect(document.activeElement).toBe(outside);
    expect(picker.popup).toBe(false);
    expect(blurTargets).toEqual([popupInput]);
    expect(picker.stops.slice()).toEqual(stops);
    expect(picker.getValue()).toBe(value);
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([[0, 0], [0.004, 0], [0.005, 0.01], [1, 1], [0.996, 1], [0.994, 0.99], [0.5, 0.5], [0.375, 0.38], [0.145, 0.15], [0.123456, 0.12], [undefined, '']])('formats alpha %s as %s', (alpha, expected) => {
    wrapper = mount(<ColorPicker />);
    expect(wrapper.instance().formatAlpha(alpha)).toBe(expected);
  });
});
