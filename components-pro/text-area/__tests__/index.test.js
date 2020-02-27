import React from 'react';
import { mount } from 'enzyme';
import TextArea from '..';
import TextAreaTest from './textAreaTest';

describe('TextArea-pro', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders TextArea-pro correctly', () => {
    const wrapper = mount(<TextArea />);
    expect(wrapper).toMatchSnapshot();
  });

  it('TextArea should have the default resize and rows', () => {
    const wrapper = mount(<TextArea />);
    expect(wrapper.prop('resize')).toBe('none');
    expect(wrapper.prop('rows')).toBe(4);
  });

  it('TextArea have the disabled property and default false', () => {
    const wrapper = mount(<TextArea />);
    expect(wrapper.find('.c7n-pro-textarea-disabled')).toHaveLength(0);
    wrapper.setProps({ disabled: true });
    wrapper.update();
    expect(wrapper.find('.c7n-pro-textarea-disabled')).toHaveLength(1);
  });

  it('can not click or input when the readOnly true and default false', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<TextArea onChange={handleChange} />);
    expect(wrapper.prop('readOnly')).toBe(false);
    wrapper.setProps({ readOnly: true });
    wrapper.update();
    expect(wrapper.prop('readOnly')).toBe(true);

    wrapper.find('textarea').simulate('change');
    jest.runAllTimers();
    wrapper.update();
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('the value will be controlled and the change event trigger when the value change', () => {
    const handleChange = jest.fn();
    const wrapper = mount(<TextArea value="text" onChange={handleChange} />);
    expect(
      wrapper
        .find('textarea')
        .at(0)
        .prop('value'),
    ).toBe('text');
    wrapper.setProps({ value: 'text-area' });
    wrapper.update();
    expect(
      wrapper
        .find('textarea')
        .at(0)
        .prop('value'),
    ).toBe('text-area');
  });

  it('the dataSet should renders correctly', () => {
    const wrapper = mount(<TextAreaTest />);
    expect(wrapper.find('TextArea').props().name).toEqual('content');
    expect(wrapper).toMatchSnapshot();
  });
});
