import React from 'react';
import { mount } from 'enzyme';
import Range from '..';
import DataSet from '../../data-set';

describe('Range', () => {
  it('should show tooltip when hovering range handler', () => {
    const mockFn = jest.fn();
    const ds = new DataSet({
      autoCreate: true,
      fields: [{ name: 'range', defaultValue: 50, min: 0, max: 100, step: 1 }],
      events: {
        update: mockFn,
      },
    });
    const wrapper = mount(<Range dataSet={ds} />);
    expect(wrapper).toMatchSnapshot();
    wrapper
      .find('.c7n-pro-range-draghandle')
      .at(0)
      .simulate('mouseEnter');
    expect(wrapper).toMatchSnapshot();
  });
  it('the range drag test ', () => {
    const mockFn = jest.fn();
    const ds = new DataSet({
      autoCreate: true,
      fields: [{ name: 'range', defaultValue: 0, min: 0, max: 100, step: 1 }],
      events: {
        update: mockFn,
      },
    });
    const wrapper = mount(<Range dataSet={ds} />);
    wrapper
      .find('.c7n-pro-range-track')
      .simulate('mouseDown', { clientX: 0, clientY: 0 })
      .simulate('mouseMove', { clientX: 0, clientY: 100 })
      .simulate('mouseUp');
    expect(wrapper).toMatchSnapshot();
  });
});
