import React from 'react';
import { mount } from 'enzyme';
import Modal from '..';

describe('modal triggers callbacks correctly', () => {
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    errorSpy.mockReset();
    document.body.innerHTML = '';
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  const _pro = className => {
    return document.body.querySelectorAll(className);
  };

  const confirm = args => {
    Modal.confirm({
      title: 'Confirm Test',
      children: (
        <div>
          <p>Some confirm...</p>
        </div>
      ),
      ...args,
    });
  };

  const open = args => {
    Modal.open({
      title: 'Modal Test',
      children: (
        <div>
          <p>Some contents...</p>
          <p>Some contents...</p>
          <p>Some contents...</p>
        </div>
      ),
      ...args,
    });
  };

  it('should not render title when title not defined', () => {
    Modal.confirm({
      content: 'test descriptions',
    });
    expect(document.querySelector('.c7n-pro-confirm-title')).toBe(null);
  });

  it('trigger onCancel once when click on cancel button', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    open({
      onCancel,
      onOk,
    });
    _pro('.c7n-pro-btn')[1].click();
    expect(onCancel.mock.calls.length).toBe(1);
    expect(onOk.mock.calls.length).toBe(0);
  });

  it('trigger onOk once when click on ok button', () => {
    const onCancel = jest.fn();
    const onOk = jest.fn();
    open({
      onCancel,
      onOk,
    });
    _pro('.c7n-pro-btn-primary')[0].click();
    expect(onCancel.mock.calls.length).toBe(0);
    expect(onOk.mock.calls.length).toBe(1);
  });
});
