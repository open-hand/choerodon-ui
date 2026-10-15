import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import ColorPicker from '..';

describe('ColorPicker preset selection', () => {
  let wrapper;
  const palette = '.c7n-pro-color-picker-popup-view-palettes';
  const block = `${palette}-block`;
  const active = `${block}-active`;
  const storageKey = 'color.picker.customized.used';

  afterEach(() => {
    wrapper.unmount();
    localStorage.removeItem(storageKey);
  });

  function open(defaultValue, onChange) {
    wrapper = mount(<ColorPicker preset defaultValue={defaultValue} onChange={onChange} />);
    act(() => wrapper.instance().setPopup(true));
    wrapper.update();
  }

  it.each([
    ['#FFFFFF', 0],
    ['#F2F2F2', 1],
  ])('selects %s only in the preset palette when recent colors contain the same color', (color, index) => {
    localStorage.setItem(storageKey, JSON.stringify([color, color]));
    open(color);

    const palettes = wrapper.find(palette);
    expect(palettes).toHaveLength(3);
    expect(palettes.at(index).find(active)).toHaveLength(1);
    expect(wrapper.find(`${active} i.icon-check`)).toHaveLength(1);
    expect(wrapper.find(active)).toHaveLength(1);
    expect(palettes.at(2).find(active)).toHaveLength(0);
    expect(palettes.at(2).find('i.icon-check')).toHaveLength(0);
  });

  it.each(['#FFFFFF', '#F2F2F2', '#123456'])('keeps recent %s clickable without an active class or check', color => {
    const onChange = jest.fn();
    localStorage.setItem(storageKey, JSON.stringify([color]));
    open('#000000', onChange);

    act(() => {
      wrapper.find(palette).at(2).find(block).at(0).simulate('click');
    });
    wrapper.update();

    expect(wrapper.instance().getValue()).toBe(color);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(color, '#000000', undefined);
    const palettes = wrapper.find(palette);
    expect(palettes.at(2).find(active)).toHaveLength(0);
    expect(palettes.at(2).find('i.icon-check')).toHaveLength(0);
    expect(wrapper.find(active)).toHaveLength(color === '#123456' ? 0 : 1);
  });

  it.each([
    ['#fff', 1],
    ['rgba(255, 255, 255, 1)', 1],
    ['rgba(255, 255, 255, 0.5)', 0],
    [undefined, 0],
    ['', 0],
    ['invalid', 0],
    ['linear-gradient(#000, #fff)', 0],
  ])('matches preset selection by RGBA for %s without selecting recent colors', (value, count) => {
    localStorage.setItem(storageKey, JSON.stringify(['#FFFFFF']));
    open(value);

    const palettes = wrapper.find(palette);
    expect(palettes.at(0).find(active)).toHaveLength(count);
    expect(palettes.at(0).find('i.icon-check')).toHaveLength(count);
    expect(palettes.at(1).find(active)).toHaveLength(0);
    expect(palettes.at(2).find(active)).toHaveLength(0);
    expect(palettes.at(2).find('i.icon-check')).toHaveLength(0);
  });

  it.each([
    ['#FFFFFF', 0],
    ['#F2F2F2', 1],
  ])('moves selection to clicked preset %s without selecting matching recent colors', (color, index) => {
    const onChange = jest.fn();
    localStorage.setItem(storageKey, JSON.stringify([color]));
    open('#000000', onChange);

    act(() => {
      wrapper.find(palette).at(index).find(block).at(0).simulate('click');
    });
    wrapper.update();

    expect(wrapper.instance().getValue()).toBe(color);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(color, '#000000', undefined);
    const palettes = wrapper.find(palette);
    expect(palettes.at(index).find(active).prop('style').backgroundColor).toBe(color);
    expect(wrapper.find(active)).toHaveLength(1);
    expect(wrapper.find(`${active} i.icon-check`)).toHaveLength(1);
    expect(palettes.at(2).find(active)).toHaveLength(0);
    expect(palettes.at(2).find('i.icon-check')).toHaveLength(0);
  });
});
