import React from 'react';
import { mount } from 'enzyme';
import Currency from '..';
import DataSet from '../../data-set';

describe('Currency', () => {
  it('should show US$ in a input value', () => {
    const handleDataSetChange = jest.fn();
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'money',
          type: 'number',
          defaultValue: 100000000000000,
          required: true,
          currency: 'USD',
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(<Currency dataSet={ds} name="money" />);
    expect(wrapper.find('input').prop('value')).toEqual(expect.stringContaining('$100,000,000,000,000.00'));
  });
  it('should show ￥ in a input value', () => {
    const handleDataSetChange = jest.fn();
    const ds = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'money',
          type: 'number',
          defaultValue: 200,
          required: true,
          currency: 'CNY',
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(<Currency dataSet={ds} name="money" />);
    expect(wrapper.find('input').prop('value')).toEqual(expect.stringContaining('¥'));
    expect(wrapper.find('input').prop('value')).toEqual(expect.stringContaining('200'));
  });
});
