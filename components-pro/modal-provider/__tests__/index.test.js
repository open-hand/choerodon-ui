import React from 'react';
import { mount } from 'enzyme';
import ModalProviderTest from './modalProviderTest';

describe('ModalProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('the mask appears when click the button', () => {
    const wrapper = mount(<ModalProviderTest />);
    expect(wrapper.find('.c7n-pro-mask-wrapper').length).toBe(0);
    wrapper
      .find('button')
      .at(1)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-mask-wrapper').length).toBe(1);

  });

  it('the modal show when click the button', () => {
    const wrapper = mount(<ModalProviderTest />);
    expect(wrapper.find('.c7n-pro-modal')).toHaveLength(0);
    wrapper
      .find('button')
      .at(1)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-modal')).toHaveLength(1);
  });

  it('the modal hidden when click the button cancel', () => {
    const wrapper = mount(<ModalProviderTest />);
    wrapper
      .find('button')
      .at(1)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-modal')).toHaveLength(1);
    expect(
      wrapper
        .find('.c7n-pro-modal')
        .hostNodes()
        .find('button')
        .at(1),
    ).toHaveLength(1);
    wrapper
      .find('.c7n-pro-modal')
      .hostNodes()
      .find('button')
      .at(1)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-mask-wrapper').prop('hidden')).toBe(false);

    wrapper
      .find('.c7n-pro-modal')
      .hostNodes()
      .find('button')
      .at(0)
      .simulate('click');
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper.find('.c7n-pro-modal')).toHaveLength(2);
  });
});
