import React from 'react';
import { mount } from 'enzyme';
import TriggerTest from './triggerTest';

describe('TriggerTests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders TriggerTest correctly', () => {
    const wrapper = mount(<TriggerTest />);
    expect(wrapper).toMatchSnapshot();
  });

  it('the Popup change event will trigger when {click, mousedown,mousemove,mouseenter,contextmenu }', () => {
    const handlePopupChange = jest.fn();
    const wrapper = mount(<TriggerTest onPopupHiddenChange={handlePopupChange} />);
    expect(handlePopupChange).not.toHaveBeenCalled();

    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    expect(handlePopupChange).toHaveBeenCalled();

    wrapper.find('input').simulate('mousedown');
    jest.runAllTimers();
    expect(handlePopupChange).toHaveBeenCalled();

    wrapper.find('input').simulate('mouseenter');
    jest.runAllTimers();
    expect(handlePopupChange).toHaveBeenCalled();

    wrapper.find('input').simulate('mousemove');
    jest.runAllTimers();
    expect(handlePopupChange).toHaveBeenCalled();

    wrapper.find('input').simulate('contextmenu');
    jest.runAllTimers();
    expect(handlePopupChange).toHaveBeenCalled();
  });

  it('the Popup change can not trigger when the property readonly is true', () => {
    const handlePopupChange = jest.fn();
    const wrapper = mount(<TriggerTest onPopupHiddenChange={handlePopupChange} />);

    wrapper.setProps({ readOnly: true });
    wrapper.find('input').simulate('click');
    jest.runAllTimers();
    expect(handlePopupChange).not.toHaveBeenCalled();
  });
});
