import React from 'react';
import { mount } from 'enzyme';
import SwitchTest from './SwitchTest';
import Switch from '..';
import focusTest from '../../../tests/shared/focusTest';

const setupByMount = () => {
  const wrapper = mount(<SwitchTest />);
  return {
    wrapper,
  };
};
describe('Switch-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  focusTest(Switch);
  it('should have five Switch', () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('Switch').length).toBe(5);
  });
  it('should change when key enter down', () => {
    const wrapper = mount(<Switch defaultChecked />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('checked'),
    ).toBe(true);
    wrapper.find('input').simulate('keyDown', { keyCode: 39 });
    wrapper.find('input').simulate('keyDown', { keyCode: 37 });
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('checked'),
    ).toBe(false);
  });
});
