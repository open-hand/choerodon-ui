import React from 'react';
import { mount } from 'enzyme';
import TreeTest from './TreeTest';

const setupByMount = () => {
  const wrapper = mount(<TreeTest />);
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

  it('should have a input', () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('input').length).toBe(1);
  });

  it('should input value is equal to one', () => {
    const { wrapper } = setupByMount();
    wrapper.find('.c7n-tree-node-content-wrapper').simulate('click');
    expect(wrapper.find('NumberField').prop('value')).toBe(1);
  });

  it('tree expand the treeNode', () => {
    const { wrapper } = setupByMount();
    wrapper.find('Icon').simulate('click');
    expect(wrapper.find('TreeNode').length).toBe(4);
  });
});
