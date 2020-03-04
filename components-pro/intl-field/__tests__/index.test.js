import React from 'react';
import { mount } from 'enzyme';
import IntlField from '..';
import IntlList from '../IntlList';
import Form from '../../form/Form';
import ObserverTextField from '../../text-field/TextField';
import IntlFieldTest from './intlField';
import focusTest from '../../../tests/shared/focusTest';
import mountTest from '../../../tests/shared/mountTest';
import ModalContainer from '../../modal-container/ModalContainer';
import Modal from '../../modal/Modal';

mountTest(IntlList);
mountTest(IntlField);
mountTest(ObserverTextField);
mountTest(ModalContainer);
mountTest(Form);
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
    const wrapper1 = mount(<IntlList />);
    const wrapper2 = mount(<ObserverTextField />);
    const wrapper3 = mount(<Form />);
    const wrapper4 = mount(<Modal />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper1).toMatchSnapshot();
    expect(wrapper2).toMatchSnapshot();
    expect(wrapper3).toMatchSnapshot();
    expect(wrapper4).toMatchSnapshot();
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
  });

  it('renders dataset correctly', () => {
    const wrapper = mount(<IntlFieldTest />);
    expect(wrapper.find('IntlField').props().name).toEqual('first-name');
    expect(wrapper.find('input').props().value).toEqual('吴');
    expect(wrapper).toMatchSnapshot();
  });

  it('onCancel should be called when the methods handleCancel trigger1', () => {
    const wrapper = mount(<IntlField />);
    wrapper.find('.c7n-pro-input-suffix').simulate('click');
    jest.runAllTimers();
    expect(_pro('.c7n-pro-modal-container')).toHaveLength(1);
  });
});
