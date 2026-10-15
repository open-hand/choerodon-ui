import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ColorPicker from '..';

describe.each([
  ['color panel', 'gradient', 'selectPointer', 'handleGPClick', 'onGPMouseUp', '#7f3f3f'],
  ['hue', 'hue', 'huePointer', 'handleHueClick', 'onHPMouseUp', '#00ffff'],
  ['opacity', 'opacity', 'opacityPointer', 'handleOpacityClick', 'onOpacityMouseUp', '#ff000080'],
  ['preset opacity', 'presetOpacity', 'presetOpacityPointer', 'handlePresetOpacityClick', 'handlePresetOpacityMouseUp', 'rgba(255, 0, 0, 0.5)'],
])('ColorPicker %s drag', (name, track, pointer, moveHandler, upHandler, expectedValue) => {
  let wrapper;
  let container;
  let picker;
  let move;
  let up;
  let onChange;
  let addListener;
  let removeListener;

  beforeEach(() => {
    jest.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    onChange = jest.fn();
    wrapper = mount(
      <ColorPicker preset={track === 'presetOpacity'} defaultValue="#ff0000" onChange={onChange} />,
      { attachTo: container },
    );
    picker = wrapper.instance();
    act(() => picker.setPopup(true));
    wrapper.update();
    jest.spyOn(picker[track], 'getBoundingClientRect').mockReturnValue({
      left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120,
    });
    move = jest.spyOn(picker, moveHandler);
    up = jest.spyOn(picker, upHandler);
    addListener = jest.spyOn(document, 'addEventListener');
    removeListener = jest.spyOn(document, 'removeEventListener');
  });

  afterEach(() => {
    if (wrapper) wrapper.unmount();
    container.remove();
    jest.restoreAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
    localStorage.removeItem('color.picker.customized.used');
  });

  function startDrag() {
    act(() => {
      wrapper.findWhere(node => node.type() === 'div' && node.getDOMNode() === picker[pointer])
        .simulate('mouseDown', { button: 0, preventDefault: jest.fn() });
    });
    wrapper.update();
    expect(picker.draggingColor).toBe(true);
    expect(addListener).toHaveBeenCalledWith('mousemove', move, false);
    expect(addListener).toHaveBeenCalledWith('mouseup', up, false);
  }

  function dispatch(type, coordinates = {}) {
    const event = new MouseEvent(type, { bubbles: true, ...coordinates });
    act(() => {
      document.dispatchEvent(event);
    });
    if (wrapper) wrapper.update();
    return event;
  }

  it('routes document mousemove to the matching callback and updates the color', () => {
    dispatch('mousemove', { clientX: 110, clientY: 70 });
    expect(move).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();

    startDrag();
    const event = dispatch('mousemove', { clientX: 110, clientY: 70 });

    expect(move).toHaveBeenCalledTimes(1);
    expect(move).toHaveBeenCalledWith(event);
    expect(picker.getValue()).toBe(expectedValue);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expectedValue, '#ff0000', undefined);
    expect(up).not.toHaveBeenCalled();
  });

  it('removes document listeners on mouseup and ignores subsequent mouse events', () => {
    startDrag();
    dispatch('mousemove', { clientX: 110, clientY: 70 });
    dispatch('mouseup');

    expect(up).toHaveBeenCalledTimes(1);
    expect(picker.draggingColor).toBe(false);
    expect(removeListener).toHaveBeenCalledWith('mousemove', move, false);
    expect(removeListener).toHaveBeenCalledWith('mouseup', up, false);
    expect(picker.eventManager.events.mousemove).toHaveLength(0);
    expect(picker.eventManager.events.mouseup).toHaveLength(0);

    move.mockClear();
    up.mockClear();
    onChange.mockClear();
    dispatch('mousemove', { clientX: 210, clientY: 20 });
    dispatch('mouseup');

    expect(move).not.toHaveBeenCalled();
    expect(up).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(picker.getValue()).toBe(expectedValue);
  });

  it('blocks popup closing during dragging and permits closing after mouseup', () => {
    startDrag();
    act(() => picker.setPopup(false));
    wrapper.update();
    expect(picker.popup).toBe(true);

    dispatch('mousemove', { clientX: 110, clientY: 70 });
    expect(picker.getValue()).toBe(expectedValue);
    expect(picker.popup).toBe(true);

    dispatch('mouseup');
    act(() => picker.setPopup(false));
    wrapper.update();

    expect(picker.draggingColor).toBe(false);
    expect(picker.popup).toBe(false);
  });

  it('clears active document listeners on unmount without waiting for mouseup', () => {
    startDrag();
    dispatch('mousemove', { clientX: 110, clientY: 70 });
    const clear = jest.spyOn(picker.eventManager, 'clear');
    act(() => {
      wrapper.unmount();
    });
    wrapper = undefined;

    expect(clear).toHaveBeenCalledTimes(1);
    expect(removeListener).toHaveBeenCalledWith('mousemove', move, false);
    expect(removeListener).toHaveBeenCalledWith('mouseup', up, false);
    expect(picker.eventManager.events).toEqual({});

    move.mockClear();
    up.mockClear();
    onChange.mockClear();
    dispatch('mousemove', { clientX: 210, clientY: 20 });
    dispatch('mouseup');

    expect(move).not.toHaveBeenCalled();
    expect(up).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
    expect(picker.getValue()).toBe(expectedValue);
  });
});
