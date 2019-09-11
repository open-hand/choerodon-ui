import React from 'react';
import { mount } from 'enzyme';
import Checkbox from '../index';

describe('CheckboxGroup', () => {
  it('should work basically', () => {
    const onChange = jest.fn();
    const wrapper = mount(
      <Checkbox.Group options={['Apple', 'Pear', 'Orange']} onChange={onChange} />,
    );
    wrapper
      .find('.c7n-checkbox-input')
      .at(0)
      .simulate('change');
    expect(onChange).toHaveBeenCalledWith(['Apple']);
    wrapper
      .find('.c7n-checkbox-input')
      .at(1)
      .simulate('change');
    expect(onChange).toHaveBeenCalledWith(['Apple', 'Pear']);
    wrapper
      .find('.c7n-checkbox-input')
      .at(2)
      .simulate('change');
    expect(onChange).toHaveBeenCalledWith(['Apple', 'Pear', 'Orange']);
    wrapper
      .find('.c7n-checkbox-input')
      .at(1)
      .simulate('change');
    expect(onChange).toHaveBeenCalledWith(['Apple', 'Orange']);
  });

  it('does not trigger onChange callback of both Checkbox and CheckboxGroup when CheckboxGroup is disabled', () => {
    const onChangeGroup = jest.fn();

    const options = [{ label: 'Apple', value: 'Apple' }, { label: 'Pear', value: 'Pear' }];

    const groupWrapper = mount(
      <Checkbox.Group options={options} onChange={onChangeGroup} disabled />,
    );
    groupWrapper
      .find('.c7n-checkbox-input')
      .at(0)
      .simulate('change');
    expect(onChangeGroup).not.toHaveBeenCalled();
    groupWrapper
      .find('.c7n-checkbox-input')
      .at(1)
      .simulate('change');
    expect(onChangeGroup).not.toHaveBeenCalled();
  });

  it('does not prevent onChange callback from Checkbox when CheckboxGroup is not disabled', () => {
    const onChangeGroup = jest.fn();

    const options = [
      { label: 'Apple', value: 'Apple' },
      { label: 'Orange', value: 'Orange', disabled: true },
    ];

    const groupWrapper = mount(<Checkbox.Group options={options} onChange={onChangeGroup} />);
    groupWrapper
      .find('.c7n-checkbox-input')
      .at(0)
      .simulate('change');
    expect(onChangeGroup).toHaveBeenCalledWith(['Apple']);
    groupWrapper
      .find('.c7n-checkbox-input')
      .at(1)
      .simulate('change');
    expect(onChangeGroup).toHaveBeenCalledWith(['Apple']);
  });
});
