import React from 'react';
import { mount } from 'enzyme';
import Modal from '..';
import mountTest from '../../../tests/shared/mountTest';

describe('modal-pro', () => {
  mountTest(Modal);

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders modal-pro correctly', () => {
    const wrapper = mount(<Modal />);
    expect(wrapper).toMatchSnapshot();
  });

  it('onCancel should be called when the methods handleCancel trigger', () => {
    const onCancel = jest.fn();
    const wrapper = mount(<Modal onCancel={onCancel} />);
    wrapper.instance().handleCancel();
    expect(onCancel).toHaveBeenCalled();
  });

  it('onOk should be called when the methods handleOk trigger', () => {
    const onOk = jest.fn();
    const wrapper = mount(<Modal onOk={onOk} />);
    wrapper.instance().handleOk();
    expect(onOk).toHaveBeenCalled();
  });

  it('render correctly without footer', () => {
    const wrapper = mount(<Modal footer={null} />);
    expect(wrapper.render()).toMatchSnapshot();
  });

  it('render close correctly', () => {
    const wrapper = mount(<Modal closable />);
    expect(wrapper.render()).toMatchSnapshot();
  });
});
