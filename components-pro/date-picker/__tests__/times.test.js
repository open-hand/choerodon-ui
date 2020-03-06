import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import TimesPicker from '../../time-picker';
import focusTest from '../../../tests/shared/focusTest';
import { disableWrapper, simulateCode } from './utils';

describe('times-picker-pro', () => {
  focusTest(TimesPicker);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the times will be controlled by the value', () => {
    const wrapper = mount(<TimesPicker value={moment('2020-02-20 20:20:19')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('20:20:19');
    wrapper.setProps({ value: moment('2020-02-21 20:22:18') });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('20:22:18');
  });

  it('the keyDown event keyCode should render correctly', () => {
    const wrapper = mount(<TimesPicker mode="time" />);
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
    wrapper.update();
  });

  it('should has disabled property can not do anything', () => {
    const wrapper = mount(<TimesPicker />);
    disableWrapper(wrapper);
  });
});
