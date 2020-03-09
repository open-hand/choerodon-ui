import React from 'react';
import { mount } from 'enzyme';
import IntlField from '..';
import IntlList from '../IntlList';
import IntlFieldTest from './intlField';
import focusTest from '../../../tests/shared/focusTest';
import mountTest from '../../../tests/shared/mountTest';
import { open } from '../../modal-container/ModalContainer';
import DataSet from '../../data-set';

mountTest(IntlList);
mountTest(IntlField);
focusTest(IntlField);

describe('IntlField-pro', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    errorSpy.mockReset();
    document.body.innerHTML = '';
    jest.useRealTimers();
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  const _pro = className => {
    return document.body.querySelectorAll(className);
  };

  it('renders IntlField correctly', () => {
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

  it('input should render readOnly correctly', () => {
    const wrapper = mount(<IntlField />);
    expect(wrapper.prop('readOnly')).toBe(false);
    wrapper.setProps({ readOnly: true });
    wrapper.update();
    expect(wrapper.prop('readOnly')).toBe(true);
    wrapper.find('.c7n-pro-input-suffix').simulate('click');
    jest.runAllTimers();
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(0);
  });

  it('trigger onOk once when click on ok button', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    open({
      onCancel,
      onOk,
    });
    _pro('.c7n-pro-modal-footer')[0]
      .querySelector('.c7n-pro-btn-primary')
      .click();
    expect(onCancel.mock.calls.length).toBe(0);
    expect(onOk.mock.calls.length).toBe(1);
  });

  it('renders dataset correctly', () => {
    const handleDataSetChange = jest.fn();
    const wrapper = mount(<IntlFieldTest />);
    expect(wrapper.find('IntlField').props().name).toEqual('first-name');
    expect(wrapper.find('input').props().value).toEqual('吴');
    expect(wrapper).toMatchSnapshot();
    const ds = new DataSet({
      lang: 'en_GB',
      primaryKey: 'pk',
      data: [{}],
      tlsUrl: '/dataset/user/languages',
      fields: [
        {
          name: 'first',
          type: 'intl',
          required: true,
        },
      ],
      events: {
        update: handleDataSetChange,
      },
    });
    const wrapper1 = mount(<IntlField dataSet={ds} name="first" />);
    expect(wrapper1.find('IntlField').props().name).toEqual('first');
    expect(wrapper1).toMatchSnapshot();
  });

  it('onCancel should be called when the methods handleCancel trigger1', () => {
    const wrapper = mount(<IntlField />);
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(0);
    wrapper.find('.c7n-pro-input-suffix').simulate('click');
    jest.runAllTimers();
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(1);
    expect(_pro('.c7n-pro-btn')).toHaveLength(2);
    _pro('.c7n-pro-btn-primary')[0].click();
    jest.runAllTimers();
    wrapper.update();
    _pro('.c7n-pro-btn-default')[0].click();
    jest.runAllTimers();
    wrapper.update();
    expect(wrapper).toMatchSnapshot();
  });

  it('modal should be called when the methods handleCancel trigger1', () => {
    const wrapper = mount(<IntlField />);
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(0);
    wrapper.find('input').simulate('keydown', { keyCode: 40 });
    jest.runAllTimers();
    wrapper.update();
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(1);
  });

  it('modal should unmout', () => {
    const wrapper = mount(<IntlField />);
    wrapper.unmount();
  });
});
