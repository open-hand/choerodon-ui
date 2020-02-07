import React from 'react';
import { render, mount, shallow } from 'enzyme';
import PagnationTest from './PagnationTest';

const setupByMount = () => {
  const wrapper = mount(<PagnationTest />);
  return {
    wrapper,
  };
};

describe('Tree-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have a pageSize 20 ', () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('Select').prop('value')).toBe('20');
  });

  it('set showQuickJumper should have a NumberField render ', () => {
    const { wrapper } = setupByMount();
    wrapper.setProps({ showQuickJumper: true });
    expect(wrapper.find('NumberField').length).toBe(1);
  });

  it('set disable Select should have a disable props ', () => {
    const { wrapper } = setupByMount();
    wrapper.setProps({ disabled: true });
    expect(wrapper.find('Select').prop('disabled')).toBe(true);
  });
});
