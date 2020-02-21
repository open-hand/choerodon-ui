import React from 'react';
import { mount } from 'enzyme';
import moment from 'moment';
import YearsPicker from '../../year-picker';
import focusTest from '../../../tests/shared/focusTest';
import triggerPopTest from '../../../tests/shared/triggerPopTest';

describe('years-picker-pro', () => {
  focusTest(YearsPicker);
  triggerPopTest(YearsPicker);

  it('renders YearsPicker correctly', () => {
    const wrapper = mount(<YearsPicker />);
    expect(wrapper).toMatchSnapshot();
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
});
