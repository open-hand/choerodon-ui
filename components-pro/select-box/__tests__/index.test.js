import React from 'react';
import { mount } from 'enzyme';
import SelectBox from '..';
import DataSet from '../../data-set';

describe('Select-Box-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  const optionData = [
    { text: 'Jack', value: 'jack' },
    { text: 'Huazhen', value: 'huazhen' },
    { text: 'Lucy', value: 'lucy' },
    { text: 'Niu', value: 'jiaqin' },
    { text: 'Shao', value: 'shao' },
  ];

  const data = [
    {
      name: 'huazhen',
    },
  ];
  const optionDs = new DataSet({
    data: optionData,
    selection: 'single',
  });
  const ds = new DataSet({
    data,
    fields: [{ name: 'name', textField: 'text', valueField: 'value', options: optionDs }],
  });
  it('dataset set SelectBox dataSet render Huazhen radio onchecked', () => {
    const wrapper = mount(<SelectBox dataSet={ds} name="name" />);
    jest.runAllTimers();
    expect(wrapper.find('input').length).toBe(5);
  });
  it('dataset set SelectBox only has one checked', () => {
    const wrapper = mount(<SelectBox dataSet={ds} name="name" />);
    jest.runAllTimers();
    expect(
      wrapper
        .find('input')
        .at(1)
        .prop('checked'),
    ).toBe(true);
  });
  it('dataset set SelectBox disabled test', () => {
    const wrapper = mount(<SelectBox disabled dataSet={ds} name="name" />);
    jest.runAllTimers();
    expect(wrapper.find('.c7n-pro-radio-disabled').length).toBe(5);
  });
});
