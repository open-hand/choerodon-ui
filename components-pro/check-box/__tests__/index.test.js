import React from 'react';
import { mount } from 'enzyme';
import CheckBox from '..';
import DataSet from '../../data-set';
import focusTest from '../../../tests/shared/focusTest';

focusTest(CheckBox);

describe('checkBox-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('dataset set checked', () => {
    const data = [
      {
        bind: 'A',
      },
    ];
    const ds = new DataSet({
      fields: [{ name: 'bind', multiple: true }],
      data,
    });
    const wrapper = mount(
      <CheckBox dataSet={ds} name="bind" value="A">
        A
      </CheckBox>,
    );

    expect(wrapper.find('input').prop('checked')).toBe(true);
  });
});
