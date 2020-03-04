import React from 'react';
import { mount } from 'enzyme';
import NumberField from '..';
import NumberDataTest from './numberData';
import focusTest from '../../../tests/shared/focusTest';
import mountTest from '../../../tests/shared/mountTest';

mountTest(NumberField);
focusTest(NumberField);

describe('NumberField', () => {
  // it('renders NumberField correctly', () => {
  //   const wrapper = mount(<NumberField />);
  //   expect(wrapper).toMatchSnapshot();
  // });

  it('step renders correctly', () => {
    const wrapper = mount(<NumberField />);
    expect(wrapper.find('.c7n-pro-input-number-inner-button')).toHaveLength(0);
    wrapper.setProps({ step: 1 });
    wrapper.update();
    expect(wrapper.find('.c7n-pro-input-number-inner-button')).toHaveLength(1);
  });

  it('step click renders correctly', () => {
    const wrapper = mount(<NumberField value={18} />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('18');
    wrapper.setProps({ value: 12 });
    wrapper.update();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('12');
  });

  it('the range value should render correctly', () => {
    const handleChange = jest.fn();
    const wrapper = mount(
      <NumberField
        range={['start', 'end']}
        defaultValue={{ start: 0, end: 4 }}
        placeholder={['Range Start', 'Range End']}
        onChange={handleChange}
      />,
    );
    // expect(wrapper).toMatchSnapshot();
    expect(
      wrapper
        .find('.c7n-pro-input-number-range-start')
        .at(0)
        .prop('value'),
    ).toBe('0');
    expect(
      wrapper
        .find('.c7n-pro-input-number-range-end')
        .at(0)
        .prop('value'),
    ).toBe('4');
  });

  it('input should render readOnly correctly', () => {
    const wrapper = mount(<NumberField />);
    expect(wrapper.prop('readOnly')).toBe(false);
    wrapper.setProps({ readOnly: true });
    wrapper.update();
    expect(wrapper.prop('readOnly')).toBe(true);
  });

  it('the dataset value should render correctly', () => {
    const wrapper = mount(<NumberDataTest />);
    expect(wrapper.find('NumberField').props().name).toEqual('age');
    expect(wrapper.find('input').props().value).toEqual('10,000,000');
    expect(wrapper).toMatchSnapshot();
  });
});
