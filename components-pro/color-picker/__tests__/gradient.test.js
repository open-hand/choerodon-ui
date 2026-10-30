import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { configure, runInAction } from 'mobx';
import ColorPicker from '..';
import { parseColor, parseGradient } from '../../../components-dataset/utils/color';
import localeContext from '../../locale-context/LocaleContext';
import en from '../../locale-context/en_US';
import zh from '../../locale-context/zh_CN';

describe('ColorPicker gradient editing', () => {
  let wrapper;

  beforeAll(() => {
    configure({ enforceActions: 'always' });
    localeContext.setLocale(zh);
  });

  function open(props = {}) {
    wrapper = mount(<ColorPicker gradientMode={['single', 'gradient']} {...props} />);
    wrapper.instance().setPopup(true);
    wrapper.update();
    return wrapper.instance();
  }

  function input(selector, value, displayedValue = value) {
    const node = wrapper.find(selector).getDOMNode();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(node, value);
      node.dispatchEvent(new Event('input', { bubbles: true }));
    });
    wrapper.update();
    expect(wrapper.find(selector).getDOMNode().value).toBe(displayedValue);
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    jest.useRealTimers();
    localStorage.clear();
    localeContext.setLocale(zh);
  });

  afterAll(() => {
    configure({ enforceActions: 'never' });
  });

  it('localizes visible panel labels while keeping English aria labels on locale changes', () => {
    const picker = open({ preset: true });
    expect(wrapper.find('.c7n-pro-color-picker-no-fill').text()).toBe('无填充色');
    expect(wrapper.find('.c7n-pro-color-picker-preset-opacity > span').text()).toBe('透明度');
    expect(wrapper.find('input[aria-label="Opacity"]')).toHaveLength(1);
    localeContext.setLocale(en);
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-no-fill').text()).toBe('No fill');
    expect(wrapper.find('.c7n-pro-color-picker-preset-opacity > span').text()).toBe('Opacity');
    expect(wrapper.find('input[aria-label="Opacity"]')).toHaveLength(1);
    expect(wrapper.find('TabPane').map(tab => tab.prop('tab'))).toEqual(['Solid', 'Gradient']);
    picker.handleModeChange('gradient');
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-stop-list-header span').text()).toBe('Color stops');
    expect(wrapper.find('button.c7n-pro-color-picker-stop-add').prop('aria-label')).toBe('Add color stop');
    expect(wrapper.find('.c7n-pro-color-picker-direction-options button').at(0).prop('aria-label')).toBe('Gradient direction 135 degrees');
    expect(wrapper.find('.c7n-pro-color-picker-stop-row').at(0).find('input').map(input => input.prop('aria-label'))).toEqual([
      'Color stop 1 position', 'Color stop 1 color', 'Color stop 1 alpha',
    ]);
    expect(wrapper.find('.c7n-pro-color-picker-stop-track button').map(button => button.prop('aria-label'))).toEqual(['Color stop 0%', 'Color stop 100%']);
    expect(wrapper.find('button[aria-label="Remove color stop 2"]')).toHaveLength(1);
    expect(wrapper.find('button[aria-label="Gradient direction radial"]')).toHaveLength(1);
    expect(wrapper.find('.c7n-pro-color-picker-direction-option > span').last().text()).toBe('Radial');
    expect(wrapper.find('.c7n-pro-color-picker-gradient-style-title').text()).toBe('Gradient style value');
    expect(wrapper.find('textarea[aria-label="Gradient CSS"]')).toHaveLength(1);
    wrapper.find('textarea').simulate('input', { target: { value: 'invalid' } });
    wrapper.find('textarea').simulate('blur');
    wrapper.update();
    expect(wrapper.find('[role="alert"]').text()).toBe('Please enter a valid gradient color');
    const labels = () => wrapper.find('[aria-label]').map(node => node.prop('aria-label'));
    const englishLabels = labels();
    localeContext.setLocale(zh);
    wrapper.update();
    expect(labels()).toEqual(englishLabels);
    expect(wrapper.find('.c7n-pro-color-picker-stop-list-header span').text()).toBe('色标');
    expect(wrapper.find('.c7n-pro-color-picker-preset-opacity > span').text()).toBe('透明度');
    expect(wrapper.find('.c7n-pro-color-picker-gradient-direction > span').text()).toBe('渐变方向');
    expect(wrapper.find('.c7n-pro-color-picker-direction-option > span').last().text()).toBe('径向');
    expect(wrapper.find('.c7n-pro-color-picker-gradient-style-title').text()).toBe('渐变样式值');
    expect(wrapper.find('[role="alert"]').text()).toBe('请输入有效的渐变颜色');
  });

  it('initializes and edits observable state with strict actions enabled', () => {
    wrapper = mount(<ColorPicker gradientMode={['single', 'gradient']} defaultValue="#123456" preset />);
    const picker = wrapper.instance();
    expect(picker).toMatchObject({
      activeMode: 'single', stops: [], selectedStop: 0, gradientType: 'linear',
      gradientAngle: 135, gradientText: '', gradientError: false, stopColorDrafts: {}, gradientHidden: true,
      hueColor: undefined, footerEditFlag: undefined, gradienLeft: undefined, footerHex: undefined,
    });
    runInAction(() => { picker.gradientAngle = 90; });
    expect(picker.gradientAngle).toBe(90);
    picker.setPopup(true);
    picker.onExpandChange({ stopPropagation: jest.fn() });
    expect(picker.gradientHidden).toBe(false);
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-custom-panel').prop('style').display).toBe('block');
    picker.handleModeChange('gradient');
    picker.setColor('#00ff00');
    wrapper.update();
    expect(wrapper.find('input[name="Hex"]').prop('value')).toBe('00ff00');
    picker.handleNoFill();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-stop-row')).toHaveLength(2);
    expect(picker.getValue()).toBeUndefined();
  });

  it('uses the committed color when a controlled color edit is rejected', () => {
    const picker = open({ defaultValue: '#123456', onBeforeChange: () => false });
    picker.setColor('#abcdef');
    picker.handleModeChange('gradient');
    expect(parseColor(picker.stops[0].color)).toMatchObject(parseColor('#123456'));
  });

  it('renders popup content without initializing color state', () => {
    const picker = open({ defaultValue: '#123456' });
    runInAction(() => { picker.hueColor = undefined; });
    const setColor = jest.spyOn(picker, 'setColor');
    const hsv = { ...picker.HSV };
    const rgba = { ...picker.RGBA };
    try {
      picker.getPopupContent();
      expect(setColor).not.toHaveBeenCalled();
      expect(picker.hueColor).toBeUndefined();
      expect(picker.HSV).toEqual(hsv);
      expect(picker.RGBA).toEqual(rgba);
    } finally {
      setColor.mockRestore();
    }
  });

  it('keeps single color and gradient drafts across tab changes', () => {
    const picker = open({ defaultValue: '#12345680' });
    expect(wrapper.find('Tabs').length).toBeGreaterThan(0);
    picker.handleModeChange('gradient');
    expect(parseGradient(picker.getValue()).stops).toHaveLength(2);
    const gradient = picker.getValue();
    picker.handleModeChange('single');
    expect(picker.getValue()).toBe('#12345680');
    picker.handleModeChange('gradient');
    expect(picker.getValue()).toBe(gradient);
  });

  it('places tabs inside the custom panel and initializes the gradient with 72% white', () => {
    const picker = open({ preset: true, defaultValue: '#000000' });
    expect(wrapper.find('.c7n-pro-color-picker-custom-panel Tabs')).toHaveLength(1);
    picker.handleModeChange('gradient');
    expect(picker.stops[1].color).toBe('#b8b8b8');
    picker.selectStop(picker.stops[1].id);
    picker.handleModeChange('single');
    expect(picker.getValue()).toBe('#b8b8b8');
  });

  it('supports gradient-only mode without committing on open', () => {
    const onChange = jest.fn();
    const picker = open({ gradientMode: 'gradient', onChange });
    expect(picker.editingGradient).toBe(true);
    expect(picker.stops).toHaveLength(2);
    expect(wrapper.find('Tabs')).toHaveLength(0);
    expect(onChange).not.toHaveBeenCalled();
    picker.setColor('#00ff00');
    expect(parseGradient(picker.getValue()).stops[0].color).toBe('#00ff00');
  });

  it('adds, selects, moves and removes stops while retaining at least two', () => {
    const picker = open({ gradientMode: 'gradient' });
    picker.stopTrack.getBoundingClientRect = () => ({ left: 10, width: 200 });
    picker.handleStopTrackClick({ clientX: 110 });
    expect(picker.stops).toHaveLength(3);
    const selected = picker.selectedStop;
    const event = { preventDefault: jest.fn(), stopPropagation: jest.fn() };
    picker.handleStopMouseDown(event, selected);
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 310 }));
    expect(picker.stops.find(stop => stop.id === selected).position).toBe(100);
    picker.setPopup(false);
    expect(picker.popup).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10 }));
    expect(picker.stops.find(stop => stop.id === selected).position).toBe(100);
    picker.updateStopPosition(-20);
    expect(picker.sortedStops[0].position).toBe(0);
    picker.removeStop();
    picker.removeStop();
    expect(picker.stops).toHaveLength(2);
    picker.setPopup(false);
    expect(picker.popup).toBe(false);
  });

  it('edits every stop row and applies preset opacity to all stops', () => {
    const picker = open({ gradientMode: 'gradient' });
    const second = picker.sortedStops[1].id;
    picker.updateStopColor(second, '#00ff00');
    picker.updateStopPosition(72.5, second);
    expect(picker.stops.find(stop => stop.id === second)).toMatchObject({ color: '#00ff00', position: 72.5 });
    picker.changeOpacity(0.375);
    expect(picker.stops.map(stop => parseColor(stop.color).a)).toEqual([0.375, 0.375]);
    expect(parseColor(picker.currentStopColor).a).toBeCloseTo(0.375, 2);
  });

  it('supports incremental row edits, row deletion and decimal preset opacity', () => {
    const picker = open({ preset: true, gradientMode: 'gradient' });
    wrapper.find('input[aria-label="Color stop 2 color"]').simulate('change', { target: { value: '#' } });
    wrapper.update();
    expect(wrapper.find('input[aria-label="Color stop 2 color"]').prop('value')).toBe('#');
    wrapper.find('input[aria-label="Color stop 2 color"]').simulate('change', { target: { value: '#123456' } });
    wrapper.find('input[aria-label="Color stop 2 position"]').simulate('change', { target: { value: '72.5' } });
    expect(picker.currentStopColor).toBe('#123456');
    wrapper.find('input[aria-label="Opacity"]').simulate('change', { target: { value: '0.375' } });
    expect(picker.stops.map(stop => parseColor(stop.color).a)).toEqual([0.375, 0.375]);
    expect(wrapper.find('input[aria-label="Opacity"]').prop('max')).toBe(1);
    expect(wrapper.find('input[aria-label="Opacity"]').prop('value')).toBe(0.38);
    wrapper.find('button.c7n-pro-color-picker-stop-add').simulate('click');
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-stop-row')).toHaveLength(3);
    expect(wrapper.find('.c7n-pro-color-picker-stop-row').at(1).find('input').at(0).prop('value')).toBe(36.25);
    expect(wrapper.find('.c7n-pro-color-picker-stop-row').at(1).find('input[aria-label="Color stop 2 alpha"]').prop('value')).toBe(0.38);
    wrapper.find('button[aria-label="Remove color stop 2"]').simulate('click');
    wrapper.update();
    expect(wrapper.find('.c7n-pro-color-picker-stop-row')).toHaveLength(2);
    expect(wrapper.find('button[aria-label="Remove color stop 1"]').prop('aria-disabled')).toBe(true);
    expect(wrapper.find('.c7n-pro-color-picker-popup-footer-input-rgba input')).toHaveLength(4);
  });

  it('inserts interpolated RGBA stops in the largest gap regardless of selection', () => {
    const picker = open({ gradientMode: 'gradient', defaultValue: 'linear-gradient(135deg, #000 0%, rgba(100, 50, 0, 0.2) 20%, rgba(200, 150, 100, 0.8) 100%)' });
    picker.selectStop(picker.sortedStops[0].id);
    wrapper.find('button[aria-label="Add color stop"]').simulate('click');
    expect(picker.sortedStops[2].position).toBe(60);
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 150, g: 100, b: 50, a: 0.5 });
    picker.addStop();
    expect(picker.sortedStops[2].position).toBe(40);
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 125, g: 75, b: 25, a: 0.35 });
  });

  it('interpolates track insertions and handles coincident stops', () => {
    const picker = open({ gradientMode: 'gradient', defaultValue: 'linear-gradient(90deg, #000 0%, #fff 100%)' });
    picker.addStop(25);
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 64, g: 64, b: 64, a: 1 });
    picker.loadGradient(parseGradient('linear-gradient(90deg, #000 50%, #fff 50%)'));
    picker.addStop();
    expect(picker.sortedStops).toHaveLength(3);
    expect(picker.sortedStops[2].position).toBe(50);
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 255, g: 255, b: 255, a: 1 });
  });

  it('renders the title before tabs and orders gradient controls', () => {
    const picker = open({ preset: true, gradientMode: 'gradient' });
    const editor = wrapper.find('.c7n-pro-color-picker-gradient-editor').getDOMNode();
    expect(wrapper.find('.c7n-pro-color-picker-gradient-preview')).toHaveLength(0);
    expect(Array.from(editor.children).map(node => node.className).slice(0, 3)).toEqual([
      'c7n-pro-color-picker-popup-view', 'c7n-pro-color-picker-stop-track', 'c7n-pro-color-picker-stop-list-header',
    ]);
    expect(wrapper.find('.c7n-pro-color-picker-custom-panel > .c7n-pro-color-picker-popup-view-picker-name')).toHaveLength(1);
    const panel = wrapper.find('.c7n-pro-color-picker-custom-panel').getDOMNode();
    expect(panel.firstElementChild.className).toBe('c7n-pro-color-picker-popup-view-picker-name');
    expect(wrapper.find('.c7n-pro-color-picker-stop-list-header .icon-add')).toHaveLength(1);
    expect(wrapper.find('.c7n-pro-color-picker-stop-list-header span').text()).toBe('色标');
    expect(wrapper.find('.c7n-pro-color-picker-stop-track-color').prop('style').background).toBe('linear-gradient(90deg, #ff0000 0%, #ffb8b8 100%)');
    expect(wrapper.find('.c7n-pro-color-picker-stop-row').at(0).find('input').map(input => input.prop('aria-label'))).toEqual([
      'Color stop 1 position', 'Color stop 1 color', 'Color stop 1 alpha',
    ]);
    expect(wrapper.find('.c7n-pro-color-picker-stop-row').at(0).find('input.c7n-pro-color-picker-stop-color')).toHaveLength(1);
    expect(wrapper.find('.c7n-pro-color-picker-stop-row .icon-remove')).toHaveLength(2);
    expect(wrapper.find('.c7n-pro-color-picker-stop-add .icon-add')).toHaveLength(1);
    expect(wrapper.find('.c7n-pro-color-picker-direction-options button').map(button => button.prop('aria-label'))).toEqual([
      'Gradient direction 135 degrees', 'Gradient direction 90 degrees', 'Gradient direction 225 degrees', 'Gradient direction 315 degrees', 'Gradient direction 180 degrees', 'Gradient direction 45 degrees', 'Gradient direction radial',
    ]);
    expect(wrapper.find('.c7n-pro-color-picker-direction-option > span').map(label => label.text())).toEqual([
      '135°', '90°', '-135°', '-45°', '-180°', '45°', '径向',
    ]);
    expect(wrapper.find('.c7n-pro-color-picker-gradient-style-title').text()).toBe('渐变样式值');
    expect(wrapper.find('.c7n-pro-color-picker-preset-opacity').text()).not.toContain('%');
    wrapper.find('input[aria-label="Color stop 2 alpha"]').simulate('change', { target: { value: '0.123' } });
    expect(parseColor(picker.sortedStops[1].color).a).toBe(0.12);
    expect(parseColor(picker.sortedStops[0].color).a).toBe(1);
    wrapper.find('input[aria-label="Color stop 2 alpha"]').simulate('change', { target: { value: '2' } });
    expect(parseColor(picker.sortedStops[1].color).a).toBe(1);
    wrapper.find('input[aria-label="Color stop 2 alpha"]').simulate('change', { target: { value: '-1' } });
    expect(parseColor(picker.sortedStops[1].color).a).toBe(0);
  });

  it.each([false, true])('keeps the picker title above native second-level tabs with preset %s', preset => {
    const picker = open({ preset, defaultValue: 'rgba(255, 184, 100, 0.375)' });
    ['single', 'gradient'].forEach(mode => {
      picker.handleModeChange(mode);
      wrapper.update();
      const panel = wrapper.find('.c7n-pro-color-picker-custom-panel').getDOMNode();
      expect(panel.firstElementChild.className).toBe('c7n-pro-color-picker-popup-view-picker-name');
      expect(panel.children[1].classList.contains('c7n-tabs-second-level')).toBe(true);
      expect(wrapper.find('.c7n-pro-color-picker-mode-tabs .c7n-pro-color-picker-popup-view-picker-name')).toHaveLength(0);
      expect(wrapper.find('.c7n-pro-color-picker-popup-footer-input-rgba input').map(input => input.prop('value'))).toEqual([255, 184, 100, 0.38]);
      expect(Array.from(panel.children).map(node => node.className)).toMatchSnapshot(mode);
    });
  });

  it('shows compact HEX without changing CSS and preserves alpha and color drafts during edits', () => {
    const value = 'linear-gradient(90deg, rgba(255, 184, 100, 0.375) 0%, #12345680 100%)';
    const onChange = jest.fn();
    const picker = open({ defaultValue: value, onChange });
    const input = () => wrapper.find('input[aria-label="Color stop 1 color"]');
    expect(input().prop('value')).toBe('#ffb864');
    expect(wrapper.find('input[aria-label="Color stop 2 color"]').prop('value')).toBe('#123456');
    expect(picker.getValue()).toBe(value);
    expect(onChange).not.toHaveBeenCalled();
    input().simulate('change', { target: { value: '#' } });
    expect(input().prop('value')).toBe('#');
    expect(picker.getValue()).toBe(value);
    input().simulate('change', { target: { value: '#abcdef' } });
    expect(input().prop('value')).toBe('#abcdef');
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 171, g: 205, b: 239, a: 0.375 });
    input().simulate('blur');
    expect(input().prop('value')).toBe('#abcdef');
    input().simulate('change', { target: { value: '#1234' } });
    expect(input().prop('value')).toBe('#1234');
    expect(parseColor(picker.currentStopColor).a).toBe(0.375);
    input().simulate('blur');
    expect(input().prop('value')).toBe('#112233');
    input().simulate('change', { target: { value: 'rgba(10, 20, 30, 0.123456)' } });
    expect(input().prop('value')).toBe('rgba(10, 20, 30, 0.123456)');
    input().simulate('blur');
    expect(input().prop('value')).toBe('#0a141e');
    expect(parseColor(picker.currentStopColor).a).toBe(0.375);
    expect(picker.getValue()).toContain('#0a141e60 0%');
    expect(picker.getValue()).toContain('#12345680 100%');
  });

  it.each(['abc', 'abcd', 'abcdef', 'abcdef80', 'ab', 'abcde', 'xyz', ''])('normalizes unprefixed stop draft %s only on blur', draft => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: 'linear-gradient(90deg, rgba(10, 20, 30, 0.375) 0%, #ffffff 100%)', onChange });
    const original = picker.getValue();
    const field = () => wrapper.find('input[aria-label="Color stop 1 color"]');
    field().simulate('change', { target: { value: draft } });
    expect(field().prop('value')).toBe(draft);
    expect(picker.getValue()).toBe(original);
    expect(onChange).not.toHaveBeenCalled();
    field().simulate('blur');
    const parsed = parseColor(`#${draft}`);
    expect(parseColor(picker.sortedStops[0].color)).toEqual(parsed ? { ...parsed, a: 0.375 } : { r: 10, g: 20, b: 30, a: 0.375 });
    expect(field().prop('value')).toBe(parsed ? picker.rgbToHEX(parsed.r, parsed.g, parsed.b, 1) : '#0a141e');
    expect(onChange).toHaveBeenCalledTimes(parsed ? 1 : 0);
  });

  it.each(['#abcdef80', '#abcdef'])('preserves stop alpha through every actual input deletion from %s', hex => {
    const picker = open({ defaultValue: 'linear-gradient(90deg, rgba(10, 20, 30, 0.375) 0%, #12345680 100%)' });
    const selector = 'input[aria-label="Color stop 1 color"]';
    input(selector, hex);
    let previous = parseColor(hex);
    for (let length = hex.length - 1; length >= 0; length -= 1) {
      const value = hex.slice(0, length);
      input(selector, value);
      previous = parseColor(value) || previous;
      expect(parseColor(picker.currentStopColor)).toEqual({ ...previous, a: 0.375 });
      expect(parseColor(parseGradient(picker.getValue()).stops[0].color).a).toBeCloseTo(0.375, 2);
      expect(wrapper.find('input[aria-label="Color stop 1 alpha"]').prop('value')).toBe(0.38);
      expect(parseColor(picker.sortedStops[1].color).a).toBe(128 / 255);
    }
    wrapper.find(selector).simulate('blur');
    expect(wrapper.find(selector).prop('value')).toBe('#aabbcc');
    expect(parseColor(picker.currentStopColor).a).toBe(0.375);
  });

  it.each([
    '#abc', '#abcd', '#abcdef', '#abcdef80',
    'rgb(10, 20, 30)', 'rgba(10, 20, 30, 0.1)',
    'rgb(10 20 30 / 10%)', 'rgba(10% 20% 30% / 20%)',
  ])('changes only RGB through actual color input %s', value => {
    const picker = open({ defaultValue: 'linear-gradient(90deg, rgba(1, 2, 3, 0.375) 0%, #fff 100%)' });
    input('input[aria-label="Color stop 1 color"]', value);
    expect(parseColor(picker.currentStopColor)).toEqual({ ...parseColor(value), a: 0.375 });
  });

  it.each(['#abcd', '#abcdef80', 'rgba(10, 20, 30, 0.123456)'])('uses parsed alpha for the first actual color input %s on an empty stop', value => {
    const picker = open({ gradientMode: 'gradient' });
    picker.handleNoFill();
    wrapper.update();
    input('input[aria-label="Color stop 1 color"]', value);
    expect(parseColor(picker.currentStopColor)).toEqual(parseColor(value));
    expect(picker.getValue()).toBeUndefined();
    input('input[aria-label="Color stop 2 color"]', '#fff');
    expect(parseColor(parseGradient(picker.getValue()).stops[0].color).a).toBeCloseTo(parseColor(value).a, 2);
    input('input[aria-label="Color stop 1 color"]', '#1234');
    expect(parseColor(picker.currentStopColor)).toEqual({ ...parseColor('#1234'), a: parseColor(value).a });
  });

  it.each([0, 1])('preserves existing endpoint alpha %s for RGBA and HEX color inputs', alpha => {
    const picker = open({ defaultValue: `linear-gradient(90deg, rgba(1, 2, 3, ${alpha}) 0%, #fff 100%)` });
    ['rgba(10, 20, 30, 0.5)', '#abcdef80', '#abcd'].forEach(value => {
      input('input[aria-label="Color stop 1 color"]', value);
      expect(parseColor(picker.currentStopColor)).toEqual({ ...parseColor(value), a: alpha });
    });
  });

  it('allows actual row Alpha, footer RGBA alpha and footer HEX alpha inputs to change alpha independently', () => {
    const picker = open({ defaultValue: 'linear-gradient(90deg, rgba(10, 20, 30, 0.375) 0%, #fff 100%)' });
    input('input[aria-label="Color stop 1 color"]', '#abcd');
    input('input[aria-label="Color stop 1 alpha"]', '0.123456', '0.12');
    expect(parseColor(picker.currentStopColor)).toEqual({ r: 170, g: 187, b: 204, a: 0.12 });
    expect(picker.stopColorDrafts).toEqual({});
    input('input[name="a"]', '0.5');
    expect(parseColor(picker.currentStopColor).a).toBeCloseTo(0.5, 2);
    input('input[name="Hex"]', '12345680');
    expect(parseColor(picker.currentStopColor)).toEqual(parseColor('#12345680'));
    expect(parseColor(picker.sortedStops[1].color).a).toBe(1);
    expect(parseColor(parseGradient(picker.getValue()).stops[0].color)).toEqual(parseColor('#12345680'));
  });

  it('uses decimal preset alpha for single colors including endpoints', () => {
    const picker = open({ preset: true, defaultValue: 'rgba(10, 20, 30, 0.375)' });
    const input = () => wrapper.find('input[aria-label="Opacity"]');
    expect(input().prop('value')).toBe(0.38);
    input().simulate('change', { target: { value: '0' } });
    expect(parseColor(picker.getValue()).a).toBe(0);
    input().simulate('change', { target: { value: '1' } });
    expect(parseColor(picker.getValue()).a).toBe(1);
  });

  it('updates selected stop color through HEX and RGBA inputs', () => {
    const picker = open({ gradientMode: 'gradient' });
    wrapper.find('input[name="Hex"]').simulate('input', { target: { name: 'Hex', value: '00ff00' } });
    expect(picker.currentStopColor).toBe('#00ff00');
    const previous = picker.getValue();
    picker.handleFooterInput({ target: { name: 'Hex', value: 'invalid' } });
    expect(picker.getValue()).toBe(previous);
    picker.handleFooterInput({ target: { name: 'a', value: '0.5' } });
    expect(parseColor(picker.currentStopColor).a).toBeCloseTo(0.5, 2);
    picker.handleFooterInput({ target: { name: 'r', value: '-20' } });
    expect(parseColor(picker.currentStopColor).r).toBe(0);
    expect(parseGradient(picker.getValue())).toBeDefined();
  });

  it('preserves pixel stops through loading, editing and mode changes', () => {
    const value = 'repeating-linear-gradient(to top left, lightpink, lightpink 5px, white 5px, white 10px)';
    const picker = open({ defaultValue: value });
    expect(picker.gradientStopUnit).toBe('px');
    expect(picker.gradientValue).toBe('repeating-linear-gradient(315deg, #ffb6c1 0px, #ffb6c1 5px, #ffffff 5px, #ffffff 10px)');
    expect(wrapper.find('.c7n-pro-color-picker-stop-position > span').map(node => node.text())).toEqual(['px', 'px', 'px', 'px']);
    expect(wrapper.find('input[aria-label="Color stop 4 position"]').prop('max')).toBeUndefined();
    expect(wrapper.find('.c7n-pro-color-picker-stop-track button').map(node => node.prop('style').left)).toEqual(['0%', '50%', '50%', '100%']);
    expect(wrapper.find('.c7n-pro-color-picker-stop-track-color').prop('style').background).toBe('linear-gradient(90deg, #ffb6c1 0%, #ffb6c1 50%, #ffffff 50%, #ffffff 100%)');
    picker.stopTrack.getBoundingClientRect = () => ({ left: 10, width: 200 });
    expect(picker.getStopPosition({ clientX: 110 })).toBe(5);
    picker.updateStopPosition(250, picker.sortedStops[3].id);
    expect(parseGradient(picker.getValue()).stops[3].position).toBe(250);
    expect(picker.getStopPosition({ clientX: 110 })).toBe(125);
    picker.addStop(500);
    expect(picker.sortedStops[4].position).toBe(250);
    picker.handleModeChange('single');
    picker.handleModeChange('gradient');
    expect(parseGradient(picker.getValue()).stopUnit).toBe('px');
    picker.handleDirectionChange({ target: { value: 'radial' } });
    expect(parseGradient(picker.getValue())).toMatchObject({ type: 'radial', stopUnit: 'px' });
    wrapper.update();
    wrapper.find('.c7n-pro-color-picker-direction-options button').forEach(button => {
      expect(button.prop('style').background).toContain('250px');
    });
    picker.loadGradient(parseGradient('linear-gradient(#000 0px, #fff 0px)'));
    expect(picker.stopPositionRange).toBe(1);
    expect(picker.getStopPosition({ clientX: 110 })).toBe(0.5);
    picker.handleNoFill();
    expect(picker.gradientStopUnit).toBeUndefined();
    picker.loadGradient(parseGradient(value));
    picker.loadGradient(parseGradient('linear-gradient(#000, #fff)'));
    expect(picker.gradientStopUnit).toBeUndefined();
    picker.updateStopPosition(250, picker.sortedStops[1].id);
    expect(picker.sortedStops[1].position).toBe(100);
  });

  it('supports radial and linear directions', () => {
    const picker = open({ gradientMode: 'gradient' });
    picker.handleDirectionChange({ target: { value: 'radial' } });
    expect(parseGradient(picker.getValue()).type).toBe('radial');
    picker.handleDirectionChange({ target: { value: '45' } });
    expect(parseGradient(picker.getValue())).toMatchObject({ type: 'linear', angle: 45 });
    wrapper.update();
    expect(wrapper.find('button[aria-label="Gradient direction 45 degrees"] .icon-check')).toHaveLength(1);
    expect(wrapper.find('button[aria-label="Gradient direction 0 degrees"]')).toHaveLength(0);
    wrapper.find('button[aria-label="Gradient direction radial"]').simulate('click');
    expect(parseGradient(picker.getValue()).type).toBe('radial');
  });

  it('validates TextArea on blur and preserves the last valid value on errors', () => {
    const picker = open({ defaultValue: 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)' });
    const previous = picker.getValue();
    wrapper.find('textarea').simulate('input', { target: { value: 'bad gradient' } });
    expect(picker.getValue()).toBe(previous);
    wrapper.find('textarea').simulate('blur', { target: { value: 'bad gradient' } });
    expect(picker.gradientError).toBe(true);
    expect(picker.getValue()).toBe(previous);
    wrapper.update();
    expect(wrapper.find('[role="alert"]')).toHaveLength(1);
    const value = 'radial-gradient(at center, rgba(0, 0, 0, 0.5) 0%, #fff 100%)';
    wrapper.find('textarea').simulate('input', { target: { value } });
    wrapper.find('textarea').simulate('blur', { target: { value } });
    expect(picker.gradientError).toBe(false);
    expect(parseGradient(picker.getValue()).type).toBe('radial');
  });

  it('keeps preset and opacity editing open in both modes', () => {
    const picker = open({ preset: true, defaultValue: '#123456' });
    picker.handlePreset('#00ff00');
    expect(picker.popup).toBe(true);
    expect(picker.getValue()).toBe('#00ff00');
    picker.changeOpacity(0.5);
    expect(parseColor(picker.getValue()).a).toBeCloseTo(0.5, 2);
    picker.handleModeChange('gradient');
    picker.handlePreset('#0000ff');
    picker.changeOpacity(0.25);
    expect(picker.popup).toBe(true);
    expect(parseColor(picker.currentStopColor)).toMatchObject({ b: 255 });
    expect(parseColor(picker.currentStopColor).a).toBeCloseTo(0.25, 2);
  });

  it('rebuilds the gradient from a preset with 72% white and clears drafts', () => {
    const picker = open({ preset: true, gradientMode: ['single', 'gradient'], defaultValue: '#000000' });
    picker.handleModeChange('gradient');
    const stopId = picker.selectedStop;
    picker.updateStopColor(stopId, '#123456');
    runInAction(() => {
      picker.stopColorDrafts = { [stopId]: '#123456' };
    });
    picker.handleModeChange('single');
    picker.handlePreset('#ff0000');
    picker.handleModeChange('gradient');
    expect(picker.stops).toHaveLength(2);
    expect(picker.stops[0].color).toBe('#ff0000');
    expect(picker.stops[1].color).toBe('#ffb8b8');
    picker.addStop();
    picker.handleDirectionChange({ target: { value: 'radial' } });
    picker.handlePreset('#0000ff');
    expect(parseGradient(picker.getValue())).toEqual({
      type: 'linear', angle: 135, stops: [{ color: '#0000ff', position: 0 }, { color: '#b8b8ff', position: 100 }],
    });
    runInAction(() => {
      picker.stopColorDrafts = { [picker.selectedStop]: '#bad' };
    });
    picker.handleFooterInput({ target: { name: 'Hex', value: 'invalid' } });
    picker.handleGradientTextInput({ target: { value: 'bad gradient' } });
    picker.handleNoFill();
    expect(picker.stopColorDrafts).toEqual({});
    expect(picker.footerHex).toBeUndefined();
    expect(picker.gradientText).toBe('');
    expect(picker.stops.map(stop => stop.color)).toEqual(['', '']);
    expect(picker.getValue()).toBeUndefined();
  });

  it.each([[0, 100], [200, 0], [0, 0]])('ignores panel clicks with dimensions %s by %s', (width, height) => {
    const onChange = jest.fn();
    const picker = open({ defaultValue: '#123456', onChange });
    const hsv = { ...picker.HSV };
    const rgba = { ...picker.RGBA };
    picker.gradient.getBoundingClientRect = () => ({ left: 10, top: 20, width, height });
    picker.handleGPClick({ clientX: 110, clientY: 70 });
    expect(picker.getValue()).toBe('#123456');
    expect(picker.HSV).toEqual(hsv);
    expect(picker.RGBA).toEqual(rgba);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('ignores zero-width sliders and applies valid opacity clicks and drags', () => {
    const onChange = jest.fn();
    const picker = open({ preset: true, defaultValue: '#ff0000', onChange });
    picker.handleHueClick({ clientX: 100 });
    picker.handleOpacityClick({ clientX: 100 });
    picker.handlePresetOpacityClick({ clientX: 100 });
    expect(picker.getValue()).toBe('#ff0000');
    expect(Object.values(picker.HSV).every(Number.isFinite)).toBe(true);
    expect(Object.values(picker.RGBA).every(Number.isFinite)).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    picker.opacity.getBoundingClientRect = () => ({ left: 10, width: 200 });
    picker.handleOpacityClick({ clientX: 110 });
    expect(picker.getValue()).toBe('#ff000080');
    picker.presetOpacity.getBoundingClientRect = () => ({ left: 10, width: 200 });
    picker.handlePresetOpacityMouseDown({ preventDefault: jest.fn() });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 60 }));
    expect(parseColor(picker.getValue()).a).toBe(0.25);
    picker.setPopup(false);
    expect(picker.popup).toBe(true);
    document.dispatchEvent(new MouseEvent('mouseup'));
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 210 }));
    expect(parseColor(picker.getValue()).a).toBe(0.25);
    picker.setPopup(false);
    expect(picker.popup).toBe(false);
  });

  it('keeps color geometry finite for zero and valid dimensions', () => {
    const picker = open({ defaultValue: '#123456' });
    const pointer = document.createElement('div');
    const wrap = document.createElement('div');
    wrap.getBoundingClientRect = () => ({ left: 10, top: 20, width: 0, height: 0 });
    pointer.getBoundingClientRect = () => ({ width: 0, height: 0 });
    expect(picker.setGradientPointer(20, 30, pointer, wrap, true)).toEqual({ left: 0, top: 0 });
    expect(pointer.style.left).toBe('0px');
    expect(pointer.style.top).toBe('0px');
    expect(picker.positionToHSV(0, 0, 0, 0)).toEqual(picker.HSV);
    wrap.getBoundingClientRect = () => ({ left: 10, top: 20, width: 200, height: 100 });
    pointer.getBoundingClientRect = () => ({ width: 10, height: 6 });
    expect(picker.setGradientPointer(110, 70, pointer, wrap, true)).toEqual({ left: 100, top: 50 });
    expect(pointer.style.left).toBe('95px');
    expect(pointer.style.top).toBe('47px');
    expect(picker.positionToHSV(100, 50, 200, 100)).toMatchObject({ s: 0.5, v: 0.5 });
  });

  it('keeps internal focus open and closes for an external blur', () => {
    jest.useFakeTimers();
    const picker = open({ defaultValue: '#123456' });
    const trigger = wrapper.find('input').at(0);
    const popupInput = wrapper.find('.c7n-pro-color-picker-popup input').at(0);
    trigger.simulate('focus');
    trigger.simulate('blur', { relatedTarget: popupInput.getDOMNode() });
    expect(picker.popup).toBe(true);
    popupInput.simulate('focus');
    popupInput.simulate('blur', { relatedTarget: document.body });
    jest.runAllTimers();
    expect(picker.popup).toBe(false);
  });

  it('synchronizes controlled gradient updates without emitting changes', () => {
    const onChange = jest.fn();
    const picker = open({ value: 'linear-gradient(90deg, #000 0%, #fff 100%)', onChange });
    wrapper.setProps({ value: 'radial-gradient(at center, #f00 0%, #0f0 100%)' });
    expect(picker.gradientType).toBe('radial');
    expect(picker.currentStopColor).toBe('#f00');
    expect(onChange).not.toHaveBeenCalled();
  });
});
