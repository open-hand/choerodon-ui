import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import WeeksPicker from '../../week-picker';
import focusTest from '../../../tests/shared/focusTest';
import { disableWrapper } from './utils';

describe('weeks-picker-pro', () => {
  focusTest(WeeksPicker);

  it('the week will be controlled by the value', () => {
    const wrapper = mount(<WeeksPicker value={moment('2020-02-19')} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-8th');
    wrapper.setProps({ value: moment('2020-02-26') });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('2020-9th');
  });

  it('should has disabled property can not do anything', () => {
    const wrapper = mount(<WeeksPicker />);
    disableWrapper(wrapper);
  });
});
