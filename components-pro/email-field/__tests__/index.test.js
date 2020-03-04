import React from 'react';
import { mount } from 'enzyme';
import EmailFiled from '..';
import DataSet from '../../data-set';
import focusTest from '../../../tests/shared/focusTest';

focusTest(EmailFiled);

describe('Select', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  const handleDataSetChange = jest.fn();

  const ds = new DataSet({
    autoCreate: true,
    fields: [{ name: 'email', type: 'email', defaultValue: '123@abc.com', required: true }],
    events: {
      update: handleDataSetChange,
    },
  });
  it('dataset set Select value', () => {
    const dstest = new DataSet({
      autoCreate: true,
      fields: [{ name: 'email', type: 'email', defaultValue: '123@abc.com', required: true }],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper = mount(<EmailFiled dataSet={dstest} />);
    jest.runAllTimers();
    expect(wrapper.find('input').length).toBe(1);
  });
  it('change the Select value', () => {
    const wrapper = mount(<EmailFiled dataSet={ds} />);
    wrapper
      .find('input')
      .at(0)
      .simulate('change', {
        target: {
          value: '1234@abc.com',
        },
      });
    expect(
      wrapper
        .find('input')
        .at(0)
        .prop('value'),
    ).toBe('1234@abc.com');
  });
});
