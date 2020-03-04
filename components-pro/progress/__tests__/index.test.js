import React from 'react';
import { mount } from 'enzyme';
import ProgressTest from './ProgressTest';

const setupByMount = () => {
  const wrapper = mount(<ProgressTest />);
  return {
    wrapper,
  };
};

describe('Progress-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should have a line', () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('.c7n-progress-line').length).toBe(1);
  });

  it('successPercent should decide the progress status when it exists', async () => {
    const { wrapper } = setupByMount();
    expect(wrapper.find('.c7n-progress-status-success')).toHaveLength(1);
  });

  it('should have a circle when type is circle', async () => {
    const { wrapper } = setupByMount();
    wrapper.setProps({ type: 'circle' });
    expect(wrapper.find('svg.c7n-progress-circle').length).toBe(1);
  });
});
