import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import YearsPicker from '../../year-picker';
import focusTest from '../../../tests/shared/focusTest';
import triggerPopTest from '../../../tests/shared/triggerPopTest';
import { simulateCode } from './utils';

describe('years-picker-pro', () => {
  focusTest(YearsPicker);
  triggerPopTest(YearsPicker);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the year will be controlled by the value', () => {
    const wrapper = mount(<YearsPicker value={moment('2020-02-20')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020');
    wrapper.setProps({ value: moment('2021-02-20') });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2021');
  });

  it('the keyDown event keyCode should render correctly', () => {
    const wrapper = mount(<YearsPicker mode="year" />);
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    wrapper.update();
    simulateCode(wrapper, 39);
    simulateCode(wrapper, 37);
    simulateCode(wrapper, 40);
    simulateCode(wrapper, 38);
    simulateCode(wrapper, 35);
    simulateCode(wrapper, 36);
    simulateCode(wrapper, 33);
    simulateCode(wrapper, 34);
    simulateCode(wrapper, 13);
    simulateCode(wrapper, 10);
    wrapper.update();
  });
});
