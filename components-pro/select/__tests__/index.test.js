import React from 'react';
import { mount } from 'enzyme';
import Select from '..';
import DataSet from '../../data-set';

const { Option } = Select;

describe('Select', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dataset set Select value', () => {
    const handleDataSetChange = jest.fn();
    const data = [
      {
        user: 'wu',
      },
    ];
    const ds = new DataSet({
      data,
      fields: [{ name: 'user', type: 'string', textField: 'text', label: '用户' }],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(
      <Select dataSet={ds} name="user">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>,
    );
    jest.runAllTimers();
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('wu');
  });
  it('dataset set value render right number item', () => {
    const handleDataSetChange = jest.fn();
    const data = [
      {
        user: 'wu',
      },
    ];
    const ds = new DataSet({
      data,
      fields: [{ name: 'user', type: 'string', textField: 'text', label: '用户' }],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(
      <Select dataSet={ds} name="user">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
        <Option value="wu">Wu</Option>
      </Select>,
    );
    wrapper.find('.c7n-pro-select').simulate('click');
    jest.runAllTimers();
    expect(wrapper.find('MenuItem').length).toBe(3);
  });
});
