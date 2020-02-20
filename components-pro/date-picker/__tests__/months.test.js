import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import MonthsPicker from '../../month-picker';
import focusTest from '../../../tests/shared/focusTest';
import { disableWrapper } from './utils';

describe('months-picker-pro', () => {
  focusTest(MonthsPicker);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders monthsPicker correctly', () => {
    const wrapper = mount(<MonthsPicker />);
    expect(wrapper).toMatchSnapshot();
  });

  it('the month will be controlled by the value', () => {
    const wrapper = mount(<MonthsPicker value={moment('2020-02-19')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-02');
    wrapper.setProps({ value: moment('2021-01-01') });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2021-01');
  });

  it('should has disabled property can not do anything', () => {
    const wrapper = mount(<MonthsPicker />);
    disableWrapper(wrapper);
  });

  it('should has min-max value', () => {
    const wrapper = mount(<MonthsPicker min={new Date()} />);
    wrapper.find('.c7n-pro-calendar-picker-wrapper').simulate('click');
    jest.runAllTimers();
    expect(
      wrapper
        .find('Popup')
        .at(0)
        .hasClass('c7n-pro-calendar-picker-popup'),
    ).toBe(true);
  });
});
