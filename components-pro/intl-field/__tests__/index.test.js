import React from 'react';
import { mount } from 'enzyme';
import IntlField from '..';
import DataSet from '../../data-set';

describe('IntlField-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders IntlField-pro correctly', () => {
    const wrapper = mount(<IntlField />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should focused when the input click or mousedown', () => {
    const wrapper = mount(<IntlField />);
    expect(wrapper.find('.c7n-pro-input-focused')).toHaveLength(0);
    wrapper.find('input').simulate('focus');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-input-focused')).toHaveLength(1);
  });

  it('can set the default value', () => {
    const wrapper = mount(<IntlField value="周" />);
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('周');
  });

  it('renders dataset correctly', () => {
    const handleDataSetChange = jest.fn();
    const ds = new DataSet({
      primaryKey: 'pk',
      data: [{ name: '周' }],
      tlsUrl: '/dataset/user/languages',
      fields: [
        {
          name: 'test',
          type: 'intl',
          defaultValue: 'QingDong',
          required: true,
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(<IntlField dataSet={ds} name="test" />);
    // expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('IntlField').props().name).toEqual('test');
  });
});
