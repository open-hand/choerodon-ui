import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import TimesPicker from '../../time-picker';
import focusTest from '../../../tests/shared/focusTest';
import { disableWrapper } from './utils';

describe('times-picker-pro', () => {
  focusTest(TimesPicker);

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

  it('should has disabled property can not do anything', () => {
    const wrapper = mount(<TimesPicker />);
    disableWrapper(wrapper);
  });
});
